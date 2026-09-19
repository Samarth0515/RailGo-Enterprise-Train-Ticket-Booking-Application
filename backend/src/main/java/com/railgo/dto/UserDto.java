package com.railgo.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileResponse {
        private Long id;
        private String name;
        private String email;
        private String mobile;
        private LocalDate dateOfBirth;
        private String gender;
        private String address;
        private String role;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProfileRequest {
        private String name;
        private String mobile;
        private LocalDate dateOfBirth;
        private String gender;
        private String address;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }
}
