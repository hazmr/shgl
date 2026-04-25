package org.oji.shgl.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import org.oji.shgl.dto.CompanyResponseDto;
import org.oji.shgl.entity.Company;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface CompanyMapper {
//    CompanyMapper INSTANCE = Mappers.getMapper(CompanyMapper.class);
    CompanyResponseDto toDto(Company company);
}
