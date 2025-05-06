package com.example.Activity_Service.interfaces;

import com.example.Activity_Service.model.TaskHistory;

import java.util.List;

public interface ITaskHistory {
    TaskHistory recordHistory(TaskHistory history);
    List<TaskHistory> getHistoryForTask(String taskId);
    TaskHistory recordCommentHistory(String taskId, String username, String action, String content);
}
