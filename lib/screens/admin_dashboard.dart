import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user.dart';
import '../providers/language_provider.dart';

class AdminDashboard extends StatelessWidget {
  final User user;
  const AdminDashboard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Scaffold(
      appBar: AppBar(title: Text(lang.t('adminDashboard'))),
      body: Center(child: Text('${lang.t('welcome')}, ${user.name}')),
    );
  }
}
