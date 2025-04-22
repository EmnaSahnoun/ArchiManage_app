package tn.iit.services;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class KeycloakService {
    private final RestTemplate restTemplate;
    private static final String KEYCLOAK_BASE_URL = "https://esmm.systeo.tn/admin/realms/systeodigital";

    public KeycloakService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

// find groupe by name
public String findGroupIdByName(String groupName, String authToken) {
        String searchUrl = KEYCLOAK_BASE_URL + "/groups?search=" + groupName;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken.replace("Bearer ", ""));
        
        ResponseEntity<Map[]> response = restTemplate.exchange(
            searchUrl,
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



    public void createKeycloakGroup(String groupName, Map<String, List<String>> attributes, String authToken) {
        String url = KEYCLOAK_BASE_URL + "/groups";
        executeKeycloakRequest(url, HttpMethod.POST, groupName, null, attributes, authToken);
    }


public void deleteKeycloakGroup(String groupName, String authToken) {
    // 1. Trouver l'ID du groupe
    String groupId = findGroupIdByName(groupName, authToken);
    
    // 2. Préparer la requête de suppression
    String url = KEYCLOAK_BASE_URL + "/groups/" + groupId;
    
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(authToken.replace("Bearer ", ""));
    
    // 3. Exécuter la suppression
    try {
        restTemplate.exchange(
            url, 
            HttpMethod.DELETE, 
            new HttpEntity<>(headers), 
            Void.class
        );
    } catch (Exception e) {
        throw new RuntimeException("Failed to delete Keycloak group: " + groupName, e);
    }
}


public void updateKeycloakGroup(String oldGroupName, String newGroupName, 
                              Map<String, List<String>> attributes, 
                              String authToken) {
    // 1. Trouver l'ID du groupe avec l'ancien nom
    String groupId = findGroupIdByName(oldGroupName, authToken);
    
    // 2. Préparer la requête de mise à jour
    String url = KEYCLOAK_BASE_URL + "/groups/" + groupId;
    
    Map<String, Object> body = new HashMap<>();
    body.put("name", newGroupName); // Nouveau nom ici
    body.put("attributes", attributes);
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(authToken.replace("Bearer ", ""));
    
    // 3. Exécuter la mise à jour
    restTemplate.put(url, new HttpEntity<>(body, headers));
}

    private void executeKeycloakRequest(String url, HttpMethod method, 
                                      String groupName, String groupId,
                                      Map<String, List<String>> attributes, 
                                      String authToken) {
        Map<String, Object> body = new HashMap<>();
        body.put("name", groupName);
        if (groupId != null) {
            body.put("id", groupId);
        }
        body.put("attributes", attributes);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken.replace("Bearer ", ""));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        if (method == HttpMethod.POST) {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Keycloak operation failed: " + response.getBody());
            }
        } else {
            restTemplate.put(url, request);
        }
    }
}
