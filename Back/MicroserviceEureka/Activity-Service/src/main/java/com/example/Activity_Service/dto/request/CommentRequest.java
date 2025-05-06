package com.example.Activity_Service.dto.request;

import lombok.Data;

import java.io.Serializable;

@Data
public class CommentRequest implements Serializable {
    private String taskId;
    private String username;
    private String content;
    private static final long serialVersionUID = 1L;
    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getusername() {
        return username;
    }

    public void setusername(String username) {
        this.username = username;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
