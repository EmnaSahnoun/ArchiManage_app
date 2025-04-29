package com.example.ProjectService.repositories;

import com.example.ProjectService.models.PhaseAccess;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PhaseAccessRepository extends MongoRepository<PhaseAccess, Long> {
    List<PhaseAccess> findByPhaseId(Long phaseId);
}
