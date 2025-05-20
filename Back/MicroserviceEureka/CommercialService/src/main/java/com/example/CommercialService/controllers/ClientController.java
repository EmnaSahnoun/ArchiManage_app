package com.example.CommercialService.controllers;

import com.example.CommercialService.models.Client;
import com.example.CommercialService.services.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
