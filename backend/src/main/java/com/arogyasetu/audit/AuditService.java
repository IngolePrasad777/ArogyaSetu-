package com.arogyasetu.audit;

import com.arogyasetu.entity.AuditLog;
import com.arogyasetu.entity.User;
import com.arogyasetu.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogs;

    public void record(String action, String resourceType, UUID resourceId, String metadata) {
        User user = null;
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User principal) {
            user = principal;
        }
        auditLogs.save(AuditLog.builder()
                .actorUserId(user == null ? null : user.getId())
                .actorEmail(user == null ? "anonymous" : user.getEmail())
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .metadata(metadata)
                .build());
    }
}
