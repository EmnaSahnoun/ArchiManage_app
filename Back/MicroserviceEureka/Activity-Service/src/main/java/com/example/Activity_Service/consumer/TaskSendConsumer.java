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


try{
    TaskEventDTO taskEventDTO = objectMapper.readValue(event,TaskEventDTO.class);
    LOGGER.info("Received task : {}", taskEventDTO);
    LOGGER.info("Received idtask : {}", taskEventDTO.getId());
    LOGGER.info("Received iduser : {}", taskEventDTO.getId());
    LOGGER.info("Received Action : {}", taskEventDTO.getAction());
    LOGGER.info("Received CreatedAt : {}", LocalDateTime.now());

    TaskHistory history = new TaskHistory();

    history.setTaskId(taskEventDTO.getId()); // ID de la tâche
    LOGGER.info("object history with idtask: ", history);
    history.setidUser(taskEventDTO.getPhase().getProject().getIdAdmin()); // ID de l'admin
    LOGGER.info("object history with iduser : ", history);
    history.setAction(taskEventDTO.getAction()); // "CREATE", "UPDATE", etc.
    LOGGER.info("object history with action: ", history);
    history.setFieldChanged("task"); // Champ modifié (ici, la tâche entière)
    history.setCreatedAt(LocalDateTime.now());
    LOGGER.info("object history : ", history);
    // 3. Sauvegarder l'historique
    taskHistoryService.recordHistory(history);
    LOGGER.info("History saved for task {}: {}", taskEventDTO.getId(), history);
     LOGGER.info("Task event received: {}", objectMapper.writeValueAsString(taskEventDTO));
        }catch (Exception e){
    LOGGER.error("Error while parsing task event", e);
}

             }

}