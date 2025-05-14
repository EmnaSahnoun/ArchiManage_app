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
import reactor.core.publisher.Sinks;

import java.io.IOException;

@Service

public class CommentNotificationConsumer {
    @Autowired
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(CommentNotificationConsumer.class);

    private final Sinks.Many<CommentNotificationDto> sink;
    @Autowired
    public CommentNotificationConsumer(ObjectMapper objectMapper,
                                       Sinks.Many<CommentNotificationDto> sink
                                       ) {

        this.objectMapper = objectMapper;
        this.sink = sink;
    }

    @RabbitListener(queues = "${rabbitmq.queueJson2.name}")
    public void consume(CommentNotificationDto notification) {
        try {
            logger.info("Received comment notification for task: {}", notification.getTaskId());
            sink.tryEmitNext(notification);
        } catch (Exception e) {
            logger.error("Error processing comment notification", e);
        }
    }
}
