package com.example.NotificationService.publisher;

import com.example.NotificationService.dto.EmailNotificationDto;
import com.example.NotificationService.dto.NotificationDto;
import com.example.NotificationService.services.KeycloakService;
import com.example.NotificationService.services.NotificationStorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailNotificationProducer {
    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationProducer.class);

    private final RabbitTemplate rabbitTemplate;
    private final NotificationStorageService notificationStorageService;
    private final KeycloakService keycloakService;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Value("${rabbitmq.exchange5.name}")
    private String exchange;

    @Value("${rabbitmq.routing.json.key5.name}")
    private String routingKey;

    @PostConstruct
    public void init() {
        // Schedule a task to check for unread notifications every minute
        scheduler.scheduleAtFixedRate(this::checkAndSendEmailNotifications,
                5, 5, TimeUnit.MINUTES);
    }

    private void checkAndSendEmailNotifications() {
        try {
            // Get admin token for Keycloak
            String authToken = keycloakService.getAdminToken();

            // Get all user directories
            Path storagePath = Paths.get(notificationStorageService.getStorageDirectory());
            if (!Files.exists(storagePath)) return;

            Files.list(storagePath)
                    .filter(Files::isDirectory)
                    .forEach(userDir -> {
                        String userId = userDir.getFileName().toString();
                        try {
                            // Get unread notifications for this user
                            List<Map<String, Object>> notifications = notificationStorageService.getUserNotifications(userId);
                            long unreadCount = notifications.stream()
                                    .filter(n -> !(Boolean) n.get("read"))
                                    .count();

                            if (unreadCount > 0) {
                                // Get user email from Keycloak
                                String email = getUserEmailFromKeycloak(userId, authToken);
                                if (email != null) {
                                    // Prepare email notification
                                    NotificationDto latestNotification = (NotificationDto) notifications.get(0).get("notification");
                                    sendEmailNotification(userId, email, latestNotification);
                                }
                            }
                        } catch (Exception e) {
                            logger.error("Error processing user notifications for {}", userId, e);
                        }
                    });
        } catch (Exception e) {
            logger.error("Error in scheduled email notification check", e);
        }
    }

    private String getUserEmailFromKeycloak(String userId, String authToken) {
        try {
            String url = "https://esmm.systeo.tn/admin/realms/systeodigital/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(authToken.replace("Bearer ", ""));

            ResponseEntity<Map> response = new RestTemplate().exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("email");
            }
        } catch (Exception e) {
            logger.error("Error fetching user email from Keycloak for user {}", userId, e);
        }
        return null;
    }

    public void sendEmailNotification(String userId, String email, NotificationDto notification) {
        try {
            EmailNotificationDto emailNotification = new EmailNotificationDto();
            emailNotification.setUserId(userId);
            emailNotification.setEmail(email);
            emailNotification.setSubject("You have unread notifications");
            emailNotification.setContent(buildEmailContent(notification));
            emailNotification.setOriginalNotification(notification);

            rabbitTemplate.convertAndSend(exchange, routingKey, emailNotification);
            logger.info("Sent email notification for user {}", userId);
        } catch (Exception e) {
            logger.error("Failed to send email notification for user {}", userId, e);
        }
    }

    private String buildEmailContent(NotificationDto notification) {
        return String.format(
                "You have unread notifications:\n\n" +
                        "Project: %s\n" +
                        "Task: %s\n" +
                        "Message: %s\n\n" +
                        "Please login to view your notifications.",
                notification.getProjectName(),
                notification.getTaskName(),
                notification.getMessage()
        );
    }
}