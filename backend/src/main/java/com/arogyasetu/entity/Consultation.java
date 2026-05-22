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
@Table(name = "consultations")
@EntityListeners(AuditingEntityListener.class)
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID consultationId;

    @OneToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ConsultationMode mode;

    private String agoraChannel;
    private String notes;
    private String diagnosis;
    private String storeAndForwardPayloadUrl;

    @OneToOne(mappedBy = "consultation")
    private Prescription prescription;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
