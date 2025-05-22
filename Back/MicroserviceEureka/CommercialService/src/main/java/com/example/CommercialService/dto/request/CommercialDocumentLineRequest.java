package com.example.CommercialService.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class CommercialDocumentLineRequest {
    @NotBlank
    private String description;
    @DecimalMin("0.01")
    private BigDecimal quantity = BigDecimal.ONE;

    @DecimalMin("0.00")
    private BigDecimal unitPrice = BigDecimal.ZERO;
    @DecimalMin("0.00")
    private BigDecimal taxRate = BigDecimal.ZERO;

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
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
}
