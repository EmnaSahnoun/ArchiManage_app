package com.example.ProjectService.repositories;

import com.example.ProjectService.models.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, Long> {
    List<Project> findAllByIsDeletedFalse();
    List<Project> findByIdAdminAndIsDeletedFalse(Long adminId);
}
