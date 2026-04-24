package org.oji.shgl.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.oji.shgl.dto.CompanyDto;
import org.oji.shgl.entity.Company;

@Mapper
public interface CompanyMapper {
    CompanyMapper INSTANCE = Mappers.getMapper(CompanyMapper.class);

    CompanyDto toCompanyDto(Company company);
}
