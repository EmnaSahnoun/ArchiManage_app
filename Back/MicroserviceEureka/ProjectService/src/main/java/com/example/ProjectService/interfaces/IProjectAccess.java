package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.ProjectAccessRequest;
import com.example.ProjectService.dto.response.ProjectAccessResponse;
import com.example.ProjectService.models.enums.InvitationStatus;

import java.util.List;

public interface IProjectAccess {
    ProjectAccessResponse createProjectAccess(ProjectAccessRequest request);
    ProjectAccessResponse getProjectAccessById(Long id);
    List<ProjectAccessResponse> getAccessesByProject(Long projectId);
    ProjectAccessResponse updateInvitationStatus(Long id, InvitationStatus status);
    void deleteProjectAccess(Long id);
}
