package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.TaskAccessRequest;
import com.example.ProjectService.dto.response.TaskAccessResponse;
import com.example.ProjectService.interfaces.ITaskAccess;
import com.example.ProjectService.models.Task;
import com.example.ProjectService.models.TaskAccess;
import com.example.ProjectService.repositories.TaskAccessRepository;
import com.example.ProjectService.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskAccessService implements ITaskAccess {
    private  TaskRepository taskRepository;
    private TaskAccessRepository taskAccessRepository;

    @Override
    public TaskAccessResponse createTaskAccess(TaskAccessRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + request.getTaskId()));

        TaskAccess taskAccess = new TaskAccess();
        taskAccess.setIdUser(request.getIdUser());
        taskAccess.setCanView(request.getCanView());
        taskAccess.setTask(task);

        TaskAccess savedAccess = taskAccessRepository.save(taskAccess);
        return mapToTaskAccessResponse(savedAccess);
    }

    @Override
    public TaskAccessResponse getTaskAccessById(Long id) {
        TaskAccess taskAccess = taskAccessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task access not found with id: " + id));
        return mapToTaskAccessResponse(taskAccess);
    }

    @Override
    public List<TaskAccessResponse> getAccessesByTask(Long taskId) {
        return taskAccessRepository.findByTaskId(taskId)
                .stream()
                .map(this::mapToTaskAccessResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskAccessResponse updateViewPermission(Long id, boolean canView) {
        TaskAccess taskAccess = taskAccessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task access not found with id: " + id));

        taskAccess.setCanView(canView);
        TaskAccess updatedAccess = taskAccessRepository.save(taskAccess);
        return mapToTaskAccessResponse(updatedAccess);
    }

    @Override
    public void deleteTaskAccess(Long id) {
        if (!taskAccessRepository.existsById(id)) {
            throw new RuntimeException("Task access not found with id: " + id);
        }
        taskAccessRepository.deleteById(id);
    }

    private TaskAccessResponse mapToTaskAccessResponse(TaskAccess taskAccess) {
        TaskAccessResponse response = new TaskAccessResponse();
        response.setId(taskAccess.getId());
        response.setIdUser(taskAccess.getIdUser());
        response.setCanView(taskAccess.isCanView());

        if (taskAccess.getTask() != null) {
            response.setTaskId(taskAccess.getTask().getId());
        }

        return response;
    }
}
