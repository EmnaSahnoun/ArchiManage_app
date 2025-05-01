package tn.iit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import tn.iit.entites.Compain;

import java.util.Optional;

public interface CompainRepository extends MongoRepository<Compain, String> {
    Optional<Compain> findByName(String name);
    boolean existsByName(String name);

}
