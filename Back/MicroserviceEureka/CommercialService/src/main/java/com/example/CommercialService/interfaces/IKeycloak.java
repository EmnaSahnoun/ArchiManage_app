package com.example.CommercialService.interfaces;

public interface IKeycloak {
    String createUser(String username, String email, String authToken);
    void assignRoleToUser(String userId, String roleName, String authToken);
    void addUserToGroup(String userId, String groupName, String authToken);
    String getUserIdByUsername(String username, String authToken);
    String getGroupIdByName(String groupName, String authToken);
    String getRoleIdByName(String roleName, String authToken);

}
