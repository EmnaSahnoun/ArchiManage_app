// lib/core/auth/auth_config.dart
class AuthConfig {
  static const String issuer = 'https://esmm.systeo.tn/realms/systeodigital';
  static const String clientId = 'app-pfeFront'; // Same client ID as web? Or create a new one for mobile? Check Keycloak setup.
  static const String redirectUri = 'com.example.mobilefront://callback'; // Your custom scheme
  static const List<String> scopes = [
    'openid',
    'profile',
    'roles', 
    'email',

  ];
  static const String endSessionEndpoint = '$issuer/protocol/openid-connect/logout';
  static const Map<String, String> customParameters = {};
}
