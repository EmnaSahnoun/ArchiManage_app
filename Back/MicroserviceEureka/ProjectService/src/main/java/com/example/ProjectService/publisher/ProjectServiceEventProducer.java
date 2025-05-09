package com.example.ProjectService.publisher;

import com.example.ProjectService.models.Task;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.amqp.core.*;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@Service
public class ProjectServiceEventProducer {
    @Value("${rabbitmq.exchange.name}")
    private String exchange;
    /*@Value("${rabbitmq.routing.key.name}")
    private String routingKey;*/
    @Value("${rabbitmq.routing.json.key.name}")
    private String routingKeyJson;
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private  ObjectMapper objectMapper;
    private static  final Logger LOGGER= LoggerFactory.getLogger(ProjectServiceEventProducer.class);



    public ProjectServiceEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendTaskinMessage(Task task, String action, Map<String, String> oldValues, String idUser) {
        try {
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("taskId", task.getId());
            eventPayload.put("action", action);
            eventPayload.put("idUser", idUser);
            eventPayload.put("newTaskData", task);
            eventPayload.put("oldValues", oldValues);
            eventPayload.put("timestamp", LocalDateTime.now());

            LOGGER.info("Sending task event to RabbitMQ: {}", eventPayload);

            // Envoyez directement la Map, le MessageConverter fera la conversion
            rabbitTemplate.convertAndSend(exchange, routingKeyJson, eventPayload, message -> {
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return message;
            });
        } catch (Exception e) {
            LOGGER.error("Failed to send task event to RabbitMQ", e);
            throw new RuntimeException("Failed to send message to RabbitMQ", e);
        }
    }
}
