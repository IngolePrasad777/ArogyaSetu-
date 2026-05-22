package com.arogyasetu.repository;

import com.arogyasetu.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByUserId(UUID userId);
    Optional<Doctor> findByEmailIgnoreCase(String email);
    List<Doctor> findBySpecializationContainingIgnoreCaseAndVerifiedTrue(String specialization);
    List<Doctor> findByVerifiedFalse();
    List<Doctor> findByVerifiedTrue();
}
