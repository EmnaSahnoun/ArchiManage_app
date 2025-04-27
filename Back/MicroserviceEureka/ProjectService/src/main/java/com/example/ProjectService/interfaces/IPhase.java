package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.PhaseRequest;
import com.example.ProjectService.dto.response.PhaseResponse;

import java.util.List;

public interface IPhase {
    PhaseResponse createPhase(PhaseRequest request);
    PhaseResponse getPhaseById(Long id);
    List<PhaseResponse> getPhasesByProject(Long projectId);
    PhaseResponse updatePhase(Long id, PhaseRequest request);
    void deletePhase(Long id);
}
