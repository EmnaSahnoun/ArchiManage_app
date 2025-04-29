package com.example.ProjectService.dto.request;

import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.models.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


public class ProjectAccessRequest {

    private Long idUser;

    @Email(message = "Email should be valid")
    private String emailUser;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private InvitationStatus invitationStatus = InvitationStatus.PENDING;

    @NotNull(message = "Role is required")
    private Role role;

    public Long getIdUser() {
        return idUser;
    }

    public String getEmailUser() {
        return emailUser;
    }

    public Long getProjectId() {
        return projectId;
    }

    public InvitationStatus getInvitationStatus() {
        return invitationStatus;
    }

    public Role getRole() {
        return role;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public void setEmailUser(String emailUser) {
        this.emailUser = emailUser;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public void setInvitationStatus(InvitationStatus invitationStatus) {
        this.invitationStatus = invitationStatus;
    }

    public void setRole(Role role) {
        this.role = role;
    }

}
