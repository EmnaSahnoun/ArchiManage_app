package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.ProjectRequest;
import com.example.ProjectService.dto.response.ProjectResponse;

import java.util.List;

public interface IProject {
    ProjectResponse createProject(ProjectRequest request);
    ProjectResponse getProjectById(Long id);
    List<ProjectResponse> getAllProjects();
    ProjectResponse updateProject(Long id, ProjectRequest request);
    void deleteProject(Long id);
    List<ProjectResponse> getProjectsByAdmin(Long adminId);
    List<ProjectResponse> getProjectsByCompain(Long idCompain);
}
