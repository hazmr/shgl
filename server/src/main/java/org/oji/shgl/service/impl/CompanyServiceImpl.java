package org.oji.shgl.service.impl;

import lombok.RequiredArgsConstructor;
import org.oji.shgl.dto.CompanyDto;
import org.oji.shgl.entity.Company;
import org.oji.shgl.mapper.CompanyMapper;
import org.oji.shgl.repository.CompanyRepository;
import org.oji.shgl.service.CompanyService;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
//lombok
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;

//    public CompanyServiceImpl(CompanyRepository companyRepository){
//        this.companyRepository = companyRepository;
//    }

    public List<CompanyDto> getAllCompanies(){
        List<Company> companies = companyRepository.findAll();
        // -> map(this::transformData) // manual mapping
        // -> -> map(i -> CompanyMapper.INSTANCE.toCompanyDto(i)) // automapping
        return companies.stream().map(CompanyMapper.INSTANCE::toCompanyDto).toList();
    }

    /*private CompanyDto transformData(Company company){
        return new CompanyDto(company.getId(), company.getName(), company.getLogo(), company.getIndustry(), company.getSize(), company.getRating(), company.getLocations(), company.getFounded(), company.getDescription(), company.getEmployees(), company.getWebsite(), company.getCreatedAt());
    }*/
}
