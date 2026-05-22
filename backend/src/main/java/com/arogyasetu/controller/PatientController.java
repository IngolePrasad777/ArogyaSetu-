package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.User;
import com.arogyasetu.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    @GetMapping("/profile")
    public PatientProfileResponse profile(@AuthenticationPrincipal User user) {
        return patientService.profile(user);
    }

    @PutMapping("/profile")
    public PatientProfileResponse update(@AuthenticationPrincipal User user, @Valid @RequestBody UpdatePatientRequest request) {
        return patientService.update(user, request);
    }

    @PostMapping("/symptoms")
    public SymptomResponse symptoms(@AuthenticationPrincipal User user, @Valid @RequestBody SymptomRequest request) {
        return patientService.addSymptoms(user, request);
    }

    @PostMapping(value = "/upload-report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@AuthenticationPrincipal User user, @RequestPart MultipartFile file) {
        return Map.of("url", patientService.uploadReport(user, file));
    }

    @GetMapping("/ehr")
    public EhrResponse ehr(@AuthenticationPrincipal User user) {
        return patientService.ehr(user);
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> notifications(@AuthenticationPrincipal User user) {
        return patientService.notifications(user);
    }
}
