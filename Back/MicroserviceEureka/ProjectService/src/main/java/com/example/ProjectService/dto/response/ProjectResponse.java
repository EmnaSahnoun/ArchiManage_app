package com.example.ProjectService.dto.response;


import lombok.Data;
import com.example.ProjectService.dto.response.PhaseResponse;

import java.util.Date;
import java.util.List;


public class ProjectResponse {
    private Long id;
    private Long idCompany;
    private String name;
    private String description;
    private Long idAdmin;
    private boolean isDeleted;
    private List<Long> projectAccessIds;
    private List<Long> phaseIds;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getIdAdmin() {
        return idAdmin;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public List<Long> getProjectAccessIds() {
        return projectAccessIds;
    }

    public List<Long> getPhaseIds() {
        return phaseIds;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setIdAdmin(Long idAdmin) {
        this.idAdmin = idAdmin;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public void setProjectAccessIds(List<Long> projectAccessIds) {
        this.projectAccessIds = projectAccessIds;
    }

    public void setPhaseIds(List<Long> phaseIds) {
        this.phaseIds = phaseIds;
    }

    public Long getIdCompany() {
        return idCompany;
    }

    public void setIdCompany(Long idCompany) {
        this.idCompany = idCompany;
    }
}