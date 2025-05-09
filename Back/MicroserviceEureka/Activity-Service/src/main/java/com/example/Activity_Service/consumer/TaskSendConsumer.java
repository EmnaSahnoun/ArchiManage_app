package com.example.Activity_Service.consumer;

import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.service.TaskHistoryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class TaskSendConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(TaskSendConsumer.class);
    private final TaskHistoryService taskHistoryService;
    private final ObjectMapper objectMapper;

    @Autowired
    public TaskSendConsumer(TaskHistoryService taskHistoryService, ObjectMapper objectMapper) {
        this.taskHistoryService = taskHistoryService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "queue.ActivityService.taskCreated")
    public void consumeTaskEvent(Message message, Channel channel) throws IOException {
        try {
            String messageBody = new String(message.getBody(), StandardCharsets.UTF_8);
            LOGGER.info("Received message: {}", messageBody);

            Map<String, Object> event = objectMapper.readValue(messageBody, new TypeReference<Map<String, Object>>() {});

            String action = (String) event.get("action");
            String taskId = (String) event.get("taskId");
            String idUser = (String) event.get("idUser");
            Map<String, Object> newTaskData = (Map<String, Object>) event.get("newTaskData");
            Map<String, String> oldValues = (Map<String, String>) event.get("oldValues");

            TaskHistory history = new TaskHistory();
            history.setTaskId(taskId);
            history.setidUser(idUser);
            history.setAction(action);
            history.setCreatedAt(LocalDateTime.now());

            switch (action) {
                case "CREATE":
                    history.setFieldChanged("ALL");
                    history.setNewValue("Task created: " + newTaskData.get("name"));
                    break;
                case "UPDATE":
                    history.setFieldChanged("Multiple fields");
                    history.setOldValue(oldValues != null ? "Before: " + oldValues.toString() : "N/A");
                    history.setNewValue("After: " + newTaskData.toString());
                    break;
                case "DELETE":
                    history.setFieldChanged("ALL");
                    history.setNewValue("Task deleted: " + newTaskData.get("name"));
                    break;
            }

            taskHistoryService.recordHistory(history);
            LOGGER.info("Task history saved for taskId: {}", taskId);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            LOGGER.error("Error processing message", e);

            if (message.getMessageProperties().getRedelivered()) {
                LOGGER.warn("Message already redelivered, sending to DLQ");
                channel.basicReject(message.getMessageProperties().getDeliveryTag(), false);
            } else {
                LOGGER.info("Requesting message redelivery");
                channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
            }
        }
    }
}