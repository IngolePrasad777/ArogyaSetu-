package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.PrescriptionResponse;
import com.arogyasetu.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    @GetMapping("/{id}")
    public PrescriptionResponse get(@PathVariable UUID id) {
        return prescriptionService.get(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<String> download(@PathVariable UUID id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=prescription-%s.txt".formatted(id))
                .contentType(MediaType.TEXT_PLAIN)
                .body(prescriptionService.download(id));
    }

    @GetMapping("/verify/{code}")
    public PrescriptionResponse verify(@PathVariable String code) {
        return prescriptionService.verify(code);
    }
}
