package com.arogyasetu.repository;

import com.arogyasetu.entity.Appointment;
import com.arogyasetu.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(UUID patientId);
    List<Appointment> findByDoctorDoctorIdOrderByAppointmentDateAscAppointmentTimeAsc(UUID doctorId);
    boolean existsByDoctorDoctorIdAndPatientPatientIdAndStatus(UUID doctorId, UUID patientId, AppointmentStatus status);
}
