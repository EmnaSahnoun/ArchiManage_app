package com.example.NotificationService.services;

import com.example.NotificationService.dto.NotificationDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class NotificationStorageService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationStorageService.class);

    @Value("${notification.storage.directory:./notifications}")
    private String storageDirectory;

    private final ObjectMapper objectMapper;
    public NotificationStorageService(ObjectMapper objectMapper,
                                          @Value("${notification.storage.directory:./notifications}") String storageDir) {
        this.objectMapper = objectMapper;
        this.storageDirectory = storageDir;
        createStorageDirectoryIfNotExists();
    }


    public String getStorageDirectory() {
        return storageDirectory;
    }
    private void createStorageDirectoryIfNotExists() {
        try {
            Path path = Paths.get(storageDirectory);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                logger.info("Created storage directory: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("Failed to create storage directory", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }
    public void saveNotification(String userId, NotificationDto notification) {
        try {
            Path userDir = Paths.get(storageDirectory, userId);
            if (!Files.exists(userDir)) {
                Files.createDirectories(userDir);
            }

            String filename = UUID.randomUUID().toString() + ".json";
            Path filePath = userDir.resolve(filename);

            // Ajouter un champ pour marquer si la notification est lue
            Map<String, Object> notificationWithStatus = new HashMap<>();
            notificationWithStatus.put("notification", notification);
            notificationWithStatus.put("read", false);
            notificationWithStatus.put("timestamp", System.currentTimeMillis());

            Files.write(filePath, objectMapper.writeValueAsBytes(notificationWithStatus));
        } catch (IOException e) {
            logger.error("Failed to save notification for user: " + userId, e);
        }
    }

    public List<Map<String, Object>> getUserNotifications(String userId) {
        try {
            Path userDir = Paths.get(storageDirectory, userId);
            if (!Files.exists(userDir)) {
                return Collections.emptyList();
            }

            return Files.list(userDir)
                    .filter(path -> path.toString().endsWith(".json"))
                    .map(path -> {
                        try {
                            return objectMapper.readValue(path.toFile(),
                                    new TypeReference<Map<String, Object>>() {});
                        } catch (IOException e) {
                            logger.error("Failed to read notification file: " + path, e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .sorted((map1, map2) -> {
                        Long time1 = getTimestamp(map1);
                        Long time2 = getTimestamp(map2);
                        return time2.compareTo(time1); // For descending order
                    })
                    .collect(Collectors.toList());
        } catch (IOException e) {
            logger.error("Failed to read notifications for user: " + userId, e);
            return Collections.emptyList();
        }
    }

    // Helper method to safely extract timestamp
    private Long getTimestamp(Map<String, Object> map) {
        Object timestamp = map.get("timestamp");
        if (timestamp instanceof Number) {
            return ((Number) timestamp).longValue();
        }
        return 0L; // Default value if timestamp is missing or invalid
    }

    public void markNotificationAsRead(String userId, String notificationId) {
        try {
            Path userDir = Paths.get(storageDirectory, userId);
            if (!Files.exists(userDir)) {
                return;
            }

            Files.list(userDir)
                    .filter(path -> path.getFileName().toString().startsWith(notificationId))
                    .findFirst()
                    .ifPresent(path -> {
                        try {
                            Map<String, Object> notification = objectMapper.readValue(path.toFile(), Map.class);
                            notification.put("read", true);
                            Files.write(path, objectMapper.writeValueAsBytes(notification));
                        } catch (IOException e) {
                            logger.error("Failed to mark notification as read: " + path, e);
                        }
                    });
        } catch (IOException e) {
            logger.error("Failed to mark notification as read for user: " + userId, e);
        }
    }

    public long getUnreadCount(String userId) {
        return getUserNotifications(userId).stream()
                .filter(notification -> !(Boolean) notification.get("read"))
                .count();
    }

    public List<Map<String, Object>> getUnreadNotificationsOlderThan(String userId, long minutes) {
        long thresholdTime = System.currentTimeMillis() - (minutes * 60 * 1000);

        return getUserNotifications(userId).stream()
                .filter(notification -> !(Boolean) notification.get("read"))
                .filter(notification -> {
                    Long timestamp = getTimestamp(notification);
                    return timestamp != null && timestamp < thresholdTime;
                })
                .collect(Collectors.toList());
    }
    public List<String> getNotificationFilePathsOlderThan(String userId, long minutes) {
        long thresholdTime = System.currentTimeMillis() - (minutes * 60 * 1000);

        try {
            Path userDir = Paths.get(storageDirectory, userId);
            if (!Files.exists(userDir)) {
                return Collections.emptyList();
            }

            return Files.list(userDir)
                    .filter(path -> path.toString().endsWith(".json"))
                    .filter(path -> {
                        try {
                            Map<String, Object> notification = objectMapper.readValue(path.toFile(), Map.class);
                            return !(Boolean) notification.get("read") &&
                                    getTimestamp(notification) < thresholdTime;
                        } catch (IOException e) {
                            logger.error("Failed to read notification file: " + path, e);
                            return false;
                        }
                    })
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            logger.error("Failed to read notifications for user: " + userId, e);
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getAndMarkUnreadNotificationsOlderThan(String userId, long minutes) {
        long thresholdTime = System.currentTimeMillis() - (minutes * 60 * 1000);

        List<Map<String, Object>> notifications = getUserNotifications(userId).stream()
                .filter(notification -> !(Boolean) notification.get("read"))
                .filter(notification -> {
                    Long timestamp = getTimestamp(notification);
                    return timestamp != null && timestamp < thresholdTime;
                })
                .collect(Collectors.toList());

        // Marquer ces notifications comme étant en cours de traitement
        notifications.forEach(notification -> {
            notification.put("processing", true);
            // Sauvegarder ce changement
            String notificationId = (String) ((Map<String, Object>) notification.get("notification")).get("id");
            if (notificationId != null) {
                try {
                    Path path = Paths.get(storageDirectory, userId, notificationId + ".json");
                    Files.write(path, objectMapper.writeValueAsBytes(notification));
                } catch (IOException e) {
                    logger.error("Failed to mark notification as processing: " + notificationId, e);
                }
            }
        });

        return notifications;
    }

}