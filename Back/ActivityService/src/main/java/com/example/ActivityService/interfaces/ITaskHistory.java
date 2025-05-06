package com.example.ActivityService.interfaces;

import com.example.ActivityService.model.TaskHistory;

import java.util.List;

public interface ITaskHistory {
    TaskHistory recordHistory(TaskHistory history);
    List<TaskHistory> getHistoryForTask(String taskId);
    TaskHistory recordCommentHistory(String taskId, String username, String action, String content);
}
