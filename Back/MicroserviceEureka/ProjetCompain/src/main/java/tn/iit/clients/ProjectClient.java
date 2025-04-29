package tn.iit.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.iit.dto.response.ProjectResponse;

import java.util.List;

@FeignClient(name = "PROJECT-SERVICE")
public interface ProjectClient {
    @GetMapping("/ProjectService/project/compain/{companyId}")
    List<ProjectResponse> getProjectsByCompanyId(@PathVariable String companyId);
}
