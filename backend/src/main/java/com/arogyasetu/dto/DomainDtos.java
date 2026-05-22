package com.arogyasetu.dto;

import com.arogyasetu.entity.*;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public final class DomainDtos {
    private DomainDtos() {}

    public record PatientProfileResponse(UUID patientId, String firstName, String lastName, String email, String phone,
                                         Gender gender, LocalDate dob, String bloodGroup, String address,
                                         String emergencyContact, Instant createdAt) {}
    public record UpdatePatientRequest(@NotBlank String firstName, @NotBlank String lastName, String phone,
                                       Gender gender, LocalDate dob, String bloodGroup, String address,
                                       String emergencyContact) {}
    public record SymptomRequest(@NotBlank String symptoms, @Min(0) @Max(10) Integer painLevel,
                                 String duration, String medicalHistory) {}
    public record SymptomResponse(UUID symptomId, String symptoms, Integer painLevel, String duration,
                                  TriageLevel triageLevel, String recommendedDoctor, String aiDisclaimer,
                                  Instant createdAt) {}
    public record DoctorResponse(UUID doctorId, String fullName, String specialization, String qualification,
                                 Integer experience, String email, String availability, boolean verified) {}
    public record AppointmentRequest(@NotNull UUID doctorId, @NotNull LocalDate appointmentDate,
                                     @NotNull LocalTime appointmentTime, @NotNull ConsultationMode consultationMode) {}
    public record EmergencyAppointmentRequest(@NotBlank String symptoms, String preferredSpecialization,
                                              @NotNull ConsultationMode consultationMode) {}
    public record RescheduleRequest(@NotNull LocalDate appointmentDate, @NotNull LocalTime appointmentTime) {}
    public record AppointmentResponse(UUID appointmentId, UUID patientId, UUID doctorId, String doctorName,
                                      LocalDate appointmentDate, LocalTime appointmentTime,
                                      ConsultationMode consultationMode, AppointmentStatus status) {}
    public record ConsultationRequest(@NotNull UUID appointmentId, @NotNull ConsultationMode mode,
                                      String notes, String diagnosis, String storeAndForwardPayloadUrl) {}
    public record ConsultationResponse(UUID consultationId, UUID appointmentId, ConsultationMode mode,
                                       String agoraChannel, String agoraToken, String notes, String diagnosis) {}
    public record PrescriptionRequest(@NotNull UUID consultationId, @NotBlank String medicines,
                                      String dosageInstructions, String followUpAdvice) {}
    public record EhrRequest(@NotNull UUID patientId, String medicalHistory, String allergies, String currentMedications,
                             String reportsUrl, String consultationHistory, String prescriptionHistory) {}
    public record EhrResponse(UUID ehrId, UUID patientId, String medicalHistory, String allergies, String currentMedications, String reportsUrl,
                              String consultationHistory, String prescriptionHistory, Instant updatedAt) {}
    public record TriageRequest(@NotBlank String symptoms, @Min(0) @Max(10) Integer painLevel,
                                String duration, String medicalHistory) {}
    public record TriageResponse(TriageLevel level, String recommendedDoctor, String rationale, String disclaimer) {}
    public record NotificationRequest(@NotNull UUID userId, @NotNull NotificationType type,
                                      @NotBlank String title, @NotBlank String message) {}
    public record NotificationResponse(UUID notificationId, NotificationType type, String title, String message,
                                       boolean read, Instant createdAt) {}
    public record DoctorSlotResponse(UUID doctorId, LocalDate date, List<LocalTime> slots) {}
    public record PrescriptionResponse(UUID prescriptionId, UUID consultationId, String medicines,
                                       String dosageInstructions, String followUpAdvice, String verificationCode, Instant createdAt) {}
    public record AnalyticsResponse(long users, long patients, long doctors, long appointments, long emergencyCases) {}
    public record OfflineSyncRequest(String clientOperationId, String type, String payload, Instant updatedAt) {}
    public record OfflineSyncResponse(String clientOperationId, String status, String message) {}
    public record DoctorQueueItem(AppointmentResponse appointment, PatientProfileResponse patient, SymptomResponse latestSymptom) {}
}
