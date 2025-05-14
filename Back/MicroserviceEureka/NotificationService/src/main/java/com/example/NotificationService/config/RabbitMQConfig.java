package com.example.NotificationService.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class RabbitMQConfig {
    @Value("${rabbitmq.queueJson2.name}")
    private String JsonQueue2;
    @Value("${rabbitmq.exchange2.name}")
    private String exchange2;
    @Value("${rabbitmq.routing.json.key2.name}")
    private String JsonRoutingKey2;

    @Bean
    public Queue JsonQueue2() {
        return new Queue(JsonQueue2); // durable = true
    }

    @Bean
    public TopicExchange exchange2() {
        return new TopicExchange(exchange2);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding2() {
        return BindingBuilder.bind(JsonQueue2())
                .to(exchange2())
                .with(JsonRoutingKey2);
    }


    @Bean
    public MessageConverter converter(){
        return new Jackson2JsonMessageConverter();
    }
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }

}
