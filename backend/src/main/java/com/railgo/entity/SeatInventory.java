package com.railgo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_inventories", uniqueConstraints = {
    @UniqueConstraint(name = "uk_schedule_seat", columnNames = {"train_schedule_id", "seat_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_schedule_id", nullable = false)
    private TrainSchedule trainSchedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SeatInventoryStatus status = SeatInventoryStatus.AVAILABLE;

    private LocalDateTime lockedUntil;

    private Long lockedByUserId;

    @Version
    private Long version;
}
