package com.example.ProjectService.dto.response;

import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.models.enums.Role;
import lombok.Data;


public class ProjectAccessResponse {
    private Long id;
    private Long idUser;
    private String emailUser;
    private InvitationStatus invitationStatus;
    private Role role;
    private Long projectId;

    public Long getId() {
        return id;
    }

    public Long getIdUser() {
        return idUser;
    }

    public String getEmailUser() {
        return emailUser;
    }

    public InvitationStatus getInvitationStatus() {
        return invitationStatus;
    }

    public Role getRole() {
        return role;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public void setEmailUser(String emailUser) {
        this.emailUser = emailUser;
    }

    public void setInvitationStatus(InvitationStatus invitationStatus) {
        this.invitationStatus = invitationStatus;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}
