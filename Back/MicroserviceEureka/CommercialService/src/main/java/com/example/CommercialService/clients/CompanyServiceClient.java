package com.example.CommercialService.clients;

import com.example.CommercialService.config.FeignConfig;
import com.example.CommercialService.dto.response.CompanyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PROJECTCOMPANY",
        configuration = FeignConfig.class,
        url="https://e1.systeo.tn/PROJECTCOMPANY"

)
public interface CompanyServiceClient {
    @GetMapping("/{id}")
    CompanyResponse getCompanyById(@PathVariable String id);
}
