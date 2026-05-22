package com.arogyasetu.service;

import com.arogyasetu.ai.TriageEngine;
import com.arogyasetu.audit.AuditService;
import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.*;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.mapper.PatientMapper;
import com.arogyasetu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patients;
    private final SymptomRepository symptoms;
    private final EhrRepository ehrs;
    private final NotificationRepository notifications;
    private final PatientMapper mapper;
    private final TriageEngine triageEngine;
    private final StorageService storageService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public Patient patientFor(User user) {
        return patients.findByUserId(user.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient profile not found"));
    }

    public PatientProfileResponse profile(User user) {
        return mapper.toResponse(patientFor(user));
    }

    @Transactional
    public PatientProfileResponse update(User user, UpdatePatientRequest request) {
        Patient patient = patientFor(user);
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setPhone(request.phone());
        patient.setGender(request.gender());
        patient.setDob(request.dob());
        patient.setBloodGroup(request.bloodGroup());
        patient.setAddress(request.address());
        patient.setEmergencyContact(request.emergencyContact());
        auditService.record("PATIENT_PROFILE_UPDATED", "Patient", patient.getPatientId(), null);
        return mapper.toResponse(patients.save(patient));
    }

    @Transactional
    public SymptomResponse addSymptoms(User user, SymptomRequest request) {
        Patient patient = patientFor(user);
        TriageResponse triage = triageEngine.triage(new TriageRequest(request.symptoms(), request.painLevel(), request.duration(), request.medicalHistory()));
        Symptom symptom = symptoms.save(Symptom.builder()
                .patient(patient).symptoms(request.symptoms()).painLevel(request.painLevel())
                .duration(request.duration()).medicalHistory(request.medicalHistory())
                .triageLevel(triage.level()).recommendedDoctor(triage.recommendedDoctor())
                .aiDisclaimer(triage.disclaimer()).build());
        if (triage.level() == TriageLevel.HIGH || triage.level() == TriageLevel.EMERGENCY) {
            notificationService.send(new NotificationRequest(user.getId(), NotificationType.EMERGENCY_ALERT,
                    "Emergency symptoms detected", "Please seek urgent care and book an emergency consultation."));
        }
        auditService.record("SYMPTOM_CREATED", "Symptom", symptom.getSymptomId(), triage.level().name());
        return new SymptomResponse(symptom.getSymptomId(), symptom.getSymptoms(), symptom.getPainLevel(), symptom.getDuration(),
                symptom.getTriageLevel(), symptom.getRecommendedDoctor(), symptom.getAiDisclaimer(), symptom.getCreatedAt());
    }

    @Transactional
    public String uploadReport(User user, MultipartFile file) {
        Patient patient = patientFor(user);
        String url = storageService.uploadReport(patient.getPatientId(), file);
        Ehr ehr = ehrs.findByPatientPatientId(patient.getPatientId()).orElseGet(() -> ehrs.save(Ehr.builder().patient(patient).build()));
        ehr.setReportsUrl((ehr.getReportsUrl() == null || ehr.getReportsUrl().isBlank()) ? url : ehr.getReportsUrl() + "\n" + url);
        ehrs.save(ehr);
        auditService.record("REPORT_UPLOADED", "Patient", patient.getPatientId(), url);
        return url;
    }

    public EhrResponse ehr(User user) {
        Patient patient = patientFor(user);
        Ehr ehr = ehrs.findByPatientPatientId(patient.getPatientId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EHR not found"));
        return new EhrResponse(ehr.getEhrId(), patient.getPatientId(), ehr.getMedicalHistory(), ehr.getAllergies(), ehr.getCurrentMedications(), ehr.getReportsUrl(),
                ehr.getConsultationHistory(), ehr.getPrescriptionHistory(), ehr.getUpdatedAt());
    }

    public List<NotificationResponse> notifications(User user) {
        return notifications.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(n -> new NotificationResponse(n.getNotificationId(), n.getType(), n.getTitle(), n.getMessage(), n.isRead(), n.getCreatedAt()))
                .toList();
    }
}
