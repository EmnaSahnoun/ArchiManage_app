package com.example.CommercialService.dto.request;

import com.example.CommercialService.models.enums.Type;

import java.math.BigDecimal;
import java.util.List;

public class CommercialDocumentRequest {
    private String companyId;
    private Type documentType;
    private BigDecimal discount;
    private String notes;
    private List<CommercialDocumentLineRequest> lines;

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public Type getDocumentType() {
        return documentType;
    }

    public void setDocumentType(Type documentType) {
        this.documentType = documentType;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<CommercialDocumentLineRequest> getLines() {
        return lines;
    }

    public void setLines(List<CommercialDocumentLineRequest> lines) {
        this.lines = lines;
    }
}
