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
import com.example.ProjectService.repositories.ProjectRepository;
import com.example.ProjectService.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
@Service

public class TaskService implements ITask {
    private  final TaskRepository taskRepository;
    private  final PhaseRepository phaseRepository;
    private final ProjectAccessRepository projectAccessRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository,
                       PhaseRepository phaseRepository,
                       ProjectAccessRepository projectAccessRepository) {
        this.taskRepository = taskRepository;
        this.phaseRepository = phaseRepository;
        this.projectAccessRepository = projectAccessRepository;
    }
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
        // Vérifier que la tâche parent existe
        Task parentTask = taskRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent task not found with id: " + parentId));

        // Vérifier que la phase existe
        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + request.getPhaseId()));

        // Créer la sous-tâche
        Task subTask = new Task();
        subTask.setName(request.getName());
        subTask.setDescription(request.getDescription());
        subTask.setStartDate(request.getStartDate());
        subTask.setEndDate(request.getEndDate());
        subTask.setStatus(request.getStatus());
        subTask.setPriority(request.getPriority());
        subTask.setPhase(phase);
        subTask.setParentTaskId(parentId); // Définir l'ID du parent

        // Sauvegarder la sous-tâche
        Task savedSubTask = taskRepository.save(subTask);

        // Ajouter la sous-tâche à la liste des sous-tâches du parent
        if (parentTask.getSubTasks() == null) {
            parentTask.setSubTasks(new ArrayList<>());
        }
        parentTask.getSubTasks().add(savedSubTask);
        taskRepository.save(parentTask);

        // Créer la réponse
        TaskResponse response = mapToTaskResponse(savedSubTask);
        response.setParentTaskId(parentId); // S'assurer que l'ID parent est dans la réponse

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
        response.setDescription(task.getDescription());
        response.setStartDate(task.getStartDate());
        response.setEndDate(task.getEndDate());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setCreatedAt(task.getCreatedAt());
        response.setParentTaskId(task.getParentTaskId());

        if (task.getPhase() != null) {
            response.setPhaseId(task.getPhase().getId());
        }

        if (task.getSubTasks() != null) {
            response.setSubTaskIds(task.getSubTasks()
                    .stream()
                    .map(Task::getId)
                    .collect(Collectors.toList()));
        } else {
            response.setSubTaskIds(Collections.emptyList());
        }



        return response;
    }
}
