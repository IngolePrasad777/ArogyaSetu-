package com.arogyasetu.service;

import com.arogyasetu.audit.AuditService;
import com.arogyasetu.dto.DomainDtos.EhrRequest;
import com.arogyasetu.dto.DomainDtos.EhrResponse;
import com.arogyasetu.entity.Ehr;
import com.arogyasetu.entity.Patient;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.repository.EhrRepository;
import com.arogyasetu.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EhrService {
    private final EhrRepository ehrs;
    private final PatientRepository patients;
    private final AuditService auditService;

    @Transactional
    public EhrResponse generate(UUID patientId) {
        Patient patient = patients.findById(patientId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient not found"));
        Ehr ehr = ehrs.findByPatientPatientId(patientId).orElseGet(() -> ehrs.save(Ehr.builder()
                .patient(patient).medicalHistory("Generated EHR initialized.").allergies("")
                .currentMedications("").consultationHistory("").prescriptionHistory("").reportsUrl("").build()));
        auditService.record("EHR_GENERATED", "EHR", ehr.getEhrId(), null);
        return toResponse(ehr);
    }

    public EhrResponse get(UUID patientId) {
        return toResponse(ehrs.findByPatientPatientId(patientId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EHR not found")));
    }

    @Transactional
    public EhrResponse update(EhrRequest request) {
        Ehr ehr = ehrs.findByPatientPatientId(request.patientId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EHR not found"));
        ehr.setMedicalHistory(request.medicalHistory());
        ehr.setAllergies(request.allergies());
        ehr.setCurrentMedications(request.currentMedications());
        ehr.setReportsUrl(request.reportsUrl());
        ehr.setConsultationHistory(request.consultationHistory());
        ehr.setPrescriptionHistory(request.prescriptionHistory());
        auditService.record("EHR_UPDATED", "EHR", ehr.getEhrId(), null);
        return toResponse(ehrs.save(ehr));
    }

    public String download(UUID patientId) {
        EhrResponse ehr = get(patientId);
        return """
                ArogyaSetu+ Electronic Health Record
                Patient ID: %s
                Medical History: %s
                Allergies: %s
                Current Medications: %s
                Reports: %s
                Consultations: %s
                Prescriptions: %s
                """.formatted(ehr.patientId(), ehr.medicalHistory(), ehr.allergies(), ehr.currentMedications(),
                ehr.reportsUrl(), ehr.consultationHistory(), ehr.prescriptionHistory());
    }

    private EhrResponse toResponse(Ehr ehr) {
        return new EhrResponse(ehr.getEhrId(), ehr.getPatient().getPatientId(), ehr.getMedicalHistory(), ehr.getAllergies(), ehr.getCurrentMedications(),
                ehr.getReportsUrl(), ehr.getConsultationHistory(), ehr.getPrescriptionHistory(), ehr.getUpdatedAt());
    }
}
