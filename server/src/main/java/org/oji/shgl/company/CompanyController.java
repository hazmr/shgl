package org.oji.shgl.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.oji.shgl.company.service.ICompanyService;
import org.oji.shgl.dto.CompanyResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("companies")

//lombok
@RequiredArgsConstructor
public class CompanyController {

    private final ICompanyService companyService;
//we will use lombok to generate this constructor for us since it's boilerplate code
//    @Autowired
//    public CompanyController(CompanyService companyService){
//        this.companyService = companyService;
//    }

    @GetMapping(version = "1.0")
    public ResponseEntity<List<CompanyResponseDto>> getAllCompanies(){
        return ResponseEntity.ok().body(companyService.getAllCompanies());
    }
}
