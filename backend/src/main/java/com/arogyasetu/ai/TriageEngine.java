package com.arogyasetu.ai;

import com.arogyasetu.dto.DomainDtos.TriageRequest;
import com.arogyasetu.dto.DomainDtos.TriageResponse;
import com.arogyasetu.entity.TriageLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TriageEngine {
    public static final String DISCLAIMER = "AI output is assistive only and requires doctor validation.";
    private final WebClient.Builder webClientBuilder;

    @Value("${app.gemini.api-key}")
    private String apiKey;
    @Value("${app.gemini.model}")
    private String model;

    public TriageResponse triage(TriageRequest request) {
        TriageResponse fallback = ruleBased(request);
        if (apiKey == null || apiKey.isBlank()) {
            return fallback;
        }
        try {
            String prompt = """
                    Return concise clinical triage JSON with level LOW|MEDIUM|HIGH|EMERGENCY, recommendedDoctor, rationale.
                    Symptoms: %s
                    Pain level: %s
                    Duration: %s
                    Medical history: %s
                    """.formatted(request.symptoms(), request.painLevel(), request.duration(), request.medicalHistory());
            Map<?, ?> body = Map.of("contents", new Object[]{Map.of("parts", new Object[]{Map.of("text", prompt)})});
            String text = webClientBuilder.build().post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}", model, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return new TriageResponse(fallback.level(), fallback.recommendedDoctor(),
                    "Gemini assisted assessment. Raw summary: " + abbreviate(text), DISCLAIMER);
        } catch (Exception ex) {
            return fallback;
        }
    }

    public TriageResponse ruleBased(TriageRequest request) {
        String s = (request.symptoms() + " " + request.medicalHistory()).toLowerCase(Locale.ROOT);
        TriageLevel level = request.painLevel() != null && request.painLevel() >= 8 ? TriageLevel.HIGH : TriageLevel.MEDIUM;
        String doctor = "General Medicine";
        if (s.contains("skin") || s.contains("rash") || s.contains("itch")) doctor = "Dermatologist";
        if (s.contains("breath") || s.contains("asthma") || s.contains("oxygen") || s.contains("cough")) doctor = "Pulmonologist";
        if (s.contains("child") || s.contains("infant") || s.contains("baby")) doctor = "Pediatrics";
        if (s.contains("bone") || s.contains("joint") || s.contains("fracture") || s.contains("sprain")) doctor = "Orthopedics";
        if (s.contains("pregnan") || s.contains("period") || s.contains("pelvic")) doctor = "Gynecology";
        if (s.contains("seizure") || s.contains("stroke") || s.contains("weakness") || s.contains("numb")) doctor = "Neurologist";
        if (s.contains("anxiety") || s.contains("depress") || s.contains("panic") || s.contains("suicide")) doctor = "Psychiatrist";
        if (s.contains("ear") || s.contains("throat") || s.contains("sinus")) doctor = "ENT Specialist";
        if (s.contains("chest pain") || s.contains("heart") || s.contains("palpitation")) doctor = "Cardiologist";
        if (s.contains("unconscious") || s.contains("stroke") || s.contains("severe bleeding") || s.contains("suicide")) {
            level = TriageLevel.EMERGENCY;
        } else if (s.contains("chest pain") || s.contains("breathing")) {
            level = TriageLevel.HIGH;
        } else if (request.painLevel() != null && request.painLevel() <= 3) {
            level = TriageLevel.LOW;
        }
        return new TriageResponse(level, doctor, "Fallback rule engine matched rural triage routing rules.", DISCLAIMER);
    }

    private String abbreviate(String text) {
        if (text == null) return "";
        return text.length() > 280 ? text.substring(0, 280) + "..." : text;
    }
}
