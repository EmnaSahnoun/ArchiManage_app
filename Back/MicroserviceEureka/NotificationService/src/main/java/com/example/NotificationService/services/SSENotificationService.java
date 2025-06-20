package com.example.NotificationService.services;

import com.example.NotificationService.dto.NotificationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class SSENotificationService {
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(SSENotificationService.class);
    // Gardez une trace des notifications pour les utilisateurs non connectés
    private final Map<String, List<NotificationDto>> pendingNotifications = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String userId) {
        // Nettoyer les anciens emitters s'ils existent
        if (emitters.containsKey(userId)) {
            emitters.get(userId).complete();
            emitters.remove(userId);
        }

        SseEmitter emitter = new SseEmitter(3_600_000L);

        // Envoyer les notifications en attente si elles existent
        if (pendingNotifications.containsKey(userId)) {
            List<NotificationDto> notifications = pendingNotifications.get(userId);
            notifications.forEach(notification -> {
                try {
                    emitter.send(SseEmitter.event()
                            .id(UUID.randomUUID().toString())
                            .name("comment-notification")
                            .data(notification)
                            .reconnectTime(5000L));
                } catch (Exception e) {
                    logger.error("Failed to send pending notification to user: " + userId, e);
                }
            });
            pendingNotifications.remove(userId);
        }
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
    public List<NotificationDto> getPendingNotifications(String userId) {
        return pendingNotifications.getOrDefault(userId, Collections.emptyList());
    }

    public void clearPendingNotifications(String userId) {
        pendingNotifications.remove(userId);
    }
    public void addPendingNotification(String userId, NotificationDto notification) {
        pendingNotifications.computeIfAbsent(userId, k -> new ArrayList<>()).add(notification);
    }
    private final Map<String, Set<String>> deliveredNotifications = new ConcurrentHashMap<>();

    public void sendNotificationToUsers(List<String> userIds, NotificationDto notification) {
        String notificationId = UUID.randomUUID().toString(); // ou utilisez un ID unique de la notification

        userIds.forEach(userId -> {
            // Vérifier si la notification a déjà été envoyée
            if (!deliveredNotifications.computeIfAbsent(userId, k -> new HashSet<>()).contains(notificationId)) {
                SseEmitter emitter = emitters.get(userId);
                if (emitter != null) {
                    try {
                        emitter.send(SseEmitter.event()
                                .id(notificationId)
                                .data(notification));
                        deliveredNotifications.get(userId).add(notificationId);
                    } catch (Exception e) {
                        logger.error("Failed to send notification", e);
                        pendingNotifications.computeIfAbsent(userId, k -> new ArrayList<>()).add(notification);
                    }
                } else {
                    pendingNotifications.computeIfAbsent(userId, k -> new ArrayList<>()).add(notification);
                }
            }
        });
    }
}