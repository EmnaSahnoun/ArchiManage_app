package com.example.ProjectService.repositories;

import com.example.ProjectService.models.Phase;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PhaseRepository extends MongoRepository<Phase, Long> {
    List<Phase> findByProjectId(Long projectId);
    boolean existsByProjectIdAndName(Long projectId, String name);
}
