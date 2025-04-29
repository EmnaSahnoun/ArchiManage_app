package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.TaskRequest;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.exception.PhaseNotFoundException;
import com.example.ProjectService.exception.TaskNotFoundException;
import com.example.ProjectService.interfaces.ITask;
import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.PhaseAccess;
import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.models.Task;
import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import com.example.ProjectService.repositories.PhaseRepository;
import com.example.ProjectService.repositories.ProjectAccessRepository;
import com.example.ProjectService.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class TaskService implements ITask {
    private  TaskRepository taskRepository;
    private  PhaseRepository phaseRepository;
    private ProjectAccessRepository projectAccessRepository;
    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        // Récupérer la phase
        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new PhaseNotFoundException(request.getPhaseId()));

        // Créer la tâche
        Task task = new Task();
        task.setName(request.getName());
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setPhase(phase);

        // Sauvegarder la tâche
        Task savedTask = taskRepository.save(task);



        return mapToTaskResponse(savedTask);
    }


    @Override
    public TaskResponse getTaskById(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return mapToTaskResponse(task);

    }

    @Override
    public List<TaskResponse> getTasksByPhase(String phaseId) {
        return taskRepository.findByPhaseId(phaseId)
                .stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponse updateTaskStatus(String id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse updateTaskPriority(String id, TaskPriority priority) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setPriority(priority);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse addSubTask(String parentId, TaskRequest request) {
        Task parentTask = taskRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent task not found with id: " + parentId));

        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + request.getPhaseId()));

        Task subTask = new Task();
        subTask.setName(request.getName());
        subTask.setStartDate(request.getStartDate());
        subTask.setEndDate(request.getEndDate());
        subTask.setStatus(request.getStatus());
        subTask.setPriority(request.getPriority());
        subTask.setPhase(phase);

        Task savedSubTask = taskRepository.save(subTask);
        parentTask.getSubTasks().add(savedSubTask);
        taskRepository.save(parentTask);

        TaskResponse response = mapToTaskResponse(savedSubTask);
        response.setParentTaskId(parentId);
        return response;
    }

    @Override
    public void deleteTask(String id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException("task non trouvé!");
        }
        taskRepository.deleteById(id);
    }

    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setName(task.getName());
        response.setStartDate(task.getStartDate());
        response.setEndDate(task.getEndDate());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());

        if (task.getPhase() != null) {
            response.setPhaseId(task.getPhase().getId());
        }

        if (task.getSubTasks() != null) {
            response.setSubTaskIds(task.getSubTasks()
                    .stream()
                    .map(Task::getId)
                    .collect(Collectors.toList()));
        }



        return response;
    }
}
