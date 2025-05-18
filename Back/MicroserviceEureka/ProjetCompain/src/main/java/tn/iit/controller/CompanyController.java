package tn.iit.controller;

import org.springframework.web.bind.annotation.ResponseStatus;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import tn.iit.dto.request.CompanyRequest;
import tn.iit.dto.response.CompanyResponse;
import tn.iit.dto.response.ProjectResponse;
import tn.iit.entites.Company;
import tn.iit.exception.CompanyNotFoundException;
import tn.iit.services.CompanyService;

import org.springframework.security.access.prepost.PreAuthorize;
import tn.iit.services.ProjectService;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
           allowedHeaders = "*",
           allowCredentials = "true")
@RestController
@AllArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private  ProjectService projectService;
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/all")
    public List<CompanyResponse> getAllCompanies() {
        return companyService.findAll().stream()
                .map(companyService::convertToResponse) // Correction ici
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CompanyResponse getCompanyById(@PathVariable(name = "id") String id) throws CompanyNotFoundException {
        return companyService.convertToResponse(companyService.getById(id));
    }

@ResponseStatus(HttpStatus.OK)
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteCompany(
        @PathVariable String id,
        @RequestHeader("Authorization") String authToken) {
    
    try {
        companyService.deletecompany(id, authToken);
        return ResponseEntity.noContent().build();
    } catch (CompanyNotFoundException e) {
        return ResponseEntity.notFound().build();
    } catch (RuntimeException e) {
        return ResponseEntity.internalServerError()
                .body(e.getMessage());
    }
}    



@ResponseStatus(HttpStatus.CREATED)
@PostMapping("/create")
public CompanyResponse createCompany(@RequestBody @Valid CompanyRequest request,
                                     @RequestHeader("Authorization") String authToken) {
    Company company = companyService.convertToEntity(request);
    return companyService.convertToResponse(companyService.createcompany(company, authToken));
    }

@PutMapping("/update/{id}")
@ResponseStatus(HttpStatus.OK)
public CompanyResponse updateCompany(@PathVariable String id,
                                     @RequestBody @Valid CompanyRequest request,
                                     @RequestHeader("Authorization") String authToken)
        throws CompanyNotFoundException {

    Company company = companyService.convertToEntity(request);
    company.setId(id); // Assurez-vous que l'ID est bien défini
    Company updated = companyService.updatecompany(id, company, authToken);
    return companyService.convertToResponse(updated);
}



    @GetMapping("/{companyId}/projects")
    public ResponseEntity<List<ProjectResponse>> getCompanyProjects(@PathVariable String companyId) {
        List<ProjectResponse> projects = projectService.getProjectsByCompany(companyId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<?> getCompanyByName(@PathVariable String name) {
        try {
            Company company = companyService.getcompanyByName(name);
            return ResponseEntity.ok(companyService.convertToResponse(company));
        } catch (CompanyNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Company with name '" + name + "' not found");
        }
    }


}
