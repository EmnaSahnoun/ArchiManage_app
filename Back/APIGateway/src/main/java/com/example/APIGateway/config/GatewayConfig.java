package com.example.APIGateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import reactor.core.publisher.Mono;

import java.security.Principal;

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
                                .removeRequestHeader("Cookie") // Sécurité
                                .removeRequestHeader("Set-Cookie") // Sécurité
                                .addRequestHeader("X-Forwarded-Proto", "https")
                                .preserveHostHeader() // Conserve le header Host original
                        )
                        .uri(companyServiceUrl))
                .build();
    }
    }
