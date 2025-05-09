package com.example.Activity_Service.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class TaskEventDTO {
    private String idTask;
    private String action; // CREATE, UPDATE, DELETE
    private String idUser;
    private Map<String, String> changes;

    public String getIdTask() {
        return idTask;
    }

    public void setIdTask(String idTask) {
        this.idTask = idTask;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Map<String, String> getChanges() {
        return changes;
    }

    public void setChanges(Map<String, String> changes) {
        this.changes = changes;
    }

    public String getIdUser() {
        return idUser;
    }

    public void setIdUser(String idUser) {
        this.idUser = idUser;
    }
}
