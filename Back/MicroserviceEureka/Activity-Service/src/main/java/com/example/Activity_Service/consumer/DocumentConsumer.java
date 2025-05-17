package com.example.Activity_Service.consumer;

import com.example.Activity_Service.dto.response.NotificationDto;
import com.example.Activity_Service.dto.response.DocumentDTO;
import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;
import com.example.Activity_Service.interfaces.ITask;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.publish.CommentNotificationProducer;
import com.example.Activity_Service.service.TaskHistoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service

public class DocumentConsumer {
    private static final Logger logger = LoggerFactory.getLogger(DocumentConsumer.class);
    private final TaskHistoryService taskHistoryService;
    @Autowired
    private ObjectMapper objectMapper;
    private final ITask taskService;
    @Autowired
    private CommentNotificationProducer notificationProducer;
    @Autowired
    public DocumentConsumer(TaskHistoryService taskHistoryService, ObjectMapper objectMapper, ITask taskService) {
        this.taskHistoryService = taskHistoryService;
        this.objectMapper = objectMapper;
        this.taskService = taskService;
    }
    @RabbitListener(queues ={"${rabbitmq.queueJson3.name}"})
    public void handleDocumentEvent(String event) throws IOException {

        logger.info("Received document : {}", event);
        try{
            DocumentDTO documentDTO = objectMapper.readValue(event,DocumentDTO.class);
            logger.info("Document en json : {}", documentDTO.getTaskId());
            TaskCommentNotificationDto notificationInfo;

            try {
                // 2. Récupérer les infos de notification depuis MSProject
                notificationInfo = taskService.getTaskNotificationbyIdTask(documentDTO.getTaskId());
                logger.info("Notification info : {}", notificationInfo);
                logger.info("=== Informations de la tâche récupérées ===");
                logger.info("ID Tâche: {}", documentDTO.getTaskId());
                logger.error("Bien reçu", notificationInfo.getTaskName());
                logger.info("Nom Tâche: {}", notificationInfo.getTaskName());
                logger.info("Nom Phase: {}", notificationInfo.getPhaseName());
                logger.info("Nom Projet: {}", notificationInfo.getProjectName());
                logger.info("Utilisateurs à notifier: {}", notificationInfo.getUserIdsToNotify());
                if (documentDTO.getAction()=="CREATE"){


                NotificationDto notification = new NotificationDto(

                        documentDTO.getTaskId(),
                        notificationInfo.getTaskName(),
                        notificationInfo.getProjectName(),
                        notificationInfo.getPhaseName(),
                        documentDTO.getUsername()+ " a ajouté un document à la tâche" + notificationInfo.getTaskName()
                                +" (Phase ["+notificationInfo.getPhaseName() +"], Projet ["+ notificationInfo.getProjectName()+"])",
                        LocalDateTime.now(),
                        notificationInfo.getUserIdsToNotify(),
                        null,
                        documentDTO.getUsername(),

                        "ADD"
                );
                logger.info("Sending notification to RabbitMQ: {}", notification);
                notificationProducer.sendNotification(notification);}
            } catch (Exception e) {
                // Log l'erreur mais continue le traitement
                logger.error("Failed to fetch notification info from MSProject", e);
                notificationInfo = new TaskCommentNotificationDto(); // Objet vide
                notificationInfo.setTaskName("Unknown Task");
            }

            TaskHistory history = new TaskHistory();
                    history.setTaskId(documentDTO.getTaskId());
                    history.setIdUser(documentDTO.getUsername());
                    history.setAction(documentDTO.getAction());
                    history.setCreatedAt(LocalDateTime.now());
                    history.setFileName(documentDTO.getFilename());
                    history.setFieldChanged("documents");
                    taskHistoryService.recordHistory(history);
                    logger.info("Recorded document {}: {} from {} to {}",
                            documentDTO.getTaskId());
        }catch (Exception e){
            logger.error("Error while parsing task event", e);
        }
    }

}
