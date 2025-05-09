package com.example.Activity_Service.config;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.interceptor.RetryOperationsInterceptor;

@Configuration
public class RabbitMQConfig {

        //@Value("${rabbitmq.queue.name}")
        //private String queue;
        @Value("${rabbitmq.queueJson.name}")
        private String JsonQueue;
        @Value("${rabbitmq.exchange.name}")
        private String exchange;
        /*@Value("${rabbitmq.routing.key.name}")
        private String routingKey;*/
        @Value("${rabbitmq.routing.json.key.name}")
       private String JsonRoutingKey;

        //@Bean
        //public Queue queue() {
         //   return new Queue(queue); // durable = true
        //}

        @Bean
        public Queue JsonQueue() {
            return new Queue(JsonQueue); // durable = true
        }

        @Bean
        public TopicExchange exchange() {
            return new TopicExchange(exchange);
        }

        //binding between queu and exchange using routing key
       // @Bean
       // public Binding binding() {
       //     return BindingBuilder.bind(queue())
       //             .to(exchange())
       //             .with(routingKey);
       // }


        //binding between JsonQueue and exchange using routing key
        @Bean
        public Binding jsonBinding() {
            return BindingBuilder.bind(JsonQueue())
                    .to(exchange())
                    .with(JsonRoutingKey);
        }

    @Bean
    public MessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        converter.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.TYPE_ID);
        converter.setClassMapper(classMapper());
        return converter;
    }

    @Bean
    public DefaultClassMapper classMapper() {
        DefaultClassMapper classMapper = new DefaultClassMapper();
        classMapper.setTrustedPackages("com.example.common.messaging", "com.example.*");
        return classMapper;
    }
        @Bean
        public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
            RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
            rabbitTemplate.setMessageConverter(converter());
            return rabbitTemplate;
        }
    @Bean
    public MessageConverter converter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        converter.setCreateMessageIds(true); // Pour le suivi
        return converter;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            SimpleRabbitListenerContainerFactoryConfigurer configurer) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL); // Gestion manuelle des ACK
        factory.setPrefetchCount(1); // Traiter un message à la fois
        factory.setDefaultRequeueRejected(false); // Ne pas réessayer automatiquement
        factory.setAdviceChain(retryInterceptor());
        return factory;
    }

    @Bean
    public RetryOperationsInterceptor retryInterceptor()


    {
        return RetryInterceptorBuilder.stateless()
                .maxAttempts(3)
                .backOffOptions(1000, 2.0, 10000)
                .recoverer(new RejectAndDontRequeueRecoverer())
                .build();
    }
}
