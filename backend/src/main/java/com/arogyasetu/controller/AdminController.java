package com.arogyasetu.controller;

import com.arogyasetu.analytics.AnalyticsService;
import com.arogyasetu.dto.DomainDtos.AnalyticsResponse;
import com.arogyasetu.entity.Doctor;
import com.arogyasetu.entity.User;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository users;
    private final DoctorRepository doctors;
    private final AuditLogRepository auditLogs;
    private final AnalyticsService analyticsService;

    @GetMapping("/users")
    public List<User> users() {
        return users.findAll();
    }

    @GetMapping("/analytics")
    public AnalyticsResponse analytics() {
        return analyticsService.summary();
    }

    @PutMapping("/verify-doctor")
    public Doctor verifyDoctor(@RequestBody Map<String, Object> request) {
        UUID id = UUID.fromString(String.valueOf(request.get("doctorId")));
        boolean verified = Boolean.parseBoolean(String.valueOf(request.getOrDefault("verified", "true")));
        Doctor doctor = doctors.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
        doctor.setVerified(verified);
        return doctors.save(doctor);
    }

    @GetMapping("/audit-logs")
    public Object auditLogs() {
        return auditLogs.findTop100ByOrderByCreatedAtDesc();
    }
}
