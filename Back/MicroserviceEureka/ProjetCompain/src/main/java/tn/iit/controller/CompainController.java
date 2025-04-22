package tn.iit.controller;

import org.springframework.web.bind.annotation.ResponseStatus;
import java.util.List;
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
import tn.iit.entites.Compain;
import tn.iit.exception.CompainNotFoundException;
import tn.iit.services.CompainService;

import org.springframework.security.access.prepost.PreAuthorize;
@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"}, 
           allowedHeaders = "*",
           allowCredentials = "true")
@RestController
@AllArgsConstructor
public class CompainController {

    private final CompainService compainService;

    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/all")
    public List<Compain> getAllCompains() {
        return compainService.findAll();
    }

    @GetMapping("/{id}")
    public Compain getCompainById(@PathVariable(name = "id") String id) throws CompainNotFoundException {
        return compainService.getById(id);
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



@ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
@PostMapping("/create")
public Compain createCompain(@RequestBody Compain compain,
                               @RequestHeader("Authorization") String authToken) {
        return compainService.createCompain(compain, authToken);
    }

@PutMapping("/update/{id}")
@ResponseStatus(HttpStatus.OK)
public ResponseEntity<Compain> updateCompain(
        @PathVariable String id,
        @RequestBody @Valid Compain updatedCompain,
        @RequestHeader("Authorization") String authToken) 
        throws CompainNotFoundException {
    
    // Validation supplémentaire
    if (!id.equals(updatedCompain.getId())) {
        throw new IllegalArgumentException("ID in path doesn't match ID in body");
    }

    Compain updated = compainService.updateCompain(id, updatedCompain, authToken);
    return ResponseEntity.ok(updated);
}




}
