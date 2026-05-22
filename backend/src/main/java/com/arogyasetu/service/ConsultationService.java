package com.arogyasetu.service;

import com.arogyasetu.audit.AuditService;
import com.arogyasetu.dto.DomainDtos.ConsultationRequest;
import com.arogyasetu.dto.DomainDtos.ConsultationResponse;
import com.arogyasetu.dto.DomainDtos.EhrRequest;
import com.arogyasetu.entity.*;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {
    private final AppointmentRepository appointments;
    private final ConsultationRepository consultations;
    private final EhrService ehrService;
    private final AuditService auditService;

    @Value("${app.agora.app-id}")
    private String agoraAppId;

    @Transactional
    public ConsultationResponse start(ConsultationRequest request) {
        Appointment appointment = appointments.findById(request.appointmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        ConsultationMode mode = fallbackMode(request.mode());
        Consultation consultation = consultations.findByAppointmentAppointmentId(appointment.getAppointmentId()).orElseGet(() ->
                consultations.save(Consultation.builder().appointment(appointment).mode(mode).build()));
        consultation.setMode(mode);
        consultation.setNotes(request.notes());
        consultation.setDiagnosis(request.diagnosis());
        consultation.setStoreAndForwardPayloadUrl(request.storeAndForwardPayloadUrl());
        consultation.setAgoraChannel("appointment-" + appointment.getAppointmentId());
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointments.save(appointment);
        consultations.save(consultation);
        var ehr = ehrService.get(appointment.getPatient().getPatientId());
        ehrService.update(new EhrRequest(appointment.getPatient().getPatientId(), ehr.medicalHistory(), ehr.allergies(), ehr.currentMedications(), ehr.reportsUrl(),
                (ehr.consultationHistory() == null ? "" : ehr.consultationHistory() + "\n") + request.diagnosis(), ehr.prescriptionHistory()));
        auditService.record("CONSULTATION_COMPLETED", "Consultation", consultation.getConsultationId(), mode.name());
        return new ConsultationResponse(consultation.getConsultationId(), appointment.getAppointmentId(), mode,
                consultation.getAgoraChannel(), agoraToken(consultation.getAgoraChannel()), consultation.getNotes(), consultation.getDiagnosis());
    }

    private ConsultationMode fallbackMode(ConsultationMode requested) {
        return requested == null ? ConsultationMode.ASYNC : requested;
    }

    private String agoraToken(String channel) {
        if (agoraAppId == null || agoraAppId.isBlank()) return "AGORA_APP_ID_NOT_CONFIGURED";
        return Base64.getUrlEncoder().withoutPadding().encodeToString((agoraAppId + ":" + channel).getBytes(StandardCharsets.UTF_8));
    }
}
