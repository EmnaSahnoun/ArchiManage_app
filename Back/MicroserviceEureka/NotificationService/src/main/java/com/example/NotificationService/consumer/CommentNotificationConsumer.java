package com.example.NotificationService.consumer;

import com.example.NotificationService.dto.CommentNotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CommentNotificationConsumer {
    @Autowired
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(CommentNotificationConsumer.class);

    private final Sinks.Many<CommentNotificationDto> sink;



    @RabbitListener(queues = "${rabbitmq.queueJson2.name}")
    public void consume(CommentNotificationDto  notification) {
        try {
            logger.info("Raw JSON received: {}", notification);


            // Modification selon le type si nécessaire
            if ("ADD".equals(notification.getActionType())) {
                notification.setMessage("Nouveau commentaire: " + notification.getMessage());
            } else if ("UPDATE".equals(notification.getActionType())) {
                notification.setMessage("Commentaire modifié: " + notification.getMessage());
            }

            logger.info("Processed notification: {}", notification);
            sink.tryEmitNext(notification);

        } catch (Exception e) {
            logger.error("Error processing message: {}", notification, e);
            throw new AmqpRejectAndDontRequeueException("Failed to process message", e);
        }
    }
}
