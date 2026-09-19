package com.railgo.service;

import com.railgo.dto.AdminDto;
import com.railgo.entity.*;
import com.railgo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TrainRepository trainRepository;
    private final BookingRepository bookingRepository;
    private final SeatInventoryRepository seatInventoryRepository;
    private final TrainScheduleRepository trainScheduleRepository;

    private static final DateTimeFormatter TREND_DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM");

    @Transactional(readOnly = true)
    public AdminDto.DashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTrains = trainRepository.count();
        long totalBookings = bookingRepository.count();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayBookings = bookingRepository.countTodayBookings(startOfDay, endOfDay);

        Double revenue = bookingRepository.sumRevenueByStatus(BookingStatus.CONFIRMED);
        double totalRevenue = revenue != null ? revenue : 0.0;

        long confirmedCount = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long cancelledCount = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        double cancellationRate = totalBookings > 0 ? ((double) cancelledCount / totalBookings) * 100.0 : 0.0;

        // Last 7 days trend
        List<AdminDto.DailyBookingMetric> trend = new ArrayList<>();
        List<Booking> allBookings = bookingRepository.findAllByOrderByBookingDateDesc();

        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            long count = allBookings.stream()
                    .filter(b -> b.getBookingDate().toLocalDate().equals(d) && b.getStatus() == BookingStatus.CONFIRMED)
                    .count();
            double rev = allBookings.stream()
                    .filter(b -> b.getBookingDate().toLocalDate().equals(d) && b.getStatus() == BookingStatus.CONFIRMED)
                    .mapToDouble(Booking::getTotalAmount)
                    .sum();

            trend.add(AdminDto.DailyBookingMetric.builder()
                    .date(d.format(TREND_DATE_FORMAT))
                    .bookingsCount(count)
                    .revenue(rev)
                    .build());
        }

        // Top trains occupancy
        List<Train> trains = trainRepository.findAll();
        List<AdminDto.TrainOccupancyMetric> occupancyMetrics = new ArrayList<>();

        for (Train train : trains) {
            int totalSeatsInTrain = train.getCoaches().stream().mapToInt(Coach::getTotalSeats).sum();
            if (totalSeatsInTrain == 0) totalSeatsInTrain = 100;

            // Compute booked seats across active schedules for this train
            List<TrainSchedule> schedules = trainScheduleRepository.findByTrain(train);
            int bookedSeats = 0;
            int totalSeatsCount = 0;

            for (TrainSchedule s : schedules) {
                List<SeatInventory> invs = seatInventoryRepository.findByTrainSchedule(s);
                totalSeatsCount += invs.size();
                bookedSeats += (int) invs.stream().filter(si -> si.getStatus() == SeatInventoryStatus.BOOKED).count();
            }

            double occupancy = totalSeatsCount > 0 ? ((double) bookedSeats / totalSeatsCount) * 100.0 : 75.0;

            occupancyMetrics.add(AdminDto.TrainOccupancyMetric.builder()
                    .trainNumber(train.getTrainNumber())
                    .trainName(train.getTrainName())
                    .totalSeats(totalSeatsInTrain)
                    .bookedSeats(bookedSeats)
                    .occupancyPercentage(Math.round(occupancy * 10.0) / 10.0)
                    .build());
        }

        // Revenue by class breakdown
        Map<String, Double> revByClass = new HashMap<>();
        for (CoachType ct : CoachType.values()) {
            double sum = allBookings.stream()
                    .filter(b -> b.getCoachType() == ct && b.getStatus() == BookingStatus.CONFIRMED)
                    .mapToDouble(Booking::getTotalAmount)
                    .sum();
            revByClass.put(ct.getCode(), Math.round(sum * 100.0) / 100.0);
        }

        return AdminDto.DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalTrains(totalTrains)
                .totalBookings(totalBookings)
                .todayBookings(todayBookings)
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .confirmedBookings(confirmedCount)
                .cancelledBookings(cancelledCount)
                .cancellationRate(Math.round(cancellationRate * 10.0) / 10.0)
                .recentBookingsTrend(trend)
                .topTrainsOccupancy(occupancyMetrics)
                .revenueByClass(revByClass)
                .build();
    }
}
