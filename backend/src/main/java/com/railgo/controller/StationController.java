package com.railgo.controller;

import com.railgo.dto.StationDto;
import com.railgo.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@Tag(name = "Stations", description = "Station directory and admin station management")
public class StationController {

    private final StationService stationService;

    @GetMapping
    @Operation(summary = "Get all railway stations")
    public ResponseEntity<List<StationDto>> getAllStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get station by ID")
    public ResponseEntity<StationDto> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search stations by name, code, or city")
    public ResponseEntity<List<StationDto>> searchStations(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(stationService.searchStations(q));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new station (Admin only)")
    public ResponseEntity<StationDto> createStation(@Valid @RequestBody StationDto dto) {
        return ResponseEntity.ok(stationService.createStation(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing station (Admin only)")
    public ResponseEntity<StationDto> updateStation(@PathVariable Long id, @Valid @RequestBody StationDto dto) {
        return ResponseEntity.ok(stationService.updateStation(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a station (Admin only)")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
}
