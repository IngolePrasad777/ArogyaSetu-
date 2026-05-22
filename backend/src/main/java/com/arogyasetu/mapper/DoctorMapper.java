package com.arogyasetu.mapper;

import com.arogyasetu.dto.DomainDtos.DoctorResponse;
import com.arogyasetu.entity.Doctor;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DoctorMapper {
    DoctorResponse toResponse(Doctor doctor);
}
