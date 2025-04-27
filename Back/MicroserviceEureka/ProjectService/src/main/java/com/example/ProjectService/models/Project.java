package com.example.ProjectService.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.util.Date;
import java.util.List;

@Document(collection = "projects")
@Data
public class Project {
    @Id
    private Long id;
    private String name;
    private String description;
    private Long idAdmin;
    private boolean isDeleted = false;

    @DBRef
    private List<ProjectAccess> projectAccesses;

    @DBRef
    private List<Phase> phases;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getIdAdmin() {
        return idAdmin;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public List<ProjectAccess> getProjectAccesses() {
        return projectAccesses;
    }

    public List<Phase> getPhases() {
        return phases;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public void setProjectAccesses(List<ProjectAccess> projectAccesses) {
        this.projectAccesses = projectAccesses;
    }

    public void setPhases(List<Phase> phases) {
        this.phases = phases;
    }
}
