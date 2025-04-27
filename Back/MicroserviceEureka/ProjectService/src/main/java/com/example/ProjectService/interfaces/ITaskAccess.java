package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.TaskAccessRequest;
import com.example.ProjectService.dto.response.TaskAccessResponse;

import java.util.List;

public interface ITaskAccess {
    TaskAccessResponse createTaskAccess(TaskAccessRequest request);
    TaskAccessResponse getTaskAccessById(Long id);
    List<TaskAccessResponse> getAccessesByTask(Long taskId);
    TaskAccessResponse updateViewPermission(Long id, boolean canView);
    void deleteTaskAccess(Long id);
}
