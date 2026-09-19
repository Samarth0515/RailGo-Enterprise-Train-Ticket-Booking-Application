package com.railgo.dto;

import com.railgo.entity.CoachType;
import com.railgo.entity.SeatType;
import com.railgo.entity.TrainStatus;
import com.railgo.entity.TrainType;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

public class TrainDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchResult {
        private Long scheduleId;
        private Long trainId;
        private String trainNumber;
        private String trainName;
        private TrainType trainType;
        private TrainStatus status;

        private Long fromStationId;
        private String fromStationCode;
        private String fromStationName;
        private String departureTime;

        private Long toStationId;
        private String toStationCode;
        private String toStationName;
        private String arrivalTime;

        private String duration; // e.g. "3h 30m"
        private Double distanceKm;
        private Integer stopsCount;
        private LocalDate journeyDate;

        private List<ClassOption> classes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassOption {
        private CoachType coachType;
        private String classCode; // 1A, 2A, 3A, SL, CC, 2S
        private String displayName; // AC 3 Tier
        private Double baseFare;
        private Double totalFare;
        private long availableSeats;
        private String statusBadge; // "AVAILABLE 42", "WL 5", etc.
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrainStopDto {
        private Long id;
        private Long stationId;
        private String stationCode;
        private String stationName;
        private String city;
        private Integer stopNumber;
        private String arrivalTime;
        private String departureTime;
        private Double distanceFromSourceKm;
        private Integer dayNumber;
        private Integer haltMinutes;
        private String platform;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrainDetails {
        private Long id;
        private String trainNumber;
        private String trainName;
        private TrainType trainType;
        private TrainStatus status;
        private StationDto sourceStation;
        private StationDto destinationStation;
        private String departureTime;
        private String arrivalTime;
        private Double totalDistanceKm;
        private String runsOnDays;
        private List<TrainStopDto> stops;
        private List<CoachSummary> coaches;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoachSummary {
        private Long id;
        private String coachNumber;
        private CoachType coachType;
        private Integer totalSeats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoachSeatMapResponse {
        private Long scheduleId;
        private String trainNumber;
        private String trainName;
        private LocalDate journeyDate;
        private List<CoachSeatDetail> coaches;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoachSeatDetail {
        private Long coachId;
        private String coachNumber;
        private CoachType coachType;
        private String classCode;
        private List<SeatDetail> seats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatDetail {
        private Long seatId;
        private Integer seatNumber;
        private SeatType seatType;
        private String status; // AVAILABLE, LOCKED, BOOKED
        private Long lockedByUserId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LockSeatsRequest {
        private Long scheduleId;
        private List<Long> seatIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LockSeatsResponse {
        private boolean success;
        private String message;
        private List<Long> lockedSeatIds;
        private int lockDurationSeconds;
    }
}
