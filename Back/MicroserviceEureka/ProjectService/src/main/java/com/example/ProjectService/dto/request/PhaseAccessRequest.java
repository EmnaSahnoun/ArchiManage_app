package com.example.ProjectService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


public class PhaseAccessRequest {
    @NotNull(message = "User ID is required")
    private Long idUser;

    @NotNull(message = "Phase ID is required")
    private Long phaseId;

    @NotNull(message = "View permission is required")
    private Boolean canView;

    public Long getIdUser() {
        return idUser;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public Long getPhaseId() {
        return phaseId;
    }

    public void setPhaseId(Long phaseId) {
        this.phaseId = phaseId;
    }

    public Boolean getCanView() {
        return canView;
    }

    public void setCanView(Boolean canView) {
        this.canView = canView;
    }
}
