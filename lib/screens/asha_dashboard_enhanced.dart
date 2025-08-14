import 'package:flutter/material.dart';
import '../models/user.dart';

class AshaDashboardEnhanced extends StatelessWidget {
  final User user;
  const AshaDashboardEnhanced({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ASHA Dashboard+')),
      body: Center(child: Text('Enhanced features for ${user.name}')),
    );
  }
}
