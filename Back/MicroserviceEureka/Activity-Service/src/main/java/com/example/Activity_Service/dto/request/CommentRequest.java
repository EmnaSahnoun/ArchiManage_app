package com.example.Activity_Service.dto.request;

import lombok.Data;

import java.io.Serializable;

@Data
public class CommentRequest implements Serializable {
    private String taskId;
    private String idUser;
    private String content;
    private static final long serialVersionUID = 1L;
    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getidUser() {
        return idUser;
    }

    public void setidUser(String idUser) {
        this.idUser = idUser;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
