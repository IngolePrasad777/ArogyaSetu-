package com.arogyasetu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctors", indexes = {
        @Index(name = "idx_doctors_email", columnList = "email", unique = true),
        @Index(name = "idx_doctors_specialization", columnList = "specialization")
})
@EntityListeners(AuditingEntityListener.class)
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID doctorId;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 140)
    private String fullName;

    @Column(nullable = false, length = 120)
    private String specialization;

    private String qualification;
    private Integer experience;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(columnDefinition = "text")
    private String availability;

    @Column(nullable = false)
    private boolean verified;

    @OneToMany(mappedBy = "doctor")
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
