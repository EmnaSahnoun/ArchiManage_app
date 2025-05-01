package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.ProjectAccessRequest;
import com.example.ProjectService.dto.response.ProjectAccessResponse;
import com.example.ProjectService.interfaces.IProjectAccess;
import com.example.ProjectService.models.Project;
import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.repositories.ProjectAccessRepository;
import com.example.ProjectService.repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service

public class ProjectAccessService implements IProjectAccess {

    private final ProjectAccessRepository projectAccessRepository;
    private  final ProjectRepository projectRepository;
    @Autowired
    public ProjectAccessService(ProjectAccessRepository projectAccessRepository,
                                ProjectRepository projectRepository) {
        this.projectAccessRepository = projectAccessRepository;
        this.projectRepository = projectRepository;
    }
    @Override
    public ProjectAccessResponse createProjectAccess(ProjectAccessRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));

        ProjectAccess projectAccess = new ProjectAccess();
        projectAccess.setIdUser(request.getIdUser());
        projectAccess.setEmailUser(request.getEmailUser());
        projectAccess.setRole(request.getRole());
        projectAccess.setInvitationStatus(InvitationStatus.PENDING);
        projectAccess.setProject(project);

        ProjectAccess savedAccess = projectAccessRepository.save(projectAccess);
        return mapToProjectAccessResponse(savedAccess);
    }

    @Override
    public ProjectAccessResponse getProjectAccessById(String id) {
        ProjectAccess projectAccess = projectAccessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project access not found with id: " + id));
        return mapToProjectAccessResponse(projectAccess);
    }

    @Override
    public List<ProjectAccessResponse> getAccessesByProject(String projectId) {
        return projectAccessRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToProjectAccessResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectAccessResponse updateInvitationStatus(String id, InvitationStatus status) {
        ProjectAccess projectAccess = projectAccessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project access not found with id: " + id));

        projectAccess.setInvitationStatus(status);
        ProjectAccess updatedAccess = projectAccessRepository.save(projectAccess);
        return mapToProjectAccessResponse(updatedAccess);
    }

    @Override
    public void deleteProjectAccess(String id) {
        if (!projectAccessRepository.existsById(id)) {
            throw new RuntimeException("Project access not found with id: " + id);
        }
        projectAccessRepository.deleteById(id);
    }

    private ProjectAccessResponse mapToProjectAccessResponse(ProjectAccess projectAccess) {
        ProjectAccessResponse response = new ProjectAccessResponse();
        response.setId(projectAccess.getId());
        response.setIdUser(projectAccess.getIdUser());
        response.setEmailUser(projectAccess.getEmailUser());
        response.setInvitationStatus(projectAccess.getInvitationStatus());
        response.setRole(projectAccess.getRole());
        response.setCreatedAt(projectAccess.getCreatedAt());

        if (projectAccess.getProject() != null) {
            response.setProjectId(projectAccess.getProject().getId());
        }

        return response;
    }

}
