package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.PhaseAccessRequest;
import com.example.ProjectService.dto.response.PhaseAccessResponse;


import java.util.List;

public interface IPhaseAccess {
    PhaseAccessResponse createPhaseAccess(PhaseAccessRequest request);
    PhaseAccessResponse getPhaseAccessById(Long id);
    List<PhaseAccessResponse> getAccessesByPhase(Long phaseId);
    PhaseAccessResponse updateViewPermission(Long id, boolean canView);
    void deletePhaseAccess(Long id);
}
