package com.arogyasetu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patients", indexes = {
        @Index(name = "idx_patients_email", columnList = "email", unique = true),
        @Index(name = "idx_patients_phone", columnList = "phone")
})
@EntityListeners(AuditingEntityListener.class)
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID patientId;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(nullable = false, length = 80)
    private String lastName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(length = 24)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(length = 24)
    private Gender gender;

    private LocalDate dob;
    private String bloodGroup;
    private String address;
    private String emergencyContact;

    @OneToMany(mappedBy = "patient")
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient")
    @Builder.Default
    private List<Symptom> symptoms = new ArrayList<>();

    @OneToOne(mappedBy = "patient")
    private Ehr ehr;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
