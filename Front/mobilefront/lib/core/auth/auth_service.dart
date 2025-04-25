// lib/core/auth/auth_service.dart
import 'package:flutter/foundation.dart'; // For ChangeNotifier
import 'package:flutter/material.dart';
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'auth_config.dart';
import '../storage/secure_storage_service.dart';

class AuthService with ChangeNotifier {
  final FlutterAppAuth _appAuth = const FlutterAppAuth();
  final SecureStorageService _storageService = SecureStorageService();

  String? _accessToken;
  String? _idToken;
  String? _refreshToken;
  DateTime? _accessTokenExpiration;
  Map<String, dynamic>? _idTokenClaims;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  // --- Storage Keys ---
  static const String _accessTokenKey = 'access_token';
  static const String _idTokenKey = 'id_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _accessTokenExpirationKey = 'access_token_expiration';

  // --- Getters ---
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get accessToken => _accessToken;
  Map<String, dynamic>? get userClaims => _idTokenClaims;

  AuthService() {
    // Try to load tokens on startup
    _loadTokensFromStorage();
  }

  Future<void> _setLoading(bool value) async {
     // Use WidgetsBinding.instance.addPostFrameCallback to avoid setState errors during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
       if (_isLoading != value) {
         _isLoading = value;
         notifyListeners();
       }
    });
  }

  Future<void> _loadTokensFromStorage() async {
    await _setLoading(true);
    try {
      _accessToken = await _storageService.read(key: _accessTokenKey);
      _idToken = await _storageService.read(key: _idTokenKey);
      _refreshToken = await _storageService.read(key: _refreshTokenKey);
      final expirationString = await _storageService.read(key: _accessTokenExpirationKey);

      if (_accessToken != null && expirationString != null) {
        _accessTokenExpiration = DateTime.tryParse(expirationString);
        if (_accessTokenExpiration != null && _accessTokenExpiration!.isAfter(DateTime.now())) {
          _isAuthenticated = true;
          _decodeIdToken(); // Decode claims if ID token exists
        } else {
          // Access token expired, potentially try refresh or clear
          print('Access token expired');
          await clearTokens(); // Or implement refresh logic here
        }
      } else {
        _isAuthenticated = false;
      }
    } catch (e) {
      print("Error loading tokens: $e");
      _isAuthenticated = false;
      await clearTokens(); // Clear potentially corrupted state
    } finally {
      await _setLoading(false);
      notifyListeners(); // Notify listeners about the auth state
    }
  }

  Future<void> login() async {
    await _setLoading(true);
    try {
      final AuthorizationTokenResponse? result =
          await _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          AuthConfig.clientId,
          AuthConfig.redirectUri,
          issuer: AuthConfig.issuer,
          scopes: AuthConfig.scopes,
          preferEphemeralSession: false, // Set to true to not store cookies in browser
          additionalParameters: AuthConfig.customParameters, // Pass audience here if needed
        ),
      );

      if (result != null) {
        _accessToken = result.accessToken;
        _idToken = result.idToken;
        _refreshToken = result.refreshToken;
        _accessTokenExpiration = result.accessTokenExpirationDateTime;
        _isAuthenticated = true;

        await _storeTokens();
        _decodeIdToken();
        print('Login successful!');
      } else {
        print('Login failed: Authorization result is null');
        _isAuthenticated = false;
      }
    } catch (e, s) {
      print('Login Error: $e');
      print('Stacktrace: $s');
      _isAuthenticated = false;
      await clearTokens(); // Clear any partial state on error
    } finally {
       await _setLoading(false);
       notifyListeners();
    }
  }

  Future<void> logout() async {
     await _setLoading(true);
    try {
      // Use endSessionEndpoint from discovery or config
      // Need the id_token to properly logout from Keycloak session
      final idToken = await _storageService.read(key: _idTokenKey);
      if (idToken != null) {
         await _appAuth.endSession(EndSessionRequest(
           idTokenHint: idToken,
           issuer: AuthConfig.issuer,
           postLogoutRedirectUrl: AuthConfig.redirectUri, // Redirect back to app after logout
           // serviceConfiguration: provide service config if not using discovery
           // additionalParameters: { 'client_id': AuthConfig.clientId } // Sometimes needed
         ));
      } else {
         print("Cannot perform OIDC logout without ID Token hint.");
         // Fallback: Just clear local tokens if proper logout isn't possible
      }

    } catch (e, s) {
      print('Logout Error: $e');
      print('Stacktrace: $s');
      // Even if server logout fails, clear local state
    } finally {
       await clearTokens(); // Always clear local tokens
       await _setLoading(false);
    }
  }


  Future<void> _storeTokens() async {
    await _storageService.write(key: _accessTokenKey, value: _accessToken);
    await _storageService.write(key: _idTokenKey, value: _idToken);
    await _storageService.write(key: _refreshTokenKey, value: _refreshToken);
    await _storageService.write(key: _accessTokenExpirationKey, value: _accessTokenExpiration?.toIso8601String());
  }

  Future<void> clearTokens() async {
    await _storageService.delete(key: _accessTokenKey);
    await _storageService.delete(key: _idTokenKey);
    await _storageService.delete(key: _refreshTokenKey);
    await _storageService.delete(key: _accessTokenExpirationKey);
    _accessToken = null;
    _idToken = null;
    _refreshToken = null;
    _accessTokenExpiration = null;
    _idTokenClaims = null;
    _isAuthenticated = false;
    notifyListeners(); // Notify UI about logout
  }

  void _decodeIdToken() {
    if (_idToken != null) {
      try {
        _idTokenClaims = JwtDecoder.decode(_idToken!);
        print("Decoded ID Token: $_idTokenClaims");
      } catch (e) {
        print("Error decoding ID token: $e");
        _idTokenClaims = null;
      }
    } else {
      _idTokenClaims = null;
    }
  }

  // --- Role Checks (similar to Angular) ---
  List<String> _getRoles() {
    if (_idTokenClaims == null) return [];

    // Adjust based on your Keycloak token structure
    // It's often in 'realm_access' > 'roles' or 'resource_access' > 'your_client_id' > 'roles'
    final realmAccess = _idTokenClaims!['realm_access'];
    if (realmAccess is Map && realmAccess['roles'] is List) {
      return List<String>.from(realmAccess['roles']);
    }
    // Check resource access if needed
    // final resourceAccess = _idTokenClaims!['resource_access'];
    // if (resourceAccess is Map && resourceAccess[AuthConfig.clientId] is Map) {
    //   final clientRoles = resourceAccess[AuthConfig.clientId]['roles'];
    //   if (clientRoles is List) {
    //      return List<String>.from(clientRoles);
    //   }
    // }

    return [];
  }

  bool isSuperAdmin() {
    return _getRoles().any((role) => role.toUpperCase() == 'SUPER-ADMIN');
  }

  bool isAdmin() {
    return _getRoles().any((role) => role.toUpperCase() == 'ADMIN');
  }

  bool isUser() {
    // Assuming 'USER' might be a default role or explicitly assigned
    return _getRoles().any((role) => role.toUpperCase() == 'USER');
  }

  // --- TODO: Implement Token Refresh ---
  // You'll need logic to use the _refreshToken to get a new _accessToken
  // when the current one is about to expire or has expired.
  // `flutter_appauth` has a `token` method for this:
  // await _appAuth.token(TokenRequest(...));
}
