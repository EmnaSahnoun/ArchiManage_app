package com.example.ActivityService.controller;

import com.example.ActivityService.model.TaskHistory;
import com.example.ActivityService.service.TaskHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/history")

public class TaskHistoryController {
    private final TaskHistoryService taskHistoryService;
    @Autowired
    public TaskHistoryController(TaskHistoryService taskHistoryService) {
        this.taskHistoryService = taskHistoryService;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskHistory>> getHistoryForTask(@PathVariable String taskId) {
        return ResponseEntity.ok(taskHistoryService.getHistoryForTask(taskId));
    }
}
