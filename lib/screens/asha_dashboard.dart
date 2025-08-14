import 'package:flutter/material.dart';
import '../models/user.dart';

class AshaDashboard extends StatelessWidget {
  final User user;
  const AshaDashboard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ASHA Dashboard')),
      body: Center(child: Text('Welcome, ${user.name}')),
    );
  }
}
