package com.example.NotificationService.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class KeycloakService {
    private static final Logger logger = LoggerFactory.getLogger(KeycloakService.class);
    @Value("${keycloak.auth-server-url}")
    private String authServerUrl;

    @Value("systeodigital")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private RestTemplate restTemplate;

    private static final String KEYCLOAK_BASE_URL = "https://esmm.systeo.tn/admin/realms/systeodigital";
    public String getAdminToken() {
        String url = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "client_credentials");

        ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);

        return "Bearer " + response.getBody().get("access_token");
    }
    public String getUserEmailById(String userId, String authToken) {
        String url = KEYCLOAK_BASE_URL + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("email");
            }
            throw new RuntimeException("Email not found for user ID: " + userId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching user email from Keycloak: " + e.getMessage(), e);
        }
    }
}
