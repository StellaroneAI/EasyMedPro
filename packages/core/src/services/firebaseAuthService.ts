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
import { storage } from '../storage';

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
      // Standard 10 digit mobile number
      return {
        isValid: true,
        formatted: `+91${digits}`
      };
    } else if (
      digits.length === 11 &&
      digits.startsWith('0') &&
      digits.substring(1).match(/^[6-9]\d{9}$/)
    ) {
      // Number with leading zero (0XXXXXXXXXX)
      return {
        isValid: true,
        formatted: `+91${digits.substring(1)}`
      };
    } else if (
      digits.length === 12 &&
      digits.startsWith('91') &&
      digits.substring(2).match(/^[6-9]\d{9}$/)
    ) {
      // Number with country code (91XXXXXXXXXX)
      return {
        isValid: true,
        formatted: `+${digits}`
      };
    } else if (
      digits.length === 13 &&
      digits.startsWith('0') &&
      digits.substring(1, 3) === '91' &&
      digits.substring(3).match(/^[6-9]\d{9}$/)
    ) {
      // Number with leading zero and country code (0 91XXXXXXXXXX)
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
      console.log('🔥 Firebase sendOTP called:', { phoneNumber, userType, language });
      
      // Validate phone number
      const validation = this.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        console.error('❌ Phone validation failed:', validation.error);
        return {
          success: false,
          message: validation.error || 'Invalid phone number'
        };
      }

      console.log('✅ Phone number validated:', validation.formatted);

      // Initialize reCAPTCHA
      console.log('🤖 Initializing reCAPTCHA...');
      const recaptchaVerifier = await this.initializeRecaptcha();
      console.log('✅ reCAPTCHA initialized successfully');
      
      // Send SMS via Firebase
      console.log('📱 Sending SMS via Firebase to:', validation.formatted);
      const confirmationResult = await signInWithPhoneNumber(
        this.auth,
        validation.formatted!,
        recaptchaVerifier
      );

      // Store confirmation result for verification
      this.currentConfirmationResult = confirmationResult;
      console.log('✅ SMS sent successfully via Firebase');

      return {
        success: true,
        message: `Real SMS OTP sent successfully to ${validation.formatted}`,
        confirmationResult
      };
    } catch (error: any) {
      console.error('🚨 Firebase SMS Error:', error);
      
      // Handle specific Firebase errors
      const authError = error as AuthError;
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      switch (authError.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many SMS requests. Please try again later (Firebase rate limit).';
          break;
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format for Firebase.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
          // Reset reCAPTCHA
          this.recaptchaVerifier = null;
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'Firebase SMS quota exceeded. Please try again later.';
          break;
        case 'auth/web-storage-unsupported':
          errorMessage = 'Web storage not supported. Please enable cookies and try again.';
          break;
        default:
          errorMessage = `Firebase Error: ${authError.message || errorMessage}`;
      }

      console.error('🚨 Final error message:', errorMessage);

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
      
      // Try to fetch user profile from Firebase Realtime Database
      let userData = await this.fetchUserProfile(user.phoneNumber!, userType);
      
      // If no profile exists, create a default one
      if (!userData) {
        userData = await this.createUserProfile(user, userType);
      }

      // Clear confirmation result
      this.currentConfirmationResult = null;
      
      // Store user data using cross-platform storage
      await storage.setItem('easymed_user', JSON.stringify(userData));
      await storage.setItem('easymed_token', idToken);

      // Get refresh token if available
      if (user.refreshToken) {
        await storage.setItem('easymed_refresh_token', user.refreshToken);
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
   * Fetch user profile from Firebase Realtime Database
   */
  private async fetchUserProfile(phoneNumber: string, userType: string): Promise<any | null> {
    try {
      const { getDatabase, ref, get } = await import('firebase/database');
      const db = getDatabase();
      
      // Try to find user by phone number in the users collection
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        // Find user with matching phone number and user type
        for (const userId in users) {
          const userData = users[userId];
          if (userData.phone === phoneNumber && userData.userType === userType) {
            return {
              ...userData,
              id: userId,
              firebaseUid: this.auth.currentUser?.uid
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Create a default user profile for test users
   */
  private async createUserProfile(user: any, userType: string): Promise<any> {
    const testUserProfiles = {
      '+919060328119': {
        name: 'Super Admin',
        userType: 'admin',
        role: 'super_admin',
        phone: '+919060328119'
      },
      '+919611044219': {
        name: 'Dr. Rajesh Kumar',
        userType: 'doctor',
        role: 'doctor',
        phone: '+919611044219',
        specialization: ['General Medicine'],
        experience: 10
      },
      '+917550392336': {
        name: 'Sunita Devi',
        userType: 'asha',
        role: 'asha_worker',
        phone: '+917550392336',
        assignedArea: 'Block 1, District Health',
        experience: 5
      },
      '+919514070205': {
        name: 'Priya Sharma',
        userType: 'patient',
        role: 'patient',
        phone: '+919514070205',
        age: 32,
        gender: 'female'
      }
    };

    const phoneNumber = user.phoneNumber;
    const testProfile = testUserProfiles[phoneNumber as keyof typeof testUserProfiles];
    
    if (testProfile) {
      // Use the predefined test profile
      return {
        id: user.uid,
        name: testProfile.name,
        phone: phoneNumber,
        email: user.email,
        userType: testProfile.userType,
        role: testProfile.role,
        phoneVerified: true,
        firebaseUid: user.uid,
        ...testProfile
      };
    }

    // Create a generic profile for other phone numbers
    const defaultNames = {
      admin: 'Admin User',
      doctor: 'Dr. User',
      asha: 'ASHA Worker',
      patient: 'Patient User'
    };

    return {
      id: user.uid,
      name: defaultNames[userType as keyof typeof defaultNames] || 'User',
      phone: phoneNumber,
      email: user.email,
      userType: userType,
      role: userType,
      phoneVerified: true,
      firebaseUid: user.uid,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getItem('easymed_token');
    return !!(this.auth.currentUser && token);
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    const userStr = await storage.getItem('easymed_user');
    return userStr ? JSON.parse(userStr) : this.auth.currentUser;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      await storage.removeItem('easymed_user');
      await storage.removeItem('easymed_token');
      await storage.removeItem('easymed_refresh_token');
      
      // Clear confirmation result
      this.currentConfirmationResult = null;
      
      // Clear reCAPTCHA
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier = null;
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear storage anyway
      await storage.removeItem('easymed_user');
      await storage.removeItem('easymed_token');
      await storage.removeItem('easymed_refresh_token');
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
      await storage.setItem('easymed_token', idToken);

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