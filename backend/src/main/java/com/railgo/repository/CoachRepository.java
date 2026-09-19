package com.railgo.repository;

import com.railgo.entity.Coach;
import com.railgo.entity.CoachType;
import com.railgo.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CoachRepository extends JpaRepository<Coach, Long> {
    List<Coach> findByTrainOrderByCoachNumberAsc(Train train);
    List<Coach> findByTrainAndCoachType(Train train, CoachType coachType);
    Optional<Coach> findByTrainAndCoachNumber(Train train, String coachNumber);
}
