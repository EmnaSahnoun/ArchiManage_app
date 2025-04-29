package tn.iit.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.iit.dto.response.ProjectResponse;

import java.util.List;
@FeignClient(name = "ProjectService", url = "https://e1.systeo.tn/ProjectService")
public interface ProjectClient {
    @GetMapping("/ProjectService/project/company/{companyId}")
    List<ProjectResponse> getProjectsByCompanyId(@PathVariable String companyId);
}
