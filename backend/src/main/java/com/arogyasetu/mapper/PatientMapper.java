package com.arogyasetu.mapper;

import com.arogyasetu.dto.DomainDtos.PatientProfileResponse;
import com.arogyasetu.entity.Patient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PatientMapper {
    PatientProfileResponse toResponse(Patient patient);
}
