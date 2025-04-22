package tn.iit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import tn.iit.entites.Compain;

public interface CompainRepository extends MongoRepository<Compain, String> {

}
