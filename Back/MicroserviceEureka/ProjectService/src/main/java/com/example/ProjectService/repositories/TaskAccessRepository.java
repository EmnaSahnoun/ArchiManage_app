package com.example.ProjectService.repositories;


import com.example.ProjectService.models.TaskAccess;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskAccessRepository extends MongoRepository<TaskAccess, Long> {
    List<TaskAccess> findByTaskId(Long taskId);
}
