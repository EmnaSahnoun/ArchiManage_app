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

    @Bean
    public Queue dlq() {
        return QueueBuilder.durable("queue.ActivityService.taskCreated.DLQ").build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(dlq())
                .to(exchange())
                .with("ProjectService.envoye.ActivityService.DLQ");
    }

    public ProjectServiceEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendTaskinMessage(Task task, String action, Map<String, String> oldValues, String idUser) {
        try {
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("taskId", task.getId());
            eventPayload.put("action", action); // "CREATE", "UPDATE", "DELETE"
            eventPayload.put("idUser", idUser);
            eventPayload.put("newTaskData", task);
            eventPayload.put("oldValues", oldValues); // Pour les updates
            eventPayload.put("timestamp", LocalDateTime.now());

            String jsonMessage = objectMapper.writeValueAsString(eventPayload);
            LOGGER.info("Sending task event to RabbitMQ: {}", jsonMessage);
            rabbitTemplate.convertAndSend(exchange, routingKeyJson, jsonMessage, message -> {
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return message;
            });
        } catch (Exception e) {
            LOGGER.error("Failed to send task event to RabbitMQ", e);
            throw new RuntimeException("Failed to send message to RabbitMQ", e);
        }
    }
}
