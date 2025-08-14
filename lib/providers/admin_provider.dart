import 'package:flutter/foundation.dart';

class AdminUser {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String designation;
  final String role; // super_admin, admin, manager, coordinator
  final List<String> permissions;
  final DateTime createdAt;
  final bool isActive;

  AdminUser({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.designation,
    required this.role,
    required this.permissions,
    required this.createdAt,
    this.isActive = true,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) => AdminUser(
        id: json['id'] as String,
        name: json['name'] as String,
        phone: json['phone'] as String,
        email: json['email'] as String?,
        designation: json['designation'] as String,
        role: json['role'] as String,
        permissions:
            List<String>.from(json['permissions'] as List<dynamic>? ?? []),
        createdAt: DateTime.parse(json['createdAt'] as String),
        isActive: json['isActive'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'designation': designation,
        'role': role,
        'permissions': permissions,
        'createdAt': createdAt.toIso8601String(),
        'isActive': isActive,
      };
}

class AdminProvider extends ChangeNotifier {
  static const String _superAdminPhone = '9060328119';
  static const List<String> _superAdminEmails = [
    'admin@easymed.in',
    'admin@gmail.com',
    'superadmin@easymed.in',
    'praveen@stellaronehealth.com',
  ];

  static const List<String> _adminPasswords = [
    'admin123',
    'easymed2025',
    'admin@123',
    'dummy123',
  ];

  static const Map<String, List<String>> _defaultPermissions = {
    'super_admin': [
      'manage_all_users',
      'manage_team',
      'view_all_data',
      'edit_all_data',
      'delete_all_data',
      'system_settings',
      'analytics',
      'financial_reports',
      'user_management',
      'role_management',
    ],
    'admin': [
      'manage_users',
      'view_data',
      'edit_data',
      'analytics',
      'user_management',
      'reports',
    ],
    'manager': [
      'view_data',
      'edit_data',
      'manage_assigned_users',
      'reports',
    ],
    'coordinator': [
      'view_data',
      'basic_edit',
      'basic_reports',
    ],
  };

  AdminUser? _currentAdmin;
  final List<AdminUser> _adminTeam = [];

  AdminUser? get currentAdmin => _currentAdmin;
  List<AdminUser> get adminTeam => List.unmodifiable(_adminTeam);
  bool get isAdminAuthenticated => _currentAdmin != null;
  bool get isSuperAdmin => _currentAdmin?.phone == _superAdminPhone ||
      _superAdminEmails.contains(_currentAdmin?.email);

  Future<bool> loginAdmin(String identifier,
      {Map<String, dynamic>? userInfo, String? password}) async {
    try {
      if (identifier == _superAdminPhone) {
        final admin = AdminUser(
          id: 'super_admin_001',
          name: userInfo?['name'] ?? 'Super Admin',
          phone: _superAdminPhone,
          email: userInfo?['email'] ?? '',
          designation: 'System Administrator',
          role: 'super_admin',
          permissions: _defaultPermissions['super_admin']!,
          createdAt: DateTime.now(),
          isActive: true,
        );
        _currentAdmin = admin;
        notifyListeners();
        return true;
      }

      if (_superAdminEmails.contains(identifier) &&
          password != null &&
          _adminPasswords.contains(password)) {
        final adminName = identifier == 'praveen@stellaronehealth.com'
            ? 'Praveen - StellarOne Health'
            : 'Super Admin';
        final admin = AdminUser(
          id: 'super_admin_email_001',
          name: adminName,
          phone: userInfo?['phone'] ?? _superAdminPhone,
          email: identifier,
          designation: 'System Administrator',
          role: 'super_admin',
          permissions: _defaultPermissions['super_admin']!,
          createdAt: DateTime.now(),
          isActive: true,
        );
        _currentAdmin = admin;
        notifyListeners();
        return true;
      }

      final byPhone = _adminTeam.firstWhere(
        (m) => m.phone == identifier && m.isActive,
        orElse: () => AdminUser(
            id: '',
            name: '',
            phone: '',
            designation: '',
            role: '',
            permissions: const [],
            createdAt: DateTime.now()),
      );
      if (byPhone.id.isNotEmpty) {
        _currentAdmin = byPhone;
        notifyListeners();
        return true;
      }

      final byEmail = _adminTeam.firstWhere(
        (m) => m.email == identifier && m.isActive,
        orElse: () => AdminUser(
            id: '',
            name: '',
            phone: '',
            designation: '',
            role: '',
            permissions: const [],
            createdAt: DateTime.now()),
      );
      if (byEmail.id.isNotEmpty) {
        _currentAdmin = byEmail;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  void logoutAdmin() {
    _currentAdmin = null;
    notifyListeners();
  }

  Future<bool> addTeamMember(AdminUser member) async {
    try {
      if (!isSuperAdmin && _currentAdmin?.role != 'admin') {
        throw Exception('Insufficient permissions to add team members');
      }
      if (_adminTeam.any((m) => m.phone == member.phone)) {
        throw Exception('Phone number already exists');
      }
      final newMember = AdminUser(
        id: 'admin_${DateTime.now().millisecondsSinceEpoch}',
        name: member.name,
        phone: member.phone,
        email: member.email,
        designation: member.designation,
        role: member.role,
        permissions:
            _defaultPermissions[member.role] ?? _defaultPermissions['coordinator']!,
        createdAt: DateTime.now(),
        isActive: member.isActive,
      );
      _adminTeam.add(newMember);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateTeamMember(String id, Map<String, dynamic> updates) async {
    try {
      if (!isSuperAdmin && _currentAdmin?.role != 'admin') {
        throw Exception('Insufficient permissions to update team members');
      }
      final index = _adminTeam.indexWhere((m) => m.id == id);
      if (index == -1) return false;
      final existing = _adminTeam[index];
      final updated = AdminUser(
        id: existing.id,
        name: updates['name'] ?? existing.name,
        phone: updates['phone'] ?? existing.phone,
        email: updates['email'] ?? existing.email,
        designation: updates['designation'] ?? existing.designation,
        role: updates['role'] ?? existing.role,
        permissions: updates.containsKey('role')
            ? _defaultPermissions[updates['role']] ?? existing.permissions
            : existing.permissions,
        createdAt: existing.createdAt,
        isActive: updates['isActive'] ?? existing.isActive,
      );
      _adminTeam[index] = updated;
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> removeTeamMember(String id) async {
    try {
      if (!isSuperAdmin) {
        throw Exception('Only super admin can remove team members');
      }
      _adminTeam.removeWhere((m) => m.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  bool checkPermission(String permission) {
    if (_currentAdmin == null) return false;
    return _currentAdmin!.permissions.contains(permission) || isSuperAdmin;
  }
}

