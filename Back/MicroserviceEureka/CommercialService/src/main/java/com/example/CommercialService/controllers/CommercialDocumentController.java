package com.example.CommercialService.controllers;

import com.example.CommercialService.dto.request.CommercialDocumentRequest;
import com.example.CommercialService.dto.response.CommercialDocumentResponse;
import com.example.CommercialService.services.CommercialDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")

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


    @PutMapping("/{id}")
    public ResponseEntity<CommercialDocumentResponse> updateDocument(
            @PathVariable String id,
            @Valid @RequestBody CommercialDocumentRequest request) {
        CommercialDocumentResponse response = commercialDocumentService.updateDocument(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CommercialDocumentResponse> deleteDocument(
            @PathVariable String id) {
        CommercialDocumentResponse response = commercialDocumentService.deleteDocument(id);
        return ResponseEntity.ok(response);
         }

    @GetMapping("/{id}")
    public ResponseEntity<CommercialDocumentResponse> getDocumentById(
            @PathVariable String id) {
        CommercialDocumentResponse response = commercialDocumentService.getDocumentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CommercialDocumentResponse>> getAllDocuments() {
        List<CommercialDocumentResponse> responses = commercialDocumentService.getAllDocuments();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CommercialDocumentResponse>> getDocumentByIdCompany(
            @PathVariable String companyId) {
        return ResponseEntity.ok(commercialDocumentService.getDocumentByIdCompany(companyId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<CommercialDocumentResponse>> getByClient(
            @PathVariable String clientId) {
        return ResponseEntity.ok(commercialDocumentService.getDocumentByIdClient(clientId));
    }

}
