package com.example.ActivityService.interfaces;

import com.example.ActivityService.dto.request.CommentRequest;
import com.example.ActivityService.dto.response.CommentResponse;

import java.util.List;

public interface IComment {
    CommentResponse addComment(CommentRequest commentRequest);
    List<CommentResponse> getCommentsForTask(String taskId);
    void deleteComment(String commentId, String taskId, String username);
    CommentResponse updateComment(String commentId, CommentRequest commentRequest);
}
