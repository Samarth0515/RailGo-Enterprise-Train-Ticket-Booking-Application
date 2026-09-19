package com.railgo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "coaches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    @JsonBackReference("train-coaches")
    private Train train;

    @Column(nullable = false, length = 10)
    private String coachNumber; // e.g., "A1", "B1", "B2", "S1"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoachType coachType;

    @Column(nullable = false)
    private Integer totalSeats;

    @OneToMany(mappedBy = "coach", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("seatNumber ASC")
    @JsonManagedReference("coach-seats")
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();
}
