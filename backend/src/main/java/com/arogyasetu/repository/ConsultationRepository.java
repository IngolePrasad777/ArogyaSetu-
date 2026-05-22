package com.arogyasetu.repository;

import com.arogyasetu.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {
    Optional<Consultation> findByAppointmentAppointmentId(UUID appointmentId);
    List<Consultation> findByAppointmentPatientPatientIdOrderByCreatedAtDesc(UUID patientId);
}
