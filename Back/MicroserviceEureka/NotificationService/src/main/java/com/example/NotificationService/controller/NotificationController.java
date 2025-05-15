package com.example.NotificationService.controller;

import com.example.NotificationService.dto.CommentNotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.List;
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    private final Sinks.Many<CommentNotificationDto> sink;

    private final SSENotificationService sseNotificationService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<CommentNotificationDto> streamNotifications(@RequestHeader("X-User-ID") String userId) {
// 1. Envoyer les notifications en attente (si besoin)
        sseNotificationService.getPendingNotifications(userId).forEach(notif ->
                sink.tryEmitNext(notif)
        );
        sseNotificationService.clearPendingNotifications(userId);
        // 2. S'abonner au Sink et filtrer pour l'utilisateur
        return sink.asFlux()
                .filter(notif -> notif.getUserIdsToNotify().contains(userId))
                .doOnCancel(() -> logger.info("Client déconnecté: {}", userId));

    }

    @GetMapping("/pending")
    public ResponseEntity<List<CommentNotificationDto>> getPendingNotifications(@RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(sseNotificationService.getPendingNotifications(userId));
    }
    @PostMapping("/send-notification")
    public ResponseEntity<String> sendTestNotification(@RequestBody CommentNotificationDto notification) {
        // Envoyer via le sink
        sink.tryEmitNext(notification);

        // Envoyer directement aux utilisateurs
        sseNotificationService.sendNotificationToUsers(notification.getUserIdsToNotify(), notification);

        return ResponseEntity.ok("Notification envoyée");
    }
}