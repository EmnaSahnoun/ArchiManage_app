package com.example.NotificationService.config;

import com.example.NotificationService.dto.CommentNotificationDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Sinks;

@Configuration
public class NotificationSinkConfig {

    @Bean
    public Sinks.Many<CommentNotificationDto> notificationSink() {
        return Sinks.many().multicast().onBackpressureBuffer();
    }
}