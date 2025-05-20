package com.example.CommercialService.repositories;

import com.example.CommercialService.models.CommercialDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommercialDocumentRepository extends MongoRepository<CommercialDocument, String> {
    List<CommercialDocument> findByCompanyId(String companyId);

    // Trouver tous les documents d'un client
    List<CommercialDocument> findByClientId(String clientId);

    // Trouver tous les documents d'un client dans une company spécifique
    List<CommercialDocument> findByCompanyIdAndClientId(String companyId, String clientId);
}
