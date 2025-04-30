package tn.iit.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class FeignConfig {
    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor() {
        return requestTemplate -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && authentication instanceof JwtAuthenticationToken jwtAuth) {
                requestTemplate.header("Authorization", "Bearer " + jwtAuth.getToken().getTokenValue());
            } else {
                throw new IllegalStateException("Cannot propagate authentication token - no JWT found");
            }
        };
    }
}
