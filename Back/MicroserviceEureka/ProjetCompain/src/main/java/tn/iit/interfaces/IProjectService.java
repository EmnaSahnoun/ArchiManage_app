package tn.iit.interfaces;

import tn.iit.dto.response.ProjectResponse;

import java.util.List;

public interface IProjectService {
    List<ProjectResponse> getProjectsByCompany(String companyId);
}
