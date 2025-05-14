package com.example.NotificationService.consumer;

import com.example.NotificationService.dto.CommentNotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentNotificationConsumer {
    private static final Logger logger = LoggerFactory.getLogger(CommentNotificationConsumer.class);

    private final SSENotificationService sseNotificationService;
    @RabbitListener(queues = {"${rabbitmq.queueJson2.name}"})
    public void consumeMessage(CommentNotificationDto notificationDto) {
        logger.info("Received notification: {}", notificationDto);

        // Envoyer la notification SSE aux utilisateurs concernés
        sseNotificationService.sendNotificationToUsers(
                notificationDto.getUserIdsToNotify(),
                notificationDto
        );
    }
}
