package com.railgo.controller;

import com.railgo.dto.BookingDto;
import com.railgo.dto.TrainDto;
import com.railgo.security.CustomUserDetails;
import com.railgo.service.BookingService;
import com.railgo.service.PdfTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Seat locking, ticket reservation, cancellation, and PDF ticket generation")
public class BookingController {

    private final BookingService bookingService;
    private final PdfTicketService pdfTicketService;

    @PostMapping("/lock-seats")
    @Operation(summary = "Temporarily lock selected seats for 5 minutes during checkout")
    public ResponseEntity<TrainDto.LockSeatsResponse> lockSeats(
            @Valid @RequestBody TrainDto.LockSeatsRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.lockSeats(request, userDetails.getId()));
    }

    @PostMapping
    @Operation(summary = "Create and confirm train ticket booking with payment")
    public ResponseEntity<BookingDto.BookingResponse> createBooking(
            @Valid @RequestBody BookingDto.CreateBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.createBooking(request, userDetails.getId()));
    }

    @GetMapping("/pnr/{pnr}")
    @Operation(summary = "Look up booking details and live status by PNR")
    public ResponseEntity<BookingDto.BookingResponse> getBookingByPnr(@PathVariable String pnr) {
        return ResponseEntity.ok(bookingService.getBookingByPnr(pnr));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get list of all bookings for the authenticated user")
    public ResponseEntity<List<BookingDto.BookingResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getUserBookings(userDetails.getId()));
    }

    @PostMapping("/{pnr}/cancel")
    @Operation(summary = "Cancel an existing confirmed booking and calculate refund")
    public ResponseEntity<BookingDto.CancelBookingResponse> cancelBooking(
            @PathVariable String pnr,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(bookingService.cancelBooking(pnr, userDetails.getId(), isAdmin));
    }

    @GetMapping("/{pnr}/ticket-pdf")
    @Operation(summary = "Download official E-Ticket reservation slip in PDF format")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable String pnr) {
        BookingDto.BookingResponse booking = bookingService.getBookingByPnr(pnr);
        byte[] pdfBytes = pdfTicketService.generateTicketPdf(booking);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "RailGo_Ticket_" + pnr + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
