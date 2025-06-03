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

    private final Sinks.Many<String> sink = Sinks.many().replay().latest();


    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamNotifications(ServerHttpRequest request) {
        System.out.println("New SSE connection from: " + request.getRemoteAddress());

        // Main event stream with explicit event type
        return sink.asFlux()
                .map(message -> {
                    System.out.println("Sending notification: " + message);
                    return ServerSentEvent.<String>builder()
                            .event("notification")  // Explicit event type
                            .data(message)
                            .build();
                })
                .mergeWith(heartbeat())  // Add heartbeat
                .doOnSubscribe(sub ->
                        System.out.println("Subscription started for: " + request.getRemoteAddress()))
                .doOnCancel(() ->
                        System.out.println("Client disconnected: " + request.getRemoteAddress()));
    }

    // Heartbeat to keep connection alive
    private Flux<ServerSentEvent<String>> heartbeat() {
        return Flux.interval(Duration.ofSeconds(15))
                .map(seq -> ServerSentEvent.<String>builder()
                        .comment("heartbeat")
                        .build());
    }

    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(@RequestBody String message) {
        System.out.println("Received notification to send: " + message);
        Sinks.EmitResult result = sink.tryEmitNext(message);

        if (result.isSuccess()) {
            System.out.println("Notification emitted successfully");
            return ResponseEntity.ok().build();
        } else {
            System.out.println("Failed to emit notification: " + result);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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