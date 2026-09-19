package com.railgo.dto;

import com.railgo.entity.BookingStatus;
import com.railgo.entity.CoachType;
import com.railgo.entity.PaymentMethod;
import com.railgo.entity.SeatType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateBookingRequest {
        @NotNull(message = "Schedule ID is required")
        private Long scheduleId;

        @NotNull(message = "Origin station ID is required")
        private Long fromStationId;

        @NotNull(message = "Destination station ID is required")
        private Long toStationId;

        @NotNull(message = "Coach type is required")
        private CoachType coachType;

        @NotEmpty(message = "At least one passenger is required")
        @Valid
        private List<PassengerRequest> passengers;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        private String paymentReference;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PassengerRequest {
        @NotNull(message = "Passenger name is required")
        private String name;

        @NotNull(message = "Age is required")
        private Integer age;

        @NotNull(message = "Gender is required")
        private String gender;

        private String seatPreference;

        // Either user selects a specific seatId or system allocates
        private Long seatId;
        private String coachNumber;
        private Integer seatNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingResponse {
        private Long bookingId;
        private String pnr;
        private Long scheduleId;
        private String trainNumber;
        private String trainName;
        private CoachType coachType;
        private String classCode;

        private String fromStationCode;
        private String fromStationName;
        private String departureTime;

        private String toStationCode;
        private String toStationName;
        private String arrivalTime;

        private LocalDate journeyDate;
        private LocalDateTime bookingDate;
        private BookingStatus status;

        private Double baseFare;
        private Double reservationFee;
        private Double gst;
        private Double totalAmount;
        private Double cancellationRefund;
        private LocalDateTime cancelledAt;

        private List<PassengerResponse> passengers;
        private PaymentSummary payment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PassengerResponse {
        private Long id;
        private String name;
        private Integer age;
        private String gender;
        private String seatPreference;
        private String coachNumber;
        private Integer seatNumber;
        private SeatType seatType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentSummary {
        private String transactionId;
        private PaymentMethod paymentMethod;
        private String status;
        private Double amount;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CancelBookingResponse {
        private String pnr;
        private BookingStatus status;
        private Double totalAmount;
        private Double cancellationFee;
        private Double refundAmount;
        private String message;
    }
}
