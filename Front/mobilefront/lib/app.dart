// lib/app.dart
import 'package:flutter/material.dart';
// Importez MainScreen si ce n'est pas déjà fait
import 'package:mobilefront/screens/main_screen.dart';
import 'package:provider/provider.dart';

import 'core/auth/auth_service.dart';
import 'features/auth/screens/login_screen.dart';
// L'import de DashboardScreen n'est plus nécessaire ici si vous allez toujours vers MainScreen
// import 'package:mobilefront/features/dashbord/screens/dashboard_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ArchiManage Mobile',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFE27D60)),
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false, // Optionnel: cache la bannière debug
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _autoLoginAttempted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthAndTriggerLogin();
    });
  }

  void _checkAuthAndTriggerLogin() {
    if (!mounted) return;

    final authService = context.read<AuthService>();
    // On ne tente le login automatique que si on n'est pas déjà authentifié,
    // pas en cours de chargement, et qu'on ne l'a pas déjà tenté.
    if (!authService.isAuthenticated && !authService.isLoading && !_autoLoginAttempted) {
      setState(() {
        _autoLoginAttempted = true;
      });
      print("AuthWrapper: Tentative de connexion automatique (via AuthService.login)...");

      // On suppose que authService.login() tente de se connecter (peut-être avec un refresh token)
      // et met à jour son état (isLoading, isAuthenticated) et notifie les listeners.
      authService.login().catchError((error) {
        // L'erreur est déjà logguée dans AuthService, mais on peut ajouter un log ici aussi.
        print("AuthWrapper: Échec de la tentative de connexion automatique: $error");
        if (mounted) {
          // L'état (_autoLoginAttempted = true) reste, donc on affichera LoginScreen
        }
      });
    } else {
       print("AuthWrapper: Connexion automatique non nécessaire ou déjà tentée (isAuthenticated=${authService.isAuthenticated}, isLoading=${authService.isLoading}, autoLoginAttempted=$_autoLoginAttempted).");
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();

    print("--- AuthWrapper Build ---");
    print("État AuthService: isLoading=${authService.isLoading}, isAuthenticated=${authService.isAuthenticated}");
    print("État AuthWrapper: autoLoginAttempted=$_autoLoginAttempted");

    // CAS 1: En cours de chargement (connexion auto/manuelle en cours, vérification token...)
    if (authService.isLoading) {
      print("➡️ AuthWrapper: Affichage Indicateur de Chargement (isLoading=true)");
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    // CAS 2: Authentifié (et pas en cours de chargement)
    else if (authService.isAuthenticated) {
      // --- LOG DE CONNEXION RÉUSSIE ---
      print("✅ AuthWrapper: Utilisateur AUTHENTIFIÉ ! Navigation vers MainScreen...");
      // --- FIN LOG ---

      // Réinitialiser le flag si nécessaire (utile si l'utilisateur se déconnecte)
      if (_autoLoginAttempted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() => _autoLoginAttempted = false);
            print("AuthWrapper: Flag autoLoginAttempted réinitialisé.");
          }
        });
      }

      // --- NAVIGATION VERS MAINSCREEN ---
      return const MainScreen();
      // --- FIN NAVIGATION ---
    }
    // CAS 3: Non authentifié (et pas en cours de chargement)
    else {
      // Si on a tenté la connexion auto et qu'elle a échoué (ou si l'utilisateur
      // a annulé une connexion manuelle qui l'a ramené ici), on affiche LoginScreen.
      if (_autoLoginAttempted) {
         print("❌ AuthWrapper: Non authentifié (après tentative auto). Affichage LoginScreen.");
         return const LoginScreen();
      }
      // Sinon, c'est probablement l'état initial avant la tentative auto,
      // ou juste après un échec très rapide. On affiche le chargement
      // en attendant que _checkAuthAndTriggerLogin s'exécute ou se termine.
      else {
         print("⏳ AuthWrapper: Non authentifié (avant/pendant tentative auto initiale). Affichage Indicateur + Lancement check.");
         // On relance le check au cas où.
         WidgetsBinding.instance.addPostFrameCallback((_) {
           _checkAuthAndTriggerLogin();
         });
         return const Scaffold(
           body: Center(child: CircularProgressIndicator()),
         );
      }
    }
  }
}
