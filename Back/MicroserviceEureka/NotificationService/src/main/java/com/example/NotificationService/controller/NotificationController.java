package com.example.NotificationService.controller;

import com.example.NotificationService.consumer.CommentNotificationConsumer;
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

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final SSENotificationService sseNotificationService;
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String userId) {
        logger.info("New SSE subscription for user: {}", userId);
        return sseNotificationService.subscribe(userId);
    }
}
