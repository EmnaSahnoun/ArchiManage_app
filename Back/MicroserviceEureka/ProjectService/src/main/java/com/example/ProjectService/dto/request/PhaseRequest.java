package com.example.ProjectService.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class PhaseRequest {
    @NotBlank(message = "Phase name is required")
    private String name;

    private String description;

    @NotNull(message = "Start date is required")
    private Date startDate;

    private Date endDate;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Date getStartDate() {
        return startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}
