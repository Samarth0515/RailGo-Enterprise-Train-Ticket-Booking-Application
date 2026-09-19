package com.railgo.repository;

import com.railgo.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    Optional<Station> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT s FROM Station s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Station> searchStations(@Param("query") String query);
}
