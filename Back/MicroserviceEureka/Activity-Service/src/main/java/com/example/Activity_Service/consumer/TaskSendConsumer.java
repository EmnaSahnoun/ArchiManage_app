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

    @RabbitListener(queues = "queue.ActivityService.taskCreated")
    public void handleTaskEvent(@Payload TaskEventDTO event,
                                Message message,
                                Channel channel) throws IOException {
        try {
            LOGGER.info("Received task event: {}", event);

            TaskHistory history = new TaskHistory();
            history.setTaskId(event.getTaskId());
            history.setidUser(event.getIdUser());
            history.setAction(event.getAction());
            history.setCreatedAt(LocalDateTime.now());

            switch (event.getAction()) {
                case "CREATE":
                    history.setFieldChanged("ALL");
                    history.setNewValue("Created: " + event.getNewTaskData().get("name"));
                    break;
                case "UPDATE":
                    history.setFieldChanged("Fields updated");
                    history.setOldValue("Before: " + event.getOldValues());
                    history.setNewValue("After: " + event.getNewTaskData().get("name"));
                    break;
                case "DELETE":
                    history.setFieldChanged("ALL");
                    history.setNewValue("Deleted task");
                    break;
            }

            taskHistoryService.recordHistory(history);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            LOGGER.error("Error processing event", e);
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
}