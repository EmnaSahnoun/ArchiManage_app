package com.example.Activity_Service.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class TaskEventDTO {
    private String taskId;
    private String action;
    private String idUser;
    private Map<String, Object> newTaskData;
    private Map<String, String> oldValues;
    private LocalDateTime timestamp;

    public String getIdUser() {
        return idUser;
    }

    public void setIdUser(String idUser) {
        this.idUser = idUser;
    }

    public Map<String, Object> getNewTaskData() {
        return newTaskData;
    }

    public void setNewTaskData(Map<String, Object> newTaskData) {
        this.newTaskData = newTaskData;
    }

    public Map<String, String> getOldValues() {
        return oldValues;
    }

    public void setOldValues(Map<String, String> oldValues) {
        this.oldValues = oldValues;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    // Getters et Setters
    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
