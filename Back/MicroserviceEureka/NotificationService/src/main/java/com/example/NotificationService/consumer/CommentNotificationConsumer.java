package com.example.NotificationService.consumer;

import com.example.NotificationService.dto.CommentNotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service

public class CommentNotificationConsumer {
    @Autowired
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(CommentNotificationConsumer.class);
    private final SSENotificationService sseNotificationService;
    @Autowired
    public CommentNotificationConsumer(SSENotificationService sseNotificationService) {
        this.sseNotificationService = sseNotificationService;
    }

    @RabbitListener(queues = {"${rabbitmq.queueJson2.name}"})
    public void consumeMessage(String notificationDto) throws IOException {
        logger.info("Received notification: {}", notificationDto);

        try{
            CommentNotificationDto commentNotificationDto = objectMapper.readValue(notificationDto, CommentNotificationDto.class);
            logger.info("commentNotificationDto recu {}: {} from {} to {}",
                    commentNotificationDto.getMessage());
        // Envoyer la notification SSE aux utilisateurs concernés
        sseNotificationService.sendNotificationToUsers(
                commentNotificationDto.getUserIdsToNotify(),
                commentNotificationDto
        );
        }catch (Exception e){
            logger.error("Error while parsing Comment notification ",e.getMessage());
        }
    }
}
