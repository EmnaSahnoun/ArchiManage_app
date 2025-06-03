package com.example.NotificationService.controller;

import com.example.NotificationService.dto.NotificationDto;
import com.example.NotificationService.services.SSENotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import org.springframework.http.server.reactive.ServerHttpRequest;
import java.time.Duration;
import java.util.List;
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final Sinks.Many<NotificationDto> sink;
    private final SSENotificationService sseNotificationService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<NotificationDto>> streamNotifications(
            @RequestHeader("X-User-ID") String userId) {

        logger.info("New SSE connection from user: {}", userId);

        // Flux des notifications en direct avec filtrage par userId
        Flux<NotificationDto> liveNotifications = sink.asFlux()
                .filter(notif -> notif.getUserIdsToNotify().contains(userId))
                .doOnNext(notif -> logger.debug("Sending live notification: {}", notif));

        // Flux des notifications en attente
        Flux<NotificationDto> pendingNotifications = Flux.fromIterable(
                        sseNotificationService.getPendingNotifications(userId))
                .doOnComplete(() -> sseNotificationService.clearPendingNotifications(userId));

        // Combiner les deux flux + heartbeat
        return Flux.merge(
                        pendingNotifications,
                        liveNotifications
                )
                .map(this::toSseEvent)
                .mergeWith(heartbeat())
                .doOnCancel(() -> logger.info("Client disconnected: {}", userId));
    }

    private ServerSentEvent<NotificationDto> toSseEvent(NotificationDto notification) {
        return ServerSentEvent.<NotificationDto>builder()
                .event("notification")
                .data(notification)
                .build();
    }

    private Flux<ServerSentEvent<NotificationDto>> heartbeat() {
        return Flux.interval(Duration.ofSeconds(15))
                .map(seq -> ServerSentEvent.<NotificationDto>builder()
                        .comment("heartbeat")
                        .build())
                .doOnNext(hb -> logger.trace("Sending heartbeat"));
    }
}


//    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
//    public Flux<NotificationDto> streamNotifications(@RequestHeader("X-User-ID") String userId) {
//        // 1. Envoyer d'abord les notifications en attente
//        List<NotificationDto> pending = sseNotificationService.getPendingNotifications(userId);
//        Flux<NotificationDto> pendingFlux = Flux.fromIterable(pending);
//
//        // 2. S'abonner aux nouvelles notifications
//        Flux<NotificationDto> liveFlux = sink.asFlux()
//                .filter(notif -> notif.getUserIdsToNotify().contains(userId));
//
//        // 3. Combiner les deux et nettoyer les notifications en attente
//        return Flux.concat(pendingFlux, liveFlux)
//                .doOnComplete(() -> sseNotificationService.clearPendingNotifications(userId))
//                .doOnCancel(() -> logger.info("Client déconnecté: {}", userId));
//
//    }
//
//    @GetMapping("/pending")
//    public ResponseEntity<List<NotificationDto>> getPendingNotifications(@RequestHeader("X-User-ID") String userId) {
//        return ResponseEntity.ok(sseNotificationService.getPendingNotifications(userId));
//    }
//    @PostMapping("/send-notification")
//    public ResponseEntity<String> sendTestNotification(@RequestBody NotificationDto notification) {
//        // Envoyer via le sink
//        sink.tryEmitNext(notification);
//
//        // Envoyer directement aux utilisateurs
//        sseNotificationService.sendNotificationToUsers(notification.getUserIdsToNotify(), notification);
//
//        return ResponseEntity.ok("Notification envoyée");
//    }
//}