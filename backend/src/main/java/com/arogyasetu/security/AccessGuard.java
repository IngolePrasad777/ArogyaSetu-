package com.arogyasetu.security;

import com.arogyasetu.entity.AppointmentStatus;
import com.arogyasetu.entity.User;
import com.arogyasetu.repository.AppointmentRepository;
import com.arogyasetu.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("accessGuard")
@RequiredArgsConstructor
public class AccessGuard {
    private final PatientRepository patients;
    private final AppointmentRepository appointments;

    public User user() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public boolean isSelfPatient(UUID patientId) {
        return patients.findByUserId(user().getId()).map(p -> p.getPatientId().equals(patientId)).orElse(false);
    }

    public boolean doctorAssignedToPatient(UUID doctorId, UUID patientId) {
        return appointments.existsByDoctorDoctorIdAndPatientPatientIdAndStatus(doctorId, patientId, AppointmentStatus.SCHEDULED)
                || appointments.existsByDoctorDoctorIdAndPatientPatientIdAndStatus(doctorId, patientId, AppointmentStatus.COMPLETED);
    }
}
