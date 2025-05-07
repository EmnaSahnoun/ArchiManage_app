package com.example.Activity_Service.consumer;

import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.service.TaskHistoryService;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskSendConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(TaskSendConsumer.class);
    private final TaskHistoryService taskHistoryService;
    @Autowired
    public TaskSendConsumer(TaskHistoryService taskHistoryService) {
        this.taskHistoryService = taskHistoryService;
    }
    @RabbitListener(queues = "${rabbitmq.queueJson.name}")
    public void consumeTaskEvent(String message) {
        try {
            LOGGER.info("Received message: {}", message);
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> event = mapper.readValue(message, new TypeReference<Map<String, Object>>() {});

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
                    history.setOldValue("Before: " + oldValues.toString());
                    history.setNewValue("After: " + newTaskData.toString());
                    break;
                case "DELETE":
                    history.setFieldChanged("ALL");
                    history.setNewValue("Task deleted: " + newTaskData.get("name"));
                    break;
            }

            taskHistoryService.recordHistory(history);
            LOGGER.info("Task history saved for taskId: {}", taskId);
        } catch (Exception e) {

            LOGGER.error("Error processing task event", e);
            throw new AmqpRejectAndDontRequeueException(e);
        }
    }
}
