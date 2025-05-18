package com.example.CommercialService.controllers;

import com.example.CommercialService.dto.request.CommercialDocumentRequest;
import com.example.CommercialService.dto.response.CommercialDocumentResponse;
import com.example.CommercialService.services.CommercialDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/commercialdocuments")
@RequiredArgsConstructor
public class CommercialDocumentController {
    private final CommercialDocumentService commercialDocumentService;
    @PostMapping
    public ResponseEntity<CommercialDocumentResponse> createDocument(
            @Valid @RequestBody CommercialDocumentRequest request) {
        CommercialDocumentResponse response = commercialDocumentService.createDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


}
