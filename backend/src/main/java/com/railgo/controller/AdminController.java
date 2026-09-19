package com.railgo.controller;

import com.railgo.dto.AdminDto;
import com.railgo.dto.BookingDto;
import com.railgo.dto.TrainDto;
import com.railgo.dto.UserDto;
import com.railgo.entity.*;
import com.railgo.exception.BadRequestException;
import com.railgo.exception.ResourceNotFoundException;
import com.railgo.repository.*;
import com.railgo.service.AdminService;
import com.railgo.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Admin dashboard KPIs, revenue analytics, train route builder, and user monitoring")
public class AdminController {

    private final AdminService adminService;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard KPI metrics, trends, and occupancy rates")
    public ResponseEntity<AdminDto.DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all platform bookings")
    public ResponseEntity<List<BookingDto.BookingResponse>> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByBookingDateDesc();
        List<BookingDto.BookingResponse> responses = bookings.stream()
                .map(b -> bookingService.getBookingByPnr(b.getPnr()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/trains")
    @Operation(summary = "Get all trains for management")
    public ResponseEntity<List<Train>> getAllTrains() {
        return ResponseEntity.ok(trainRepository.findAll());
    }

    @PutMapping("/trains/{id}/status")
    @Operation(summary = "Update train active/inactive status")
    @Transactional
    public ResponseEntity<Map<String, String>> updateTrainStatus(@PathVariable Long id, @RequestParam TrainStatus status) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));
        train.setStatus(status);
        trainRepository.save(train);
        return ResponseEntity.ok(Map.of("message", "Train status updated to " + status));
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of registered users")
    public ResponseEntity<List<UserDto.ProfileResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto.ProfileResponse> responses = users.stream().map(u ->
                UserDto.ProfileResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .mobile(u.getMobile())
                        .dateOfBirth(u.getDateOfBirth())
                        .gender(u.getGender())
                        .address(u.getAddress())
                        .role(u.getRole().name())
                        .createdAt(u.getCreatedAt())
                        .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
