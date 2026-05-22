package com.arogyasetu.service;

import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.*;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.mapper.PatientMapper;
import com.arogyasetu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctors;
    private final PatientRepository patients;
    private final AppointmentRepository appointments;
    private final ConsultationRepository consultations;
    private final PrescriptionRepository prescriptions;
    private final SymptomRepository symptoms;
    private final PatientMapper patientMapper;
    private final EhrService ehrService;

    public PatientProfileResponse patient(User doctorUser, UUID patientId) {
        assertAssigned(doctorUser, patientId);
        return patientMapper.toResponse(patients.findById(patientId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient not found")));
    }

    public List<DoctorQueueItem> queue(User doctorUser) {
        Doctor doctor = doctors.findByUserId(doctorUser.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
        return appointments.findByDoctorDoctorIdOrderByAppointmentDateAscAppointmentTimeAsc(doctor.getDoctorId()).stream()
                .map(appointment -> new DoctorQueueItem(toAppointmentResponse(appointment),
                        patientMapper.toResponse(appointment.getPatient()),
                        latestSymptom(appointment.getPatient().getPatientId())))
                .toList();
    }

    public List<SymptomResponse> symptoms(User doctorUser, UUID patientId) {
        assertAssigned(doctorUser, patientId);
        return symptoms.findByPatientPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::toSymptomResponse).toList();
    }

    public EhrResponse ehr(User doctorUser, UUID patientId) {
        assertAssigned(doctorUser, patientId);
        return ehrService.get(patientId);
    }

    public List<ConsultationResponse> consultations(User doctorUser, UUID patientId) {
        assertAssigned(doctorUser, patientId);
        return consultations.findByAppointmentPatientPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(c -> new ConsultationResponse(c.getConsultationId(), c.getAppointment().getAppointmentId(), c.getMode(),
                        c.getAgoraChannel(), null, c.getNotes(), c.getDiagnosis()))
                .toList();
    }

    public List<PrescriptionResponse> prescriptions(User doctorUser, UUID patientId) {
        assertAssigned(doctorUser, patientId);
        return prescriptions.findByConsultationAppointmentPatientPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(p -> new PrescriptionResponse(p.getPrescriptionId(), p.getConsultation().getConsultationId(), p.getMedicines(),
                        p.getDosageInstructions(), p.getFollowUpAdvice(), p.getVerificationCode(), p.getCreatedAt()))
                .toList();
    }

    @Transactional
    public PrescriptionResponse prescription(PrescriptionRequest request) {
        Consultation consultation = consultations.findById(request.consultationId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consultation not found"));
        Prescription prescription = prescriptions.save(Prescription.builder()
                .consultation(consultation).medicines(request.medicines())
                .dosageInstructions(request.dosageInstructions()).followUpAdvice(request.followUpAdvice())
                .verificationCode("RX-" + UUID.randomUUID()).build());
        Patient patient = consultation.getAppointment().getPatient();
        EhrResponseUpdater.appendPrescription(ehrService, patient.getPatientId(), request.medicines());
        return new PrescriptionResponse(prescription.getPrescriptionId(), consultation.getConsultationId(), prescription.getMedicines(),
                prescription.getDosageInstructions(), prescription.getFollowUpAdvice(), prescription.getVerificationCode(), prescription.getCreatedAt());
    }

    private static final class EhrResponseUpdater {
        static void appendPrescription(EhrService ehrService, UUID patientId, String medicine) {
            var ehr = ehrService.get(patientId);
            ehrService.update(new com.arogyasetu.dto.DomainDtos.EhrRequest(patientId, ehr.medicalHistory(), ehr.allergies(), ehr.currentMedications(), ehr.reportsUrl(),
                    ehr.consultationHistory(), (ehr.prescriptionHistory() == null ? "" : ehr.prescriptionHistory() + "\n") + medicine));
        }
    }

    private void assertAssigned(User doctorUser, UUID patientId) {
        Doctor doctor = doctors.findByUserId(doctorUser.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
        if (!appointments.existsByDoctorDoctorIdAndPatientPatientIdAndStatus(doctor.getDoctorId(), patientId, AppointmentStatus.SCHEDULED)
                && !appointments.existsByDoctorDoctorIdAndPatientPatientIdAndStatus(doctor.getDoctorId(), patientId, AppointmentStatus.COMPLETED)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Doctor can access only assigned patients");
        }
    }

    private AppointmentResponse toAppointmentResponse(Appointment a) {
        return new AppointmentResponse(a.getAppointmentId(), a.getPatient().getPatientId(), a.getDoctor().getDoctorId(),
                a.getDoctor().getFullName(), a.getAppointmentDate(), a.getAppointmentTime(), a.getConsultationMode(), a.getStatus());
    }

    private SymptomResponse latestSymptom(UUID patientId) {
        return symptoms.findByPatientPatientIdOrderByCreatedAtDesc(patientId).stream()
                .findFirst()
                .map(this::toSymptomResponse)
                .orElse(null);
    }

    private SymptomResponse toSymptomResponse(Symptom symptom) {
        return new SymptomResponse(symptom.getSymptomId(), symptom.getSymptoms(), symptom.getPainLevel(), symptom.getDuration(),
                symptom.getTriageLevel(), symptom.getRecommendedDoctor(), symptom.getAiDisclaimer(), symptom.getCreatedAt());
    }
}
