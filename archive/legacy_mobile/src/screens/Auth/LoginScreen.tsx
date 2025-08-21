import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  success: boolean;
  message?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

const LoginScreen: React.FC = () => {
  const [useEmail, setUseEmail] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const storeToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (e) {
      console.error('Failed to store token', e);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data: LoginResponse = await res.json();
      if (data.success && data.tokens?.accessToken) {
        await storeToken(data.tokens.accessToken);
        setMessage('Login successful');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setMessage('OTP sent');
      } else {
        setMessage(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data: LoginResponse = await res.json();
      if (data.success && data.tokens?.accessToken) {
        await storeToken(data.tokens.accessToken);
        setMessage('Login successful');
      } else {
        setMessage(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {useEmail ? (
        <>
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleEmailLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
          />
          {otpSent && (
            <TextInput
              placeholder="OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
            />
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={otpSent ? handleVerifyOTP : handleSendOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Loading...' : otpSent ? 'Verify OTP' : 'Send OTP'}</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => setUseEmail(!useEmail)}>
        <Text style={styles.link}>{useEmail ? 'Use phone OTP' : 'Use email/password'}</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 8,
  },
  message: {
    textAlign: 'center',
    marginTop: 12,
  },
});

export default LoginScreen;

