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
    private BigDecimal taxRate = BigDecimal.ZERO; // Nouveau champ: taux de TVA (ex: 0.20 pour 20%)
    private BigDecimal taxAmount = BigDecimal.ZERO; // Nouveau champ: montant de la TVA
    private BigDecimal totalBeforeTax = BigDecimal.ZERO; // Nouveau champ: total HT
    private BigDecimal total = BigDecimal.ZERO;
    private String commercialDocumentId;

    public void calculateTotal() {
        if (this.unitPrice == null) {
            this.unitPrice = BigDecimal.ZERO;
        }
        if (this.quantity == null) {
            this.quantity = BigDecimal.ONE;
        }
        if (this.taxRate == null) {
            this.taxRate = BigDecimal.ZERO;
        }

        this.totalBeforeTax = unitPrice.multiply(quantity);
        this.taxAmount = totalBeforeTax.multiply(taxRate);
        this.total = totalBeforeTax.add(taxAmount);
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalBeforeTax() {
        return totalBeforeTax;
    }

    public void setTotalBeforeTax(BigDecimal totalBeforeTax) {
        this.totalBeforeTax = totalBeforeTax;
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
