package com.example.NotificationService.consumer;

import com.example.NotificationService.dto.NotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

@Service
@RequiredArgsConstructor
public class TaskNotificationConsumer {
    @Autowired
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(TaskNotificationConsumer.class);

    private final Sinks.Many<NotificationDto> sink;

    private final SSENotificationService sseNotificationService;

    @RabbitListener(queues = "${rabbitmq.queueJson3.name}")
    public void consumeTask(String message) {
        try {
            logger.info("Raw JSON received: {}", message);
            NotificationDto notification = objectMapper.readValue(message, NotificationDto.class);
            logger.info("Task recu: {}", notification);

            // Modification selon le type si nécessaire
            if ("CREATE".equals(notification.getActionType())) {
                notification.setMessage("Nouveau sous tâche ajouté à " + notification.getMessage());
            } else if ("UPDATE".equals(notification.getActionType())) {
                notification.setMessage("nouveaux modifications dans : " + notification.getMessage());
            } else {
                return;
            }

            // Un seul appel à emitNext
            Sinks.EmitResult result = sink.tryEmitNext(notification);

            if (result.isFailure()) {
                notification.getUserIdsToNotify().forEach(userId -> {
                    sseNotificationService.addPendingNotification(userId, notification);
                });
            }

        } catch (Exception e) {
            logger.error("Error processing message: {}", message, e);
            throw new AmqpRejectAndDontRequeueException("Failed to process message", e);
        }
    }
}
