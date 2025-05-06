package com.example.Activity_Service.service;

import com.example.Activity_Service.dto.request.CommentRequest;
import com.example.Activity_Service.dto.response.CommentResponse;
import com.example.Activity_Service.interfaces.IComment;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

@Service

public class CommentService implements IComment {
    private final CommentRepository commentRepository;
    private final TaskHistoryService taskHistoryService;

    @Autowired
    public CommentService(CommentRepository commentRepository, TaskHistoryService taskHistoryService) {
        this.commentRepository = commentRepository;
        this.taskHistoryService = taskHistoryService;
    }

    @Override
    public CommentResponse addComment(CommentRequest commentRequest) {
        CommentResponse comment = commentRepository.save(commentRequest);
        TaskHistory history = new TaskHistory();
        history.setTaskId(commentRequest.getTaskId());
        history.setusername(commentRequest.getusername());
        history.setAction("COMMENT");
        history.setFieldChanged("comments");
        history.setNewValue("Comment added: " + commentRequest.getContent().substring(0, Math.min(50, commentRequest.getContent().length())));
        taskHistoryService.recordHistory(history);

        return comment;
    }

    @Override
    public List<CommentResponse> getCommentsForTask(String taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    @Override
    public void deleteComment(String commentId, String taskId, String username) {
        List<CommentResponse> comments = commentRepository.findByTaskId(taskId);
        comments.removeIf(c -> c.getId().equals(commentId));

        // Sauvegarder la liste mise à jour
        Path taskFile = commentRepository.getStoragePath().resolve(taskId + ".task");
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(taskFile.toFile()))) {
            oos.writeObject(comments);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save comments after deletion", e);
        }

        // Enregistrer dans l'historique
        taskHistoryService.recordCommentHistory(taskId, username, "DELETE", "Comment deleted");
    }

    @Override
    public CommentResponse updateComment(String commentId, CommentRequest commentRequest) {
        List<CommentResponse> comments = commentRepository.findByTaskId(commentRequest.getTaskId());

        CommentResponse updatedComment = comments.stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Sauvegarder l'ancienne valeur pour l'historique
        String oldContent = updatedComment.getContent();

        // Mettre à jour le commentaire
        updatedComment.setContent(commentRequest.getContent());
        updatedComment.setCreatedAt(LocalDateTime.now());

        // Sauvegarder la liste mise à jour
        Path taskFile = commentRepository.getStoragePath().resolve(commentRequest.getTaskId() + ".task");
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(taskFile.toFile()))) {
            oos.writeObject(comments);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save comments after update", e);
        }

        // Enregistrer dans l'historique
        taskHistoryService.recordCommentHistory(
                commentRequest.getTaskId(),
                commentRequest.getusername(),
                "UPDATE",
                "Content changed from: " + oldContent.substring(0, Math.min(20, oldContent.length())) +
                        " to: " + commentRequest.getContent().substring(0, Math.min(20, commentRequest.getContent().length()))
        );

        return updatedComment;
    }
}