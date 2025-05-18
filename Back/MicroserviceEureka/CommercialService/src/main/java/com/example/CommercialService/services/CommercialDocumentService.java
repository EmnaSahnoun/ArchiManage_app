package com.example.CommercialService.services;

import com.example.CommercialService.clients.CompanyServiceClient;
import com.example.CommercialService.dto.request.CommercialDocumentRequest;
import com.example.CommercialService.dto.response.CommercialDocumentLineResponse;
import com.example.CommercialService.dto.response.CommercialDocumentResponse;
import com.example.CommercialService.dto.response.CompanyResponse;
import com.example.CommercialService.interfaces.ICommercialDocument;
import com.example.CommercialService.models.CommercialDocument;
import com.example.CommercialService.models.CommercialDocumentLine;
import com.example.CommercialService.models.enums.Status;
import com.example.CommercialService.models.enums.Type;
import com.example.CommercialService.repositories.ClientRepository;
import com.example.CommercialService.repositories.CommercialDocumentRepository;
import com.example.CommercialService.repositories.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommercialDocumentService implements ICommercialDocument {
    private final CommercialDocumentRepository documentRepository;
    private final CompanyRepository companyRepository;
    private final ClientRepository clientRepository;
    private final CompanyServiceClient companyServiceClient;


    @Override
    public CommercialDocumentResponse createDocument(CommercialDocumentRequest request) {
        // Récupérer les infos de la company depuis le MS company
        CompanyResponse companyResponse = companyServiceClient.getCompanyById(request.getCompanyId());

        // Convertir la request en entity
        CommercialDocument document = new CommercialDocument();
        document.setDocumentType(request.getDocumentType());
        document.setDocumentNumber("1");
        document.setCreatedAt(new Date());
        document.setStatus(Status.UNPAID);
        document.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        document.setNotes(request.getNotes());

        // Convertir les lignes
        List<CommercialDocumentLine> lines = request.getLines().stream()
                .map(lineRequest -> {
                    CommercialDocumentLine line = new CommercialDocumentLine();
                    line.setDescription(lineRequest.getDescription());
                    line.setQuantity(lineRequest.getQuantity());
                    line.setUnitPrice(lineRequest.getUnitPrice());
                    line.calculateTotal();
                    return line;
                })
                .collect(Collectors.toList());

        document.setLines(lines);
        document.calculateTotals();

        // Sauvegarder le document
        CommercialDocument savedDocument = documentRepository.save(document);

        // Convertir en response
        return convertToResponse(savedDocument, companyResponse);
    }

    @Override
    public CommercialDocumentResponse updateDocument(CommercialDocumentRequest request) {
        return null;
    }

    @Override
    public CommercialDocumentResponse deleteDocument(CommercialDocumentRequest request) {
        return null;
    }

    @Override
    public CommercialDocumentResponse getDocument(CommercialDocumentRequest request) {
        return null;
    }

    @Override
    public CommercialDocumentResponse getAllDocuments() {
        return null;
    }


    private CommercialDocumentResponse convertToResponse(CommercialDocument document, CompanyResponse company) {
        CommercialDocumentResponse response = new CommercialDocumentResponse();
        response.setId(document.getId());
        response.setCompany(company);
        response.setDocumentType(document.getDocumentType());
        response.setDocumentNumber(document.getDocumentNumber());
        response.setCreatedAt(document.getCreatedAt());
        response.setStatus(document.getStatus());
        response.setDiscount(document.getDiscount());
        response.setSubTotal(document.getSubTotal());
        response.setTaxAmount(document.getTaxAmount());
        response.setTotalAmount(document.getTotalAmount());
        response.setNotes(document.getNotes());

        List<CommercialDocumentLineResponse> lineResponses = document.getLines().stream()
                .map(line -> {
                    CommercialDocumentLineResponse lineResponse = new CommercialDocumentLineResponse();
                    lineResponse.setId(line.getId());
                    lineResponse.setDescription(line.getDescription());
                    lineResponse.setQuantity(line.getQuantity());
                    lineResponse.setUnitPrice(line.getUnitPrice());
                    lineResponse.setTotal(line.getTotal());
                    return lineResponse;
                })
                .collect(Collectors.toList());

        response.setLines(lineResponses);
        return response;
    }
}

