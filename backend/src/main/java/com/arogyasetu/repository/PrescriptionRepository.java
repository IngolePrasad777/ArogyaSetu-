package com.arogyasetu.repository;

import com.arogyasetu.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    Optional<Prescription> findByVerificationCode(String verificationCode);
    List<Prescription> findByConsultationAppointmentPatientPatientIdOrderByCreatedAtDesc(UUID patientId);
}
