import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/admin_provider.dart';
import 'providers/language_provider.dart';

class EasyMedProApp extends StatelessWidget {
  const EasyMedProApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AdminProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: MaterialApp(
        title: 'EasyMedPro',
        home: const Scaffold(
          body: Center(child: Text('EasyMedPro')),
        ),
      ),
    );
  }
}

