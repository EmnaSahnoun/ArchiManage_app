package com.example.CommercialService.consumer;

import com.example.CommercialService.dto.response.ClientCreationMessage;
import com.example.CommercialService.interfaces.IClient;
import com.example.CommercialService.models.Client;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

@Service
public class ClientConsumer {
    private static final Logger logger = LoggerFactory.getLogger(ClientConsumer.class);

    @Autowired
    private ObjectMapper objectMapper;

    private final IClient clientService;
    @Autowired
    public ClientConsumer(ObjectMapper objectMapper, IClient clientService) {
        this.objectMapper = objectMapper;
        this.clientService = clientService;
    }

    @RabbitListener(queues ={"${rabbitmq.queueJson4.name}"})
    public void receiveClientCreationMessage(String message) {
        logger.info("Received client : {}", message);

        try {
            ClientCreationMessage clientCreationMessage= objectMapper.readValue(message, ClientCreationMessage.class);
            logger.info("client en json : {}", clientCreationMessage.getName());


            // Créer le client
        Client client = new Client();
        client.setName(clientCreationMessage.getName());
        client.setEmail(clientCreationMessage.getEmail());
        client.setIdCompany(clientCreationMessage.getCompanyId());
        client.setPhone(""); // ou autre valeur par défaut
        client.setAddress("");
        clientService.createClient(client);
        logger.info("Client created {}",client.getId());
    }
        catch (Exception e){
            logger.error("Failed to fetch notification info from MSProject", e);

        }
    }
}
