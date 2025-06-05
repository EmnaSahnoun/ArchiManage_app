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
            logger.info("Notification reçue: {}", notification);

            // Un seul traitement
            if ("CREATE".equals(notification.getActionType()) || "UPDATE".equals(notification.getActionType())) {
                // Émettre la notification une seule fois
                sink.tryEmitNext(notification);
            }
        } catch (Exception e) {
            logger.error("Error processing message: {}", message, e);
            throw new AmqpRejectAndDontRequeueException("Failed to process message", e);
        }
    }
}

