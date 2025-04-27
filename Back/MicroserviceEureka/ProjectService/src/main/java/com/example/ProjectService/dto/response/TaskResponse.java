package com.example.ProjectService.dto.response;

import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class TaskResponse {
    private Long id;
    private String name;
    private Date startDate;
    private Date endDate;
    private TaskStatus status;
    private TaskPriority priority;
    private Long phaseId;
    private Long parentTaskId;
    private List<Long> subTaskIds;
    private List<Long> taskAccessIds;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Date getStartDate() {
        return startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public Long getPhaseId() {
        return phaseId;
    }

    public Long getParentTaskId() {
        return parentTaskId;
    }

    public List<Long> getSubTaskIds() {
        return subTaskIds;
    }

    public List<Long> getTaskAccessIds() {
        return taskAccessIds;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public void setPhaseId(Long phaseId) {
        this.phaseId = phaseId;
    }

    public void setParentTaskId(Long parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public void setSubTaskIds(List<Long> subTaskIds) {
        this.subTaskIds = subTaskIds;
    }

    public void setTaskAccessIds(List<Long> taskAccessIds) {
        this.taskAccessIds = taskAccessIds;
    }
}
