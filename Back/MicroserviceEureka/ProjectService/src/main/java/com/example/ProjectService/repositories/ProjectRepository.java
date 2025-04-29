package com.example.ProjectService.repositories;

import com.example.ProjectService.models.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ProjectRepository extends MongoRepository<Project, Long> {
    List<Project> findAllByIsDeletedFalse();
    List<Project> findByIdAdminAndIsDeletedFalse(Long adminId);
    List<Project> findByIdCompainAndIsDeletedFalse(Long idCompain);
}
