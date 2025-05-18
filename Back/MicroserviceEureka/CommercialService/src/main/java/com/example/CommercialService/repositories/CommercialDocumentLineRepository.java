package com.example.CommercialService.repositories;

import com.example.CommercialService.models.CommercialDocument;
import com.example.CommercialService.models.CommercialDocumentLine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface CommercialDocumentLineRepository extends MongoRepository<CommercialDocumentLine, String> {
}
