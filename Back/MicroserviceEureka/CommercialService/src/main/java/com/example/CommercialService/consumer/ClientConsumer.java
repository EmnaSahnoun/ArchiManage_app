package com.example.CommercialService.consumer;

import com.example.CommercialService.dto.response.ClientCreationMessage;
import com.example.CommercialService.interfaces.IClient;
import com.example.CommercialService.interfaces.IKeycloak;
import com.example.CommercialService.models.Client;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class ClientConsumer {
    private static final Logger logger = LoggerFactory.getLogger(ClientConsumer.class);

    @Autowired
    private ObjectMapper objectMapper;

    private final IClient clientService;
    @Autowired
    private final IKeycloak keycloakService;
    @Autowired
    public ClientConsumer(ObjectMapper objectMapper, IClient clientService, IKeycloak keycloakService) {
        this.objectMapper = objectMapper;
        this.clientService = clientService;
        this.keycloakService = keycloakService;
    }

    @RabbitListener(queues ={"${rabbitmq.queueJson4.name}"})
    public void receiveClientCreationMessage(String message) {
        logger.info("Received client : {}", message);

        try {
            ClientCreationMessage clientCreationMessage= objectMapper.readValue(message, ClientCreationMessage.class);
            logger.info("client en json : {}", clientCreationMessage.getName());


            // Créer le client
        Client client = new Client();
        client.setId(clientCreationMessage.getUserId());
        client.setName(keycloakService.getUsernameById(clientCreationMessage.getUserId(), clientCreationMessage.getAuthToken()));
        client.setEmail(clientCreationMessage.getEmail());
        client.setIdCompany(clientCreationMessage.getCompanyId());
        client.setPhone("");
        client.setAddress("");
        client.setCompanyName(clientCreationMessage.getCompanyName());
        clientService.createClientwithoutKeycloak(client, clientCreationMessage.getAuthToken());
        logger.info("Client created {}",client.getId());
    }
        catch (Exception e){
            logger.error("Failed to fetch notification info from MSProject", e);

        }
    }

}
