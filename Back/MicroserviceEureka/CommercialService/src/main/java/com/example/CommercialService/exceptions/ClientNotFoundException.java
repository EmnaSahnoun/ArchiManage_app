package com.example.CommercialService.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ClientNotFoundException extends RuntimeException  {
    public ClientNotFoundException(Long idClient) {
        super("Client not found with id: " + idClient);
    }

    public ClientNotFoundException(String message) {
        super(message);
    }
}
