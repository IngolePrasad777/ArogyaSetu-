package com.arogyasetu.repository;

import com.arogyasetu.entity.Symptom;
import com.arogyasetu.entity.TriageLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SymptomRepository extends JpaRepository<Symptom, UUID> {
    List<Symptom> findByPatientPatientIdOrderByCreatedAtDesc(UUID patientId);
    long countByTriageLevel(TriageLevel triageLevel);
}
