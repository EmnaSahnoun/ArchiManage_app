package com.example.NotificationService.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConversionException;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
@Configuration
public class RabbitMQConfig {
    @Value("${rabbitmq.queueJson2.name}")
    private String queueName;
    @Value("${rabbitmq.exchange2.name}")
    private String exchangeName;
    @Value("${rabbitmq.routing.json.key2.name}")
    private String routingKey;

    @Value("${rabbitmq.queueJson3.name}")
    private String JsonQueue3;
    @Value("${rabbitmq.exchange3.name}")
    private String exchange3;
    @Value("${rabbitmq.routing.json.key3.name}")
    private String JsonRoutingKey3;

    @Value("${rabbitmq.queueJson5.name}")
    private String JsonQueue5;
    @Value("${rabbitmq.exchange5.name}")
    private String exchange5;
    @Value("${rabbitmq.routing.json.key5.name}")
    private String JsonRoutingKey5;
    @Bean
    public Queue JsonQueue2() {
        return new Queue(queueName, true); // durable = true
    }

    @Bean
    public TopicExchange exchange2() {
        return new TopicExchange(exchangeName);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding2() {
        return BindingBuilder.bind(JsonQueue2())
                .to(exchange2())
                .with(routingKey);
    }

    @Bean
    public Queue JsonQueue3() {
        return new Queue(JsonQueue3); // durable = true
    }

    @Bean
    public TopicExchange exchange3() {
        return new TopicExchange(exchange3);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding3() {
        return BindingBuilder.bind(JsonQueue3())
                .to(exchange3())
                .with(JsonRoutingKey3);
    }

    @Bean
    public Queue JsonQueue5() {
        return new Queue(JsonQueue5); // durable = true
    }

    @Bean
    public TopicExchange exchange5() {
        return new TopicExchange(exchange5);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding5() {
        return BindingBuilder.bind(JsonQueue5())
                .to(exchange3())
                .with(JsonRoutingKey5);
    }
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter() {
            @Override
            public Object fromMessage(Message message) throws MessageConversionException {
                return new String(message.getBody(), StandardCharsets.UTF_8);
            }
        };
    }
    @Bean
    public DefaultClassMapper classMapper() {
        DefaultClassMapper classMapper = new DefaultClassMapper();
        classMapper.setTrustedPackages("com.example.Activity_Service.dto.response", "com.example.NotificationService.dto");
        return classMapper;
    }
    @Bean
    public MessageConverter converter(){
        return new Jackson2JsonMessageConverter();
    }
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        return rabbitTemplate;
    }

}
