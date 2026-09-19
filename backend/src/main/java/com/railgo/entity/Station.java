package com.railgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code; // e.g., CSMT, PUNE, NDLS

    @Column(nullable = false)
    private String name; // e.g., Chhatrapati Shivaji Maharaj Terminus

    @Column(nullable = false)
    private String city; // e.g., Mumbai

    @Column(nullable = false)
    private String state; // e.g., Maharashtra
}
