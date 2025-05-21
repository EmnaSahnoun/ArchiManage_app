package com.example.CommercialService.services;

import com.example.CommercialService.consumer.ClientConsumer;
import com.example.CommercialService.interfaces.IKeycloak;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class KeycloakService implements IKeycloak {
    private static final Logger logger = LoggerFactory.getLogger(KeycloakService.class);
    @Value("${keycloak.auth-server-url}")
    private String authServerUrl;

    @Value("systeodigital")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;
    @Autowired
    private  RestTemplate restTemplate;
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

    @Override
    public String createUser(String username, String email, String authToken) {
        logger.info("le token recu {}", authToken);
        String url = KEYCLOAK_BASE_URL + "/users";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        Map<String, Object> user = new HashMap<>();
        user.put("username", username);
        user.put("email", email);
        user.put("enabled", true);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(user, headers);

        ResponseEntity<Void> response = restTemplate.postForEntity(url, request, Void.class);

        if (response.getStatusCode() == HttpStatus.CREATED) {
            // Récupérer l'ID de l'utilisateur créé
            return getUserIdByUsername(username, authToken);
        } else {
            throw new RuntimeException("Failed to create user in Keycloak");
        }
    }

    @Override
    public void assignRoleToUser(String userId, String roleName, String authToken) {
        logger.info("le token recu {} dasn role ", authToken);
        String roleId = getRoleIdByName(roleName, authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + userId + "/role-mappings/realm";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        Map<String, Object> role = new HashMap<>();
        role.put("id", roleId);
        role.put("name", roleName);

        HttpEntity<Map<String, Object>[]> request = new HttpEntity<>(new Map[]{role}, headers);

        restTemplate.postForEntity(url, request, Void.class);
    }

    @Override
    public void addUserToGroup(String userId, String groupName, String authToken) {
        logger.info("le token recu dns grp {}", authToken);
        String groupId = getGroupIdByName(groupName, authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + userId + "/groups/" + groupId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        restTemplate.exchange(url, HttpMethod.PUT, request, Void.class);
    }

    @Override
    public String getUserIdByUsername(String username, String authToken) {
        logger.info("le token recu dans userid {}", authToken);
        String url = KEYCLOAK_BASE_URL + "/users?username=" + username;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        ResponseEntity<Map[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map[].class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().length > 0) {
            return (String) response.getBody()[0].get("id");
        }
        throw new RuntimeException("User not found in Keycloak: " + username);
    }

    @Override
    public String getUsernameById(String id, String authToken) {
        logger.info("le token recu username {}", authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + id;

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
                String username = (String) response.getBody().get("username");
                if (username != null) {
                    return username;
                }
            }
            throw new RuntimeException("Username not found for user ID: " + id);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching user from Keycloak: " + e.getMessage(), e);
        }
    }

    @Override
    public String getGroupIdByName(String groupName, String authToken) {
        logger.info("le token recu grpid {}", authToken);
        String url = KEYCLOAK_BASE_URL + "/groups?search=" + groupName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        ResponseEntity<Map[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map[].class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            for (Map group : response.getBody()) {
                if (groupName.equals(group.get("name"))) {
                    return (String) group.get("id");
                }
            }
        }
        throw new RuntimeException("Group not found in Keycloak: " + groupName);
    }

    @Override
    public String getRoleIdByName(String roleName, String authToken) {
        logger.info("le token recu roleid {}", authToken);
        String url = KEYCLOAK_BASE_URL + "/roles/" + roleName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("id");
        }
        throw new RuntimeException("Role not found in Keycloak: " + roleName);
    }

    @Override
    public void deleteUser(String userId, String authToken) {
        logger.info("le token recu deleteuser {}", authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }

    @Override
    public void removeUserFromGroup(String userId, String groupName, String authToken) {
        logger.info("le token recu remove removeUserFromGroup {}", authToken);
        String groupId = getGroupIdByName(groupName, authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + userId + "/groups/" + groupId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }
}
