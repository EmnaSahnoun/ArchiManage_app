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

            // Conversion du JSON en DTO
            NotificationDto notification = objectMapper.readValue(message, NotificationDto.class);

            logger.info("Notification recu: {}", notification);
            // Modification selon le type si nécessaire
            if ("CREATE".equals(notification.getActionType())) {
                notification.setMessage("Nouveau commentaire: " + notification.getMessage());
            } else if ("UPDATE".equals(notification.getActionType())) {
                notification.setMessage("Commentaire modifié: " + notification.getMessage());
            }
            sink.emitNext(notification, (signalType, emitResult) -> {
                if (emitResult == Sinks.EmitResult.FAIL_NON_SERIALIZED) {
                    logger.warn("Échec d'émission (non sérialisé)");
                } else if (emitResult == Sinks.EmitResult.FAIL_OVERFLOW) {
                    logger.warn("Échec d'émission (overflow)");
                }
                return true; // Retry
            });


            // 1. Envoyer via le sink pour les clients SSE connectés
            sink.emitNext(notification, Sinks.EmitFailureHandler.FAIL_FAST);
            // 2. Stocker pour les utilisateurs non connectés
            notification.getUserIdsToNotify().forEach(userId -> {
                sseNotificationService.addPendingNotification(userId, notification);
            });
// 1. Envoyer via le sink pour les clients SSE
            //logger.info("Processed notification: {}", notification);
            //sink.tryEmitNext(notification);
            // 2. Envoyer directement aux utilisateurs concernés
            //sseNotificationService.sendNotificationToUsers(notification.getUserIdsToNotify(), notification);

        } catch (Exception e) {
            logger.error("Error processing message: {}", message, e);
            throw new AmqpRejectAndDontRequeueException("Failed to process message", e);
        }
    }


}
