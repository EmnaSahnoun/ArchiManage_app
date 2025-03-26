package com.example.APIGateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    @Value("${company.service.url}")
    private String companyServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("company-service", r -> r
                        .path("/company/**")
                        .filters(f -> f
                                .rewritePath("/company/(?<segment>.*)", "/${segment}")
                                .removeRequestHeader("Cookie") // Important pour la sécurité
                                .addRequestHeader("X-Forwarded-Proto", "https")
                        )
                        .uri(companyServiceUrl))
                .build();
    }
}
