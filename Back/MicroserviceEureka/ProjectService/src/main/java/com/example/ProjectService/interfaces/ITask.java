package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.TaskRequest;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;

import java.util.List;

public interface ITask {

    TaskResponse createTask(TaskRequest request);
    TaskResponse getTaskById(Long id);
    List<TaskResponse> getTasksByPhase(Long phaseId);
    TaskResponse updateTaskStatus(Long id, TaskStatus status);
    TaskResponse updateTaskPriority(Long id, TaskPriority priority);
    TaskResponse addSubTask(Long parentId, TaskRequest request);
    void deleteTask(Long id);
}
