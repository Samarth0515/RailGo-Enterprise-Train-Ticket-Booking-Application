package com.railgo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "passengers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonBackReference("booking-passengers")
    private Booking booking;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 10)
    private String gender; // MALE, FEMALE, OTHER

    private String seatPreference; // WINDOW, AISLE, LOWER, MIDDLE, UPPER, SIDE_LOWER, SIDE_UPPER

    @Column(nullable = false)
    private String allocatedCoach; // e.g. "B2"

    @Column(nullable = false)
    private Integer allocatedSeatNumber; // e.g. 42

    @Enumerated(EnumType.STRING)
    private SeatType allocatedSeatType; // e.g. LOWER, UPPER
}
