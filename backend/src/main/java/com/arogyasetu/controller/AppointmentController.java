package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.User;
import com.arogyasetu.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public AppointmentResponse book(@AuthenticationPrincipal User user, @Valid @RequestBody AppointmentRequest request) {
        return appointmentService.book(user, request);
    }

    @PostMapping("/emergency")
    public AppointmentResponse emergency(@AuthenticationPrincipal User user, @Valid @RequestBody EmergencyAppointmentRequest request) {
        return appointmentService.emergency(user, request);
    }

    @PutMapping("/reschedule/{id}")
    public AppointmentResponse reschedule(@AuthenticationPrincipal User user, @PathVariable UUID id, @Valid @RequestBody RescheduleRequest request) {
        return appointmentService.reschedule(user, id, request);
    }

    @DeleteMapping("/cancel/{id}")
    public Map<String, String> cancel(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        appointmentService.cancel(user, id);
        return Map.of("message", "Appointment cancelled");
    }

    @GetMapping("/history")
    public List<AppointmentResponse> history(@AuthenticationPrincipal User user) {
        return appointmentService.patientHistory(user);
    }
}
