package com.example.NotificationService.controller;

import com.example.NotificationService.consumer.CommentNotificationConsumer;
import com.example.NotificationService.dto.CommentNotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    private final Sinks.Many<CommentNotificationDto> sink;



    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<CommentNotificationDto> streamNotifications(@PathVariable String userId) {
        logger.info("New SSE subscription for user: {}", userId);
        return sink.asFlux()
                .filter(notification -> notification.getUserIdsToNotify().contains(userId))
                .doOnCancel(() -> logger.info("SSE connection closed for user: {}", userId));
    }
}