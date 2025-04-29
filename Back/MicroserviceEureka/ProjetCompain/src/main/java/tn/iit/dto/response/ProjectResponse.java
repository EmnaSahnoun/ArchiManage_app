package tn.iit.dto.response;

import java.util.List;

public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private Long idAdmin;
    private boolean isDeleted;
    private List<Long> projectAccessIds;
    private List<Long> phaseIds;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public Long getIdAdmin() {
        return idAdmin;
    }

    public void setIdAdmin(Long idAdmin) {
        this.idAdmin = idAdmin;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public List<Long> getProjectAccessIds() {
        return projectAccessIds;
    }

    public void setProjectAccessIds(List<Long> projectAccessIds) {
        this.projectAccessIds = projectAccessIds;
    }

    public List<Long> getPhaseIds() {
        return phaseIds;
    }

    public void setPhaseIds(List<Long> phaseIds) {
        this.phaseIds = phaseIds;
    }
}
