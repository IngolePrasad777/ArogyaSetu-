package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.User;
import com.arogyasetu.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final ConsultationService consultationService;
    private final EhrService ehrService;

    @GetMapping("/appointments")
    public List<AppointmentResponse> appointments(@AuthenticationPrincipal User user) {
        return appointmentService.doctorAppointments(user);
    }

    @GetMapping("/queue")
    public List<DoctorQueueItem> queue(@AuthenticationPrincipal User user) {
        return doctorService.queue(user);
    }

    @GetMapping("/patients/{id}")
    public PatientProfileResponse patient(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return doctorService.patient(user, id);
    }

    @GetMapping("/patients/{id}/symptoms")
    public List<SymptomResponse> symptoms(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return doctorService.symptoms(user, id);
    }

    @GetMapping("/patients/{id}/ehr")
    public EhrResponse ehr(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return doctorService.ehr(user, id);
    }

    @GetMapping("/patients/{id}/consultations")
    public List<ConsultationResponse> consultations(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return doctorService.consultations(user, id);
    }

    @GetMapping("/patients/{id}/prescriptions")
    public List<PrescriptionResponse> prescriptions(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return doctorService.prescriptions(user, id);
    }

    @PostMapping("/consultation")
    public ConsultationResponse consultation(@AuthenticationPrincipal User user, @Valid @RequestBody ConsultationRequest request) {
        return consultationService.start(user, request);
    }

    @PostMapping("/prescription")
    public PrescriptionResponse prescription(@Valid @RequestBody PrescriptionRequest request) {
        return doctorService.prescription(request);
    }

    @PutMapping("/ehr-update")
    public EhrResponse updateEhr(@Valid @RequestBody EhrRequest request) {
        return ehrService.update(request);
    }
}
