package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.TaskRequest;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.exception.PhaseNotFoundException;
import com.example.ProjectService.exception.TaskNotFoundException;
import com.example.ProjectService.interfaces.ITask;
import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.models.Task;
import com.example.ProjectService.models.TaskAccess;
import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.models.enums.Role;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import com.example.ProjectService.repositories.PhaseRepository;
import com.example.ProjectService.repositories.ProjectAccessRepository;
import com.example.ProjectService.repositories.TaskAccessRepository;
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
    private TaskAccessRepository taskAccessRepository;
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

        // Récupérer tous les membres du projet (acceptés)
        List<ProjectAccess> projectMembers = projectAccessRepository.findByProjectIdAndInvitationStatus(
                phase.getProject().getId(),
                InvitationStatus.ACCEPTED
        );

        // Créer les TaskAccess pour chaque membre
        createDefaultTaskAccesses(savedTask, projectMembers);

        return mapToTaskResponse(savedTask);
    }

    private void createDefaultTaskAccesses(Task task, List<ProjectAccess> projectMembers) {
        for (ProjectAccess member : projectMembers) {
            TaskAccess taskAccess = new TaskAccess();
            taskAccess.setIdUser(member.getIdUser());
            taskAccess.setTask(task);
            taskAccessRepository.save(taskAccess);
        }
    }
    @Override
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return mapToTaskResponse(task);

    }

    @Override
    public List<TaskResponse> getTasksByPhase(Long phaseId) {
        return taskRepository.findByPhaseId(phaseId)
                .stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse updateTaskPriority(Long id, TaskPriority priority) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setPriority(priority);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse addSubTask(Long parentId, TaskRequest request) {
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
    public void deleteTask(Long id) {
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

        if (task.getTaskAccesses() != null) {
            response.setTaskAccessIds(task.getTaskAccesses()
                    .stream()
                    .map(TaskAccess::getId)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}
