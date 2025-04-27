package com.example.ProjectService.controller;

import com.example.ProjectService.dto.request.TaskAccessRequest;
import com.example.ProjectService.dto.response.TaskAccessResponse;
import com.example.ProjectService.services.TaskAccessService;
import com.example.ProjectService.services.TaskService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")
@RestController
@AllArgsConstructor
public class TaskAccessController {
    private TaskAccessService taskAccessService;
    @PostMapping
    public ResponseEntity<TaskAccessResponse> createTaskAccess(@RequestBody TaskAccessRequest request) {
        TaskAccessResponse response = taskAccessService.createTaskAccess(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskAccessResponse> getTaskAccessById(@PathVariable Long id) {
        TaskAccessResponse response = taskAccessService.getTaskAccessById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskAccessResponse>> getAccessesByTask(@PathVariable Long taskId) {
        List<TaskAccessResponse> responses = taskAccessService.getAccessesByTask(taskId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/view-permission")
    public ResponseEntity<TaskAccessResponse> updateViewPermission(
            @PathVariable Long id,
            @RequestParam boolean canView) {
        TaskAccessResponse response = taskAccessService.updateViewPermission(id, canView);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskAccess(@PathVariable Long id) {
        taskAccessService.deleteTaskAccess(id);
        return ResponseEntity.noContent().build();
    }
}
