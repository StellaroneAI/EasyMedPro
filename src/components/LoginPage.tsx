import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';

interface LoginPageProps {
  onLogin: (userType: 'patient' | 'asha' | 'doctor' | 'admin', userInfo: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { currentLanguage } = useLanguage();
  const { loginAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'patient' | 'asha' | 'doctor' | 'admin'>('patient');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'social'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [message, setMessage] = useState('');

  const loginTexts = {
    english: {
      welcome: "Welcome to EasyMed",
      tagline: "Your Family's Health, Just a Tap Away",
      patient: "Patient/Family",
      asha: "ASHA Worker",
      doctor: "Doctor/Healthcare Provider",
      admin: "Admin/NGO",
      phoneLogin: "Login with Phone",
      emailLogin: "Login with Email",
      phoneNumber: "Phone Number",
      email: "Email Address",
      password: "Password",
      enterOtp: "Enter OTP",
      sendOtp: "Send OTP",
      verifyOtp: "Verify OTP",
      login: "Login",
    },
    hindi: {
      welcome: "EasyMed में आपका स्वागत है",
      tagline: "आपके परिवार का स्वास्थ्य, बस एक टैप दूर",
      patient: "मरीज़/परिवार",
      asha: "आशा कार्यकर्ता",
      doctor: "डॉक्टर/स्वास्थ्य प्रदाता",
      admin: "एडमिन/एनजीओ",
      phoneLogin: "फोन से लॉगिन करें",
      emailLogin: "ईमेल से लॉगिन करें",
      phoneNumber: "फोन नंबर",
      email: "ईमेल पता",
      password: "पासवर्ड",
      enterOtp: "OTP दर्ज करें",
      sendOtp: "OTP भेजें",
      verifyOtp: "OTP सत्यापित करें",
      login: "लॉगिन",
    }
  };

  const currentTexts = loginTexts[currentLanguage as keyof typeof loginTexts] || loginTexts.english;

  const handleSendOTP = async () => {
    if (phoneNumber.length >= 10) {
      setIsLoading(true);

      // Auto-login for admin number
      if (phoneNumber === '9060328119' && activeTab === 'admin') {
        setTimeout(() => {
          setIsLoading(false);
          handleLogin();
        }, 1000);
        return;
      }

      // Simulate OTP sending
      setTimeout(() => {
        setShowOTP(true);
        setIsLoading(false);
        const otpCode = '123456';
        setGeneratedOTP(otpCode);
        setMessage(`OTP sent to ${phoneNumber}. For demo: Enter 123456`);
        Alert.alert('OTP Sent', `For demo: Enter 123456 as your OTP`);
      }, 1000);
    } else {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      if (activeTab === 'admin') {
        let success = false;
        let userInfo: any = {};

        // Admin phone login
        if (loginMethod === 'phone' && phoneNumber === '9060328119') {
          userInfo = {
            phoneNumber: phoneNumber,
            loginMethod: 'phone',
            name: 'Super Admin',
            role: 'super_admin',
            timestamp: new Date().toISOString()
          };
          success = await loginAdmin(phoneNumber, userInfo);

        }
        // Admin email login
        else if (loginMethod === 'email' &&
                 (email === 'admin@easymed.in' || email === 'admin@gmail.com') &&
                 (password === 'admin123' || password === 'dummy123')) {
          success = true;
          userInfo = {
            phoneNumber: '9060328119',
            email,
            loginMethod: 'email',
            name: 'Super Admin (Email)',
            role: 'super_admin',
            timestamp: new Date().toISOString()
          };
        }

        if (success) {
          setMessage('Admin login successful!');
          setTimeout(() => {
            onLogin('admin', userInfo);
          }, 1000);
        } else {
          Alert.alert('Access Denied', 'Use phone: 9060328119 or email: admin@easymed.in / admin123');
        }

      } else {
        // Regular user login with OTP
        let success = false;
        let userInfo: any = {};

        if (loginMethod === 'phone' && showOTP && otp) {
          if (otp.length < 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit OTP');
            setIsLoading(false);
            return;
          }

          if (otp !== '123456' && generatedOTP && otp !== generatedOTP) {
            Alert.alert('Invalid OTP', 'For demo, please enter: 123456');
            setIsLoading(false);
            return;
          }

          success = true;
          userInfo = {
            phoneNumber,
            phone: phoneNumber,
            loginMethod: 'phone',
            name: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} User`,
            role: activeTab,
            timestamp: new Date().toISOString()
          };
        }

        if (success) {
          setMessage('Login successful!');
          setTimeout(() => {
            onLogin(activeTab, userInfo);
          }, 1000);
        } else {
          // This case might need refinement, e.g., if login is attempted without OTP
          if (loginMethod === 'phone' && !showOTP) {
             Alert.alert('Error', 'Please send an OTP first');
          }
        }
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentTexts.welcome}</Text>
        <Text style={styles.subtitle}>{currentTexts.tagline}</Text>
      </View>

      {/* User Type Tabs */}
      <View style={styles.tabContainer}>
        {(['patient', 'asha', 'doctor', 'admin'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tab,
              activeTab === type && styles.activeTab
            ]}
            onPress={() => setActiveTab(type)}
          >
            <Text style={[
              styles.tabText,
              activeTab === type && styles.activeTabText
            ]}>
              {currentTexts[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Login Method Selector */}
      <View style={styles.loginMethodContainer}>
        <TouchableOpacity
          style={[
            styles.loginMethodButton,
            loginMethod === 'phone' && styles.activeLoginMethod
          ]}
          onPress={() => setLoginMethod('phone')}
        >
          <Text style={styles.loginMethodText}>{currentTexts.phoneLogin}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.loginMethodButton,
            loginMethod === 'email' && styles.activeLoginMethod
          ]}
          onPress={() => setLoginMethod('email')}
        >
          <Text style={styles.loginMethodText}>{currentTexts.emailLogin}</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {loginMethod === 'phone' ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder={currentTexts.phoneNumber}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
            
            {showOTP && (
              <TextInput
                style={styles.input}
                placeholder={currentTexts.enterOtp}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
            )}
            
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={showOTP ? handleLogin : handleSendOTP}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Loading...' : showOTP ? currentTexts.verifyOtp : currentTexts.sendOtp}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.input}
              placeholder={currentTexts.email}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={currentTexts.password}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Loading...' : currentTexts.login}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // Lighter gray
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tab: {
    flexGrow: 1,
    flexBasis: '45%',
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
  },
  loginMethodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loginMethodButton: {
    flex: 1,
    margin: 4,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activeLoginMethod: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  loginMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  messageText: {
    color: '#065f46',
    textAlign: 'center',
    fontWeight: '500',
  },
});
