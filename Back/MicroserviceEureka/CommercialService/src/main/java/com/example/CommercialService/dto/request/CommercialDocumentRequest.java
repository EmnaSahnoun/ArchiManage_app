package com.example.CommercialService.dto.request;

import com.example.CommercialService.models.enums.Type;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class CommercialDocumentRequest {
    @NotBlank(message = "Company ID is required")
    private String companyId;
    @NotBlank(message = "Client ID is required")
    private String clientId;
    @NotNull(message = "Document type is required")
    private Type documentType;
    @DecimalMin(value ="0.00", message = "Discount cannot be negative")
    private BigDecimal discount=BigDecimal.ZERO;
    private String notes;
    @NotEmpty(message = "At least one document line is required")
    @Valid
    private List<CommercialDocumentLineRequest> lines;

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

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
