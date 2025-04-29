package com.example.ProjectService.repositories;


import com.example.ProjectService.models.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface TaskRepository extends MongoRepository<Task, Long> {
    List<Task> findByPhaseId(Long phaseId);
    List<Task> findAllBySubTasksContaining(Task task);
}
