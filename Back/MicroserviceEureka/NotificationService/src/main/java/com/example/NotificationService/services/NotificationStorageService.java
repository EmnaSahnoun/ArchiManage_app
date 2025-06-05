package com.example.NotificationService.services;

import com.example.NotificationService.model.StoredNotification;
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
    @Value("${notification.storage.path:notifications}")
    private String storagePath;
    private static final Logger logger = LoggerFactory.getLogger(SSENotificationService.class);

    private final ObjectMapper objectMapper;
    private final Map<String, List<StoredNotification>> userNotifications = new ConcurrentHashMap<>();

    public NotificationStorageService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() throws IOException {
        Path path = Paths.get(storagePath);
        logger.info("Notification storage path: {}", path.toAbsolutePath());

        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        loadNotifications();
    }

    private void loadNotifications() throws IOException {
        File folder = new File(storagePath);
        File[] userDirs = folder.listFiles(File::isDirectory);
        if (userDirs != null) {
            for (File userDir : userDirs) {
                File[] notificationFiles = userDir.listFiles((dir, name) -> name.endsWith(".json"));
                if (notificationFiles != null) {
                    for (File file : notificationFiles) {
                        try {
                            StoredNotification notification = objectMapper.readValue(file, StoredNotification.class);
                            userNotifications.computeIfAbsent(notification.getUserId(), k -> new ArrayList<>())
                                    .add(notification);
                        } catch (IOException e) {
                            logger.error("Error reading notification file: " + file.getPath(), e);
                        }
                    }
                }
            }
        }
    }

    public void saveNotification(StoredNotification notification) throws IOException {
        // Créer un dossier par utilisateur
        Path userDir = Paths.get(storagePath, notification.getUserId());
        Files.createDirectories(userDir);

        // Sauvegarder dans un fichier JSON
        Path filePath = userDir.resolve(notification.getId() + ".json");
        objectMapper.writeValue(filePath.toFile(), notification);

        // Mettre à jour la Map en mémoire
        userNotifications.computeIfAbsent(notification.getUserId(), k -> new ArrayList<>())
                .add(notification);
    }
    public void markAsRead(String userId, String notificationId) throws IOException {
        List<StoredNotification> notifications = userNotifications.getOrDefault(userId, Collections.emptyList());
        for (StoredNotification notification : notifications) {
            if (notification.getId().equals(notificationId)) {
                notification.markAsRead();
                Path filePath = Paths.get(storagePath, notification.getId() + ".json");
                objectMapper.writeValue(filePath.toFile(), notification);
                break;
            }
        }
    }

    public List<StoredNotification> loadUserNotifications(String userId) throws IOException {
        Path userDir = Paths.get(storagePath, userId);
        if (!Files.exists(userDir)) {
            return Collections.emptyList();
        }

        return Files.list(userDir)
                .filter(path -> path.toString().endsWith(".json"))
                .map(path -> {
                    try {
                        return objectMapper.readValue(path.toFile(), StoredNotification.class);
                    } catch (IOException e) {
                        logger.error("Error reading notification file", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(StoredNotification::getReceivedAt).reversed())
                .collect(Collectors.toList());
    }
    public List<StoredNotification> getUnreadNotifications(String userId) {
        return userNotifications.getOrDefault(userId, Collections.emptyList())
                .stream()
                .filter(n -> !n.isRead())
                .sorted(Comparator.comparing(StoredNotification::getReceivedAt).reversed())
                .collect(Collectors.toList());
    }
}