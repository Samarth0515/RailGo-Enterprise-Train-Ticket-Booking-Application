package com.railgo.service;

import com.railgo.dto.BookingDto;
import com.railgo.dto.TrainDto;
import com.railgo.entity.*;
import com.railgo.exception.BadRequestException;
import com.railgo.exception.ResourceNotFoundException;
import com.railgo.exception.SeatUnavailableException;
import com.railgo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final StationRepository stationRepository;
    private final SeatRepository seatRepository;
    private final SeatInventoryRepository seatInventoryRepository;
    private final PassengerRepository passengerRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FareService fareService;
    private final TrainStopRepository trainStopRepository;
    private final CoachRepository coachRepository;

    @Value("${app.booking.seat-lock-timeout-minutes:5}")
    private int seatLockTimeoutMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public TrainDto.LockSeatsResponse lockSeats(TrainDto.LockSeatsRequest request, Long userId) {
        TrainSchedule schedule = trainScheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + request.getScheduleId()));

        List<SeatInventory> inventories = seatInventoryRepository.findWithLockByScheduleAndSeatIds(schedule, request.getSeatIds());

        if (inventories.size() != request.getSeatIds().size()) {
            throw new BadRequestException("Some selected seats do not exist in inventory for this schedule");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lockExpiry = now.plusMinutes(seatLockTimeoutMinutes);

        for (SeatInventory inv : inventories) {
            if (inv.getStatus() == SeatInventoryStatus.BOOKED) {
                throw new SeatUnavailableException("Seat " + inv.getSeat().getSeatNumber() + " is already booked");
            }

            if (inv.getStatus() == SeatInventoryStatus.LOCKED &&
                    inv.getLockedUntil() != null &&
                    inv.getLockedUntil().isAfter(now) &&
                    !Objects.equals(inv.getLockedByUserId(), userId)) {
                throw new SeatUnavailableException("Seat " + inv.getSeat().getSeatNumber() + " is currently selected by another passenger");
            }

            inv.setStatus(SeatInventoryStatus.LOCKED);
            inv.setLockedUntil(lockExpiry);
            inv.setLockedByUserId(userId);
        }

        seatInventoryRepository.saveAll(inventories);

        return TrainDto.LockSeatsResponse.builder()
                .success(true)
                .message("Seats temporarily locked for " + seatLockTimeoutMinutes + " minutes")
                .lockedSeatIds(request.getSeatIds())
                .lockDurationSeconds(seatLockTimeoutMinutes * 60)
                .build();
    }

    @Transactional
    public BookingDto.BookingResponse createBooking(BookingDto.CreateBookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        TrainSchedule schedule = trainScheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + request.getScheduleId()));

        Station fromStation = stationRepository.findById(request.getFromStationId())
                .orElseThrow(() -> new ResourceNotFoundException("From station not found with id: " + request.getFromStationId()));

        Station toStation = stationRepository.findById(request.getToStationId())
                .orElseThrow(() -> new ResourceNotFoundException("To station not found with id: " + request.getToStationId()));

        // Calculate distance
        TrainStop fromStop = trainStopRepository.findByTrainAndStation(schedule.getTrain(), fromStation)
                .orElseThrow(() -> new BadRequestException("Origin stop not on train route"));
        TrainStop toStop = trainStopRepository.findByTrainAndStation(schedule.getTrain(), toStation)
                .orElseThrow(() -> new BadRequestException("Destination stop not on train route"));

        if (fromStop.getStopNumber() >= toStop.getStopNumber()) {
            throw new BadRequestException("Origin stop must precede destination stop");
        }

        double distanceKm = Math.abs(toStop.getDistanceFromSourceKm() - fromStop.getDistanceFromSourceKm());
        FareService.FareBreakdown fare = fareService.calculateFare(distanceKm, request.getCoachType(), request.getPassengers().size());

        String pnr = generateUniquePnr();

        Booking booking = Booking.builder()
                .pnr(pnr)
                .user(user)
                .trainSchedule(schedule)
                .fromStation(fromStation)
                .toStation(toStation)
                .coachType(request.getCoachType())
                .journeyDate(schedule.getJourneyDate())
                .bookingDate(LocalDateTime.now())
                .status(BookingStatus.CONFIRMED)
                .baseFare(fare.getBaseFare())
                .reservationFee(fare.getReservationFee())
                .gst(fare.getGst())
                .totalAmount(fare.getTotalFare())
                .build();

        LocalDateTime now = LocalDateTime.now();
        List<Passenger> passengers = new ArrayList<>();

        for (BookingDto.PassengerRequest pReq : request.getPassengers()) {
            Seat allocatedSeat = null;

            if (pReq.getSeatId() != null) {
                // Specific seat requested
                Seat seat = seatRepository.findById(pReq.getSeatId())
                        .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + pReq.getSeatId()));

                SeatInventory inv = seatInventoryRepository.findWithLockByScheduleAndSeat(schedule, seat)
                        .orElseThrow(() -> new ResourceNotFoundException("Seat inventory missing for seat: " + seat.getId()));

                if (inv.getStatus() == SeatInventoryStatus.BOOKED) {
                    throw new SeatUnavailableException("Seat " + seat.getSeatNumber() + " in coach " + seat.getCoach().getCoachNumber() + " is already booked");
                }

                if (inv.getStatus() == SeatInventoryStatus.LOCKED &&
                        inv.getLockedUntil() != null &&
                        inv.getLockedUntil().isAfter(now) &&
                        !Objects.equals(inv.getLockedByUserId(), userId)) {
                    throw new SeatUnavailableException("Seat " + seat.getSeatNumber() + " is currently locked by another user");
                }

                inv.setStatus(SeatInventoryStatus.BOOKED);
                inv.setLockedUntil(null);
                inv.setLockedByUserId(null);
                seatInventoryRepository.save(inv);
                allocatedSeat = seat;
            } else {
                // Auto-allocation: find first available seat in the coach type with lock
                List<Coach> coaches = schedule.getTrain().getCoaches().stream()
                        .filter(c -> c.getCoachType() == request.getCoachType())
                        .toList();

                for (Coach coach : coaches) {
                    List<SeatInventory> coachInvs = seatInventoryRepository.findByScheduleAndCoach(schedule, coach);
                    for (SeatInventory inv : coachInvs) {
                        if (inv.getStatus() == SeatInventoryStatus.AVAILABLE) {
                            SeatInventory lockedInv = seatInventoryRepository.findWithLockById(inv.getId()).orElse(null);
                            if (lockedInv != null && lockedInv.getStatus() == SeatInventoryStatus.AVAILABLE) {
                                lockedInv.setStatus(SeatInventoryStatus.BOOKED);
                                lockedInv.setLockedUntil(null);
                                lockedInv.setLockedByUserId(null);
                                seatInventoryRepository.save(lockedInv);
                                allocatedSeat = lockedInv.getSeat();
                                break;
                            }
                        }
                    }
                    if (allocatedSeat != null) break;
                }

                if (allocatedSeat == null) {
                    throw new SeatUnavailableException("No seats available in class " + request.getCoachType().getDisplayName());
                }
            }

            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .name(pReq.getName().trim())
                    .age(pReq.getAge())
                    .gender(pReq.getGender().toUpperCase())
                    .seatPreference(pReq.getSeatPreference())
                    .allocatedCoach(allocatedSeat.getCoach().getCoachNumber())
                    .allocatedSeatNumber(allocatedSeat.getSeatNumber())
                    .allocatedSeatType(allocatedSeat.getSeatType())
                    .build();

            passengers.add(passenger);
        }

        booking.setPassengers(passengers);
        Booking savedBooking = bookingRepository.save(booking);

        // Record initial payment
        String txnId = "TXN" + System.currentTimeMillis() + (100 + RANDOM.nextInt(900));
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .transactionId(txnId)
                .amount(savedBooking.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.SUCCESS)
                .paymentReference(request.getPaymentReference() != null ? request.getPaymentReference() : "REF-" + pnr)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // Create in-app notification
        Notification notification = Notification.builder()
                .user(user)
                .title("Ticket Confirmed: PNR " + pnr)
                .message("Your booking for " + schedule.getTrain().getTrainName() + " (" + schedule.getTrain().getTrainNumber() + ") on " + schedule.getJourneyDate() + " is confirmed!")
                .type(NotificationType.BOOKING_CONFIRMED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        return mapBookingToResponse(savedBooking, fromStop.getDepartureTime(), toStop.getArrivalTime(), payment);
    }

    @Transactional(readOnly = true)
    public BookingDto.BookingResponse getBookingByPnr(String pnr) {
        Booking booking = bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with PNR: " + pnr));

        TrainStop fromStop = trainStopRepository.findByTrainAndStation(booking.getTrainSchedule().getTrain(), booking.getFromStation()).orElse(null);
        TrainStop toStop = trainStopRepository.findByTrainAndStation(booking.getTrainSchedule().getTrain(), booking.getToStation()).orElse(null);
        List<Payment> payments = paymentRepository.findByBooking(booking);
        Payment latestPayment = payments.isEmpty() ? null : payments.get(payments.size() - 1);

        String depTime = fromStop != null ? fromStop.getDepartureTime() : booking.getTrainSchedule().getTrain().getDepartureTime();
        String arrTime = toStop != null ? toStop.getArrivalTime() : booking.getTrainSchedule().getTrain().getArrivalTime();

        return mapBookingToResponse(booking, depTime, arrTime, latestPayment);
    }

    @Transactional(readOnly = true)
    public List<BookingDto.BookingResponse> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Booking> bookings = bookingRepository.findByUserOrderByBookingDateDesc(user);
        return bookings.stream().map(b -> {
            TrainStop fromStop = trainStopRepository.findByTrainAndStation(b.getTrainSchedule().getTrain(), b.getFromStation()).orElse(null);
            TrainStop toStop = trainStopRepository.findByTrainAndStation(b.getTrainSchedule().getTrain(), b.getToStation()).orElse(null);
            List<Payment> payments = paymentRepository.findByBooking(b);
            Payment latestPayment = payments.isEmpty() ? null : payments.get(payments.size() - 1);

            String depTime = fromStop != null ? fromStop.getDepartureTime() : b.getTrainSchedule().getTrain().getDepartureTime();
            String arrTime = toStop != null ? toStop.getArrivalTime() : b.getTrainSchedule().getTrain().getArrivalTime();
            return mapBookingToResponse(b, depTime, arrTime, latestPayment);
        }).collect(Collectors.toList());
    }

    @Transactional
    public BookingDto.CancelBookingResponse cancelBooking(String pnr, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with PNR: " + pnr));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking with PNR " + pnr + " is already cancelled");
        }

        // Release seats back to inventory
        TrainSchedule schedule = booking.getTrainSchedule();
        for (Passenger passenger : booking.getPassengers()) {
            Coach coach = coachRepository.findByTrainAndCoachNumber(schedule.getTrain(), passenger.getAllocatedCoach()).orElse(null);
            if (coach != null) {
                Seat seat = seatRepository.findByCoachAndSeatNumber(coach, passenger.getAllocatedSeatNumber()).orElse(null);
                if (seat != null) {
                    Optional<SeatInventory> invOpt = seatInventoryRepository.findWithLockByScheduleAndSeat(schedule, seat);
                    invOpt.ifPresent(inv -> {
                        inv.setStatus(SeatInventoryStatus.AVAILABLE);
                        inv.setLockedUntil(null);
                        inv.setLockedByUserId(null);
                        seatInventoryRepository.save(inv);
                    });
                }
            }
        }

        double refund = fareService.calculateCancellationRefund(booking.getTotalAmount(), booking.getCoachType());
        double cancellationFee = fareService.getCancellationFee(booking.getCoachType());

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationRefund(refund);
        bookingRepository.save(booking);

        // Record refund payment
        String refundTxnId = "REF" + System.currentTimeMillis() + (100 + RANDOM.nextInt(900));
        Payment refundPayment = Payment.builder()
                .booking(booking)
                .transactionId(refundTxnId)
                .amount(refund)
                .paymentMethod(PaymentMethod.UPI)
                .status(PaymentStatus.REFUNDED)
                .paymentReference("CANCEL-" + pnr)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(refundPayment);

        // Send cancellation notification
        Notification notification = Notification.builder()
                .user(booking.getUser())
                .title("Booking Cancelled: PNR " + pnr)
                .message("Your booking has been cancelled. Refund of ₹" + refund + " has been initiated to your original payment method.")
                .type(NotificationType.REFUND_PROCESSED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        return BookingDto.CancelBookingResponse.builder()
                .pnr(pnr)
                .status(BookingStatus.CANCELLED)
                .totalAmount(booking.getTotalAmount())
                .cancellationFee(cancellationFee)
                .refundAmount(refund)
                .message("Booking successfully cancelled. Refund of ₹" + refund + " initiated.")
                .build();
    }

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void releaseExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();
        List<SeatInventory> expired = seatInventoryRepository.findExpiredLocks(SeatInventoryStatus.LOCKED, now);
        if (!expired.isEmpty()) {
            log.info("Releasing {} expired seat locks", expired.size());
            for (SeatInventory inv : expired) {
                inv.setStatus(SeatInventoryStatus.AVAILABLE);
                inv.setLockedUntil(null);
                inv.setLockedByUserId(null);
            }
            seatInventoryRepository.saveAll(expired);
        }
    }

    private String generateUniquePnr() {
        String pnr;
        do {
            long number = 1000000000L + (long)(RANDOM.nextDouble() * 9000000000L);
            pnr = String.valueOf(number);
        } while (bookingRepository.findByPnr(pnr).isPresent());
        return pnr;
    }

    private BookingDto.BookingResponse mapBookingToResponse(Booking b, String depTime, String arrTime, Payment payment) {
        List<BookingDto.PassengerResponse> passengerResponses = b.getPassengers().stream().map(p ->
                BookingDto.PassengerResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .age(p.getAge())
                        .gender(p.getGender())
                        .seatPreference(p.getSeatPreference())
                        .coachNumber(p.getAllocatedCoach())
                        .seatNumber(p.getAllocatedSeatNumber())
                        .seatType(p.getAllocatedSeatType())
                        .build()
        ).collect(Collectors.toList());

        BookingDto.PaymentSummary paymentSummary = payment != null ?
                BookingDto.PaymentSummary.builder()
                        .transactionId(payment.getTransactionId())
                        .paymentMethod(payment.getPaymentMethod())
                        .status(payment.getStatus().name())
                        .amount(payment.getAmount())
                        .createdAt(payment.getCreatedAt())
                        .build() : null;

        return BookingDto.BookingResponse.builder()
                .bookingId(b.getId())
                .pnr(b.getPnr())
                .scheduleId(b.getTrainSchedule().getId())
                .trainNumber(b.getTrainSchedule().getTrain().getTrainNumber())
                .trainName(b.getTrainSchedule().getTrain().getTrainName())
                .coachType(b.getCoachType())
                .classCode(b.getCoachType().getCode())
                .fromStationCode(b.getFromStation().getCode())
                .fromStationName(b.getFromStation().getName())
                .departureTime(depTime)
                .toStationCode(b.getToStation().getCode())
                .toStationName(b.getToStation().getName())
                .arrivalTime(arrTime)
                .journeyDate(b.getJourneyDate())
                .bookingDate(b.getBookingDate())
                .status(b.getStatus())
                .baseFare(b.getBaseFare())
                .reservationFee(b.getReservationFee())
                .gst(b.getGst())
                .totalAmount(b.getTotalAmount())
                .cancellationRefund(b.getCancellationRefund())
                .cancelledAt(b.getCancelledAt())
                .passengers(passengerResponses)
                .payment(paymentSummary)
                .build();
    }
}
