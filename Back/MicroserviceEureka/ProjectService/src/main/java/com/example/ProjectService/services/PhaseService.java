package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.PhaseRequest;
import com.example.ProjectService.dto.response.PhaseResponse;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.exception.PhaseNotFoundException;
import com.example.ProjectService.exception.ProjectNotFoundException;
import com.example.ProjectService.interfaces.IPhase;
import com.example.ProjectService.models.*;

import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.repositories.PhaseAccessRepository;
import com.example.ProjectService.repositories.PhaseRepository;
import com.example.ProjectService.repositories.ProjectAccessRepository;
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
    private PhaseAccessRepository phaseAccessRepository;
    private ProjectAccessRepository projectAccessRepository;
    @Override
    public PhaseResponse createPhase(PhaseRequest request) {
        String id=request.getProjectId();
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));

        Phase phase = new Phase();
        phase.setName(request.getName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setProject(project);

        Phase savedPhase = phaseRepository.save(phase);
        // Récupérer tous les membres du projet (acceptés)
        List<ProjectAccess> projectMembers = projectAccessRepository.findByProjectIdAndInvitationStatus(
                phase.getProject().getId(),
                InvitationStatus.ACCEPTED
        );

        // Créer les TaskAccess pour chaque membre
        createDefaultPhaseAccesses(savedPhase, projectMembers);
        return mapToResponse(savedPhase);
    }

    private void createDefaultPhaseAccesses(Phase phase, List<ProjectAccess> projectMembers) {
        for (ProjectAccess member : projectMembers) {
            PhaseAccess phaseAccess = new PhaseAccess();
            phaseAccess.setIdUser(member.getIdUser());
            phaseAccess.setCanView(true);
            phaseAccess.setPhase(phase);
            phaseAccessRepository.save(phaseAccess);
        }
    }

    @Override
    public PhaseResponse getPhaseById(String id) {
        Phase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new PhaseNotFoundException("Phase not found with id: " + id));
        return mapToResponse(phase);
    }

    @Override
    public List<PhaseResponse> getPhasesByProject(String projectId) {
        return phaseRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhaseResponse updatePhase(String id, PhaseRequest request) {
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
    public void deletePhase(String id) {
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
        if (phase.getPhaseAccesses() != null) {
            response.setPhaseAccessIds(phase.getPhaseAccesses()
                    .stream()
                    .map(PhaseAccess::getId)
                    .collect(Collectors.toList()));
        }
        return response;
    }

}
