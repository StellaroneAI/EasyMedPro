import 'package:flutter/material.dart';

class OtpDiagnosticPanel extends StatelessWidget {
  const OtpDiagnosticPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('OTP Diagnostic Panel')),
      body: const Center(child: Text('OTP diagnostics go here')),
    );
  }
}
