package com.example.Activity_Service.consumer;

import com.example.Activity_Service.dto.TaskEventDTO;
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
private ObjectMapper objectMapper;
    @Autowired
    public TaskSendConsumer(TaskHistoryService taskHistoryService) {
        this.taskHistoryService = taskHistoryService;

    }

    @RabbitListener(queues ={"${rabbitmq.queueJson.name}"})
    public void handleTaskEvent(String event) throws IOException {

        LOGGER.info("Received task : {}", event);
try{
    TaskEventDTO taskEventDTO = objectMapper.readValue(event,TaskEventDTO.class);
    TaskHistory history = new TaskHistory();

    if (taskEventDTO.getChanges() != null) {
        if(taskEventDTO.getParentTaskId() == null) {
        for (TaskEventDTO.TaskChangeEvent change : taskEventDTO.getChanges()) {

            history.setTaskId(taskEventDTO.getId());
            history.setIdUser(taskEventDTO.getPhase().getProject().getIdAdmin());
            history.setAction(taskEventDTO.getAction());
            history.setFieldChanged(change.getFieldChanged());
            history.setOldValue(change.getOldValue());
            history.setNewValue(change.getNewValue());
            history.setCreatedAt(LocalDateTime.now());

            taskHistoryService.recordHistory(history);
            LOGGER.info("Recorded change for task {}: {} from {} to {}",
                    taskEventDTO.getId(),
                    change.getFieldChanged(),
                    change.getOldValue(),
                    change.getNewValue());
        }
    }

        if (taskEventDTO.getParentTaskId() != null)  {
                for (TaskEventDTO.TaskChangeEvent change : taskEventDTO.getChanges()) {

                    history.setTaskId(taskEventDTO.getParentTaskId());
                    history.setSubTaskId(taskEventDTO.getId());
                    history.setIdUser(taskEventDTO.getPhase().getProject().getIdAdmin());
                    history.setAction(taskEventDTO.getAction());
                    history.setFieldChanged(change.getFieldChanged());
                    history.setOldValue(change.getOldValue());
                    history.setNewValue(change.getNewValue());
                    history.setCreatedAt(LocalDateTime.now());

                    taskHistoryService.recordHistory(history);
                    LOGGER.info("Recorded change for task {}: {} from {} to {}",
                            taskEventDTO.getId(),
                            change.getFieldChanged(),
                            change.getOldValue(),
                            change.getNewValue());
                }
            }


    }

    if (taskEventDTO.getChanges() == null) {
        if(taskEventDTO.getParentTaskId() == null) {
                history.setTaskId(taskEventDTO.getId());
                history.setIdUser(taskEventDTO.getPhase().getProject().getIdAdmin());
                history.setAction(taskEventDTO.getAction());
                history.setCreatedAt(LocalDateTime.now());
                taskHistoryService.recordHistory(history);
                LOGGER.info("Recorded change for task {}: {} from {} to {}",
                        taskEventDTO.getId());


        }

        if (taskEventDTO.getParentTaskId() != null)  {
                history.setTaskId(taskEventDTO.getParentTaskId());
                history.setSubTaskId(taskEventDTO.getId());
                history.setIdUser(taskEventDTO.getPhase().getProject().getIdAdmin());
                history.setAction(taskEventDTO.getAction());

                history.setCreatedAt(LocalDateTime.now());

                taskHistoryService.recordHistory(history);
                LOGGER.info("Recorded change for task {}: {} from {} to {}",
                        taskEventDTO.getId());
            }



    }

}catch (Exception e){
    LOGGER.error("Error while parsing task event", e);
}

             }

}