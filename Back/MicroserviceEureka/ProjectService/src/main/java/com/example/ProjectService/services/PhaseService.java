package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.PhaseRequest;
import com.example.ProjectService.dto.response.PhaseResponse;
import com.example.ProjectService.exception.PhaseNotFoundException;
import com.example.ProjectService.exception.ProjectNotFoundException;
import com.example.ProjectService.interfaces.IPhase;
import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.Project;

import com.example.ProjectService.models.Task;
import com.example.ProjectService.repositories.PhaseRepository;
import com.example.ProjectService.repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhaseService implements IPhase {
    private  PhaseRepository phaseRepository;
    private   ProjectRepository projectRepository;

    @Override
    public PhaseResponse createPhase(PhaseRequest request) {
        Long id=request.getProjectId();
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));

        Phase phase = new Phase();
        phase.setName(request.getName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setProject(project);

        Phase savedPhase = phaseRepository.save(phase);
        return mapToResponse(savedPhase);
    }

    @Override
    public PhaseResponse getPhaseById(Long id) {
        Phase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new PhaseNotFoundException("Phase not found with id: " + id));
        return mapToResponse(phase);
    }

    @Override
    public List<PhaseResponse> getPhasesByProject(Long projectId) {
        return phaseRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhaseResponse updatePhase(Long id, PhaseRequest request) {
        Phase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new PhaseNotFoundException("Phase not found with id: " + id));

        phase.setName(request.getName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());

        // Update project reference if needed
        if (!phase.getProject().getId().equals(request.getProjectId())) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + request.getProjectId()));
            phase.setProject(project);
        }

        Phase updatedPhase = phaseRepository.save(phase);
        return mapToResponse(updatedPhase);
    }

    @Override
    public void deletePhase(Long id) {
        if (!phaseRepository.existsById(id)) {
            throw new PhaseNotFoundException("Phase not found with id: " + id);
        }
        phaseRepository.deleteById(id);
    }

    private PhaseResponse mapToResponse(Phase phase) {
        PhaseResponse response = new PhaseResponse();
        response.setId(phase.getId());
        response.setName(phase.getName());
        response.setDescription(phase.getDescription());
        response.setStartDate(phase.getStartDate());
        response.setEndDate(phase.getEndDate());
        response.setProjectId(phase.getProject().getId());

        if (phase.getTasks() != null) {
            response.setTaskIds(phase.getTasks().stream()
                    .map(Task::getId)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}
