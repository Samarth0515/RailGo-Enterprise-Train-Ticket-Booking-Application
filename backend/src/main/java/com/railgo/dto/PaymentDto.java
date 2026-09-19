package com.railgo.dto;

import com.railgo.entity.PaymentMethod;
import com.railgo.entity.PaymentStatus;
import lombok.*;
import java.time.LocalDateTime;

public class PaymentDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessPaymentRequest {
        private String pnr;
        private PaymentMethod paymentMethod;
        private Double amount;
        private String upiId;
        private String cardNumber;
        private String cardHolder;
        private String bankName;
        private String walletName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentResponse {
        private Long paymentId;
        private String transactionId;
        private String pnr;
        private Double amount;
        private PaymentMethod paymentMethod;
        private PaymentStatus status;
        private LocalDateTime timestamp;
        private String message;
    }
}
