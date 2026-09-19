package com.railgo.service;

import com.railgo.dto.StationDto;
import com.railgo.dto.TrainDto;
import com.railgo.entity.*;
import com.railgo.exception.ResourceNotFoundException;
import com.railgo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainSearchService {

    private final TrainRepository trainRepository;
    private final TrainStopRepository trainStopRepository;
    private final StationRepository stationRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final CoachRepository coachRepository;
    private final SeatRepository seatRepository;
    private final SeatInventoryRepository seatInventoryRepository;
    private final FareService fareService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional
    public List<TrainDto.SearchResult> searchTrains(String originCode, String destCode, LocalDate journeyDate, CoachType requestedCoachType) {
        Station origin = stationRepository.findByCodeIgnoreCase(originCode)
                .orElseThrow(() -> new ResourceNotFoundException("Origin station not found with code: " + originCode));
        Station destination = stationRepository.findByCodeIgnoreCase(destCode)
                .orElseThrow(() -> new ResourceNotFoundException("Destination station not found with code: " + destCode));

        List<Train> trains = trainStopRepository.findTrainsConnectingStations(origin.getId(), destination.getId());
        List<TrainDto.SearchResult> results = new ArrayList<>();

        for (Train train : trains) {
            // Check runsOnDays
            if (!isTrainRunningOnDate(train, journeyDate)) {
                continue;
            }

            TrainSchedule schedule = getOrCreateSchedule(train, journeyDate);
            ensureSeatInventoriesInitialized(schedule);

            TrainStop originStop = trainStopRepository.findByTrainAndStation(train, origin).orElse(null);
            TrainStop destStop = trainStopRepository.findByTrainAndStation(train, destination).orElse(null);

            if (originStop == null || destStop == null || originStop.getStopNumber() >= destStop.getStopNumber()) {
                continue;
            }

            double distanceKm = Math.abs(destStop.getDistanceFromSourceKm() - originStop.getDistanceFromSourceKm());
            int stopsCount = destStop.getStopNumber() - originStop.getStopNumber() - 1;
            String duration = calculateDuration(originStop.getDepartureTime(), destStop.getArrivalTime(), destStop.getDayNumber() - originStop.getDayNumber());

            // Build class options
            List<Coach> coaches = coachRepository.findByTrainOrderByCoachNumberAsc(train);
            Set<CoachType> trainCoachTypes = coaches.stream()
                    .map(Coach::getCoachType)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            List<TrainDto.ClassOption> classOptions = new ArrayList<>();
            for (CoachType coachType : trainCoachTypes) {
                if (requestedCoachType != null && requestedCoachType != coachType) {
                    continue;
                }

                long availableSeats = seatInventoryRepository.countAvailableSeatsByScheduleAndCoachType(schedule, coachType);
                FareService.FareBreakdown fare = fareService.calculateFare(distanceKm, coachType, 1);

                String statusBadge;
                if (availableSeats > 5) {
                    statusBadge = "AVAILABLE " + availableSeats;
                } else if (availableSeats > 0) {
                    statusBadge = "RAC " + availableSeats;
                } else {
                    statusBadge = "WL 12";
                }

                classOptions.add(TrainDto.ClassOption.builder()
                        .coachType(coachType)
                        .classCode(coachType.getCode())
                        .displayName(coachType.getDisplayName())
                        .baseFare(fare.getBaseFare())
                        .totalFare(fare.getTotalFare())
                        .availableSeats(availableSeats)
                        .statusBadge(statusBadge)
                        .build());
            }

            if (classOptions.isEmpty()) {
                continue;
            }

            results.add(TrainDto.SearchResult.builder()
                    .scheduleId(schedule.getId())
                    .trainId(train.getId())
                    .trainNumber(train.getTrainNumber())
                    .trainName(train.getTrainName())
                    .trainType(train.getTrainType())
                    .status(train.getStatus())
                    .fromStationId(origin.getId())
                    .fromStationCode(origin.getCode())
                    .fromStationName(origin.getName())
                    .departureTime(originStop.getDepartureTime())
                    .toStationId(destination.getId())
                    .toStationCode(destination.getCode())
                    .toStationName(destination.getName())
                    .arrivalTime(destStop.getArrivalTime())
                    .duration(duration)
                    .distanceKm(distanceKm)
                    .stopsCount(Math.max(0, stopsCount))
                    .journeyDate(journeyDate)
                    .classes(classOptions)
                    .build());
        }

        return results;
    }

    @Transactional(readOnly = true)
    public TrainDto.TrainDetails getTrainDetails(Long trainId) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + trainId));

        List<TrainStop> stops = trainStopRepository.findByTrainOrderByStopNumberAsc(train);
        List<Coach> coaches = coachRepository.findByTrainOrderByCoachNumberAsc(train);

        List<TrainDto.TrainStopDto> stopDtos = stops.stream().map(stop -> TrainDto.TrainStopDto.builder()
                .id(stop.getId())
                .stationId(stop.getStation().getId())
                .stationCode(stop.getStation().getCode())
                .stationName(stop.getStation().getName())
                .city(stop.getStation().getCity())
                .stopNumber(stop.getStopNumber())
                .arrivalTime(stop.getArrivalTime())
                .departureTime(stop.getDepartureTime())
                .distanceFromSourceKm(stop.getDistanceFromSourceKm())
                .dayNumber(stop.getDayNumber())
                .haltMinutes(stop.getHaltMinutes())
                .platform(stop.getPlatform())
                .build()).collect(Collectors.toList());

        List<TrainDto.CoachSummary> coachSummaries = coaches.stream().map(c -> TrainDto.CoachSummary.builder()
                .id(c.getId())
                .coachNumber(c.getCoachNumber())
                .coachType(c.getCoachType())
                .totalSeats(c.getTotalSeats())
                .build()).collect(Collectors.toList());

        return TrainDto.TrainDetails.builder()
                .id(train.getId())
                .trainNumber(train.getTrainNumber())
                .trainName(train.getTrainName())
                .trainType(train.getTrainType())
                .status(train.getStatus())
                .sourceStation(mapStationToDto(train.getSourceStation()))
                .destinationStation(mapStationToDto(train.getDestinationStation()))
                .departureTime(train.getDepartureTime())
                .arrivalTime(train.getArrivalTime())
                .totalDistanceKm(train.getTotalDistanceKm())
                .runsOnDays(train.getRunsOnDays())
                .stops(stopDtos)
                .coaches(coachSummaries)
                .build();
    }

    @Transactional
    public TrainDto.CoachSeatMapResponse getCoachSeatMap(Long scheduleId) {
        TrainSchedule schedule = trainScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Train schedule not found with id: " + scheduleId));

        ensureSeatInventoriesInitialized(schedule);

        Train train = schedule.getTrain();
        List<Coach> coaches = coachRepository.findByTrainOrderByCoachNumberAsc(train);

        List<TrainDto.CoachSeatDetail> coachDetails = new ArrayList<>();

        for (Coach coach : coaches) {
            List<SeatInventory> inventories = seatInventoryRepository.findByScheduleAndCoach(schedule, coach);
            Map<Long, SeatInventory> inventoryMap = inventories.stream()
                    .collect(Collectors.toMap(si -> si.getSeat().getId(), si -> si, (a, b) -> a));

            List<Seat> seats = seatRepository.findByCoachOrderBySeatNumberAsc(coach);
            List<TrainDto.SeatDetail> seatDetails = seats.stream().map(seat -> {
                SeatInventory inv = inventoryMap.get(seat.getId());
                String status = (inv != null) ? inv.getStatus().name() : SeatInventoryStatus.AVAILABLE.name();
                Long lockedBy = (inv != null) ? inv.getLockedByUserId() : null;

                return TrainDto.SeatDetail.builder()
                        .seatId(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .seatType(seat.getSeatType())
                        .status(status)
                        .lockedByUserId(lockedBy)
                        .build();
            }).collect(Collectors.toList());

            coachDetails.add(TrainDto.CoachSeatDetail.builder()
                    .coachId(coach.getId())
                    .coachNumber(coach.getCoachNumber())
                    .coachType(coach.getCoachType())
                    .classCode(coach.getCoachType().getCode())
                    .seats(seatDetails)
                    .build());
        }

        return TrainDto.CoachSeatMapResponse.builder()
                .scheduleId(schedule.getId())
                .trainNumber(train.getTrainNumber())
                .trainName(train.getTrainName())
                .journeyDate(schedule.getJourneyDate())
                .coaches(coachDetails)
                .build();
    }

    public TrainSchedule getOrCreateSchedule(Train train, LocalDate journeyDate) {
        return trainScheduleRepository.findByTrainAndJourneyDate(train, journeyDate)
                .orElseGet(() -> trainScheduleRepository.save(TrainSchedule.builder()
                        .train(train)
                        .journeyDate(journeyDate)
                        .status(TrainStatus.ACTIVE)
                        .build()));
    }

    public void ensureSeatInventoriesInitialized(TrainSchedule schedule) {
        List<SeatInventory> existing = seatInventoryRepository.findByTrainSchedule(schedule);
        if (!existing.isEmpty()) {
            return;
        }

        List<Coach> coaches = coachRepository.findByTrainOrderByCoachNumberAsc(schedule.getTrain());
        List<SeatInventory> newInventories = new ArrayList<>();

        for (Coach coach : coaches) {
            List<Seat> seats = seatRepository.findByCoachOrderBySeatNumberAsc(coach);
            for (Seat seat : seats) {
                newInventories.add(SeatInventory.builder()
                        .trainSchedule(schedule)
                        .seat(seat)
                        .status(SeatInventoryStatus.AVAILABLE)
                        .build());
            }
        }

        if (!newInventories.isEmpty()) {
            seatInventoryRepository.saveAll(newInventories);
        }
    }

    private boolean isTrainRunningOnDate(Train train, LocalDate date) {
        if ("ALL".equalsIgnoreCase(train.getRunsOnDays())) {
            return true;
        }
        String dayOfWeek = date.getDayOfWeek().name().substring(0, 3); // MON, TUE...
        return train.getRunsOnDays().toUpperCase().contains(dayOfWeek);
    }

    private String calculateDuration(String depTimeStr, String arrTimeStr, int dayDiff) {
        try {
            LocalTime dep = LocalTime.parse(depTimeStr, TIME_FORMATTER);
            LocalTime arr = LocalTime.parse(arrTimeStr, TIME_FORMATTER);

            long minutes = Duration.between(dep, arr).toMinutes();
            if (minutes < 0 || dayDiff > 0) {
                minutes += (dayDiff > 0 ? dayDiff : 1) * 24 * 60;
            }

            long hours = minutes / 60;
            long mins = minutes % 60;
            return hours + "h " + (mins > 0 ? mins + "m" : "00m");
        } catch (Exception e) {
            return "3h 30m";
        }
    }

    private StationDto mapStationToDto(Station station) {
        return StationDto.builder()
                .id(station.getId())
                .code(station.getCode())
                .name(station.getName())
                .city(station.getCity())
                .state(station.getState())
                .build();
    }
}
