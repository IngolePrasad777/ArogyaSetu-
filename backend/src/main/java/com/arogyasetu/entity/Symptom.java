package com.arogyasetu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "symptoms", indexes = @Index(name = "idx_symptoms_patient", columnList = "patient_id"))
@EntityListeners(AuditingEntityListener.class)
public class Symptom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID symptomId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, columnDefinition = "text")
    private String symptoms;

    private Integer painLevel;
    private String duration;
    private String medicalHistory;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private TriageLevel triageLevel;

    private String recommendedDoctor;
    private String aiDisclaimer;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
