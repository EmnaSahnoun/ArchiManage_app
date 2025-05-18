package com.example.CommercialService.interfaces;

import com.example.CommercialService.dto.request.CommercialDocumentRequest;
import com.example.CommercialService.dto.response.CommercialDocumentResponse;

public interface ICommercialDocument {
    public CommercialDocumentResponse createDocument(CommercialDocumentRequest request);
    public CommercialDocumentResponse updateDocument(CommercialDocumentRequest request);
    public CommercialDocumentResponse deleteDocument(CommercialDocumentRequest request);
    public CommercialDocumentResponse getDocument(CommercialDocumentRequest request);
    public CommercialDocumentResponse getAllDocuments();

}
