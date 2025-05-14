package com.example.Activity_Service.service;

import com.example.Activity_Service.Exceptions.CommentCreationException;
import com.example.Activity_Service.dto.request.CommentRequest;
import com.example.Activity_Service.dto.response.CommentResponse;
import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;
import com.example.Activity_Service.interfaces.IComment;
import com.example.Activity_Service.interfaces.ITask;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService implements IComment {
    private final CommentRepository commentRepository;
    private final TaskHistoryService taskHistoryService;
    private final ITask taskService;
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);


    @Override
    public CommentResponse addComment(CommentRequest commentRequest) {
        try {
            // 1. Enregistrer le commentaire
            CommentResponse comment = commentRepository.save(commentRequest);

            TaskCommentNotificationDto notificationInfo;
            try {
                // 2. Récupérer les infos de notification depuis MSProject
                notificationInfo = taskService.getTaskNotificationbyIdTask(commentRequest.getTaskId());
            } catch (Exception e) {
                // Log l'erreur mais continue le traitement
                logger.error("Failed to fetch notification info from MSProject", e);
                notificationInfo = new TaskCommentNotificationDto(); // Objet vide
                notificationInfo.setTaskName("Unknown Task");
            }

            // 3. Enregistrer dans l'historique
            TaskHistory history = new TaskHistory();
            history.setTaskId(commentRequest.getTaskId());
            history.setIdUser(commentRequest.getIdUser());
            history.setUsername(commentRequest.getUsername());
            history.setAction("COMMENT");
            history.setFieldChanged("comments");

            taskHistoryService.recordHistory(history);

            return comment;
        } catch (Exception e) {
            logger.error("Failed to create comment", e);
            throw new CommentCreationException("Failed to create comment", e);
        }
    }

    @Override
    public List<CommentResponse> getCommentsForTask(String taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    @Override
    public void deleteComment(String commentId, String taskId, String idUser) {
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
        taskHistoryService.recordCommentHistory(taskId, idUser, "DELETE", "Comment deleted");
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
                commentRequest.getIdUser(),
                "UPDATE",
                "Content changed from: " + oldContent.substring(0, Math.min(20, oldContent.length())) +
                        " to: " + commentRequest.getContent().substring(0, Math.min(20, commentRequest.getContent().length()))
        );

        return updatedComment;
    }
}