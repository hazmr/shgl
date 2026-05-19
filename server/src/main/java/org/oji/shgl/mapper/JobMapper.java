package org.oji.shgl.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.oji.shgl.dto.JobDto;
import org.oji.shgl.entity.Job;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface JobMapper {
    @Mapping(source = "company.name", target = "companyName")
    JobDto toDto(Job job);
}