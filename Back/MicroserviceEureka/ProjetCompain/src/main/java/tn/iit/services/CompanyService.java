package tn.iit.services;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import tn.iit.clients.ProjectClient;
import tn.iit.dto.request.CompanyRequest;
import tn.iit.dto.response.CompanyResponse;
import tn.iit.dto.response.ProjectResponse;
import tn.iit.entites.Company;
import tn.iit.exception.CompanyNotFoundException;
import tn.iit.interfaces.ICompanyService;
import tn.iit.repositories.CompanyRepository;
import java.util.*;

@RequiredArgsConstructor
@Service
public class CompanyService implements ICompanyService {
    private final CompanyRepository companyRepository;


    private final KeycloakService keycloakService;

    // Méthode pour la création
    @Override
    public Company createcompany(Company company, String authToken) {
        if (companyRepository.existsByName(company.getName())) {
            throw new RuntimeException("Company name already exists: " + company.getName());
        }
        // 1. Sauvegarde dans MongoDB
        Company savedCompany = companyRepository.save(company);
        
        try {
            // 2. Création dans Keycloak
            Map<String, List<String>> attributes = createAttributes(savedCompany);
            keycloakService.createKeycloakGroup(
                savedCompany.getName(),
                attributes,
                authToken
            );
            return savedCompany;
        } catch (Exception e) {
            // Rollback MongoDB si Keycloak échoue
            companyRepository.delete(savedCompany);
            throw new RuntimeException("Failed to create Keycloak group", e);
        }
    }

    // Méthode pour la mise à jour
    @Override
    public Company updatecompany(String id, Company updatedCompany, String authToken)throws CompanyNotFoundException {
    // 1. Récupérer l'entité existante
    Company existingCompany = companyRepository.findById(id)
            .orElseThrow(() -> new CompanyNotFoundException("Company not found"));

    // 2. Sauvegarder l'ancien état pour rollback
    String oldName = existingCompany.getName();
    

    // 3. Mettre à jour MongoDB en premier
    existingCompany.setName(updatedCompany.getName());
    existingCompany.setAddress(updatedCompany.getAddress());
    existingCompany.setEmail(updatedCompany.getEmail());
    existingCompany.setPhone(updatedCompany.getPhone());
    existingCompany.setCreatedAt(updatedCompany.getCreatedAt());
    
    Company savedCompany = companyRepository.save(existingCompany);

    try {
        // 4. Mettre à jour Keycloak avec l'ancien nom et le nouveau nom
        Map<String, List<String>> attributes = createAttributes(savedCompany);
        keycloakService.updateKeycloakGroup(
            oldName,             // Ancien nom pour trouver le groupe
            savedCompany.getName(), // Nouveau nom à appliquer
            attributes,
            authToken
        );
        return savedCompany;
    } catch (Exception e) {
       
        throw new RuntimeException("Failed to update Keycloak group. MongoDB changes rolled back.", e);
    }
}


    private Map<String, List<String>> createAttributes(Company company) {
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("address", List.of(company.getAddress()));
        attributes.put("phone", List.of(company.getPhone()));
        attributes.put("email", List.of(company.getEmail()));
        attributes.put("createdAt", List.of(company.getCreatedAt().toString()));
        return attributes;
    }


    @Override
    public List<Company> findAll() {
        return companyRepository.findAll();
    }

    @Override
    public Company getById(String id) throws CompanyNotFoundException {
        return companyRepository.findById(id)
                .orElseThrow(() -> new CompanyNotFoundException("Company with id " + id + " not found"));
    }


    public void delete(String id) {
        companyRepository.deleteById(id);
    }

    @Override
    public Company update(String id, Company updatedCompany) throws CompanyNotFoundException {
        Company existingCompany = getById(id);
        
        // Mise à jour des champs
        existingCompany.setName(updatedCompany.getName());
        existingCompany.setAddress(updatedCompany.getAddress());
        existingCompany.setEmail(updatedCompany.getEmail());
        existingCompany.setPhone(updatedCompany.getPhone());
        // Ajoutez les autres champs nécessaires
        
        return companyRepository.save(existingCompany);
    }

    @Override
    public Company getcompanyByName(String name) throws CompanyNotFoundException {
        return companyRepository.findByName(name)
                .orElseThrow(() -> new CompanyNotFoundException("Company with name '" + name + "' not found"));
    }

    @Override
    public void deletecompany(String id, String authToken) throws CompanyNotFoundException {
    Company company = companyRepository.findById(id)
            .orElseThrow(() -> new CompanyNotFoundException("Company not found"));
    
    // Sauvegarde temporaire pour rollback
   Company tempCopy = new Company();
    tempCopy.setId(company.getId());
    tempCopy.setName(company.getName());
    tempCopy.setAddress(company.getAddress());
    tempCopy.setEmail(company.getEmail());
    tempCopy.setPhone(company.getPhone());
    tempCopy.setCreatedAt(company.getCreatedAt());
    try {
        // 1. Supprimer dans MongoDB en premier
        companyRepository.deleteById(id);
        
        // 2. Supprimer dans Keycloak
        keycloakService.deleteKeycloakGroup(company.getName(), authToken);
        
    } catch (Exception e) {
        // Rollback MongoDB si Keycloak échoue
        companyRepository.save(tempCopy);
        throw new RuntimeException("Failed to delete Keycloak group. MongoDB changes rolled back.", e);
    }
}

    public Company convertToEntity(CompanyRequest request) {
        Company company = new Company();
        company.setName(request.getName());
        company.setAddress(request.getAddress());
        company.setEmail(request.getEmail());
        company.setPhone(request.getPhone());
        return company;
    }

    public CompanyResponse convertToResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setName(company.getName());
        response.setAddress(company.getAddress());
        response.setEmail(company.getEmail());
        response.setPhone(company.getPhone());
        response.setCreatedAt(company.getCreatedAt());
        return response;
    }


        private final ProjectClient projectClient;

        public List<ProjectResponse> getProjectsByCompany(String companyId) {
            return projectClient.getProjectsByCompany(companyId);
        }

}
