package com.example.NotificationService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailNotificationDto {
    private String userId;
    private String email; // Vous pouvez ajouter ce champ ou le récupérer depuis le service utilisateur
    private String subject;
    private String content;
    private NotificationDto originalNotification;

}
