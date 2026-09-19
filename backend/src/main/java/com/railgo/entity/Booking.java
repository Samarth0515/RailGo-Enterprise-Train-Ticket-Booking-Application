package com.railgo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 12)
    private String pnr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "train_schedule_id", nullable = false)
    private TrainSchedule trainSchedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_station_id", nullable = false)
    private Station fromStation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_station_id", nullable = false)
    private Station toStation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoachType coachType;

    @Column(nullable = false)
    private LocalDate journeyDate;

    @Builder.Default
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(nullable = false)
    private Double baseFare;

    @Column(nullable = false)
    private Double reservationFee;

    @Column(nullable = false)
    private Double gst;

    @Column(nullable = false)
    private Double totalAmount;

    private Double cancellationRefund;

    private LocalDateTime cancelledAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("booking-passengers")
    @Builder.Default
    private List<Passenger> passengers = new ArrayList<>();
}
