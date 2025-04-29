package com.example.ProjectService.repositories;

import com.example.ProjectService.models.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findAllByIsDeletedFalse();
    List<Project> findByIdAdminAndIsDeletedFalse(String adminId);
    List<Project> findByIdCompainAndIsDeletedFalse(String idCompain);
}
