package com.railgo.controller;

import com.railgo.dto.AuthDto;
import com.railgo.entity.Role;
import com.railgo.entity.User;
import com.railgo.exception.BadRequestException;
import com.railgo.repository.UserRepository;
import com.railgo.security.CustomUserDetails;
import com.railgo.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and token management")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    @Operation(summary = "Register a new passenger account")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email " + request.getEmail() + " is already registered");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number " + request.getMobile() + " is already registered");
        }

        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            try {
                dob = LocalDate.parse(request.getDateOfBirth());
            } catch (Exception ignored) {}
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .mobile(request.getMobile().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(dob)
                .gender(request.getGender())
                .address(request.getAddress())
                .role(Role.ROLE_USER)
                .build();

        User saved = userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        String token = tokenProvider.generateToken(auth);
        String refreshToken = tokenProvider.generateRefreshToken(auth);

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .mobile(saved.getMobile())
                .role(saved.getRole().name())
                .build());
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and obtain JWT")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        CustomUserDetails userPrincipal = (CustomUserDetails) auth.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = tokenProvider.generateToken(auth);
        String refreshToken = tokenProvider.generateRefreshToken(auth);

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh an access token using a valid refresh token")
    public ResponseEntity<AuthDto.AuthResponse> refresh(@Valid @RequestBody AuthDto.RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String username = tokenProvider.getUsernameFromJwt(request.getRefreshToken());
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String newToken = tokenProvider.generateTokenFromUsername(
                user.getEmail(),
                user.getId(),
                List.of(user.getRole().name()),
                86400000L
        );

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(newToken)
                .refreshToken(request.getRefreshToken())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .build());
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<AuthDto.AuthResponse> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .build());
    }
}
