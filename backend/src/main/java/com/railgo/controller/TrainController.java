package com.railgo.controller;

import com.railgo.dto.TrainDto;
import com.railgo.entity.CoachType;
import com.railgo.service.TrainSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
@Tag(name = "Trains", description = "Train search, schedules, route stops timeline, and seat maps")
public class TrainController {

    private final TrainSearchService trainSearchService;

    @GetMapping("/search")
    @Operation(summary = "Search trains connecting two stations on a specific date")
    public ResponseEntity<List<TrainDto.SearchResult>> searchTrains(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String coachType) {

        CoachType requestedType = null;
        if (coachType != null && !coachType.trim().isEmpty()) {
            try {
                requestedType = CoachType.fromCode(coachType);
            } catch (Exception ignored) {}
        }

        List<TrainDto.SearchResult> results = trainSearchService.searchTrains(from, to, date, requestedType);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed train itinerary, stops timeline, and coaches")
    public ResponseEntity<TrainDto.TrainDetails> getTrainDetails(@PathVariable Long id) {
        return ResponseEntity.ok(trainSearchService.getTrainDetails(id));
    }

    @GetMapping("/schedule/{scheduleId}/seats")
    @Operation(summary = "Get interactive coach seat map and live availability for a schedule")
    public ResponseEntity<TrainDto.CoachSeatMapResponse> getCoachSeatMap(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(trainSearchService.getCoachSeatMap(scheduleId));
    }
}
