package com.arogyasetu.analytics;

import com.arogyasetu.dto.DomainDtos.AnalyticsResponse;
import com.arogyasetu.entity.TriageLevel;
import com.arogyasetu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final UserRepository users;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    private final SymptomRepository symptoms;

    public AnalyticsResponse summary() {
        long emergencies = symptoms.countByTriageLevel(TriageLevel.EMERGENCY);
        return new AnalyticsResponse(users.count(), patients.count(), doctors.count(), appointments.count(), emergencies);
    }
}
