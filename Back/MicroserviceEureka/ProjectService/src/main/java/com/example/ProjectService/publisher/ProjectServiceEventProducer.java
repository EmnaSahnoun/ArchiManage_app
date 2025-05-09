package com.example.ProjectService.publisher;

import com.example.ProjectService.dto.response.TaskEventDTO;
import com.example.ProjectService.models.Task;
import com.fasterxml.jackson.core.type.TypeReference;
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
    @Value("${rabbitmq.routing.json.key.name}")
    private String routingKeyJson;
    private RabbitTemplate rabbitTemplate;

    private static  final Logger LOGGER= LoggerFactory.getLogger(ProjectServiceEventProducer.class);



    public ProjectServiceEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendTaskinMessage(Task task) {


        LOGGER.info(String.format("Json message sent -> %s", task.toString()));

        rabbitTemplate.convertAndSend(exchange, routingKeyJson, task);
    }
}
