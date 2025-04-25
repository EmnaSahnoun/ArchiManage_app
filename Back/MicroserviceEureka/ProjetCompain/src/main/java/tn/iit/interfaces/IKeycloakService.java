package tn.iit.interfaces;

import java.util.List;
import java.util.Map;

public interface IKeycloakService {
    String findGroupIdByName(String groupName, String authToken);
    void createKeycloakGroup(String groupName, Map<String, List<String>> attributes, String authToken);
    void deleteKeycloakGroup(String groupName, String authToken);
    void updateKeycloakGroup(String oldGroupName, String newGroupName,
                             Map<String, List<String>> attributes,
                             String authToken);
}
