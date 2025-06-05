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
public class CommentNotificationConsumer {
    @Autowired
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(CommentNotificationConsumer.class);

    private final Sinks.Many<NotificationDto> sink;

    private final SSENotificationService sseNotificationService;

    @RabbitListener(queues = "${rabbitmq.queueJson2.name}")
    public void consumeComment(String message) {
        try {
            logger.info("Raw JSON received: {}", message);
            NotificationDto notification = objectMapper.readValue(message, NotificationDto.class);
            logger.info("Notification recu: {}", notification);

            // Modification selon le type si nécessaire
            if ("CREATE".equals(notification.getActionType())||"UPDATE".equals(notification.getActionType())) {
                notification.setMessage(notification.getMessage());
            }

            // Un seul appel à emitNext avec gestion d'erreur complète
            Sinks.EmitResult result = sink.tryEmitNext(notification);

            if (result.isFailure()) {
                logger.warn("Échec d'émission: {}", result);
                // Stocker pour les utilisateurs non connectés en cas d'échec
                notification.getUserIdsToNotify().forEach(userId -> {
                    sseNotificationService.addPendingNotification(userId, notification);
                });
            } else {
                // Si l'émission réussit, stocker aussi pour les utilisateurs non connectés
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
