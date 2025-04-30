package tn.iit.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.iit.clients.ProjectClient;
import tn.iit.dto.response.ProjectResponse;
import tn.iit.interfaces.IProjectService;

import java.util.List;
@Service
@RequiredArgsConstructor
public class ProjectService implements IProjectService {
    private final ProjectClient projectClient;

    @Override
    public List<ProjectResponse> getProjectsByCompany(String companyId) {
        return projectClient.getProjectsByCompany(companyId);
    }
}
