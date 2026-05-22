package com.arogyasetu.service;

import com.arogyasetu.audit.AuditService;
import com.arogyasetu.dto.AuthDtos.*;
import com.arogyasetu.entity.*;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.repository.*;
import com.arogyasetu.security.JwtService;
import com.arogyasetu.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;
    @Value("${app.otp.expiration-ms}")
    private long otpExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = users.save(User.builder()
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(true)
                .consentAccepted(request.consentAccepted())
                .consentAcceptedAt(Instant.now())
                .build());

        if (request.role() == Role.PATIENT) {
            String[] parts = splitName(request.name());
            Patient patient = patients.save(Patient.builder()
                    .user(user).firstName(parts[0]).lastName(parts[1]).email(user.getEmail())
                    .phone(request.phone()).gender(request.gender()).dob(request.dob()).build());
            auditService.record("PATIENT_REGISTERED", "Patient", patient.getPatientId(), null);
        } else if (request.role() == Role.DOCTOR) {
            Doctor doctor = doctors.save(Doctor.builder()
                    .user(user).fullName(request.name()).email(user.getEmail())
                    .specialization(request.specialization() == null ? "General Medicine" : request.specialization())
                    .qualification(request.qualification()).experience(request.experience())
                    .availability("Pending schedule setup").verified(false).build());
            auditService.record("DOCTOR_REGISTERED", "Doctor", doctor.getDoctorId(), "pending verification");
        }
        return tokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        auditService.record("LOGIN", "User", user.getId(), null);
        return tokens(user);
    }

    @Transactional
    public void logout() {
        User user = currentUser();
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
        users.save(user);
        auditService.record("LOGOUT", "User", user.getId(), null);
    }

    public UserProfile profile() {
        User user = currentUser();
        return new UserProfile(user.getId(), user.getEmail(), user.getRole(), user.isEnabled(), user.getCreatedAt());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        users.findByEmailIgnoreCase(request.email()).ifPresent(user -> {
            String token = randomToken();
            user.setPasswordResetTokenHash(HashUtil.sha256(token));
            user.setPasswordResetExpiresAt(Instant.now().plusSeconds(900));
            users.save(user);
            auditService.record("PASSWORD_RESET_REQUESTED", "User", user.getId(), "Email integration placeholder");
        });
    }

    @Transactional
    public void requestOtp(OtpRequest request) {
        users.findByEmailIgnoreCase(request.email()).ifPresent(user -> {
            String otp = "%06d".formatted(new SecureRandom().nextInt(1_000_000));
            user.setOtpCodeHash(HashUtil.sha256(otp));
            user.setOtpExpiresAt(Instant.now().plusMillis(otpExpirationMs));
            users.save(user);
            auditService.record("OTP_REQUESTED", "User", user.getId(), "Development OTP: " + otp);
        });
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .filter(u -> u.getOtpExpiresAt() != null && u.getOtpExpiresAt().isAfter(Instant.now()))
                .filter(u -> HashUtil.sha256(request.otp()).equals(u.getOtpCodeHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "OTP expired or invalid"));
        user.setOtpCodeHash(null);
        user.setOtpExpiresAt(null);
        users.save(user);
        auditService.record("OTP_VERIFIED", "User", user.getId(), null);
        return tokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String hash = HashUtil.sha256(request.refreshToken());
        User user = users.findByRefreshTokenHash(hash)
                .filter(u -> u.getRefreshTokenExpiresAt() != null && u.getRefreshTokenExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired or invalid"));
        return tokens(user);
    }

    private AuthResponse tokens(User user) {
        String refresh = randomToken();
        user.setRefreshTokenHash(HashUtil.sha256(refresh));
        user.setRefreshTokenExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        users.save(user);
        return new AuthResponse(jwtService.generate(user), refresh, "Bearer",
                new UserProfile(user.getId(), user.getEmail(), user.getRole(), user.isEnabled(), user.getCreatedAt()));
    }

    private User currentUser() {
        return (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private String randomToken() {
        byte[] bytes = new byte[48];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String[] splitName(String name) {
        String trimmed = name == null ? "" : name.trim();
        int idx = trimmed.indexOf(' ');
        return idx < 0 ? new String[]{trimmed, ""} : new String[]{trimmed.substring(0, idx), trimmed.substring(idx + 1)};
    }
}
