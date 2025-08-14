import 'package:flutter/material.dart';
import '../models/user.dart';
import 'admin_dashboard.dart';
import 'doctor_dashboard.dart';
import 'patient_dashboard.dart';
import 'patient_dashboard_enhanced.dart';
import 'asha_dashboard.dart';
import 'asha_dashboard_enhanced.dart';
import 'otp_diagnostic_panel.dart';

void navigateToDashboard(BuildContext context, User user, {bool enhanced = false}) {
  Widget screen;
  switch (user.userType) {
    case 'admin':
      screen = AdminDashboard(user: user);
      break;
    case 'doctor':
      screen = DoctorDashboard(user: user);
      break;
    case 'asha':
      screen = enhanced ? AshaDashboardEnhanced(user: user) : AshaDashboard(user: user);
      break;
    case 'patient':
      screen = enhanced ? PatientDashboardEnhanced(user: user) : PatientDashboard(user: user);
      break;
    case 'otp':
      screen = const OtpDiagnosticPanel();
      break;
    default:
      screen = PatientDashboard(user: user);
  }

  Navigator.pushReplacement(
    context,
    MaterialPageRoute(builder: (_) => screen),
  );
}
