package com.example.CommercialService.services;

import com.example.CommercialService.exceptions.ClientNotFoundException;
import com.example.CommercialService.interfaces.IClient;
import com.example.CommercialService.models.Client;
import com.example.CommercialService.repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ClientService implements IClient {
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private  KeycloakService keycloakService;
    @Override
    public Client createClient(Client client, String authToken) {
        Client savedClient = clientRepository.save(client);
        try {
            // 2. Créer l'utilisateur dans Keycloak

            String keycloakUserId = keycloakService.createUser(client.getName(), client.getEmail(), authToken);

            // 3. Assigner le rôle USER
            keycloakService.assignRoleToUser(keycloakUserId, "USER", authToken);

            // 4. Ajouter l'utilisateur au groupe correspondant à la company
            keycloakService.addUserToGroup(keycloakUserId, client.getCompanyName(), authToken);

        } catch (Exception e) {
            // En cas d'erreur avec Keycloak, annuler la création du client
            clientRepository.delete(savedClient);
            throw new RuntimeException("Failed to create Keycloak user: " + e.getMessage());
        }

        return savedClient;
    }

    @Override
    public Client updateClient(String id, Client client) {
        Client c = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException("Client not found with id: " + id));
        c.setName(client.getName());
        c.setAddress(client.getAddress());
        c.setPhone(client.getPhone());
        c.setEmail(client.getEmail());
        c.setIdCompany(client.getIdCompany());
        Client updatedClient = clientRepository.save(c);
        return updatedClient;
    }

    @Override
    public void deleteClient(String id) {
        if (!clientRepository.existsById(id)) {
            throw new ClientNotFoundException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }

    @Override
    public Client getClientById(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException("client not found with id: " + id));

        return client;
    }

    @Override
    public List<Client> getClientsByCompanyId(String idCompany) {
        return clientRepository.findByIdCompany(idCompany);
    }


}
