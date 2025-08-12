/**
 * Twilio SMS Service for EasyMedPro
 * Handles SMS OTP authentication for Indian healthcare users
 */

import { loginTexts } from '../translations/loginTexts';

interface SMSResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
}

class TwilioService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Validate Indian phone number format
   */
  validatePhoneNumber(phoneNumber: string): { isValid: boolean; formatted?: string; error?: string } {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check for Indian phone number patterns
    if (digits.length === 10 && digits.match(/^[6-9]\d{9}$/)) {
      return { 
        isValid: true, 
        formatted: `+91${digits}` 
      };
    } else if (digits.length === 12 && digits.startsWith('91') && digits.substring(2).match(/^[6-9]\d{9}$/)) {
      return { 
        isValid: true, 
        formatted: `+${digits}` 
      };
    } else if (digits.length === 13 && digits.startsWith('91') && digits.substring(3).match(/^[6-9]\d{9}$/)) {
      return { 
        isValid: true, 
        formatted: `+${digits.substring(1)}` 
      };
    }

    return {
      isValid: false,
      error: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)'
    };
  }

  /**
   * Get OTP message template based on language
   */
  private getOTPMessage(otp: string, language: string): string {
    const templates = {
      english: `Your EasyMed verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      hindi: `आपका EasyMed सत्यापन कोड है: ${otp}। 10 मिनट के लिए वैध। इस कोड को साझा न करें।`,
      tamil: `உங்கள் EasyMed சரிபார்ப்பு குறியீடு: ${otp}। 10 நிமிடங்களுக்கு செல்லுபடியாகும். இந்த குறியீட்டை பகிர வேண்டாம்।`,
      telugu: `మీ EasyMed ధృవీकరణ కోడ్: ${otp}. 10 నిమిషాలు చెల్లుబాటు. ఈ కోడ్‌ని పంచుకోవద్దు.`,
      bengali: `আপনার EasyMed যাচাইকরণ কোড: ${otp}। ১০ মিনিটের জন্য বৈধ। এই কোডটি শেয়ার করবেন না।`,
      marathi: `तुमचा EasyMed सत्यापन कोड: ${otp}. १० मिनिटांसाठी वैध. हा कोड शेअर करू नका।`,
      punjabi: `ਤੁਹਾਡਾ EasyMed ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ: ${otp}। 10 ਮਿੰਟਾਂ ਲਈ ਵੈਧ। ਇਹ ਕੋਡ ਸਾਂਝਾ ਨਾ ਕਰੋ।`,
      gujarati: `તમારો EasyMed વેરિફિકેશન કોડ: ${otp}. 10 મિનિટ માટે માન્ય. આ કોડ શેર ન કરો।`,
      kannada: `ನಿಮ್ಮ EasyMed ಪರಿಶೀಲನೆ ಕೋಡ್: ${otp}. 10 ನಿಮಿಷಗಳವರೆಗೆ ಮಾನ್ಯ. ಈ ಕೋಡ್ ಅನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ।`,
      malayalam: `നിങ്ങളുടെ EasyMed സ്ഥിരീകരണ കോഡ്: ${otp}. 10 മിനിറ്റ് സാധുവാണ്. ഈ കോഡ് പങ്കിടരുത്।`,
      odia: `ଆପଣଙ୍କର EasyMed ଯାଞ୍ଚ କୋଡ୍: ${otp}। 10 ମିନିଟ୍ ପାଇଁ ବୈଧ। ଏହି କୋଡ୍ ସେୟାର କରନ୍ତୁ ନାହିଁ।`,
      assamese: `আপোনাৰ EasyMed সত্যাপন ক'ড: ${otp}। 10 মিনিটৰ বাবে বৈধ। এই ক'ডটো শ্বেয়াৰ নকৰিব।`
    };

    return templates[language] || templates.english;
  }

  /**
   * Send SMS OTP to phone number
   */
  async sendOTP(phoneNumber: string, userType: string, language: string = 'english'): Promise<SMSResponse> {
    try {
      // Validate phone number
      const validation = this.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || 'Invalid phone number'
        };
      }

      const response = await fetch(`${this.baseUrl}/sms/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: validation.formatted,
          userType,
          language
        }),
      });

      const result = await response.json();
      
      // Store session token if OTP sent successfully
      if (result.success && result.sessionToken) {
        localStorage.setItem('easymed_otp_session', result.sessionToken);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Verify SMS OTP
   */
  async verifyOTP(phoneNumber: string, otp: string, userType: string): Promise<VerifyResponse> {
    try {
      // Validate phone number
      const validation = this.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || 'Invalid phone number'
        };
      }

      // Get session token from localStorage
      const sessionToken = localStorage.getItem('easymed_otp_session');
      if (!sessionToken) {
        return {
          success: false,
          message: 'No OTP session found. Please request a new OTP.'
        };
      }

      const response = await fetch(`${this.baseUrl}/sms/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: validation.formatted,
          otp,
          userType,
          sessionToken
        }),
      });

      const result = await response.json();
      
      // Store tokens if verification successful
      if (result.success && result.token) {
        localStorage.setItem('easymed_token', result.token);
        if (result.refreshToken) {
          localStorage.setItem('easymed_refresh_token', result.refreshToken);
        }
        if (result.user) {
          localStorage.setItem('easymed_user', JSON.stringify(result.user));
        }
        // Clear OTP session token
        localStorage.removeItem('easymed_otp_session');
      }

      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const refreshToken = localStorage.getItem('easymed_refresh_token');
      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token available'
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();
      
      if (result.success && result.token) {
        localStorage.setItem('easymed_token', result.token);
      }

      return result;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    localStorage.removeItem('easymed_token');
    localStorage.removeItem('easymed_refresh_token');
    localStorage.removeItem('easymed_user');
    localStorage.removeItem('easymed_otp_session'); // Clear OTP session as well
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('easymed_token');
    return !!token;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('easymed_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new TwilioService();