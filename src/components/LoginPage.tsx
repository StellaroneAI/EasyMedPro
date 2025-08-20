import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import authService from '@core/services/authService';
import firebaseAuthService from '@core/services/firebaseAuthService';
import { sendOtp, verifyOtp, secondsRemaining } from '@/utils/otp';
import EmergencyAdminAccess from './admin/EmergencyAdminAccess';
import { loginTexts, type LoginLanguageKey, type LoginTranslationKey } from '../translations/loginTexts';

interface LoginPageProps {
  onLogin: (userType: 'patient' | 'asha' | 'doctor' | 'admin', userInfo: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { currentLanguage } = useLanguage();
  const { loginAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'patient' | 'asha' | 'doctor' | 'admin'>('patient');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'emailOTP' | 'social'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneValidation, setPhoneValidation] = useState<{isValid: boolean; message?: string}>({isValid: false});
  const [emailValidation, setEmailValidation] = useState<{isValid: boolean; message?: string}>({isValid: false});
  const [showEmergencyAccess, setShowEmergencyAccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCooldown(secondsRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Removed AI voice (speakMessage)
  const speakMessage = (text: string) => {
    // Simple text-to-speech for mobile apps
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };
  // Popup message for OTP sent
  const [showPopup, setShowPopup] = useState(false);
  const showOtpPopup = (msg: string) => {
    setMessage(msg);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3500);
  };
  // ...existing code...
  // Example usage: showOtpPopup('OTP sent to your phone!');
  {/* Popup message */}
  {showPopup && (
    <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 9999, background: '#2563eb', color: 'white', padding: '1rem 2rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      {message}
    </div>
  )}

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (showOTP) {
        handleVerifyOTP();
      } else if (loginMethod === 'phone' && phoneNumber) {
        handleSendOTP();
      } else if (loginMethod === 'email' && email && password) {
        handleLogin();
      }
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    await handleLogin();
  };

  // Success messages in multiple languages
  const successMessages = {
    english: 'Login successful! Welcome to EasyMed.',
    hindi: 'लॉगिन सफल! EasyMed में आपका स्वागत है।',
    tamil: 'உள்நுழைவு வெற்றிகரமானது! EasyMed இல் உங்களை வரவேற்கிறோம்।',
    telugu: 'లాగిన్ విజయవంతమైంది! EasyMed కు స్వాగతం.',
    bengali: 'লগইন সফল! EasyMed এ আপনাকে স্বাগতম।',
    marathi: 'लॉगिन यशस्वी! EasyMed मध्ये आपले स्वागत आहे.',
    punjabi: 'ਲਾਗਇਨ ਸਫਲ! EasyMed ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।',
    gujarati: 'લોગિન સફળ! EasyMed માં તમારું સ્વાગત છે.',
    kannada: 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ! EasyMed ಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.',
    malayalam: 'ലോഗിൻ വിജയകരമായി! EasyMed ലേക്ക് സ്വാഗതം.',
    odia: 'ଲଗଇନ୍ ସଫଳ! EasyMed କୁ ସ୍ୱାଗତ।',
    assamese: 'লগইন সফল! EasyMed লৈ আপোনাক স্বাগতম।'
  };

  // Auto-read messages when they change
  useEffect(() => {
    if (message) {
      speakMessage(message);
      // Clear message after 5 seconds
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, currentLanguage]);

  // Validate phone number in real-time
  useEffect(() => {
    if (phoneNumber.length > 0) {
      const validation = firebaseAuthService.validatePhoneNumber(phoneNumber);
      setPhoneValidation({
        isValid: validation.isValid,
        message: validation.error
      });
    } else {
      setPhoneValidation({isValid: false});
    }
  }, [phoneNumber]);

  // Validate email in real-time
  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      setEmailValidation({
        isValid,
        message: isValid ? '' : 'Please enter a valid email address'
      });
    } else {
      setEmailValidation({isValid: false});
    }
  }, [email]);

  const getText = (key: LoginTranslationKey): string => {
    return loginTexts[currentLanguage as LoginLanguageKey]?.[key] || loginTexts.english[key];
  };

  const userTypes = [
    {
      id: 'patient' as const,
      icon: '👨‍👩‍👧‍👦',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'asha' as const,
      icon: '👩‍⚕️',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'doctor' as const,
      icon: '👨‍⚕️',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'admin' as const,
      icon: '🏛️',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    }
  ];

  // Multilingual OTP messages
  const otpMessages = {
    english: `OTP sent to ${phoneNumber}. Your verification code is ready.`,
    hindi: `${phoneNumber} पर OTP भेजा गया। आपका सत्यापन कोड तैयार है।`,
    tamil: `${phoneNumber} க்கு OTP அனுப்பப்பட்டது। உங்கள் சரிபார்ப்பு குறியீடு தயார்।`,
    telugu: `${phoneNumber} కు OTP పంపబడింది। మీ ధృవీకరణ కోడ్ సిద్ధంగా ఉంది।`,
    bengali: `${phoneNumber} এ OTP পাঠানো হয়েছে। আপনার যাচাইকরণ কোড প্রস্তুত।`,
    marathi: `${phoneNumber} वर OTP पाठवला गेला. तुमचा सत्यापन कोड तयार आहे.`,
    punjabi: `${phoneNumber} ਤੇ OTP ਭੇਜਿਆ ਗਿਆ। ਤੁਹਾਡਾ ਪੁਸ਼ਟੀ ਕੋਡ ਤਿਆਰ ਹੈ।`,
    gujarati: `${phoneNumber} પર OTP મોકલાયો. તમારો ચકાસણી કોડ તૈયાર છે.`,
    kannada: `${phoneNumber} ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಪರಿಶೀಲನೆ ಕೋಡ್ ಸಿದ್ಧವಾಗಿದೆ.`,
    malayalam: `${phoneNumber} ലേക്ക് OTP അയച്ചു. നിങ്ങളുടെ പരിശോധന കോഡ് തയ്യാറാണ്.`,
    odia: `${phoneNumber} କୁ OTP ପଠାଯାଇଛି। ଆପଣଙ୍କର ଯାଞ୍ଚ କୋଡ୍ ପ୍ରସ୍ତୁତ।`,
    assamese: `${phoneNumber} লৈ OTP পঠোৱা হৈছে। আপোনাৰ সত্যাপন কোড প্ৰস্তুত।`
  };

  const handleSendOTP = async () => {
    const validation = firebaseAuthService.validatePhoneNumber(phoneNumber);

    if (!validation.isValid) {
      alert(validation.error || 'Please enter a valid Indian mobile number (10 digits starting with 6-9)');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'admin' && phoneNumber === '9060328119') {
        setShowOTP(true);
        setMessage('Admin phone detected. Use OTP: 123456 for testing.');
        alert('📱 Admin phone detected. For testing, use OTP: 123456');
        setIsLoading(false);
        return;
      }

      await sendOtp(validation.formatted!);
      setShowOTP(true);
      setCooldown(secondsRemaining());

      const message = otpMessages[currentLanguage as keyof typeof otpMessages] || otpMessages.english;
      setMessage(message);

      alert(`📱 Real SMS OTP sent to ${validation.formatted}\n\nPlease check your phone for the verification code.\n\nValid for 10 minutes.`);
    } catch (error) {
      console.error('OTP send error:', error);
      setMessage('Network error occurred. Please try again.');
      alert('❌ Network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    // Validate email
    if (!emailValidation.isValid) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          userType: activeTab
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowOTP(true);
        
        // Set success message
        const message = `📧 Email OTP sent to ${email}. Please check your inbox and spam folder.`;
        setMessage(message);
        
        // Show success message
        alert(`📧 Email OTP sent to ${email}\n\nPlease check your email inbox and spam folder for the verification code.\n\nValid for 10 minutes.\n\n${process.env.NODE_ENV === 'development' && result.otp ? `Dev OTP: ${result.otp}` : ''}`);
      } else {
        // Show error message
        setMessage(`Error: ${result.message}`);
        alert(`❌ Failed to send email OTP: ${result.message}`);
      }
    } catch (error) {
      console.error('Email OTP send error:', error);
      setMessage('Network error occurred. Please try again.');
      alert('❌ Network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      let result = { success: false, message: '', user: null, userType: activeTab };

      // Handle all user types uniformly through Firebase authentication
      if (loginMethod === 'phone' && showOTP && otp) {
        if (activeTab === 'admin' && phoneNumber === '9060328119' && otp === '123456') {
          result = {
            success: true,
            message: 'Admin phone verification successful',
            user: {
              id: 'admin_1',
              name: 'Super Admin',
              phone: '+919060328119',
              email: 'admin@easymed.in',
              userType: 'admin',
              role: 'super_admin',
              phoneVerified: true
            },
            userType: 'admin'
          };
        } else {
          try {
            const response = await verifyOtp(phoneNumber, otp);
            if (response.success) {
              authService.storeAuthData(response.user, { accessToken: response.token, refreshToken: response.refreshToken });
              result = {
                success: true,
                message: response.message,
                user: response.user,
                userType: response.user.userType || activeTab
              };
            } else {
              result = {
                success: false,
                message: response.message,
                user: null,
                userType: activeTab
              };
            }
          } catch (error) {
            console.error('OTP verification error:', error);
            result = {
              success: false,
              message: 'OTP verification failed',
              user: null,
              userType: activeTab
            };
          }
        }
      } else if (loginMethod === 'emailOTP' && showOTP && otp) {
        // Email OTP verification
        try {
          const response = await fetch('/api/auth/verify-email-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              otp: otp
            })
          });

          const emailResult = await response.json();
          if (emailResult.success) {
            result = {
              success: true,
              message: 'Email OTP verification successful',
              user: emailResult.user,
              userType: emailResult.user.userType
            };
          } else {
            result = {
              success: false,
              message: emailResult.message,
              user: null,
              userType: activeTab
            };
          }
        } catch (error) {
          console.error('Email OTP verification error:', error);
          result = {
            success: false,
            message: 'Email OTP verification failed',
            user: null,
            userType: activeTab
          };
        }
      } else if (loginMethod === 'email' && email && password) {
        // Email/password login - check for admin backdoor credentials first
        if (activeTab === 'admin' && 
            (email === 'admin@easymed.in' || email === 'admin@gmail.com' || email === 'superadmin@easymed.in' || email === 'praveen@stellaronehealth.com' || email === 'gilboj@gmail.com') && 
            (password === 'admin123' || password === 'easymed2025' || password === 'admin@123' || password === 'dummy123')) {
          // Special case for admin email credentials (backwards compatibility)
          result = {
            success: true,
            message: 'Admin login successful',
            user: {
              id: 'admin_1',
              name: email === 'praveen@stellaronehealth.com' ? 'Praveen - StellarOne Health' : 
                    email === 'gilboj@gmail.com' ? 'StellaroneAI Admin' : 'Super Admin (Email)',
              phone: email === 'gilboj@gmail.com' ? '9060328119' : '9000000000',
              email,
              userType: 'admin',
              role: 'super_admin'
            },
            userType: 'admin'
          };
          
          // Also login to AdminContext
          try {
            await loginAdmin(email, result.user, password);
          } catch (adminError) {
            console.log('AdminContext login failed, but proceeding with main login');
          }
        } else {
          // Regular email/password login through Firebase
          console.log('Attempting email login:', { email, userType: activeTab });
          result = await authService.loginWithEmail(email, password);
        }
      } else if (loginMethod === 'phone' && phoneNumber && !showOTP) {
        // Phone login without OTP - send OTP first
        alert('Please click "Send OTP" first to receive your verification code via SMS.');
        setIsLoading(false);
        return;
      } else if (loginMethod === 'emailOTP' && email && !showOTP) {
        // Email OTP without OTP - send email OTP first
        alert('Please click "Send Email OTP" first to receive your verification code via email.');
        setIsLoading(false);
        return;
      } else {
        result = {
          success: false,
          message: 'Please fill in all required fields',
          user: null,
          userType: activeTab
        };
      }

      if (result.success && result.user) {
        console.log('✅ Login successful:', result);
        
        // For admin users, also authenticate in AdminContext if needed
        if (result.user.userType === 'admin') {
          try {
            await loginAdmin(result.user.phone || result.user.email, result.user, 'admin123');
          } catch (adminError) {
            console.log('AdminContext login error:', adminError);
          }
        }
        
        // Set and speak success message
        const successMsg = successMessages[currentLanguage as keyof typeof successMessages] || successMessages.english;
        setMessage(successMsg);
        
        setTimeout(() => {
          onLogin(result.userType || activeTab, result.user);
        }, 1000);
      } else {
        console.error('❌ Login failed:', result.message);
        
        // Handle different error cases
        if (result.message.includes('OTP')) {
          setMessage(result.message);
        } else {
          // Provide helpful guidance for all user types
          let helpMessage = 'Login failed. ';
          if (loginMethod === 'phone') {
            helpMessage += 'For phone login:\n1. Enter your 10-digit phone number\n2. Click "Send OTP"\n3. Enter the OTP received via SMS\n4. Click "Verify OTP"\n\nTest phone numbers:\n• Admin: 9060328119\n• Doctor: 9611044219\n• ASHA: 7550392336\n• Patient: 9514070205';
          } else if (loginMethod === 'emailOTP') {
            helpMessage += 'For email OTP login:\n1. Enter your email address\n2. Click "Send Email OTP"\n3. Check your email for the OTP\n4. Enter the OTP and click "Verify"';
          } else if (loginMethod === 'email') {
            if (activeTab === 'admin') {
              helpMessage += 'For admin email login, use:\n• admin@easymed.in / admin123\n• praveen@stellaronehealth.com / dummy123\n• Or try phone login with: 9060328119';
            } else {
              helpMessage += 'Please check your email and password, or try phone/email OTP login instead.';
            }
          }
          alert(helpMessage);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed due to a network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    
    // Simulate social login
    setTimeout(() => {
      const userInfo = {
        loginMethod: 'social',
        provider,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        timestamp: new Date().toISOString()
      };
      onLogin(activeTab, userInfo);
      setIsLoading(false);
    }, 1500);
  };

  const handleSignup = () => {
    // Redirect to registration page (replace with your route)
    window.location.href = '/register';
  };

  const handleEmergencyLogin = async (credentials: { identifier: string; password: string }) => {
    try {
      const success = await loginAdmin(credentials.identifier, {
        name: credentials.identifier === '9060328119' ? 'Super Admin' : 'Emergency Admin',
        phone: credentials.identifier.includes('@') ? '9060328119' : credentials.identifier,
        email: credentials.identifier.includes('@') ? credentials.identifier : 'admin@easymed.in'
      }, credentials.password);

      if (success) {
        onLogin('admin', {
          name: credentials.identifier === '9060328119' ? 'Super Admin' : 'Emergency Admin',
          phone: credentials.identifier.includes('@') ? '9060328119' : credentials.identifier,
          email: credentials.identifier.includes('@') ? credentials.identifier : 'admin@easymed.in'
        });
        setShowEmergencyAccess(false);
      }
    } catch (error) {
      console.error('Emergency login failed:', error);
    }
  };

  // Show emergency access if requested
  if (showEmergencyAccess) {
    return <EmergencyAdminAccess onEmergencyLogin={handleEmergencyLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Hidden reCAPTCHA container for Firebase phone auth */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H11V21H5V3H13V9H21ZM14 13V15H12V17H14V19H16V17H18V15H16V13H14ZM19.5 19.5L17.5 17.5L19 16L19.5 16.5L22 14L23.5 15.5L19.5 19.5Z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {getText('welcome')}
          </h1>
          <p className="text-gray-600 text-sm">{getText('tagline')}</p>
          
          {/* Admin Privilege Indicator */}
          {activeTab === 'admin' && (
            <div className="mt-3 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-800 text-sm font-bold flex items-center justify-center mb-2">
                <span className="mr-2">👑</span>
                Admin Login Options
              </p>
              <div className="text-blue-700 text-xs space-y-1">
                <p><strong>📱 Phone:</strong> 9060328119 (Auto login)</p>
                <p><strong>📧 Email:</strong> admin@easymed.in, praveen@stellaronehealth.com</p>
                <p><strong>🔑 Password:</strong> admin123, dummy123</p>
                <p className="text-blue-600 mt-2">Alternative: admin@gmail.com / easymed2025</p>
              </div>
            </div>
          )}
        </div>

        {/* User Type Selection */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-xl mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Select User Type</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {userTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  activeTab === type.id
                    ? `bg-gradient-to-br ${type.bgColor} ${type.borderColor} border-opacity-50 scale-105 shadow-lg`
                    : 'bg-white/50 border-gray-200 hover:bg-white/80'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-2 ${activeTab === type.id ? 'scale-110' : ''} transition-transform`}>
                    {type.icon}
                  </div>
                  <div className={`text-xs font-semibold ${
                    activeTab === type.id 
                      ? `bg-gradient-to-r ${type.color} bg-clip-text text-transparent`
                      : 'text-gray-600'
                  }`}>
                    {getText(type.id)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* User Type Description */}
          <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
            <p className="text-xs text-gray-600">{getText(`${activeTab}Desc` as LoginTranslationKey)}</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-xl">
          {/* Login Method Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setLoginMethod('phone')}
              className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              📱 {getText('phoneLogin')}
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              ✉️ {getText('emailLogin')}
            </button>
            <button
              onClick={() => setLoginMethod('emailOTP')}
              className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                loginMethod === 'emailOTP'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              📧 Email OTP
            </button>
            <button
              onClick={() => setLoginMethod('social')}
              className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                loginMethod === 'social'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              🌐 Social
            </button>
          </div>

          {/* Phone Login */}
          {loginMethod === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('phoneNumber')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">🇮🇳 +91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-16 pr-12 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      phoneNumber.length === 0 
                        ? 'border-gray-200 focus:ring-blue-500' 
                        : phoneValidation.isValid 
                          ? 'border-green-300 focus:ring-green-500 bg-green-50/50' 
                          : 'border-red-300 focus:ring-red-500 bg-red-50/50'
                    }`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {phoneNumber.length > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {phoneValidation.isValid ? '✅' : '❌'}
                    </span>
                  )}
                </div>
                {/* Phone validation message */}
                {phoneNumber.length > 0 && !phoneValidation.isValid && phoneValidation.message && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {phoneValidation.message}
                  </p>
                )}
              </div>

              {!showOTP ? (
                <button
                  onClick={handleSendOTP}
                  disabled={!phoneValidation.isValid || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending OTP via SMS...</span>
                    </div>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>📱</span>
                      <span>{getText('sendOtp')}</span>
                    </span>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('enterOtp')}
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={otp.length < 6 || isLoading}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[0.98] transition-all flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      getText('verifyOtp')
                    )}
                  </button>
                  
                  {/* Resend OTP Button */}
                  <button
                    onClick={() => {
                      setOtp('');
                      setShowOTP(false);
                      handleSendOTP();
                    }}
                    disabled={isLoading || cooldown > 0}
                    className="w-full py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors disabled:opacity-50"
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Didn't receive OTP? Resend"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Email OTP Login */}
          {loginMethod === 'emailOTP' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address for OTP
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      email.length === 0 
                        ? 'border-gray-200 focus:ring-blue-500' 
                        : emailValidation.isValid 
                          ? 'border-green-300 focus:ring-green-500 bg-green-50/50' 
                          : 'border-red-300 focus:ring-red-500 bg-red-50/50'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {email.length > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailValidation.isValid ? '✅' : '❌'}
                    </span>
                  )}
                </div>
                {/* Email validation message */}
                {email.length > 0 && !emailValidation.isValid && emailValidation.message && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {emailValidation.message}
                  </p>
                )}
                {/* Special message for StellaroneAI */}
                {email === 'gilboj@gmail.com' && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <span className="mr-1">🔓</span>
                    Admin email whitelist - bypass enabled
                  </p>
                )}
              </div>

              {!showOTP ? (
                <button
                  onClick={handleSendEmailOTP}
                  disabled={!emailValidation.isValid || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending Email OTP...</span>
                    </div>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>📧</span>
                      <span>Send Email OTP</span>
                    </span>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Email OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={otp.length < 6 || isLoading}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[0.98] transition-all flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Email OTP'
                    )}
                  </button>
                  
                  {/* Resend Email OTP Button */}
                  <button
                    onClick={() => {
                      setOtp('');
                      setShowOTP(false);
                      handleSendEmailOTP();
                    }}
                    disabled={isLoading}
                    className="w-full py-2 text-green-600 font-medium hover:text-green-700 transition-colors disabled:opacity-50"
                  >
                    Didn't receive email? Resend OTP
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Email Login */}
          {loginMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={!email || !password || isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[0.98] transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  getText('login')
                )}
              </button>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div className={`mt-4 p-4 rounded-xl text-center font-medium ${
              message.includes('success') || message.includes('successfully') || message.includes('welcome')
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{getText('continueWith')}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuNDMgMTBDNC40MyA5LjE4IDQuNjEgOC40MiA0LjkzIDcuNzNMMS4zMSA0Ljk1QzAuNDggNi40NSAwIDguMTcgMCAxMEMwIDExLjgzIDAuNDggMTMuNTUgMS4zMSAxNS4wNUw0LjkzIDEyLjI3QzQuNjEgMTEuNTggNC40MyAxMC44MiA0LjQzIDEwWiIgZmlsbD0iI0ZCQkMwNCIvPgo8cGF0aCBkPSJNMTAgNC4xM0MxMS41NSA0LjEzIDEyLjk5IDQuNzMgMTQuMTIgNS43N0wxNy4zNiAyLjUzQzE1LjUxIDEuMDYgMTIuOTMgMC4yNSAxMCAwLjI1QzYuMDkgMC4yNSAyLjcxIDIuNDcgMS4zMSA1LjA1TDQuOTMgNy43M0M1Ljc5IDUuNTMgNy43IDQuMTMgMTAgNC4xM1oiIGZpbGw9IiNFQTQzMzUiLz4KPHN0YXRoIGQ9Ik0xMCAxNS44N0M3LjcgMTUuODcgNS43OSAxNC40NyA0LjkzIDEyLjI3TDEuMzEgMTUuMDVDMi43MSAxNy41MyA2LjA5IDE5Ljc1IDEwIDE5Ljc1QzEyLjgyIDE5Ljc1IDE1LjM1IDE4Ljk3IDE3LjI5IDE3LjU0TDEzLjkgMTQuODdDMTIuODggMTUuNTEgMTEuNDggMTUuODcgMTAgMTUuODdaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGQ9Ik0xNy4yOSAyLjQ2TDEzLjkgNS4xM0MxMi44OCA0LjQ5IDExLjQ4IDQuMTMgMTAgNC4xM1Y0LjEzVjE1Ljg3QzExLjQ4IDE1Ljg3IDEyLjg4IDE1LjUxIDEzLjkgMTQuODdMMTcuMjkgMTcuNTRDMTkuMDggMTYuMTYgMjAuMDcgMTMuNjggMjAuMDcgMTBTMTkuMDggMy44NCAxNy4yOSAyLjQ2WiIgZmlsbD0iIzQyODVGNCIvPgo8L3N2Zz4K" alt="Google" className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span className="text-xl">f</span>
                )}
              </button>
              
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="flex items-center justify-center py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span className="text-xl">🍎</span>
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {getText('dontHaveAccount')}{' '}
              <button 
                onClick={handleSignup}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
              >
                {getText('signUp')}
              </button>
            </p>
          </div>

          {/* Emergency Admin Access */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => setShowEmergencyAccess(true)}
              className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto"
            >
              <span>🚨</span>
              <span>Emergency Admin Access</span>
            </button>
            <p className="text-xs text-gray-400 mt-1">For authorized personnel only</p>
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">{getText('terms')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
