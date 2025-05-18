package com.example.CommercialService.repositories;

import com.example.CommercialService.models.CommercialDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommercialDocumentRepository extends MongoRepository<CommercialDocument, String> {
}
