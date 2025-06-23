package com.example.CommercialService.services;

import com.example.CommercialService.clients.CompanyServiceClient;
import com.example.CommercialService.consumer.ClientConsumer;
import com.example.CommercialService.dto.request.CommercialDocumentLineRequest;
import com.example.CommercialService.dto.request.CommercialDocumentRequest;
import com.example.CommercialService.dto.response.CommercialDocumentLineResponse;
import com.example.CommercialService.dto.response.CommercialDocumentResponse;
import com.example.CommercialService.dto.response.CompanyResponse;
import com.example.CommercialService.exceptions.DocumentNotFoundException;
import com.example.CommercialService.interfaces.ICommercialDocument;
import com.example.CommercialService.models.Client;
import com.example.CommercialService.models.CommercialDocument;
import com.example.CommercialService.models.CommercialDocumentLine;
import com.example.CommercialService.models.Company;
import com.example.CommercialService.models.enums.Status;
import com.example.CommercialService.models.enums.Type;
import com.example.CommercialService.repositories.ClientRepository;
import com.example.CommercialService.repositories.CommercialDocumentLineRepository;
import com.example.CommercialService.repositories.CommercialDocumentRepository;
import com.example.CommercialService.repositories.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommercialDocumentService implements ICommercialDocument {
    private final CommercialDocumentRepository documentRepository;
    private final CompanyRepository companyRepository;
    private final CompanyServiceClient companyServiceClient;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final CommercialDocumentLineRepository commercialDocumentLineRepository;
    private final CommercialDocumentRepository commercialDocumentRepository;
    private final ClientRepository clientRepository;
    private static final Logger logger = LoggerFactory.getLogger(CommercialDocumentService.class);

    @Override
    public CommercialDocumentResponse createDocument(CommercialDocumentRequest request) {
        // Récupérer les infos de la company depuis le MS company



        // Convertir la request en entity
        CommercialDocument document = new CommercialDocument();
        document.setDocumentType(request.getDocumentType());
        document.setDocumentNumber(generateDocumentNumber(request.getDocumentType()));
        document.setCreatedAt(new Date());
        document.setStatus(Status.UNPAID);
        document.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        document.setTaxAmount(BigDecimal.ZERO);
        document.setSubTotal(BigDecimal.ZERO);
        document.setNotes(request.getNotes());

        Optional<Company> existingCompany = companyRepository.findById(request.getCompanyId());
        Company company ;
        if (existingCompany.isPresent()) {
            // 2a. Si elle existe, on la récupère
            company = existingCompany.get();
        } else {
            // 2b. Si elle n'existe pas, on la récupère du microservice et on la sauvegarde
            CompanyResponse companyResponse = companyServiceClient.getCompanyById(request.getCompanyId());

            company = new Company();
            company.setId(companyResponse.getId());
            company.setName(companyResponse.getName());
            company.setAddress(companyResponse.getAddress());
            company.setEmail(companyResponse.getEmail());
            company.setPhone(companyResponse.getPhone());
            company.setCreatedAt(companyResponse.getCreatedAt());

            // Sauvegarder la nouvelle company
            company = companyRepository.save(company);
        }
        document.setCompany(company);
        Optional<Client> existingClient = clientRepository.findById(request.getClientId());
        Client client ;
        if (existingClient.isPresent()) {
            // 2a. Si elle existe, on la récupère
            client = existingClient.get();
            document.setClient(client);
        }

        // Convertir les lignes
        List<CommercialDocumentLine> lines = request.getLines().stream()
                .map(lineRequest -> {
                    CommercialDocumentLine line = convertToDocumentLine(lineRequest);
                    return commercialDocumentLineRepository.save(line); // Sauvegarde chaque ligne
                })
                .collect(Collectors.toList());

        document.setLines(lines);
        document.calculateTotals();

        // Sauvegarder le document
        CommercialDocument savedDocument = documentRepository.save(document);

        // Convertir en response
        return convertToResponse(savedDocument);
    }

    @Override
    public CommercialDocumentResponse updateDocument(String id, CommercialDocumentRequest request) {
        // Vérifier l'existence du document
        CommercialDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        // Mettre à jour les champs modifiables
        document.setNotes(request.getNotes());
        document.setDiscount(request.getDiscount());
        CompanyResponse companyResponse = companyServiceClient.getCompanyById(request.getCompanyId());
        Client client = clientRepository.findById(request.getClientId()).get();
        document.setClient(client);
        // Mettre à jour les lignes
        List<CommercialDocumentLine> updatedLines = request.getLines().stream()
                .map(this::convertToDocumentLine)
                .collect(Collectors.toList());

        document.setLines(updatedLines);
        document.calculateTotals();

        Company company = new Company();
        company.setId(companyResponse.getId());
        company.setName(companyResponse.getName());
        company.setAddress(companyResponse.getAddress());
        company.setEmail(companyResponse.getEmail());
        company.setPhone(companyResponse.getPhone());
        company.setCreatedAt(companyResponse.getCreatedAt());
        document.setCompany(company);
        // Sauvegarder
        CommercialDocument updatedDocument = documentRepository.save(document);


        return convertToResponse(updatedDocument);
    }

    @Override
    public CommercialDocumentResponse deleteDocument(String id) {
        // Vérifier l'existence du document
        CommercialDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        // Supprimer
        documentRepository.delete(document);


        return convertToResponse(document);
    }

    @Override
    public CommercialDocumentResponse getDocumentById(String id) {
        CommercialDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));


        return convertToResponse(document);
    }

    @Override
    public List<CommercialDocumentResponse> getAllDocuments() {
        // Récupérer tous les documents
        List<CommercialDocument> documents = documentRepository.findAll();

        // Convertir en responses
        List<CommercialDocumentResponse> responses = documents.stream()
                .map(doc -> {

                    return convertToResponse(doc);
                })
                .collect(Collectors.toList());

        return responses;
    }

    @Override
    public List<CommercialDocumentResponse> getDocumentByIdCompany(String idCompany) {
        List<CommercialDocument> documents = documentRepository.findByCompanyId(idCompany);
        return documents.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommercialDocumentResponse> getDocumentByIdClient(String idClient) {
        List<CommercialDocument> documents = documentRepository.findByClientId(idClient);
        return documents.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private String generateDocumentNumber(Type documentType) {
        String prefix = documentType == Type.INVOICE ? "FAC-" : "DEV-";
        long sequence = sequenceGeneratorService.getNextSequence(documentType.name());
        return prefix + sequence;
    }

    private CommercialDocumentLine convertToDocumentLine(CommercialDocumentLineRequest lineRequest) {
        CommercialDocumentLine line = new CommercialDocumentLine();
        line.setDescription(lineRequest.getDescription());
        line.setQuantity(lineRequest.getQuantity());
        line.setUnitPrice(lineRequest.getUnitPrice());
        line.setTaxRate(lineRequest.getTaxRate());
        line.calculateTotal();
        return line;
    }
    private CommercialDocumentResponse convertToResponse(CommercialDocument document) {
        CommercialDocumentResponse response = new CommercialDocumentResponse();
        response.setId(document.getId());
        // Gérer le cas où company est null
        if (document.getCompany() != null) {
            try {
                CompanyResponse companyResponse = companyServiceClient.getCompanyById(document.getCompany().getId());
                Company company = new Company();
                company.setId(companyResponse.getId());
                company.setName(companyResponse.getName());
                company.setAddress(companyResponse.getAddress());
                company.setEmail(companyResponse.getEmail());
                company.setPhone(companyResponse.getPhone());
                company.setCreatedAt(companyResponse.getCreatedAt());
                
                response.setCompany(company);
            } catch (Exception e) {

                response.setCompany(null);
            }
        } else {
            response.setCompany(null);
        }
        if (document.getClient() != null) {
            try {

                Client client = new Client();
                client.setId(document.getClient().getId());
                client.setName(document.getClient().getName());
                client.setAddress(document.getClient().getAddress());
                client.setEmail(document.getClient().getEmail());
                client.setPhone(document.getClient().getPhone());
                client.setCreatedAt(document.getClient().getCreatedAt());
                client.setCompanyName(response.getCompany().getName());
                client.setIdCompany(response.getCompany().getId());
                response.setClient(client);
            } catch (Exception e) {

                response.setClient(null);
            }
        }
        else {
            response.setClient(null);
        }


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
                    lineResponse.setTaxRate(line.getTaxRate());
                    lineResponse.setTaxAmount(line.getTaxAmount());
                    lineResponse.setTotalBeforeTax(line.getTotalBeforeTax());
                    lineResponse.setTotal(line.getTotal());
                    return lineResponse;
                })
                .collect(Collectors.toList());

        response.setLines(lineResponses);
        return response;
    }

}

