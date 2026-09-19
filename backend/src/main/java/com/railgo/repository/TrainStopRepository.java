package com.railgo.repository;

import com.railgo.entity.Station;
import com.railgo.entity.Train;
import com.railgo.entity.TrainStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainStopRepository extends JpaRepository<TrainStop, Long> {
    List<TrainStop> findByTrainOrderByStopNumberAsc(Train train);
    Optional<TrainStop> findByTrainAndStation(Train train, Station station);

    @Query("SELECT s1.train FROM TrainStop s1, TrainStop s2 " +
           "WHERE s1.train = s2.train " +
           "AND s1.station.id = :originStationId " +
           "AND s2.station.id = :destStationId " +
           "AND s1.stopNumber < s2.stopNumber " +
           "AND s1.train.status = 'ACTIVE'")
    List<Train> findTrainsConnectingStations(
            @Param("originStationId") Long originStationId,
            @Param("destStationId") Long destStationId
    );
}
