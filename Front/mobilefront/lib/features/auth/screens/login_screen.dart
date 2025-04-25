// lib/features/auth/screens/login_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_service.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.read<AuthService>(); // Use read for one-off actions

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: TextButton(
          onPressed: authService.isLoading ? null : () async { // Disable button while loading
            await authService.login();
            // Navigation is handled by AuthWrapper listening to state changes
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFE27D60),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
          ),
          child: authService.isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2,))
              : const Text('Se Connecter ...'),
        ),
      ),
    );
  }
}
