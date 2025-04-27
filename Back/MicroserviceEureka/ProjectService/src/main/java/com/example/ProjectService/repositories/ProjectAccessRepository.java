package com.example.ProjectService.repositories;


import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.models.enums.InvitationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectAccessRepository extends MongoRepository<ProjectAccess, Long> {
    List<ProjectAccess> findByProjectId(Long projectId);
    List<ProjectAccess> findByProjectIdAndInvitationStatus(Long projectId, InvitationStatus status);
}
