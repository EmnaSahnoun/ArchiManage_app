// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart'; // Your root App widget
import 'core/auth/auth_service.dart';


void main() {
  WidgetsFlutterBinding.ensureInitialized(); // Ensure bindings are initialized

  runApp(
    MultiProvider(
      providers: [
        // Provide the AuthService globally
        ChangeNotifierProvider(create: (_) => AuthService()),
        // You could also provide SecureStorageService if needed elsewhere
        // Provider(create: (_) => SecureStorageService()),
      ],
      child: const MyApp(), // Your main App widget
    ),
  );
}
