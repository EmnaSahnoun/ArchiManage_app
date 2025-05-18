package com.example.CommercialService.repositories;

import com.example.CommercialService.models.CommercialDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommercialDocumentRepository extends MongoRepository<CommercialDocument, String> {
    @Override
    @Query(fields = "{ 'company' : 1 }")
    Optional<CommercialDocument> findById(String id);
}
