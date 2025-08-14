import 'dart:convert';
import 'package:http/http.dart' as http;

import 'firebase_auth_service.dart';

class AuthenticationService {
  AuthenticationService() {
    token = _localStorage['easymed_token'];
    refreshToken = _localStorage['easymed_refresh_token'];
    final userStr = _localStorage['easymed_user'];
    if (userStr != null) {
      user = jsonDecode(userStr) as Map<String, dynamic>;
    }
  }

  final String _apiBaseUrl = '/api';
  String? token;
  String? refreshToken;
  Map<String, dynamic>? user;

  static final Map<String, String> _localStorage = {};

  Future<Map<String, dynamic>> _apiCall(
    String endpoint, {
    String method = 'GET',
    Map<String, String>? headers,
    Map<String, dynamic>? body,
  }) async {
    final url = Uri.parse('$_apiBaseUrl$endpoint');
    final defaultHeaders = <String, String>{'Content-Type': 'application/json'};
    if (token != null) {
      defaultHeaders['Authorization'] = 'Bearer $token';
    }
    final requestHeaders = {...defaultHeaders, ...?headers};
    try {
      http.Response response;
      final encodedBody = body != null ? jsonEncode(body) : null;
      switch (method.toUpperCase()) {
        case 'POST':
          response = await http.post(url, headers: requestHeaders, body: encodedBody);
          break;
        case 'PUT':
          response = await http.put(url, headers: requestHeaders, body: encodedBody);
          break;
        default:
          response = await http.get(url, headers: requestHeaders);
      }
      final data = jsonDecode(response.body);
      if (response.statusCode == 401 && data['message'] == 'Token expired' && refreshToken != null) {
        final refreshResult = await refreshAccessToken();
        if (refreshResult['success'] == true) {
          requestHeaders['Authorization'] = 'Bearer $token';
          return await _apiCall(endpoint, method: method, headers: headers, body: body);
        }
      }
      return Map<String, dynamic>.from(data);
    } catch (e) {
      return {'success': false, 'message': 'Network error occurred'};
    }
  }

  void _storeAuthData(Map<String, dynamic> usr, Map<String, dynamic> tokens) {
    user = usr;
    token = tokens['accessToken'];
    refreshToken = tokens['refreshToken'];
    _localStorage['easymed_user'] = jsonEncode(usr);
    if (token != null) _localStorage['easymed_token'] = token!;
    if (refreshToken != null) _localStorage['easymed_refresh_token'] = refreshToken!;
  }

  void _clearAuthData() {
    user = null;
    token = null;
    refreshToken = null;
    _localStorage.remove('easymed_user');
    _localStorage.remove('easymed_token');
    _localStorage.remove('easymed_refresh_token');
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiCall('/auth/register', method: 'POST', body: userData);
      return response;
    } catch (e) {
      return {'success': false, 'message': 'Registration failed'};
    }
  }

  Future<Map<String, dynamic>> sendOTP(String phone, {String userType = 'patient', String language = 'english'}) async {
    try {
      return await firebaseAuthService.sendOTP(phone, userType, language);
    } catch (e) {
      return {'success': false, 'message': 'Failed to send OTP'};
    }
  }

  Future<Map<String, dynamic>> verifyOTP(String phone, String otp, {String userType = 'patient'}) async {
    try {
      final response = await firebaseAuthService.verifyOTP(phone, otp, userType);
      if (response['success'] == true && response['user'] != null && response['token'] != null) {
        _storeAuthData(Map<String, dynamic>.from(response['user']), {
          'accessToken': response['token'],
          'refreshToken': response['refreshToken'],
        });
      }
      return response;
    } catch (e) {
      return {'success': false, 'message': 'OTP verification failed'};
    }
  }

  Future<Map<String, dynamic>> loginWithEmail(String email, String password) async {
    try {
      final response = await _apiCall('/auth/login', method: 'POST', body: {'email': email, 'password': password});
      if (response['success'] == true && response['user'] != null && response['tokens'] != null) {
        _storeAuthData(Map<String, dynamic>.from(response['user']), Map<String, dynamic>.from(response['tokens']));
      }
      return response;
    } catch (e) {
      return {'success': false, 'message': 'Login failed'};
    }
  }

  Future<Map<String, dynamic>> refreshAccessToken() async {
    try {
      final response = await firebaseAuthService.refreshToken();
      if (response['success'] == true && response['token'] != null) {
        token = response['token'];
        _localStorage['easymed_token'] = token!;
        return {'success': true};
      }
      _clearAuthData();
      return response;
    } catch (e) {
      _clearAuthData();
      return {'success': false, 'message': 'Token refresh failed'};
    }
  }

  Future<Map<String, dynamic>> logout() async {
    try {
      await firebaseAuthService.logout();
    } catch (_) {}
    _clearAuthData();
    return {'success': true, 'message': 'Logged out successfully'};
  }

  Future<Map<String, dynamic>> getProfile() async {
    if (token == null) {
      return {'success': false, 'message': 'Not authenticated'};
    }
    try {
      return await _apiCall('/auth/profile');
    } catch (e) {
      return {'success': false, 'message': 'Failed to fetch profile'};
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final response = await _apiCall('/auth/profile', method: 'PUT', body: profileData);
      if (response['success'] == true && response['user'] != null) {
        user = Map<String, dynamic>.from(response['user']);
        _localStorage['easymed_user'] = jsonEncode(user);
      }
      return response;
    } catch (e) {
      return {'success': false, 'message': 'Failed to update profile'};
    }
  }

  bool isAuthenticated() {
    return firebaseAuthService.isAuthenticated() && token != null && user != null;
  }

  Map<String, dynamic>? getCurrentUser() {
    return firebaseAuthService.getCurrentUser() ?? user;
  }

  String getApiBaseUrl() => _apiBaseUrl;
}

final authService = AuthenticationService();
