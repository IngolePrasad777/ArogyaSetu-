package com.arogyasetu.repository;

import com.arogyasetu.entity.Ehr;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EhrRepository extends JpaRepository<Ehr, UUID> {
    Optional<Ehr> findByPatientPatientId(UUID patientId);
}
