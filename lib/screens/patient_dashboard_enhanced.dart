import 'package:flutter/material.dart';
import '../models/user.dart';

class PatientDashboardEnhanced extends StatelessWidget {
  final User user;
  const PatientDashboardEnhanced({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Patient Dashboard+')),
      body: Center(child: Text('Enhanced features for ${user.name}')),
    );
  }
}
