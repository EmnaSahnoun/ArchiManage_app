package com.example.NotificationService.model;

import com.example.NotificationService.dto.NotificationDto;

import java.time.LocalDateTime;
import java.util.UUID;

public class StoredNotification {

    private String id;
    private String userId;
    private NotificationDto notification;
    private LocalDateTime receivedAt;
    private LocalDateTime readAt;
    private boolean isRead;
    public StoredNotification(String userId, NotificationDto notification) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.notification = notification;
        this.receivedAt = LocalDateTime.now();
        this.isRead = false;
    }

    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public NotificationDto getNotification() {
        return notification;
    }

    public void setNotification(NotificationDto notification) {
        this.notification = notification;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
