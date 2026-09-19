package com.railgo.controller;

import com.railgo.dto.PaymentDto;
import com.railgo.entity.PaymentStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Mock multi-method payment gateway simulation (UPI, Card, Net Banking, Wallet)")
public class PaymentController {

    @PostMapping("/mock-process")
    @Operation(summary = "Simulate payment transaction through gateway")
    public ResponseEntity<PaymentDto.PaymentResponse> processMockPayment(@RequestBody PaymentDto.ProcessPaymentRequest request) {
        String txnId = "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return ResponseEntity.ok(PaymentDto.PaymentResponse.builder()
                .transactionId(txnId)
                .pnr(request.getPnr())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.SUCCESS)
                .timestamp(LocalDateTime.now())
                .message("Payment authorized and captured successfully via " + request.getPaymentMethod())
                .build());
    }
}
