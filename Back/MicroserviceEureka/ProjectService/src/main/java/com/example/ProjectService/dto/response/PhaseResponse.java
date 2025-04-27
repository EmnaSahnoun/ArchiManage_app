package com.example.ProjectService.dto.response;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class PhaseResponse {
    private Long id;
    private String name;
    private String description;
    private Date startDate;
    private Date endDate;
    private Long projectId;
    private List<Long> taskIds;

    public Long getId() {
        return id;
    }

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

    public List<Long> getTaskIds() {
        return taskIds;
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

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public void setTaskIds(List<Long> taskIds) {
        this.taskIds = taskIds;
    }
}
