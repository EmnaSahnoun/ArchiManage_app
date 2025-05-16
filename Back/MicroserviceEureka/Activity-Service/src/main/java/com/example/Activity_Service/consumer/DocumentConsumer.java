package com.example.Activity_Service.consumer;

import com.example.Activity_Service.dto.TaskEventDTO;
import com.example.Activity_Service.dto.response.DocumentDTO;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.service.TaskHistoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service

public class DocumentConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(DocumentConsumer.class);
    private final TaskHistoryService taskHistoryService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    public DocumentConsumer(TaskHistoryService taskHistoryService) {
        this.taskHistoryService = taskHistoryService;
    }
    @RabbitListener(queues ={"${rabbitmq.queueJson3.name}"})
    public void handleDocumentEvent(String event) throws IOException {

        LOGGER.info("Received document : {}", event);
        try{
            DocumentDTO documentDTO = objectMapper.readValue(event,DocumentDTO.class);
            TaskHistory history = new TaskHistory();
                    history.setTaskId(documentDTO.getTaskId());
                    history.setIdUser(documentDTO.getUsername());
                    history.setAction(documentDTO.getAction());
                    history.setCreatedAt(LocalDateTime.now());
                    history.setFileName(documentDTO.getFilename());
                    history.setFieldChanged("documents");
                    taskHistoryService.recordHistory(history);
                    LOGGER.info("Recorded document {}: {} from {} to {}",
                            documentDTO.getTaskId());
        }catch (Exception e){
            LOGGER.error("Error while parsing task event", e);
        }
    }

}
