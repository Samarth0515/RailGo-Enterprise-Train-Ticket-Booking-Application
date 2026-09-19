package com.railgo.repository;

import com.railgo.entity.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatInventoryRepository extends JpaRepository<SeatInventory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT si FROM SeatInventory si WHERE si.id = :id")
    Optional<SeatInventory> findWithLockById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT si FROM SeatInventory si WHERE si.trainSchedule = :schedule AND si.seat = :seat")
    Optional<SeatInventory> findWithLockByScheduleAndSeat(
            @Param("schedule") TrainSchedule schedule,
            @Param("seat") Seat seat
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT si FROM SeatInventory si WHERE si.trainSchedule = :schedule AND si.seat.id IN :seatIds")
    List<SeatInventory> findWithLockByScheduleAndSeatIds(
            @Param("schedule") TrainSchedule schedule,
            @Param("seatIds") List<Long> seatIds
    );

    Optional<SeatInventory> findByTrainScheduleAndSeat(TrainSchedule trainSchedule, Seat seat);

    @Query("SELECT si FROM SeatInventory si WHERE si.trainSchedule = :schedule AND si.seat.coach = :coach")
    List<SeatInventory> findByScheduleAndCoach(
            @Param("schedule") TrainSchedule schedule,
            @Param("coach") Coach coach
    );

    @Query("SELECT COUNT(si) FROM SeatInventory si WHERE si.trainSchedule = :schedule " +
           "AND si.seat.coach.coachType = :coachType " +
           "AND si.status = 'AVAILABLE'")
    long countAvailableSeatsByScheduleAndCoachType(
            @Param("schedule") TrainSchedule schedule,
            @Param("coachType") CoachType coachType
    );

    @Query("SELECT si FROM SeatInventory si WHERE si.status = :status AND si.lockedUntil < :threshold")
    List<SeatInventory> findExpiredLocks(
            @Param("status") SeatInventoryStatus status,
            @Param("threshold") LocalDateTime threshold
    );

    List<SeatInventory> findByTrainSchedule(TrainSchedule trainSchedule);
}
