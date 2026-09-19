package com.railgo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trains")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Train {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String trainNumber; // e.g., 12123

    @Column(nullable = false)
    private String trainName; // e.g., Deccan Express

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainType trainType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_station_id", nullable = false)
    private Station sourceStation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_station_id", nullable = false)
    private Station destinationStation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrainStatus status = TrainStatus.ACTIVE;

    @Column(nullable = false)
    private String departureTime; // e.g., "07:00"

    @Column(nullable = false)
    private String arrivalTime; // e.g., "10:30"

    @Column(nullable = false)
    private Double totalDistanceKm; // e.g., 192.0

    // Comma-separated days of week train runs, e.g. "MON,TUE,WED,THU,FRI,SAT,SUN" or "ALL"
    @Column(nullable = false)
    @Builder.Default
    private String runsOnDays = "ALL";

    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stopNumber ASC")
    @JsonManagedReference("train-stops")
    @Builder.Default
    private List<TrainStop> stops = new ArrayList<>();

    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("train-coaches")
    @Builder.Default
    private List<Coach> coaches = new ArrayList<>();
}
