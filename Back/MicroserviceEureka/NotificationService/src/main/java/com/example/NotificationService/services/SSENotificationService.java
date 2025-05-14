package com.example.NotificationService.services;

import com.example.NotificationService.dto.CommentNotificationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class SSENotificationService {
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(SSENotificationService.class);
    public SseEmitter subscribe(String userId) {
        SseEmitter emitter = new SseEmitter(3_600_000L);
        // Envoyer un message de cœur battant périodiquement
        ScheduledExecutorService heartBeatExecutor = Executors.newSingleThreadScheduledExecutor();
        heartBeatExecutor.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .comment("heartbeat")
                        .reconnectTime(5000L));
            } catch (Exception e) {
                heartBeatExecutor.shutdown();
                emitters.remove(userId);
            }
        }, 0, 30, TimeUnit.SECONDS);

        emitter.onCompletion(() -> {
            heartBeatExecutor.shutdown();
            emitters.remove(userId);
            logger.info("Emitter completed for user: {}", userId);
        });

        emitter.onTimeout(() -> {
            heartBeatExecutor.shutdown();
            emitters.remove(userId);
            logger.warn("Emitter timeout for user: {}", userId);
        });

        emitter.onError(e -> {
            heartBeatExecutor.shutdown();
            emitters.remove(userId);
            logger.error("Emitter error for user: " + userId, e);
        });

        emitters.put(userId, emitter);
        logger.info("New emitter created for user: {}", userId);

        return emitter;
    }

    public void sendNotificationToUsers(List<String> userIds, CommentNotificationDto notification) {
        userIds.forEach(userId -> {
            SseEmitter emitter = emitters.get(userId);
            if (emitter != null) {
                try {
                    emitter.send(SseEmitter.event()
                            .id(UUID.randomUUID().toString())
                            .name("comment-notification")
                            .data(notification)
                            .reconnectTime(5000L));
                } catch (Exception e) {
                    logger.error("Failed to send notification to user: " + userId, e);
                    emitters.remove(userId);
                }
            }
        });
    }
}
