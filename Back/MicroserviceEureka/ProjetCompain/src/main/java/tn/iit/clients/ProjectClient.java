package tn.iit.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.iit.config.FeignConfig;
import tn.iit.dto.response.ProjectResponse;

import java.util.List;
@FeignClient(name = "PROJECTSERVICE",
        configuration = FeignConfig.class)
public interface ProjectClient {
    @GetMapping("/ProjectService/project/company/{idCompany}")
    List<ProjectResponse> getProjectsByCompany(@PathVariable String idCompany);
}