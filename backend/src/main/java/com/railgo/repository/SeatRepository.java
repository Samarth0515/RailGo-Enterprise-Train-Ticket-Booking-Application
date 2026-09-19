package com.railgo.repository;

import com.railgo.entity.Coach;
import com.railgo.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByCoachOrderBySeatNumberAsc(Coach coach);
    Optional<Seat> findByCoachAndSeatNumber(Coach coach, Integer seatNumber);
}
