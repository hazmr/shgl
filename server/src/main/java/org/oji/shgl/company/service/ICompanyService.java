package org.oji.shgl.company.service;

import org.oji.shgl.dto.CompanyResponseDto;

import java.util.List;

public interface ICompanyService {
    List<CompanyResponseDto> getAllCompanies();
}
