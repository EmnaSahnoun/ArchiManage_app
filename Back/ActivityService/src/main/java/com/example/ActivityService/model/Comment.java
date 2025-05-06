package com.example.ActivityService.model;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class Comment {
    private String id;
    private String taskId;
    private String username;
    private String content;
    private LocalDateTime createdAt;

}
