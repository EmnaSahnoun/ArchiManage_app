package tn.iit.dto.response;

import java.util.Date;
import java.util.List;

public class ProjectResponse {
    private String id;
    private String name;
    private String description;
    private String idAdmin;
    private boolean isDeleted;
    private List<String> projectAccessIds;
    private List<String> phaseIds;
    private Date createdAt;

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIdAdmin() {
        return idAdmin;
    }

    public void setIdAdmin(String idAdmin) {
        this.idAdmin = idAdmin;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public List<String> getProjectAccessIds() {
        return projectAccessIds;
    }

    public void setProjectAccessIds(List<String> projectAccessIds) {
        this.projectAccessIds = projectAccessIds;
    }

    public List<String> getPhaseIds() {
        return phaseIds;
    }

    public void setPhaseIds(List<String> phaseIds) {
        this.phaseIds = phaseIds;
    }
}
