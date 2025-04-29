package tn.iit.services;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import tn.iit.clients.ProjectClient;
import tn.iit.dto.request.CompainRequest;
import tn.iit.dto.response.CompainResponse;
import tn.iit.dto.response.ProjectResponse;
import tn.iit.entites.Compain;
import tn.iit.exception.CompainNotFoundException;
import tn.iit.interfaces.ICompainService;
import tn.iit.repositories.CompainRepository;
import java.util.*;

@RequiredArgsConstructor
@Service
public class CompainService implements ICompainService {
    private final CompainRepository compainRepository;


    private final KeycloakService keycloakService;

    // Méthode pour la création
    @Override
    public Compain createCompain(Compain compain, String authToken) {
        // 1. Sauvegarde dans MongoDB
        Compain savedCompain = compainRepository.save(compain);
        
        try {
            // 2. Création dans Keycloak
            Map<String, List<String>> attributes = createAttributes(savedCompain);
            keycloakService.createKeycloakGroup(
                savedCompain.getName(),
                attributes,
                authToken
            );
            return savedCompain;
        } catch (Exception e) {
            // Rollback MongoDB si Keycloak échoue
            compainRepository.delete(savedCompain);
            throw new RuntimeException("Failed to create Keycloak group", e);
        }
    }

    // Méthode pour la mise à jour
    @Override
    public Compain updateCompain(String id, Compain updatedCompain, String authToken)throws CompainNotFoundException {
    // 1. Récupérer l'entité existante
    Compain existingCompain = compainRepository.findById(id)
            .orElseThrow(() -> new CompainNotFoundException("Company not found"));

    // 2. Sauvegarder l'ancien état pour rollback
    String oldName = existingCompain.getName();
    

    // 3. Mettre à jour MongoDB en premier
    existingCompain.setName(updatedCompain.getName());
    existingCompain.setAddress(updatedCompain.getAddress());
    existingCompain.setEmail(updatedCompain.getEmail());
    existingCompain.setPhone(updatedCompain.getPhone());
    existingCompain.setCreatedAt(updatedCompain.getCreatedAt());
    
    Compain savedCompain = compainRepository.save(existingCompain);

    try {
        // 4. Mettre à jour Keycloak avec l'ancien nom et le nouveau nom
        Map<String, List<String>> attributes = createAttributes(savedCompain);
        keycloakService.updateKeycloakGroup(
            oldName,             // Ancien nom pour trouver le groupe
            savedCompain.getName(), // Nouveau nom à appliquer
            attributes,
            authToken
        );
        return savedCompain;
    } catch (Exception e) {
       
        throw new RuntimeException("Failed to update Keycloak group. MongoDB changes rolled back.", e);
    }
}


    private Map<String, List<String>> createAttributes(Compain compain) {
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("address", List.of(compain.getAddress()));
        attributes.put("phone", List.of(compain.getPhone()));
        attributes.put("email", List.of(compain.getEmail()));
        attributes.put("createdAt", List.of(compain.getCreatedAt().toString()));
        return attributes;
    }


    @Override
    public List<Compain> findAll() {
        return compainRepository.findAll();
    }

    @Override
    public Compain getById(String id) throws CompainNotFoundException {
        return compainRepository.findById(id)
                .orElseThrow(() -> new CompainNotFoundException("Company with id " + id + " not found"));
    }


    public void delete(String id) {
        compainRepository.deleteById(id);
    }

    @Override
    public Compain update(String id, Compain updatedCompain) throws CompainNotFoundException {
        Compain existingCompain = getById(id);
        
        // Mise à jour des champs
        existingCompain.setName(updatedCompain.getName());
        existingCompain.setAddress(updatedCompain.getAddress());
        existingCompain.setEmail(updatedCompain.getEmail());
        existingCompain.setPhone(updatedCompain.getPhone());
        // Ajoutez les autres champs nécessaires
        
        return compainRepository.save(existingCompain);
    }

    @Override
    public void deleteCompain(String id, String authToken) throws CompainNotFoundException {
    Compain compain = compainRepository.findById(id)
            .orElseThrow(() -> new CompainNotFoundException("Company not found"));
    
    // Sauvegarde temporaire pour rollback
   Compain tempCopy = new Compain();
    tempCopy.setId(compain.getId());
    tempCopy.setName(compain.getName());
    tempCopy.setAddress(compain.getAddress());
    tempCopy.setEmail(compain.getEmail());
    tempCopy.setPhone(compain.getPhone());
    tempCopy.setCreatedAt(compain.getCreatedAt());   
    try {
        // 1. Supprimer dans MongoDB en premier
        compainRepository.deleteById(id);
        
        // 2. Supprimer dans Keycloak
        keycloakService.deleteKeycloakGroup(compain.getName(), authToken);
        
    } catch (Exception e) {
        // Rollback MongoDB si Keycloak échoue
        compainRepository.save(tempCopy);
        throw new RuntimeException("Failed to delete Keycloak group. MongoDB changes rolled back.", e);
    }
}

    public Compain convertToEntity(CompainRequest request) {
        Compain compain = new Compain();
        compain.setName(request.getName());
        compain.setAddress(request.getAddress());
        compain.setEmail(request.getEmail());
        compain.setPhone(request.getPhone());
        return compain;
    }

    public CompainResponse convertToResponse(Compain compain) {
        CompainResponse response = new CompainResponse();
        response.setId(compain.getId());
        response.setName(compain.getName());
        response.setAddress(compain.getAddress());
        response.setEmail(compain.getEmail());
        response.setPhone(compain.getPhone());
        response.setCreatedAt(compain.getCreatedAt());
        return response;
    }

    @Service
    @RequiredArgsConstructor
    public class CompanyService {
        private final ProjectClient projectClient;

        public List<ProjectResponse> getProjectsByCompany(String companyId) {
            return projectClient.getProjectsByCompanyId(companyId);
        }
    }
}
