package com.example.CommercialService.models;

import com.example.CommercialService.models.enums.Status;
import com.example.CommercialService.models.enums.Type;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "commercial_documents")
public class CommercialDocument {
    @Id
    private String id;

    @DBRef(lazy = false)
    private Company company;
    private Type documentType; // "INVOICE", "QUOTE", etc.
    private String documentNumber;
    private Date createdAt;

    private Status status;

    private BigDecimal discount; // Remise globale
    private BigDecimal subTotal; // Sous-total avant taxes
    private BigDecimal taxAmount; // Montant des taxes
    private BigDecimal totalAmount; // Total TTC

    private String notes; // Notes supplémentaires

    @Field("lines")
    private List<CommercialDocumentLine> lines = new ArrayList<>();
    // Méthodes utilitaires
    public void calculateTotals() {
        // Initialiser les valeurs BigDecimal si elles sont null
        if (this.subTotal == null) {
            this.subTotal = BigDecimal.ZERO;
        }
        if (this.discount == null) {
            this.discount = BigDecimal.ZERO;
        }
        if (this.taxAmount == null) {
            this.taxAmount = BigDecimal.ZERO;
        }

        // Calculer le sous-total
        this.subTotal = lines.stream()
                .map(line -> line.getTotal() != null ? line.getTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculer le total
        this.totalAmount = subTotal.subtract(discount).add(taxAmount);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Type getDocumentType() {
        return documentType;
    }

    public void setDocumentType(Type documentType) {
        this.documentType = documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<CommercialDocumentLine> getLines() {
        return lines;
    }

    public void setLines(List<CommercialDocumentLine> lines) {
        this.lines = lines;
    }
}
