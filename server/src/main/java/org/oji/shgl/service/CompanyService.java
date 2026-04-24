package org.oji.shgl.service;

import org.oji.shgl.dto.CompanyDto;
import org.oji.shgl.entity.Company;

import java.util.List;

public interface CompanyService {
    List<CompanyDto> getAllCompanies();
}
