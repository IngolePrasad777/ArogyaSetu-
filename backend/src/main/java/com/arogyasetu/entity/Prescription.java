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
@Table(name = "prescriptions")
@EntityListeners(AuditingEntityListener.class)
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID prescriptionId;

    @OneToOne(optional = false)
    @JoinColumn(name = "consultation_id", nullable = false, unique = true)
    private Consultation consultation;

    @Column(nullable = false, columnDefinition = "text")
    private String medicines;

    private String dosageInstructions;
    private String followUpAdvice;
    @Column(nullable = false, unique = true)
    private String verificationCode;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
