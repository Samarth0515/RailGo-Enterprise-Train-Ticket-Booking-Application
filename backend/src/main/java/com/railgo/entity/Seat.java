package com.railgo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id", nullable = false)
    @JsonBackReference("coach-seats")
    private Coach coach;

    @Column(nullable = false)
    private Integer seatNumber; // 1, 2, 3...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatType seatType; // LOWER, MIDDLE, UPPER, SIDE_LOWER, SIDE_UPPER, WINDOW, AISLE
}
