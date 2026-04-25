package org.oji.shgl.company.service.impl;

import lombok.RequiredArgsConstructor;
import org.oji.shgl.dto.CompanyResponseDto;
import org.oji.shgl.entity.Company;
import org.oji.shgl.mapper.CompanyMapper;
import org.oji.shgl.repository.CompanyRepository;
import org.oji.shgl.company.service.ICompanyService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
//lombok
@RequiredArgsConstructor
public class CompanyService implements ICompanyService {
    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
//    public CompanyServiceImpl(CompanyRepository companyRepository){
//        this.companyRepository = companyRepository;
//    }

    public List<CompanyResponseDto> getAllCompanies(){
        List<Company> companies = companyRepository.findAll();
        // -> map(this::transformData) // manual mapping
        // -> -> map(i -> CompanyMapper.INSTANCE.toCompanyDto(i)) // automapping
        return companies.stream().map(companyMapper::toDto).toList();
    }

    /*private CompanyDto transformData(Company company){
        return new CompanyDto(company.getId(), company.getName(), company.getLogo(), company.getIndustry(), company.getSize(), company.getRating(), company.getLocations(), company.getFounded(), company.getDescription(), company.getEmployees(), company.getWebsite(), company.getCreatedAt());
    }*/
}
