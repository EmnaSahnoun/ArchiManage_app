package com.example.ProjectService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Data
public class ProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @NotNull(message = "Admin ID is required")
    private Long idAdmin;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getIdAdmin() {
        return idAdmin;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setIdAdmin(Long idAdmin) {
        this.idAdmin = idAdmin;
    }
}