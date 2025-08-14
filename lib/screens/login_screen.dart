import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_tts/flutter_tts.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.onLogin});

  final void Function(String userType, User? user) onLogin;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String activeTab = 'patient';
  String loginMethod = 'phone';
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController otpController = TextEditingController();
  bool showOTP = false;
  bool isLoading = false;
  String message = '';
  bool isPhoneValid = false;
  String? phoneError;
  bool isEmailValid = false;
  String? emailError;
  String? _verificationId;

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FlutterTts _tts = FlutterTts();

  @override
  void dispose() {
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    otpController.dispose();
    super.dispose();
  }

  Future<void> speak(String text) async {
    await _tts.stop();
    await _tts.speak(text);
  }

  void setMessage(String text) {
    setState(() => message = text);
    speak(text);
  }

  void _validatePhone(String value) {
    final isValid = value.length == 10 && RegExp(r'^[6-9]').hasMatch(value);
    setState(() {
      isPhoneValid = isValid;
      phoneError =
          isValid ? null : 'Please enter a valid Indian mobile number';
    });
  }

  void _validateEmail(String value) {
    final isValid = value.contains('@') && value.contains('.');
    setState(() {
      isEmailValid = isValid;
      emailError =
          isValid ? null : 'Please enter a valid email address';
    });
  }

  Future<void> _sendOTP() async {
    if (!isPhoneValid) {
      setMessage(phoneError ?? 'Invalid phone number');
      return;
    }
    setState(() => isLoading = true);
    await _auth.verifyPhoneNumber(
      phoneNumber: '+91${phoneController.text}',
      verificationCompleted: (PhoneAuthCredential credential) async {
        await _auth.signInWithCredential(credential);
        widget.onLogin(activeTab, _auth.currentUser);
        setMessage('Login successful');
      },
      verificationFailed: (FirebaseAuthException e) {
        setMessage('Failed to send OTP: ${e.message}');
      },
      codeSent: (String verificationId, int? resendToken) {
        _verificationId = verificationId;
        setState(() {
          showOTP = true;
        });
        setMessage('OTP sent to ${phoneController.text}');
      },
      codeAutoRetrievalTimeout: (String verificationId) {
        _verificationId = verificationId;
      },
    );
    setState(() => isLoading = false);
  }

  Future<void> _verifyOTP() async {
    if (_verificationId == null) {
      setMessage('Please request OTP first');
      return;
    }
    final credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!, smsCode: otpController.text);
    try {
      setState(() => isLoading = true);
      final result = await _auth.signInWithCredential(credential);
      widget.onLogin(activeTab, result.user);
      setMessage('Login successful');
    } on FirebaseAuthException catch (e) {
      setMessage('OTP verification failed: ${e.message}');
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _loginWithEmail() async {
    if (!isEmailValid || passwordController.text.isEmpty) {
      setMessage('Please enter email and password');
      return;
    }
    try {
      setState(() => isLoading = true);
      final result = await _auth.signInWithEmailAndPassword(
        email: emailController.text,
        password: passwordController.text,
      );
      widget.onLogin(activeTab, result.user);
      setMessage('Login successful');
    } on FirebaseAuthException catch (e) {
      setMessage('Login failed: ${e.message}');
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButton<String>(
              value: activeTab,
              onChanged: (value) {
                if (value != null) setState(() => activeTab = value);
              },
              items: const [
                DropdownMenuItem(value: 'patient', child: Text('Patient')),
                DropdownMenuItem(value: 'asha', child: Text('ASHA')),
                DropdownMenuItem(value: 'doctor', child: Text('Doctor')),
                DropdownMenuItem(value: 'admin', child: Text('Admin')),
              ],
            ),
            const SizedBox(height: 16),
            if (loginMethod == 'phone') ...[
              TextField(
                controller: phoneController,
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  errorText: phoneError,
                ),
                keyboardType: TextInputType.phone,
                onChanged: _validatePhone,
              ),
              const SizedBox(height: 8),
              if (showOTP)
                TextField(
                  controller: otpController,
                  decoration: const InputDecoration(labelText: 'OTP'),
                  keyboardType: TextInputType.number,
                ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: isLoading
                    ? null
                    : showOTP
                        ? _verifyOTP
                        : _sendOTP,
                child: Text(isLoading
                    ? 'Please wait...'
                    : showOTP
                        ? 'Verify OTP'
                        : 'Send OTP'),
              ),
            ] else ...[
              TextField(
                controller: emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  errorText: emailError,
                ),
                onChanged: _validateEmail,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: isLoading ? null : _loginWithEmail,
                child:
                    Text(isLoading ? 'Please wait...' : 'Login with Email'),
              ),
            ],
            const SizedBox(height: 16),
            Text(message, style: const TextStyle(color: Colors.green)),
            const Spacer(),
            DropdownButton<String>(
              value: loginMethod,
              onChanged: (value) {
                if (value != null) setState(() {
                  loginMethod = value;
                  showOTP = false;
                  otpController.clear();
                });
              },
              items: const [
                DropdownMenuItem(value: 'phone', child: Text('Phone OTP')),
                DropdownMenuItem(value: 'email', child: Text('Email/Password')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
