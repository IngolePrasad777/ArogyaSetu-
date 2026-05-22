package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.OfflineSyncRequest;
import com.arogyasetu.dto.DomainDtos.OfflineSyncResponse;
import com.arogyasetu.offline.OfflineSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/offline")
@RequiredArgsConstructor
public class OfflineController {
    private final OfflineSyncService offlineSyncService;

    @PostMapping("/sync")
    public OfflineSyncResponse sync(@RequestBody OfflineSyncRequest request) {
        return offlineSyncService.sync(request);
    }
}
