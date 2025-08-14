import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(EasyMedProApp());
}

class EasyMedProApp extends StatelessWidget {
  const EasyMedProApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LoginState()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: Consumer<LanguageProvider>(
        builder: (context, lang, _) {
          return MaterialApp(
            title: 'EasyMedPro',
            locale: lang.locale,
            supportedLocales: const [
              Locale('en'),
              Locale('hi'),
            ],
            routes: {
              '/': (_) => const HomePage(),
              '/patient': (_) => const PatientDashboard(),
              '/asha': (_) => const AshaDashboard(),
              '/doctor': (_) => const DoctorDashboard(),
              '/admin': (_) => const AdminDashboard(),
            },
          );
        },
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final login = context.watch<LoginState>();
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('EasyMedPro')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Logged in: ${login.isLoggedIn}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                if (login.isLoggedIn) {
                  login.logout();
                } else {
                  login.login();
                  Navigator.pushNamed(context, '/patient');
                }
              },
              child: Text(login.isLoggedIn ? 'Logout' : 'Login'),
            ),
            const SizedBox(height: 16),
            DropdownButton<String>(
              value: lang.locale.languageCode,
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English')),
                DropdownMenuItem(value: 'hi', child: Text('Hindi')),
              ],
              onChanged: (code) {
                if (code != null) {
                  lang.setLocale(Locale(code));
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class LoginState extends ChangeNotifier {
  bool _isLoggedIn = false;
  bool get isLoggedIn => _isLoggedIn;

  void login() {
    _isLoggedIn = true;
    notifyListeners();
  }

  void logout() {
    _isLoggedIn = false;
    notifyListeners();
  }
}

class LanguageProvider extends ChangeNotifier {
  Locale _locale = const Locale('en');
  Locale get locale => _locale;

  void setLocale(Locale locale) {
    if (_locale == locale) return;
    _locale = locale;
    notifyListeners();
  }
}

class PatientDashboard extends StatelessWidget {
  const PatientDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Patient Dashboard')),
      body: const Center(child: Text('Patient dashboard')),
    );
  }
}

class AshaDashboard extends StatelessWidget {
  const AshaDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ASHA Dashboard')),
      body: const Center(child: Text('ASHA dashboard')),
    );
  }
}

class DoctorDashboard extends StatelessWidget {
  const DoctorDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Doctor Dashboard')),
      body: const Center(child: Text('Doctor dashboard')),
    );
  }
}

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      body: const Center(child: Text('Admin dashboard')),
    );
  }
}
