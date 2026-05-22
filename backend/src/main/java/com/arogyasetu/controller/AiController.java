package com.arogyasetu.controller;

import com.arogyasetu.ai.TriageEngine;
import com.arogyasetu.dto.DomainDtos.TriageRequest;
import com.arogyasetu.dto.DomainDtos.TriageResponse;
import com.arogyasetu.repository.DoctorRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {
    private final TriageEngine triageEngine;
    private final DoctorRepository doctors;

    @PostMapping("/triage")
    public TriageResponse triage(@Valid @RequestBody TriageRequest request) {
        return triageEngine.triage(request);
    }

    @PostMapping("/recommend-doctor")
    public Map<String, Object> recommend(@Valid @RequestBody TriageRequest request) {
        TriageResponse triage = triageEngine.ruleBased(request);
        return Map.of("recommendedDoctor", triage.recommendedDoctor(),
                "doctors", doctors.findBySpecializationContainingIgnoreCaseAndVerifiedTrue(triage.recommendedDoctor()));
    }

    @PostMapping("/emergency-check")
    public Map<String, Object> emergency(@Valid @RequestBody TriageRequest request) {
        TriageResponse triage = triageEngine.ruleBased(request);
        return Map.of("level", triage.level(), "emergency", List.of("HIGH", "EMERGENCY").contains(triage.level().name()), "disclaimer", triage.disclaimer());
    }
}
