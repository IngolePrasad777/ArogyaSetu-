package com.arogyasetu.dto;

import com.arogyasetu.entity.Gender;
import com.arogyasetu.entity.Role;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @Email @NotBlank String email,
            @Size(min = 8) @NotBlank String password,
            @NotNull Role role,
            @NotBlank String name,
            String phone,
            Gender gender,
            LocalDate dob,
            String specialization,
            String qualification,
            Integer experience,
            @AssertTrue boolean consentAccepted
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record RefreshRequest(@NotBlank String refreshToken) {}
    public record ForgotPasswordRequest(@Email @NotBlank String email) {}
    public record OtpRequest(@Email @NotBlank String email) {}
    public record OtpVerifyRequest(@Email @NotBlank String email, @NotBlank String otp) {}
    public record AuthResponse(String accessToken, String refreshToken, String tokenType, UserProfile profile) {}
    public record UserProfile(UUID id, String email, Role role, boolean enabled, Instant createdAt) {}
}
