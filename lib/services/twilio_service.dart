import 'dart:convert';
import 'package:http/http.dart' as http;

class TwilioService {
  TwilioService() : _baseUrl = '/api';

  final String _baseUrl;
  final Map<String, String> _localStorage = {};

  bool _startsWithValidDigit(String number) => '6789'.contains(number[0]);

  Map<String, dynamic> validatePhoneNumber(String phoneNumber) {
    final digits = phoneNumber.replaceAll(RegExp('[^0-9]'), '');
    if (digits.length == 10 && _startsWithValidDigit(digits)) {
      return {'isValid': true, 'formatted': '+91$digits'};
    } else if (digits.length == 12 && digits.startsWith('91') && _startsWithValidDigit(digits.substring(2))) {
      return {'isValid': true, 'formatted': '+$digits'};
    } else if (digits.length == 13 && digits.startsWith('91') && _startsWithValidDigit(digits.substring(3))) {
      return {'isValid': true, 'formatted': '+${digits.substring(1)}'};
    }
    return {'isValid': false, 'error': 'Please enter a valid Indian mobile number (10 digits starting with 6-9)'};
  }

  String _getOTPMessage(String otp, String language) {
    const templates = {
      'english': 'Your EasyMed verification code is: {otp}. Valid for 10 minutes. Do not share this code.',
    };
    return (templates[language] ?? templates['english']!).replaceAll('{otp}', otp);
  }

  Future<Map<String, dynamic>> sendOTP(String phoneNumber, String userType, {String language = 'english'}) async {
    try {
      final validation = validatePhoneNumber(phoneNumber);
      if (validation['isValid'] != true) {
        return {'success': false, 'message': validation['error']};
      }
      final response = await http.post(
        Uri.parse('$_baseUrl/sms/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phoneNumber': validation['formatted'],
          'userType': userType,
          'language': language,
        }),
      );
      final result = jsonDecode(response.body);
      if (result['success'] == true && result['sessionToken'] != null) {
        _localStorage['easymed_otp_session'] = result['sessionToken'];
      }
      return Map<String, dynamic>.from(result);
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to send OTP. Please try again.',
        'error': e.toString(),
      };
    }
  }

  Future<Map<String, dynamic>> verifyOTP(String phoneNumber, String otp, String userType) async {
    try {
      final validation = validatePhoneNumber(phoneNumber);
      if (validation['isValid'] != true) {
        return {'success': false, 'message': validation['error']};
      }
      final sessionToken = _localStorage['easymed_otp_session'];
      if (sessionToken == null) {
        return {'success': false, 'message': 'No OTP session found. Please request a new OTP.'};
      }
      final response = await http.post(
        Uri.parse('$_baseUrl/sms/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phoneNumber': validation['formatted'],
          'otp': otp,
          'userType': userType,
          'sessionToken': sessionToken,
        }),
      );
      final result = jsonDecode(response.body);
      if (result['success'] == true && result['token'] != null) {
        _localStorage['easymed_token'] = result['token'];
        if (result['refreshToken'] != null) {
          _localStorage['easymed_refresh_token'] = result['refreshToken'];
        }
        if (result['user'] != null) {
          _localStorage['easymed_user'] = jsonEncode(result['user']);
        }
        _localStorage.remove('easymed_otp_session');
      }
      return Map<String, dynamic>.from(result);
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to verify OTP. Please try again.',
        'error': e.toString(),
      };
    }
  }

  Future<Map<String, dynamic>> refreshToken() async {
    try {
      final refreshToken = _localStorage['easymed_refresh_token'];
      if (refreshToken == null) {
        return {'success': false, 'error': 'No refresh token available'};
      }
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );
      final result = jsonDecode(response.body);
      if (result['success'] == true && result['token'] != null) {
        _localStorage['easymed_token'] = result['token'];
      }
      return Map<String, dynamic>.from(result);
    } catch (e) {
      return {'success': false, 'error': 'Failed to refresh token'};
    }
  }

  void logout() {
    _localStorage.remove('easymed_token');
    _localStorage.remove('easymed_refresh_token');
    _localStorage.remove('easymed_user');
    _localStorage.remove('easymed_otp_session');
  }

  bool isAuthenticated() => _localStorage.containsKey('easymed_token');

  Map<String, dynamic>? getCurrentUser() {
    final userStr = _localStorage['easymed_user'];
    return userStr != null ? jsonDecode(userStr) : null;
  }
}

final twilioService = TwilioService();
