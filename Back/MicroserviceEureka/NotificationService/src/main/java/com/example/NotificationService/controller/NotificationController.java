package com.example.NotificationService.controller;

import com.example.NotificationService.dto.NotificationDto;
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
    private final Sinks.Many<NotificationDto> sink;

    private final SSENotificationService sseNotificationService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<NotificationDto> streamNotifications(@RequestHeader("X-User-ID") String userId) {
        // 1. Envoyer d'abord les notifications en attente
        Flux<NotificationDto> pendingFlux = Flux.fromIterable(sseNotificationService.getPendingNotifications(userId))
                .doOnNext(notif -> logger.info("Envoi notification en attente pour {}", userId));

        // 2. S'abonner aux nouvelles notifications avec un filtre correct
        Flux<NotificationDto> liveFlux = sink.asFlux()
                .filter(notif -> {
                    boolean shouldNotify = notif.getUserIdsToNotify().contains(userId);
                    if (shouldNotify) {
                        logger.info("Envoi notification en temps réel pour {}", userId);
                    }
                    return shouldNotify;
                });

        // 3. Combiner les deux et nettoyer les notifications en attente
        return Flux.concat(pendingFlux, liveFlux)
                .doOnComplete(() -> {
                    sseNotificationService.clearPendingNotifications(userId);
                    logger.info("Connexion SSE terminée pour {}", userId);
                })
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
}