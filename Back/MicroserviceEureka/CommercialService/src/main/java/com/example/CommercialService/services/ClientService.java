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
        String adminToken = keycloakService.getAdminToken();
        Client savedClient;
        try {

            // 2. Créer l'utilisateur dans Keycloak

            String keycloakUserId = keycloakService.createUser(client.getName(), client.getEmail(), adminToken);
            client.setId(keycloakUserId);
            savedClient=clientRepository.save(client);
            // 3. Assigner le rôle USER
            keycloakService.assignRoleToUser(keycloakUserId, "USER", adminToken);

            // 4. Ajouter l'utilisateur au groupe correspondant à la company
            keycloakService.addUserToGroup(keycloakUserId, client.getCompanyName(), adminToken);

        } catch (Exception e) {


            throw new RuntimeException("Failed to create Keycloak user: " + e.getMessage());
        }

        return savedClient;
    }

    @Override
    public Client createClientwithoutKeycloak(Client client, String authToken) {
        return clientRepository.save(client);
    }

    @Override
    public Client updateClient(String id, Client client) {
        Client c = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException("Client not found with id: " + id));
        c.setName(c.getName());
        c.setAddress(client.getAddress());
        c.setPhone(client.getPhone());
        c.setEmail(c.getEmail());
        c.setIdCompany(c.getIdCompany());
        c.setCompanyName(c.getCompanyName());
        Client updatedClient = clientRepository.save(c);
        return updatedClient;
    }

    @Override
    public void deleteClient(String id,String authToken) {
        String adminToken = keycloakService.getAdminToken();
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        try {
            String keycloakUserId = keycloakService.getUserIdByUsername(client.getName(), adminToken);

            // 1. Retirer l'utilisateur de son groupe
            keycloakService.removeUserFromGroup(keycloakUserId, client.getCompanyName(), adminToken);

            // 2. Supprimer l'utilisateur de Keycloak
            keycloakService.deleteUser(keycloakUserId, adminToken);

            // 3. Supprimer le client de MongoDB
            clientRepository.delete(client);
        } catch (Exception e) {
            throw new RuntimeException("Échec de la suppression Keycloak: " + e.getMessage());
        }
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
