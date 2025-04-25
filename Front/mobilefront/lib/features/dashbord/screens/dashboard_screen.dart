// lib/features/dashboard/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_service.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>(); // Watch for changes if needed
    final claims = authService.userClaims;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await context.read<AuthService>().logout();
              // AuthWrapper will handle navigation back to LoginScreen
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Welcome!', style: TextStyle(fontSize: 24)),
            const SizedBox(height: 20),
            if (claims != null) ...[
              Text('Name: ${claims['name'] ?? 'N/A'}'),
              Text('Email: ${claims['email'] ?? 'N/A'}'),
              Text('Preferred Username: ${claims['preferred_username'] ?? 'N/A'}'),
              const SizedBox(height: 10),
              const Text('Roles:', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(authService.isSuperAdmin() ? '- SUPER-ADMIN' : ''),
              Text(authService.isAdmin() ? '- ADMIN' : ''),
              Text(authService.isUser() ? '- USER' : ''),
              // Or display all roles: Text(authService.getRoles().join(', ')),
            ] else ...[
              const Text('User details not available.'),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Example: Navigate to projects list
                // Navigator.push(context, MaterialPageRoute(builder: (context) => ProjectListScreen()));
                 ScaffoldMessenger.of(context).showSnackBar(
                   const SnackBar(content: Text('Navigate to Projects (Implement me!)'))
                 );
              },
              child: const Text('View Projects'),
            )
            // Add other dashboard elements here
          ],
        ),
      ),
    );
  }
}
