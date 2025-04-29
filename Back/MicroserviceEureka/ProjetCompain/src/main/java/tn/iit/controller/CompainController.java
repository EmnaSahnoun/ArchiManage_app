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
import tn.iit.dto.request.CompainRequest;
import tn.iit.dto.response.CompainResponse;
import tn.iit.dto.response.ProjectResponse;
import tn.iit.entites.Compain;
import tn.iit.exception.CompainNotFoundException;
import tn.iit.services.CompainService;

import org.springframework.security.access.prepost.PreAuthorize;
import tn.iit.services.ProjectService;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
           allowedHeaders = "*",
           allowCredentials = "true")
@RestController
@AllArgsConstructor
public class CompainController {

    private final CompainService compainService;
    private  ProjectService projectService;
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/all")
    public List<CompainResponse> getAllCompains() {
        return compainService.findAll().stream()
                .map(compainService::convertToResponse) // Correction ici
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CompainResponse getCompainById(@PathVariable(name = "id") String id) throws CompainNotFoundException {
        return compainService.convertToResponse(compainService.getById(id));
    }

@ResponseStatus(HttpStatus.OK)
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteCompain(
        @PathVariable String id,
        @RequestHeader("Authorization") String authToken) {
    
    try {
        compainService.deleteCompain(id, authToken);
        return ResponseEntity.noContent().build();
    } catch (CompainNotFoundException e) {
        return ResponseEntity.notFound().build();
    } catch (RuntimeException e) {
        return ResponseEntity.internalServerError()
                .body(e.getMessage());
    }
}    



@ResponseStatus(HttpStatus.CREATED)
@PostMapping("/create")
public CompainResponse  createCompain(@RequestBody @Valid CompainRequest request,
                                      @RequestHeader("Authorization") String authToken) {
    Compain compain = compainService.convertToEntity(request);
    return compainService.convertToResponse(compainService.createCompain(compain, authToken));
    }

@PutMapping("/update/{id}")
@ResponseStatus(HttpStatus.OK)
public CompainResponse  updateCompain(@PathVariable String id,
                                             @RequestBody @Valid CompainRequest request,
                                             @RequestHeader("Authorization") String authToken)
        throws CompainNotFoundException {

    Compain compain = compainService.convertToEntity(request);
    compain.setId(id); // Assurez-vous que l'ID est bien défini
    Compain updated = compainService.updateCompain(id, compain, authToken);
    return compainService.convertToResponse(updated);
}



    @GetMapping("/{companyId}/projects")
    public ResponseEntity<List<ProjectResponse>> getCompanyProjects(@PathVariable String companyId) {
        List<ProjectResponse> projects = projectService.getProjectsByCompany(companyId);
        return ResponseEntity.ok(projects);
    }


}
