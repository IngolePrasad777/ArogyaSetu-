package com.arogyasetu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ehr")
@EntityListeners(AuditingEntityListener.class)
public class Ehr {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID ehrId;

    @OneToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    @Column(columnDefinition = "text")
    private String medicalHistory;

    @Column(columnDefinition = "text")
    private String allergies;

    @Column(columnDefinition = "text")
    private String currentMedications;

    @Column(columnDefinition = "text")
    private String reportsUrl;

    @Column(columnDefinition = "text")
    private String consultationHistory;

    @Column(columnDefinition = "text")
    private String prescriptionHistory;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
