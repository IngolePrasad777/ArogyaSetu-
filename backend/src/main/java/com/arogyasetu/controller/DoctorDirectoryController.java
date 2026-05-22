package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.DoctorResponse;
import com.arogyasetu.dto.DomainDtos.DoctorSlotResponse;
import com.arogyasetu.mapper.DoctorMapper;
import com.arogyasetu.repository.DoctorRepository;
import com.arogyasetu.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorDirectoryController {
    private final DoctorRepository doctors;
    private final DoctorMapper doctorMapper;
    private final AppointmentService appointmentService;

    @GetMapping
    public List<DoctorResponse> search(@RequestParam(required = false) String specialization) {
        var result = specialization == null || specialization.isBlank()
                ? doctors.findByVerifiedTrue()
                : doctors.findBySpecializationContainingIgnoreCaseAndVerifiedTrue(specialization);
        return result.stream().map(doctorMapper::toResponse).toList();
    }

    @GetMapping("/{id}/slots")
    public List<DoctorSlotResponse> slots(@PathVariable UUID id, @RequestParam LocalDate date) {
        return appointmentService.slots(id, date);
    }
}
