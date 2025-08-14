import 'package:flutter/material.dart';
import '../models/user.dart';

class AdminDashboard extends StatelessWidget {
  final User user;
  const AdminDashboard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      body: Center(child: Text('Welcome, ${user.name}')),
    );
  }
}
