package com.example.NotificationService.controller;

import com.example.NotificationService.dto.NotificationDto;
import com.example.NotificationService.model.StoredNotification;
import com.example.NotificationService.services.NotificationStorageService;
import com.example.NotificationService.services.SSENotificationService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    private final Sinks.Many<NotificationDto> sink;

    private final SSENotificationService sseNotificationService;
    private final NotificationStorageService storageService;
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<NotificationDto> streamNotifications(
            @RequestHeader(value = "X-User-ID", required = false) String userIdHeader,
            @RequestParam(value = "userId", required = false) String userIdParam) {

        String userId = userIdHeader != null ? userIdHeader : userIdParam;
        if (userId == null) {
            return Flux.error(new IllegalArgumentException("User ID is required"));
        }

        // Récupérer les notifications en attente une seule fois
        List<NotificationDto> pending = sseNotificationService.getPendingNotifications(userId);
        sseNotificationService.clearPendingNotifications(userId); // Nettoyer immédiatement

        Flux<NotificationDto> pendingFlux = Flux.fromIterable(pending)
                .doOnNext(notif -> logger.info("Envoi notification en attente pour {}", userId));

        Flux<NotificationDto> liveFlux = sink.asFlux()
                .filter(notif -> notif.getUserIdsToNotify().contains(userId))
                .distinct(NotificationDto::getMessage); // Éviter les doublons

        return Flux.concat(pendingFlux, liveFlux)
                .doOnCancel(() -> logger.info("Client déconnecté: {}", userId))
                .doOnSubscribe(sub -> logger.info("Nouvelle souscription SSE pour {}", userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<NotificationDto>> getPendingNotifications(@RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(sseNotificationService.getPendingNotifications(userId));
    }
    @PostMapping("/send-notification")
    public ResponseEntity<String> sendTestNotification(@RequestBody NotificationDto notification) {
        // Envoyer via le sink
        sink.tryEmitNext(notification);

        // Envoyer directement aux utilisateurs
        sseNotificationService.sendNotificationToUsers(notification.getUserIdsToNotify(), notification);

        return ResponseEntity.ok("Notification envoyée");
    }

    @GetMapping("/history")
    public ResponseEntity<List<StoredNotification>> getNotificationHistory(
            @RequestHeader("X-User-ID") String userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {

        try {
            List<StoredNotification> notifications = storageService.loadUserNotifications(userId);

            if (unreadOnly) {
                notifications = notifications.stream()
                        .filter(n -> !n.isRead())
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(notifications);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/mark-read/{id}")
    public ResponseEntity<Void> markAsRead(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String id) {

        try {
            storageService.markAsRead(userId, id);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }

    }
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("X-User-ID") String userId) {
        try {
            long count = storageService.getUserNotifications(userId, true).size();
            return ResponseEntity.ok(count);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String id) {
        try {
            storageService.deleteNotification(userId, id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}