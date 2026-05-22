package com.arogyasetu.offline;

import com.arogyasetu.dto.DomainDtos.OfflineSyncRequest;
import com.arogyasetu.dto.DomainDtos.OfflineSyncResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class OfflineSyncService {
    public OfflineSyncResponse sync(OfflineSyncRequest request) {
        if (request.updatedAt() != null && request.updatedAt().isAfter(Instant.now().plusSeconds(60))) {
            return new OfflineSyncResponse(request.clientOperationId(), "CONFLICT", "Client timestamp is ahead of server time.");
        }
        return new OfflineSyncResponse(request.clientOperationId(), "ACCEPTED", "Queued payload accepted for server reconciliation.");
    }
}
