package com.railgo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationDto {
    private Long id;

    @NotBlank(message = "Station code is required")
    private String code;

    @NotBlank(message = "Station name is required")
    private String name;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;
}
