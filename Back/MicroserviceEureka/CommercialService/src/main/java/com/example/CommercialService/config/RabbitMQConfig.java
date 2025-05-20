package com.example.CommercialService.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Value("${rabbitmq.queueJson4.name}")
    private String JsonQueue4;
    @Value("${rabbitmq.exchange4.name}")
    private String exchange4;
    @Value("${rabbitmq.routing.json.key4.name}")
    private String JsonRoutingKey4;
    @Bean
    public Queue JsonQueue4() {
        return new Queue(JsonQueue4); // durable = true
    }

    @Bean
    public TopicExchange exchange4() {
        return new TopicExchange(exchange4);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding4() {
        return BindingBuilder.bind(JsonQueue4())
                .to(exchange4())
                .with(JsonRoutingKey4);
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
