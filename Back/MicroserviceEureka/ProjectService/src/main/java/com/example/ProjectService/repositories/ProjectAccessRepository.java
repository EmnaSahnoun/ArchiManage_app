package com.example.ProjectService.repositories;


import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.models.enums.InvitationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ProjectAccessRepository extends MongoRepository<ProjectAccess, Long> {
    List<ProjectAccess> findByProjectId(Long projectId);
    List<ProjectAccess> findByProjectIdAndInvitationStatus(Long projectId, InvitationStatus status);
}
