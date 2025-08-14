import 'package:flutter/material.dart';
import '../models/user.dart';

class DoctorDashboard extends StatelessWidget {
  final User user;
  const DoctorDashboard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Doctor Dashboard')),
      body: Center(child: Text('Welcome, ${user.name}')),
    );
  }
}
