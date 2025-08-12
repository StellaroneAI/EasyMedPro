/**
 * Firebase Phone Authentication Service for EasyMedPro
 * Replaces demo OTP system with real Firebase SMS authentication
 */

import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
  RecaptchaVerifier,
  Auth,
  AuthError,
  UserCredential
} from 'firebase/auth';
import auth from './firebaseConfig';

interface SMSResponse {
  success: boolean;
  message: string;
  confirmationResult?: ConfirmationResult;
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

class FirebaseAuthService {
  private auth: Auth;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private currentConfirmationResult: ConfirmationResult | null = null;

  constructor() {
    this.auth = auth;
  }

  /**
   * Initialize reCAPTCHA verifier for phone authentication
   */
  private async initializeRecaptcha(): Promise<RecaptchaVerifier> {
    if (this.recaptchaVerifier) {
      return this.recaptchaVerifier;
    }

    try {
      // Create reCAPTCHA container if it doesn't exist
      let recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        recaptchaContainer.style.display = 'none'; // Hide for invisible reCAPTCHA
        document.body.appendChild(recaptchaContainer);
      }

      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved:', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          this.recaptchaVerifier = null;
        }
      });

      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      throw new Error('Failed to initialize reCAPTCHA verification');
    }
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
   * Send SMS OTP using Firebase Phone Authentication
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

      // Initialize reCAPTCHA
      const recaptchaVerifier = await this.initializeRecaptcha();
      
      // Send SMS via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        this.auth,
        validation.formatted!,
        recaptchaVerifier
      );

      // Store confirmation result for verification
      this.currentConfirmationResult = confirmationResult;

      return {
        success: true,
        message: `OTP sent successfully to ${validation.formatted}`,
        confirmationResult
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Firebase errors
      const authError = error as AuthError;
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      switch (authError.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many SMS requests. Please try again later.';
          break;
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'reCAPTCHA verification failed. Please try again.';
          // Reset reCAPTCHA
          this.recaptchaVerifier = null;
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Please try again later.';
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
        error: authError.code
      };
    }
  }

  /**
   * Verify SMS OTP using Firebase
   */
  async verifyOTP(phoneNumber: string, otp: string, userType: string): Promise<VerifyResponse> {
    try {
      if (!this.currentConfirmationResult) {
        return {
          success: false,
          message: 'No OTP session found. Please request a new OTP.'
        };
      }

      // Verify the OTP
      const userCredential: UserCredential = await this.currentConfirmationResult.confirm(otp);
      const user = userCredential.user;

      // Get Firebase auth token
      const idToken = await user.getIdToken();
      
      // Create user object
      const userData = {
        id: user.uid,
        name: user.displayName || `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
        phone: user.phoneNumber,
        email: user.email,
        userType: userType,
        phoneVerified: true,
        firebaseUid: user.uid
      };

      // Clear confirmation result
      this.currentConfirmationResult = null;
      
      // Store user data in localStorage
      localStorage.setItem('easymed_user', JSON.stringify(userData));
      localStorage.setItem('easymed_token', idToken);
      
      // Get refresh token if available
      if (user.refreshToken) {
        localStorage.setItem('easymed_refresh_token', user.refreshToken);
      }

      return {
        success: true,
        message: 'Phone number verified successfully',
        token: idToken,
        refreshToken: user.refreshToken,
        user: userData
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      const authError = error as AuthError;
      let errorMessage = 'Invalid OTP. Please try again.';
      
      switch (authError.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid OTP code. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'OTP has expired. Please request a new one.';
          break;
        case 'auth/session-expired':
          errorMessage = 'Verification session expired. Please start again.';
          this.currentConfirmationResult = null;
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
        error: authError.code
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.auth.currentUser && localStorage.getItem('easymed_token'));
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('easymed_user');
    return userStr ? JSON.parse(userStr) : this.auth.currentUser;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      localStorage.removeItem('easymed_user');
      localStorage.removeItem('easymed_token');
      localStorage.removeItem('easymed_refresh_token');
      
      // Clear confirmation result
      this.currentConfirmationResult = null;
      
      // Clear reCAPTCHA
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier = null;
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear localStorage anyway
      localStorage.removeItem('easymed_user');
      localStorage.removeItem('easymed_token');
      localStorage.removeItem('easymed_refresh_token');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found'
        };
      }

      const idToken = await user.getIdToken(true); // Force refresh
      localStorage.setItem('easymed_token', idToken);

      return {
        success: true,
        token: idToken
      };
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }

  /**
   * Clean up reCAPTCHA on page unload
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

// Create and export singleton instance
const firebaseAuthService = new FirebaseAuthService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    firebaseAuthService.cleanup();
  });
}

export default firebaseAuthService;