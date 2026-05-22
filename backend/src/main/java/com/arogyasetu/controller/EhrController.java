package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.EhrRequest;
import com.arogyasetu.dto.DomainDtos.EhrResponse;
import com.arogyasetu.service.EhrService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ehr")
@RequiredArgsConstructor
public class EhrController {
    private final EhrService ehrService;

    @PostMapping("/generate")
    public EhrResponse generate(@RequestBody Map<String, UUID> request) {
        return ehrService.generate(request.get("patientId"));
    }

    @GetMapping("/patient/{id}")
    public EhrResponse get(@PathVariable UUID id) {
        return ehrService.get(id);
    }

    @PutMapping("/update")
    public EhrResponse update(@Valid @RequestBody EhrRequest request) {
        return ehrService.update(request);
    }

    @GetMapping("/download")
    public ResponseEntity<String> download(@RequestParam UUID patientId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ehr-%s.txt".formatted(patientId))
                .contentType(MediaType.TEXT_PLAIN)
                .body(ehrService.download(patientId));
    }
}
