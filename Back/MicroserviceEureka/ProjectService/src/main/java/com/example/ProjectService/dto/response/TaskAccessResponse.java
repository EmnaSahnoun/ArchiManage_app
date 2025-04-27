package com.example.ProjectService.dto.response;

import lombok.Data;

@Data
public class TaskAccessResponse {
    private Long id;
    private Long idUser;
    private boolean canView;
    private Long taskId;

    public Long getId() {
        return id;
    }

    public Long getIdUser() {
        return idUser;
    }

    public boolean isCanView() {
        return canView;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public void setCanView(boolean canView) {
        this.canView = canView;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
}
