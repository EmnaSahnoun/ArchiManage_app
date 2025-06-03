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
            NotificationDto notification = objectMapper.readValue(message, NotificationDto.class);
            logger.info("Received notification: {}", notification);

            // Envoyer immédiatement via le sink
            Sinks.EmitResult result = sink.tryEmitNext(notification);

            if (!result.isSuccess()) {
                logger.warn("Failed to emit notification: {}", result);
                // Stocker pour re-try ou autre traitement
            }

            // Stocker pour les utilisateurs non connectés
            notification.getUserIdsToNotify().forEach(userId -> {
                sseNotificationService.addPendingNotification(userId, notification);
            });

        } catch (Exception e) {
            logger.error("Error processing message", e);
            throw new AmqpRejectAndDontRequeueException("Processing error", e);
        }
    }

}
