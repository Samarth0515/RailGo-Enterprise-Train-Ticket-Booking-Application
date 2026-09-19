package com.railgo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "train_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    @JsonBackReference("train-stops")
    private Train train;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private Integer stopNumber; // 1, 2, 3...

    @Column(nullable = false)
    private String arrivalTime; // "07:00", "08:15"

    @Column(nullable = false)
    private String departureTime; // "07:05", "08:18"

    @Column(nullable = false)
    private Double distanceFromSourceKm; // e.g., 0, 54, 128, 192

    @Column(nullable = false)
    @Builder.Default
    private Integer dayNumber = 1;

    private Integer haltMinutes;

    private String platform;
}
