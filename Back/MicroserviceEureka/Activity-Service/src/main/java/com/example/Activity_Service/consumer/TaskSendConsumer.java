package com.example.Activity_Service.consumer;

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

    @RabbitListener(queues = "queue.ActivityService.taskCreated")
    public void consumeTaskEvent(@Payload Map<String, Object> event,
                                 Message message,
                                 Channel channel) throws IOException {
        try {
            String action = (String) event.get("action");
            String taskId = (String) event.get("taskId");
            String idUser = (String) event.get("idUser");

            // Cast des données (attention aux nulls)
            Map<String, Object> newTaskData = (Map<String, Object>) event.get("newTaskData");
            Map<String, String> oldValues = event.get("oldValues") != null ?
                    (Map<String, String>) event.get("oldValues") :
                    Collections.emptyMap();

            TaskHistory history = new TaskHistory();
            history.setTaskId(taskId);
            history.setidUser(idUser);
            history.setAction(action);
            history.setCreatedAt(LocalDateTime.now());

            // Traitement selon l'action
            if ("CREATE".equals(action)) {
                history.setFieldChanged("ALL");
                history.setNewValue("Task created: " + newTaskData.get("name"));
            }
            else if ("UPDATE".equals(action)) {
                history.setFieldChanged("Multiple fields");
                history.setOldValue(oldValues.toString());
                history.setNewValue(newTaskData.toString());
            }
            else if ("DELETE".equals(action)) {
                history.setFieldChanged("ALL");
                history.setNewValue("Task deleted: " + newTaskData.get("name"));
            }

            taskHistoryService.recordHistory(history);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);

        } catch (Exception e) {
            LOGGER.error("Error processing message", e);
            if (message.getMessageProperties().getRedelivered()) {
                channel.basicReject(message.getMessageProperties().getDeliveryTag(), false);
            } else {
                channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
            }
        }
    }
}