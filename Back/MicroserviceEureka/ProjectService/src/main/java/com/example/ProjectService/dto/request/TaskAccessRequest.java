package com.example.ProjectService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskAccessRequest {
    @NotNull(message = "User ID is required")
    private Long idUser;

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotNull(message = "View permission is required")
    private Boolean canView;

    public Long getIdUser() {
        return idUser;
    }

    public Long getTaskId() {
        return taskId;
    }

    public Boolean getCanView() {
        return canView;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public void setCanView(Boolean canView) {
        this.canView = canView;
    }
}
