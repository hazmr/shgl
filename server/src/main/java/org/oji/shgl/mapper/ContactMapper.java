package org.oji.shgl.mapper;

import org.mapstruct.*;
import org.oji.shgl.dto.ContactRequestDto;
import org.oji.shgl.entity.Contact;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContactMapper {
    Contact toEntity(ContactRequestDto contactRequestDto);
}