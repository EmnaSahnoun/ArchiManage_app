package com.example.Activity_Service.consumer;

import com.example.Activity_Service.dto.TaskEventDTO;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.service.TaskHistoryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@Service
public class TaskSendConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(TaskSendConsumer.class);
    private final TaskHistoryService taskHistoryService;


    @Autowired
    public TaskSendConsumer(TaskHistoryService taskHistoryService) {
        this.taskHistoryService = taskHistoryService;

    }

    @RabbitListener(queues ={"${rabbitmq.queueJson.name}"})
    public void handleTaskEvent(@Payload TaskEventDTO event, Message message, Channel channel) throws IOException {
        try {
            LOGGER.info("Received task event: {}", event);

            TaskHistory history = new TaskHistory();
            history.setTaskId(event.getIdTask());
            history.setAction(event.getAction());
            history.setIdUser(event.getIdUser());
            history.setCreatedAt(LocalDateTime.now());

            // Pour les mises à jour, enregistrer les changements
            if ("UPDATE".equals(event.getAction()) && event.getChanges() != null) {
                history.setFieldChanged("task_details");
                history.setOldValue(event.getChanges().get("oldValue"));
                history.setNewValue(event.getChanges().get("newValue"));
            }

            taskHistoryService.recordHistory(history);

            // Ack du message
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            LOGGER.error("Error processing task event: {}", e.getMessage());
            // Reject le message (ne pas le remettre dans la queue)
            channel.basicReject(message.getMessageProperties().getDeliveryTag(), false);
        }
    }
}