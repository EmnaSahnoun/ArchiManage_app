package com.example.CommercialService.repositories;

import com.example.CommercialService.models.Client;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends MongoRepository<Client, String> {
    List<Client> findByIdCompany(String idCompany);
}
