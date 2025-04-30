package tn.iit.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.iit.config.FeignConfig;
import tn.iit.dto.response.ProjectResponse;

import java.util.List;
@FeignClient(name = "ProjectService",
        url = "https://e1.systeo.tn/ProjectService",
        configuration = FeignConfig.class,
        path = "/project")
public interface ProjectClient {
    @GetMapping("/company/{idCompany}")
    List<ProjectResponse> getProjectsByCompany(@PathVariable("idCompany") String idCompany);
}
