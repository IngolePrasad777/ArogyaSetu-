package com.arogyasetu.service;

import com.arogyasetu.audit.AuditService;
import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.*;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AuditService auditService;

    @Transactional
    public AppointmentResponse book(User user, AppointmentRequest request) {
        Patient patient = patients.findByUserId(user.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient not found"));
        Doctor doctor = doctors.findById(request.doctorId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
        if (!doctor.isVerified()) throw new ApiException(HttpStatus.BAD_REQUEST, "Doctor is not verified");
        Appointment appointment = appointments.save(Appointment.builder()
                .patient(patient).doctor(doctor).appointmentDate(request.appointmentDate())
                .appointmentTime(request.appointmentTime()).consultationMode(request.consultationMode())
                .status(AppointmentStatus.SCHEDULED).build());
        auditService.record("APPOINTMENT_BOOKED", "Appointment", appointment.getAppointmentId(), null);
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse emergency(User user, EmergencyAppointmentRequest request) {
        Patient patient = patients.findByUserId(user.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient not found"));
        String specialization = request.preferredSpecialization() == null || request.preferredSpecialization().isBlank()
                ? "General Medicine" : request.preferredSpecialization();
        Doctor doctor = doctors.findBySpecializationContainingIgnoreCaseAndVerifiedTrue(specialization).stream()
                .findFirst()
                .or(() -> doctors.findByVerifiedTrue().stream().findFirst())
                .orElseThrow(() -> new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "No verified doctor is currently available"));
        Appointment appointment = appointments.save(Appointment.builder()
                .patient(patient).doctor(doctor).appointmentDate(LocalDate.now())
                .appointmentTime(LocalTime.now().plusMinutes(15).withSecond(0).withNano(0))
                .consultationMode(request.consultationMode()).status(AppointmentStatus.SCHEDULED).build());
        auditService.record("EMERGENCY_APPOINTMENT_BOOKED", "Appointment", appointment.getAppointmentId(), request.symptoms());
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse reschedule(User user, UUID id, RescheduleRequest request) {
        Appointment appointment = getOwnedAppointment(user, id);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setAppointmentTime(request.appointmentTime());
        auditService.record("APPOINTMENT_RESCHEDULED", "Appointment", id, null);
        return toResponse(appointments.save(appointment));
    }

    @Transactional
    public void cancel(User user, UUID id) {
        Appointment appointment = getOwnedAppointment(user, id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointments.save(appointment);
        auditService.record("APPOINTMENT_CANCELLED", "Appointment", id, null);
    }

    public List<AppointmentResponse> patientHistory(User user) {
        Patient patient = patients.findByUserId(user.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient not found"));
        return appointments.findByPatientPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(patient.getPatientId()).stream()
                .map(this::toResponse).toList();
    }

    public List<AppointmentResponse> doctorAppointments(User user) {
        Doctor doctor = doctors.findByUserId(user.getId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
        return appointments.findByDoctorDoctorIdOrderByAppointmentDateAscAppointmentTimeAsc(doctor.getDoctorId()).stream()
                .map(this::toResponse).toList();
    }

    public List<DoctorSlotResponse> slots(UUID doctorId, LocalDate date) {
        Doctor doctor = doctors.findById(doctorId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
        List<LocalTime> booked = appointments.findByDoctorDoctorIdOrderByAppointmentDateAscAppointmentTimeAsc(doctorId).stream()
                .filter(a -> a.getAppointmentDate().equals(date) && a.getStatus() == AppointmentStatus.SCHEDULED)
                .map(Appointment::getAppointmentTime).toList();
        List<LocalTime> slots = List.of(LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
                        LocalTime.of(14, 0), LocalTime.of(15, 0), LocalTime.of(16, 0)).stream()
                .filter(slot -> !booked.contains(slot)).toList();
        return List.of(new DoctorSlotResponse(doctor.getDoctorId(), date, slots));
    }

    private Appointment getOwnedAppointment(User user, UUID id) {
        Appointment appointment = appointments.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (!appointment.getPatient().getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Appointment belongs to another patient");
        }
        return appointment;
    }

    private AppointmentResponse toResponse(Appointment a) {
        return new AppointmentResponse(a.getAppointmentId(), a.getPatient().getPatientId(), a.getDoctor().getDoctorId(),
                a.getDoctor().getFullName(), a.getAppointmentDate(), a.getAppointmentTime(), a.getConsultationMode(), a.getStatus());
    }
}
