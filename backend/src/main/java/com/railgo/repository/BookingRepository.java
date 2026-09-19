package com.railgo.repository;

import com.railgo.entity.Booking;
import com.railgo.entity.BookingStatus;
import com.railgo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPnr(String pnr);
    List<Booking> findByUserOrderByBookingDateDesc(User user);
    List<Booking> findByStatusOrderByBookingDateDesc(BookingStatus status);
    List<Booking> findAllByOrderByBookingDateDesc();

    long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate >= :startOfDay AND b.bookingDate <= :endOfDay")
    long countTodayBookings(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0.0) FROM Booking b WHERE b.status = :status")
    Double sumRevenueByStatus(@Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.trainSchedule.id = :scheduleId")
    List<Booking> findByScheduleId(@Param("scheduleId") Long scheduleId);
}
