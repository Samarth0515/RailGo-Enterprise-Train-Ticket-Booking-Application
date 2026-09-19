package com.railgo.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class AdminDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long totalTrains;
        private long totalBookings;
        private long todayBookings;
        private double totalRevenue;
        private long confirmedBookings;
        private long cancelledBookings;
        private double cancellationRate;

        private List<DailyBookingMetric> recentBookingsTrend;
        private List<TrainOccupancyMetric> topTrainsOccupancy;
        private Map<String, Double> revenueByClass;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyBookingMetric {
        private String date; // e.g. "15 Sep"
        private long bookingsCount;
        private double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrainOccupancyMetric {
        private String trainNumber;
        private String trainName;
        private int totalSeats;
        private int bookedSeats;
        private double occupancyPercentage;
    }
}
