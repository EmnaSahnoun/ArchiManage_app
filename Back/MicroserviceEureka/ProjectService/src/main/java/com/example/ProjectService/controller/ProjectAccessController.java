package com.example.ProjectService.controller;

import com.example.ProjectService.dto.request.ProjectAccessRequest;
import com.example.ProjectService.dto.response.ProjectAccessResponse;
import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.services.ProjectAccessService;
import com.example.ProjectService.services.ProjectService;
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
public class ProjectAccessController {
    private ProjectAccessService projectAccessService;
    @PostMapping
    public ResponseEntity<ProjectAccessResponse> createProjectAccess(@RequestBody ProjectAccessRequest request) {
        ProjectAccessResponse response = projectAccessService.createProjectAccess(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectAccessResponse> getProjectAccessById(@PathVariable Long id) {
        ProjectAccessResponse response = projectAccessService.getProjectAccessById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectAccessResponse>> getAccessesByProject(@PathVariable Long projectId) {
        List<ProjectAccessResponse> responses = projectAccessService.getAccessesByProject(projectId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectAccessResponse> updateInvitationStatus(
            @PathVariable Long id,
            @RequestParam InvitationStatus status) {
        ProjectAccessResponse response = projectAccessService.updateInvitationStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjectAccess(@PathVariable Long id) {
        projectAccessService.deleteProjectAccess(id);
        return ResponseEntity.noContent().build();
    }

}
