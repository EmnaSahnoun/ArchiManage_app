package com.example.ActivityService.service;

import com.example.ActivityService.interfaces.ITaskHistory;
import com.example.ActivityService.model.TaskHistory;
import com.example.ActivityService.repository.TaskHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class TaskHistoryService implements ITaskHistory {
    private final TaskHistoryRepository taskHistoryRepository;
    @Autowired
    public TaskHistoryService(TaskHistoryRepository taskHistoryRepository) {
        this.taskHistoryRepository = taskHistoryRepository;
    }
    @Override
    public TaskHistory recordHistory(TaskHistory history) {
        return taskHistoryRepository.save(history);
    }

    @Override
    public List<TaskHistory> getHistoryForTask(String taskId) {
        return taskHistoryRepository.findByTaskId(taskId);
    }
    @Override
    public TaskHistory recordCommentHistory(String taskId, String username, String action, String content) {
        TaskHistory history = new TaskHistory();
        history.setTaskId(taskId);
        history.setusername(username);
        history.setAction(action);
        history.setFieldChanged("comments");
        history.setNewValue(content);
        return this.recordHistory(history);
    }

    private String truncateComment(String content) {
        return content.length() > 50
                ? content.substring(0, 47) + "..."
                : content;
    }

}
