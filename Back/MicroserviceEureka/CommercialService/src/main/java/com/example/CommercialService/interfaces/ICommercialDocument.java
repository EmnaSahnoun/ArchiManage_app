package com.example.CommercialService.interfaces;

import com.example.CommercialService.dto.request.CommercialDocumentRequest;
import com.example.CommercialService.dto.response.CommercialDocumentResponse;

import java.util.List;

public interface ICommercialDocument {
    public CommercialDocumentResponse createDocument(CommercialDocumentRequest request);
    public CommercialDocumentResponse updateDocument(String id , CommercialDocumentRequest request);
    public CommercialDocumentResponse deleteDocument(String id);
    public CommercialDocumentResponse getDocumentById(String id);
    public List<CommercialDocumentResponse> getAllDocuments();
    public List<CommercialDocumentResponse> getDocumentByIdCompany(String idCompany);
    public List<CommercialDocumentResponse> getDocumentByIdClient(String idClient);



}
