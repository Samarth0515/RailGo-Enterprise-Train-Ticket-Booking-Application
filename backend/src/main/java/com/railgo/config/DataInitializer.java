package com.railgo.config;

import com.railgo.entity.*;
import com.railgo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final TrainStopRepository trainStopRepository;
    private final CoachRepository coachRepository;
    private final SeatRepository seatRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final SeatInventoryRepository seatInventoryRepository;
    private final BookingRepository bookingRepository;
    private final PassengerRepository passengerRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized. Skipping seeding.");
            return;
        }

        log.info("Seeding initial railway data...");

        // 1. Seed Users
        User admin = User.builder()
                .name("RailGo Admin")
                .email("admin@railgo.com")
                .mobile("9876543210")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("Male")
                .address("Railway Bhavan, New Delhi")
                .build();
        userRepository.save(admin);

        User demoUser = User.builder()
                .name("Rahul Patil")
                .email("user@railgo.com")
                .mobile("9890123456")
                .password(passwordEncoder.encode("user123"))
                .role(Role.ROLE_USER)
                .dateOfBirth(LocalDate.of(1998, 5, 15))
                .gender("Male")
                .address("FC Road, Shivajinagar, Pune")
                .build();
        userRepository.save(demoUser);

        // 2. Seed Stations
        Station csmt = createStation("CSMT", "Chhatrapati Shivaji Maharaj Terminus", "Mumbai", "Maharashtra");
        Station pune = createStation("PUNE", "Pune Junction", "Pune", "Maharashtra");
        Station kyn  = createStation("KYN", "Kalyan Junction", "Kalyan", "Maharashtra");
        Station lnl  = createStation("LNL", "Lonavala", "Lonavala", "Maharashtra");
        Station bct  = createStation("BCT", "Mumbai Central", "Mumbai", "Maharashtra");
        Station st   = createStation("ST", "Surat", "Surat", "Gujarat");
        Station brc  = createStation("BRC", "Vadodara Junction", "Vadodara", "Gujarat");
        Station kota = createStation("KOTA", "Kota Junction", "Kota", "Rajasthan");
        Station ndls = createStation("NDLS", "New Delhi", "New Delhi", "Delhi");
        Station sbc  = createStation("SBC", "KSR Bengaluru City", "Bengaluru", "Karnataka");
        Station mas  = createStation("MAS", "MGR Chennai Central", "Chennai", "Tamil Nadu");
        Station hwh  = createStation("HWH", "Howrah Junction", "Kolkata", "West Bengal");
        Station kop  = createStation("KOP", "Chhatrapati Shahu Maharaj Terminus", "Kolhapur", "Maharashtra");

        // 3. Train 1: 12123 Deccan Express (CSMT -> PUNE)
        Train deccan = Train.builder()
                .trainNumber("12123")
                .trainName("Deccan Express")
                .trainType(TrainType.EXPRESS)
                .sourceStation(csmt)
                .destinationStation(pune)
                .departureTime("07:00")
                .arrivalTime("10:30")
                .totalDistanceKm(192.0)
                .runsOnDays("ALL")
                .status(TrainStatus.ACTIVE)
                .build();
        trainRepository.save(deccan);

        createStop(deccan, csmt, 1, "07:00", "07:00", 0.0, 1, 0, "18");
        createStop(deccan, kyn,  2, "07:42", "07:45", 54.0, 1, 3, "4");
        createStop(deccan, lnl,  3, "09:00", "09:02", 128.0, 1, 2, "1");
        createStop(deccan, pune, 4, "10:30", "10:30", 192.0, 1, 0, "1");

        createCoachesForTrain(deccan, List.of(
                new CoachSpec("A1", CoachType.FIRST_AC, 24),
                new CoachSpec("B1", CoachType.THREE_TIER_AC, 64),
                new CoachSpec("B2", CoachType.THREE_TIER_AC, 64),
                new CoachSpec("S1", CoachType.SLEEPER, 72),
                new CoachSpec("S2", CoachType.SLEEPER, 72),
                new CoachSpec("D1", CoachType.SECOND_SEATING, 108)
        ));

        // Train 2: 12124 Deccan Queen Express (PUNE -> CSMT)
        Train deccanQueen = Train.builder()
                .trainNumber("12124")
                .trainName("Deccan Queen Superfast")
                .trainType(TrainType.SUPERFAST)
                .sourceStation(pune)
                .destinationStation(csmt)
                .departureTime("07:15")
                .arrivalTime("10:25")
                .totalDistanceKm(192.0)
                .runsOnDays("ALL")
                .status(TrainStatus.ACTIVE)
                .build();
        trainRepository.save(deccanQueen);

        createStop(deccanQueen, pune, 1, "07:15", "07:15", 0.0, 1, 0, "5");
        createStop(deccanQueen, lnl,  2, "08:14", "08:15", 64.0, 1, 1, "2");
        createStop(deccanQueen, kyn,  3, "09:33", "09:35", 138.0, 1, 2, "6");
        createStop(deccanQueen, csmt, 4, "10:25", "10:25", 192.0, 1, 0, "8");

        createCoachesForTrain(deccanQueen, List.of(
                new CoachSpec("CC1", CoachType.CHAIR_CAR, 75),
                new CoachSpec("CC2", CoachType.CHAIR_CAR, 75),
                new CoachSpec("D1", CoachType.SECOND_SEATING, 108),
                new CoachSpec("D2", CoachType.SECOND_SEATING, 108)
        ));

        // Train 3: 12125 Pragati Express (CSMT -> PUNE)
        Train pragati = Train.builder()
                .trainNumber("12125")
                .trainName("Pragati Superfast Express")
                .trainType(TrainType.SUPERFAST)
                .sourceStation(csmt)
                .destinationStation(pune)
                .departureTime("16:25")
                .arrivalTime("19:50")
                .totalDistanceKm(192.0)
                .runsOnDays("ALL")
                .status(TrainStatus.ACTIVE)
                .build();
        trainRepository.save(pragati);

        createStop(pragati, csmt, 1, "16:25", "16:25", 0.0, 1, 0, "12");
        createStop(pragati, kyn,  2, "17:18", "17:20", 54.0, 1, 2, "5");
        createStop(pragati, lnl,  3, "18:40", "18:42", 128.0, 1, 2, "1");
        createStop(pragati, pune, 4, "19:50", "19:50", 192.0, 1, 0, "2");

        createCoachesForTrain(pragati, List.of(
                new CoachSpec("B1", CoachType.THREE_TIER_AC, 64),
                new CoachSpec("CC1", CoachType.CHAIR_CAR, 75),
                new CoachSpec("S1", CoachType.SLEEPER, 72)
        ));

        // Train 4: 12951 Mumbai Tejas Rajdhani Express (BCT -> NDLS)
        Train rajdhani = Train.builder()
                .trainNumber("12951")
                .trainName("Mumbai Tejas Rajdhani Express")
                .trainType(TrainType.RAJDHANI)
                .sourceStation(bct)
                .destinationStation(ndls)
                .departureTime("17:00")
                .arrivalTime("08:32")
                .totalDistanceKm(1386.0)
                .runsOnDays("ALL")
                .status(TrainStatus.ACTIVE)
                .build();
        trainRepository.save(rajdhani);

        createStop(rajdhani, bct,  1, "17:00", "17:00", 0.0, 1, 0, "1");
        createStop(rajdhani, st,   2, "19:43", "19:48", 263.0, 1, 5, "1");
        createStop(rajdhani, brc,  3, "21:06", "21:16", 392.0, 1, 10, "2");
        createStop(rajdhani, kota, 4, "03:15", "03:20", 920.0, 2, 5, "1");
        createStop(rajdhani, ndls, 5, "08:32", "08:32", 1386.0, 2, 0, "1");

        createCoachesForTrain(rajdhani, List.of(
                new CoachSpec("H1", CoachType.FIRST_AC, 24),
                new CoachSpec("A1", CoachType.TWO_TIER_AC, 48),
                new CoachSpec("A2", CoachType.TWO_TIER_AC, 48),
                new CoachSpec("B1", CoachType.THREE_TIER_AC, 64),
                new CoachSpec("B2", CoachType.THREE_TIER_AC, 64)
        ));

        // Train 5: 20608 Vande Bharat Express (SBC -> MAS)
        Train vandeBharat = Train.builder()
                .trainNumber("20608")
                .trainName("Vande Bharat Express")
                .trainType(TrainType.VANDE_BHARAT)
                .sourceStation(sbc)
                .destinationStation(mas)
                .departureTime("05:45")
                .arrivalTime("10:10")
                .totalDistanceKm(359.0)
                .runsOnDays("ALL")
                .status(TrainStatus.ACTIVE)
                .build();
        trainRepository.save(vandeBharat);

        createStop(vandeBharat, sbc, 1, "05:45", "05:45", 0.0, 1, 0, "1");
        createStop(vandeBharat, mas, 2, "10:10", "10:10", 359.0, 1, 0, "2");

        createCoachesForTrain(vandeBharat, List.of(
                new CoachSpec("EC1", CoachType.FIRST_AC, 24),
                new CoachSpec("C1", CoachType.CHAIR_CAR, 75),
                new CoachSpec("C2", CoachType.CHAIR_CAR, 75),
                new CoachSpec("C3", CoachType.CHAIR_CAR, 75)
        ));

        // 4. Create Schedules and Seat Inventories for today and upcoming 14 days
        LocalDate today = LocalDate.now();
        List<Train> allTrains = List.of(deccan, deccanQueen, pragati, rajdhani, vandeBharat);

        TrainSchedule sampleDeccanSchedule = null;

        for (Train train : allTrains) {
            for (int day = 0; day <= 14; day++) {
                LocalDate journeyDate = today.plusDays(day);
                TrainSchedule schedule = TrainSchedule.builder()
                        .train(train)
                        .journeyDate(journeyDate)
                        .status(TrainStatus.ACTIVE)
                        .build();
                trainScheduleRepository.save(schedule);

                if (train.equals(deccan) && day == 6) {
                    sampleDeccanSchedule = schedule;
                }

                // Initialize seat inventories for this schedule
                List<Coach> coaches = coachRepository.findByTrainOrderByCoachNumberAsc(train);
                List<SeatInventory> inventories = new ArrayList<>();
                for (Coach coach : coaches) {
                    List<Seat> seats = seatRepository.findByCoachOrderBySeatNumberAsc(coach);
                    for (Seat seat : seats) {
                        inventories.add(SeatInventory.builder()
                                .trainSchedule(schedule)
                                .seat(seat)
                                .status(SeatInventoryStatus.AVAILABLE)
                                .build());
                    }
                }
                seatInventoryRepository.saveAll(inventories);
            }
        }

        // 5. Seed a Sample Booking for demoUser
        if (sampleDeccanSchedule != null) {
            Booking sampleBooking = Booking.builder()
                    .pnr("4527819234")
                    .user(demoUser)
                    .trainSchedule(sampleDeccanSchedule)
                    .fromStation(csmt)
                    .toStation(pune)
                    .coachType(CoachType.THREE_TIER_AC)
                    .journeyDate(sampleDeccanSchedule.getJourneyDate())
                    .bookingDate(LocalDateTime.now().minusDays(1))
                    .status(BookingStatus.CONFIRMED)
                    .baseFare(1500.0)
                    .reservationFee(40.0)
                    .gst(75.0)
                    .totalAmount(1615.0)
                    .build();
            bookingRepository.save(sampleBooking);

            Passenger p1 = Passenger.builder()
                    .booking(sampleBooking)
                    .name("Rahul Patil")
                    .age(24)
                    .gender("MALE")
                    .seatPreference("WINDOW")
                    .allocatedCoach("B2")
                    .allocatedSeatNumber(41)
                    .allocatedSeatType(SeatType.LOWER)
                    .build();

            Passenger p2 = Passenger.builder()
                    .booking(sampleBooking)
                    .name("Priya Patil")
                    .age(22)
                    .gender("FEMALE")
                    .seatPreference("AISLE")
                    .allocatedCoach("B2")
                    .allocatedSeatNumber(42)
                    .allocatedSeatType(SeatType.MIDDLE)
                    .build();

            passengerRepository.saveAll(List.of(p1, p2));

            // Mark seats 41 & 42 as BOOKED in inventory
            Coach b2 = coachRepository.findByTrainAndCoachNumber(deccan, "B2").orElse(null);
            if (b2 != null) {
                Seat seat41 = seatRepository.findByCoachAndSeatNumber(b2, 41).orElse(null);
                Seat seat42 = seatRepository.findByCoachAndSeatNumber(b2, 42).orElse(null);
                if (seat41 != null) {
                    seatInventoryRepository.findByTrainScheduleAndSeat(sampleDeccanSchedule, seat41)
                            .ifPresent(si -> {
                                si.setStatus(SeatInventoryStatus.BOOKED);
                                seatInventoryRepository.save(si);
                            });
                }
                if (seat42 != null) {
                    seatInventoryRepository.findByTrainScheduleAndSeat(sampleDeccanSchedule, seat42)
                            .ifPresent(si -> {
                                si.setStatus(SeatInventoryStatus.BOOKED);
                                seatInventoryRepository.save(si);
                            });
                }
            }

            Payment payment = Payment.builder()
                    .booking(sampleBooking)
                    .transactionId("TXN9842109842")
                    .amount(1615.0)
                    .paymentMethod(PaymentMethod.UPI)
                    .status(PaymentStatus.SUCCESS)
                    .paymentReference("UPI/RAHUL/09842")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build();
            paymentRepository.save(payment);

            Notification notification = Notification.builder()
                    .user(demoUser)
                    .title("Ticket Confirmed: PNR 4527819234")
                    .message("Your booking for Deccan Express (12123) from CSMT to PUNE is confirmed for " + sampleDeccanSchedule.getJourneyDate())
                    .type(NotificationType.BOOKING_CONFIRMED)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        log.info("Database successfully seeded with stations, trains, routes, schedules, coaches, and demo data!");
    }

    private Station createStation(String code, String name, String city, String state) {
        Station s = Station.builder()
                .code(code)
                .name(name)
                .city(city)
                .state(state)
                .build();
        return stationRepository.save(s);
    }

    private void createStop(Train train, Station station, int stopNumber, String arr, String dep, double dist, int day, int halt, String platform) {
        TrainStop stop = TrainStop.builder()
                .train(train)
                .station(station)
                .stopNumber(stopNumber)
                .arrivalTime(arr)
                .departureTime(dep)
                .distanceFromSourceKm(dist)
                .dayNumber(day)
                .haltMinutes(halt)
                .platform(platform)
                .build();
        trainStopRepository.save(stop);
    }

    private record CoachSpec(String coachNumber, CoachType coachType, int totalSeats) {}

    private void createCoachesForTrain(Train train, List<CoachSpec> specs) {
        for (CoachSpec spec : specs) {
            Coach coach = Coach.builder()
                    .train(train)
                    .coachNumber(spec.coachNumber)
                    .coachType(spec.coachType)
                    .totalSeats(spec.totalSeats)
                    .build();
            coachRepository.save(coach);

            List<Seat> seats = new ArrayList<>();
            for (int i = 1; i <= spec.totalSeats; i++) {
                SeatType seatType = getBerthTypeForSeatNumber(spec.coachType, i);
                seats.add(Seat.builder()
                        .coach(coach)
                        .seatNumber(i)
                        .seatType(seatType)
                        .build());
            }
            seatRepository.saveAll(seats);
        }
    }

    private SeatType getBerthTypeForSeatNumber(CoachType coachType, int seatNumber) {
        if (coachType == CoachType.CHAIR_CAR || coachType == CoachType.SECOND_SEATING) {
            int mod = seatNumber % 5;
            if (mod == 1 || mod == 0) return SeatType.WINDOW;
            if (mod == 2 || mod == 4) return SeatType.AISLE;
            return SeatType.MIDDLE_CHAIR;
        }

        if (coachType == CoachType.FIRST_AC) {
            int mod = seatNumber % 4;
            if (mod == 1 || mod == 2) return SeatType.LOWER;
            return SeatType.UPPER;
        }

        if (coachType == CoachType.TWO_TIER_AC) {
            int mod = seatNumber % 6;
            if (mod == 1 || mod == 2) return SeatType.LOWER;
            if (mod == 3 || mod == 4) return SeatType.UPPER;
            if (mod == 5) return SeatType.SIDE_LOWER;
            return SeatType.SIDE_UPPER;
        }

        // 3A or Sleeper: standard 8-berth bay pattern
        int mod = seatNumber % 8;
        return switch (mod) {
            case 1, 4 -> SeatType.LOWER;
            case 2, 5 -> SeatType.MIDDLE;
            case 3, 6 -> SeatType.UPPER;
            case 7 -> SeatType.SIDE_LOWER;
            default -> SeatType.SIDE_UPPER;
        };
    }
}
