package com.railgo.repository;

import com.railgo.entity.Train;
import com.railgo.entity.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainScheduleRepository extends JpaRepository<TrainSchedule, Long> {
    Optional<TrainSchedule> findByTrainAndJourneyDate(Train train, LocalDate journeyDate);
    List<TrainSchedule> findByJourneyDate(LocalDate journeyDate);
    List<TrainSchedule> findByTrain(Train train);
}
