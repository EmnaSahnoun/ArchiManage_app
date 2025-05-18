package com.example.CommercialService.dto.request;

import com.example.CommercialService.models.enums.Type;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class CommercialDocumentRequest {
    @NotNull
    private String companyId;
    @NotNull
    private Type documentType;
    @DecimalMin("0.00")
    private BigDecimal discount=BigDecimal.ZERO;
    private String notes;
    @NotEmpty
    @Valid
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
