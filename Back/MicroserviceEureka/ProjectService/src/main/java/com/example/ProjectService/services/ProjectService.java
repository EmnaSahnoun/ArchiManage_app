package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.ProjectRequest;
import com.example.ProjectService.dto.response.ProjectResponse;
import com.example.ProjectService.interfaces.IProject;
import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.Project;
import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ProjectService implements IProject {
    private  final ProjectRepository projectRepository;

    @Override
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIdAdmin(request.getIdAdmin());
        project.setDeleted(false);

        Project savedProject = projectRepository.save(project);
        return mapToProjectResponse(savedProject);
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        if (project.isDeleted()) {
            throw new RuntimeException("Project is deleted");
        }

        return mapToProjectResponse(project);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAllByIsDeletedFalse()
                .stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        if (project.isDeleted()) {
            throw new RuntimeException("Cannot update a deleted project");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIdAdmin(request.getIdAdmin());

        Project updatedProject = projectRepository.save(project);
        return mapToProjectResponse(updatedProject);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setDeleted(true);
        projectRepository.save(project);
    }

    @Override
    public List<ProjectResponse> getProjectsByAdmin(Long adminId) {
        return projectRepository.findByIdAdminAndIsDeletedFalse(adminId)
                .stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectResponse> getProjectsByCompain(Long idCompain) {
        return projectRepository.findByIdCompainAndIsDeletedFalse(idCompain).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setIdAdmin(project.getIdAdmin());
        response.setIdCompany(project.getIdCompain()); // Ajouté
        response.setDeleted(project.isDeleted());

        // Map project accesses IDs
        if (project.getProjectAccesses() != null) {
            response.setProjectAccessIds(project.getProjectAccesses()
                    .stream()
                    .map(ProjectAccess::getId)
                    .collect(Collectors.toList()));
        }

        // Map phase IDs
        if (project.getPhases() != null) {
            response.setPhaseIds(project.getPhases()
                    .stream()
                    .map(Phase::getId)
                    .collect(Collectors.toList()));
        }

        return response;
    }
    }
