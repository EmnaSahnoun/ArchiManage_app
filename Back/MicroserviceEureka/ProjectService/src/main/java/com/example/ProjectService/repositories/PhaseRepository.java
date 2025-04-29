package com.example.ProjectService.repositories;

import com.example.ProjectService.models.Phase;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface PhaseRepository extends MongoRepository<Phase, Long> {
    List<Phase> findByProjectId(Long projectId);
    boolean existsByProjectIdAndName(Long projectId, String name);
}
