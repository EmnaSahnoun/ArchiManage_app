package tn.iit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import tn.iit.entites.Company;

import java.util.Optional;

public interface CompanyRepository extends MongoRepository<Company, String> {
    Optional<Company> findByName(String name);
    boolean existsByName(String name);

}
