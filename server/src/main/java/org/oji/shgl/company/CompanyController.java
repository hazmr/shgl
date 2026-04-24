package org.oji.shgl.company;

import lombok.RequiredArgsConstructor;
import org.oji.shgl.dto.CompanyDto;
import org.oji.shgl.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("companies")

//lombok
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
//we will use lombok to generate this constructor for us since it's boilerplate code
//    @Autowired
//    public CompanyController(CompanyService companyService){
//        this.companyService = companyService;
//    }

    @GetMapping(version = "1.0")
    public ResponseEntity<List<CompanyDto>> getAllCompanies(){
        return ResponseEntity.ok().body(companyService.getAllCompanies());
    }
}
