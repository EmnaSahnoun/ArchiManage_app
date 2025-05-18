package com.example.CommercialService.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "commercial_document_lines")
public class CommercialDocumentLine {
    @Id
    private String id;

    private String description;
    private BigDecimal quantity = BigDecimal.ONE;
    private BigDecimal unitPrice = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;
    private String commercialDocumentId;

    public void calculateTotal() {
        if (this.unitPrice == null) {
            this.unitPrice = BigDecimal.ZERO;
        }
        if (this.quantity == null) {
            this.quantity = BigDecimal.ONE;
        }
        this.total = unitPrice.multiply(quantity);
    }
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getCommercialDocumentId() {
        return commercialDocumentId;
    }

    public void setCommercialDocumentId(String commercialDocumentId) {
        this.commercialDocumentId = commercialDocumentId;
    }
}
