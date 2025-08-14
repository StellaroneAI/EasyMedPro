import '../models/user.dart';

class UserService {
  // Placeholder for fetching user data; in real app reuse existing services.
  Future<User> fetchCurrentUser() async {
    // TODO: integrate with real data source
    return const User(userType: 'patient', name: 'Demo User');
  }
}
