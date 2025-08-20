import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user.dart';
import '../providers/language_provider.dart';

class PatientDashboard extends StatefulWidget {
  final User user;
  const PatientDashboard({super.key, required this.user});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Scaffold(
      appBar: AppBar(title: Text(lang.t('patientDashboard'))),
      body: Center(child: Text('Tab $index')),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        onTap: (i) => setState(() => index = i),
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home), label: lang.t('home')),
          BottomNavigationBarItem(icon: const Icon(Icons.smart_toy), label: lang.t('ai')),
          BottomNavigationBarItem(icon: const Icon(Icons.calendar_today), label: lang.t('appointments')),
          BottomNavigationBarItem(icon: const Icon(Icons.monitor_heart), label: lang.t('health')),
          BottomNavigationBarItem(icon: const Icon(Icons.person), label: lang.t('profile')),
        ],
      ),
    );
  }
}
