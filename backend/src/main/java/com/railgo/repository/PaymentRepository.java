package com.railgo.repository;

import com.railgo.entity.Booking;
import com.railgo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBooking(Booking booking);
    Optional<Payment> findByTransactionId(String transactionId);
}
