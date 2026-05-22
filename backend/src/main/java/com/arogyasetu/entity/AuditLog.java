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
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "actorUserId"),
        @Index(name = "idx_audit_action", columnList = "action")
})
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID auditId;

    private UUID actorUserId;
    private String actorEmail;
    private String action;
    private String resourceType;
    private UUID resourceId;
    private String ipAddress;

    @Column(columnDefinition = "text")
    private String metadata;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
