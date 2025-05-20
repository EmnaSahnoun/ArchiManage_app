package com.example.CommercialService.services;

import com.example.CommercialService.interfaces.IKeycloak;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class KeycloakService implements IKeycloak {

    @Autowired
    private  RestTemplate restTemplate;
    private static final String KEYCLOAK_BASE_URL = "https://esmm.systeo.tn/admin/realms/systeodigital";


    @Override
    public String createUser(String username, String email, String authToken) {
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
        String groupId = getGroupIdByName(groupName, authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + userId + "/groups/" + groupId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        restTemplate.exchange(url, HttpMethod.PUT, request, Void.class);
    }

    @Override
    public String getUserIdByUsername(String username, String authToken) {
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
    public String getGroupIdByName(String groupName, String authToken) {
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
        String url = KEYCLOAK_BASE_URL + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }

    @Override
    public void removeUserFromGroup(String userId, String groupName, String authToken) {
        String groupId = getGroupIdByName(groupName, authToken);
        String url = KEYCLOAK_BASE_URL + "/users/" + userId + "/groups/" + groupId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Void> request = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }
}
