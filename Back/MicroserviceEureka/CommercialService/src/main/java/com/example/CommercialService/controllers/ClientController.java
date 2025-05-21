package com.example.CommercialService.controllers;

import com.example.CommercialService.models.Client;
import com.example.CommercialService.services.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")

@RestController
@RequestMapping("/client")
public class ClientController {
    @Autowired
    private  ClientService clientService;
    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client,
                                               @RequestHeader("Authorization") String authToken) {
        Client createdClient = clientService.createClient(client, authToken);
        return ResponseEntity.ok(createdClient);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable String id) {
        Client client = clientService.getClientById(id);
        return ResponseEntity.ok(client);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Client>> getClientsByCompanyId(@PathVariable String companyId) {
        List<Client> clients = clientService.getClientsByCompanyId(companyId);
        return ResponseEntity.ok(clients);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(
            @PathVariable String id,
            @RequestBody Client updatedClient) {
        Client client = clientService.updateClient(id, updatedClient);
        return ResponseEntity.ok(client);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(
            @PathVariable String id,
            @RequestHeader("Authorization") String authToken) {
        clientService.deleteClient(id, authToken);
        return ResponseEntity.noContent().build();
    }
}
