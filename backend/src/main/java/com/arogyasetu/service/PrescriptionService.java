package com.arogyasetu.service;

import com.arogyasetu.dto.DomainDtos.PrescriptionResponse;
import com.arogyasetu.entity.Prescription;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptions;

    public PrescriptionResponse get(UUID id) {
        return toResponse(prescriptions.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Prescription not found")));
    }

    public PrescriptionResponse verify(String code) {
        return toResponse(prescriptions.findByVerificationCode(code)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Prescription verification failed")));
    }

    public String download(UUID id) {
        Prescription p = prescriptions.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Prescription not found"));
        return """
                ArogyaSetu+ Digital Prescription
                Verification Code: %s
                Medicines: %s
                Dosage: %s
                Follow-up: %s
                QR Payload: AROGYASETU-RX:%s
                """.formatted(p.getVerificationCode(), p.getMedicines(), p.getDosageInstructions(),
                p.getFollowUpAdvice(), p.getVerificationCode());
    }

    private PrescriptionResponse toResponse(Prescription p) {
        return new PrescriptionResponse(p.getPrescriptionId(), p.getConsultation().getConsultationId(), p.getMedicines(),
                p.getDosageInstructions(), p.getFollowUpAdvice(), p.getVerificationCode(), p.getCreatedAt());
    }
}
