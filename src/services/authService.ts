/**
 * Real Authentication Service for EasyMedPro Frontend
 * Replaces the mock database with actual API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AuthenticationService {
  constructor() {
    this.token = localStorage.getItem('easymed_token');
    this.refreshToken = localStorage.getItem('easymed_refresh_token');
    this.user = JSON.parse(localStorage.getItem('easymed_user') || 'null');
  }

  // API call helper
  async apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.message === 'Token expired' && this.refreshToken) {
        const refreshResult = await this.refreshAccessToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          config.headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, config);
          return retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  // Store authentication data
  storeAuthData(user, tokens) {
    this.user = user;
    this.token = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    localStorage.setItem('easymed_user', JSON.stringify(user));
    localStorage.setItem('easymed_token', tokens.accessToken);
    localStorage.setItem('easymed_refresh_token', tokens.refreshToken);
  }

  // Clear authentication data
  clearAuthData() {
    this.user = null;
    this.token = null;
    this.refreshToken = null;

    localStorage.removeItem('easymed_user');
    localStorage.removeItem('easymed_token');
    localStorage.removeItem('easymed_refresh_token');
  }

  // Register new user
  async register(userData) {
    try {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: userData
      });

      if (response.success) {
        // Registration successful, OTP sent
        return {
          success: true,
          message: response.message,
          userId: response.userId,
          otpSent: response.otpSent,
          requiresOTP: true
        };
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  // Send OTP for phone verification
  async sendOTP(phone) {
    try {
      const response = await this.apiCall('/auth/send-otp', {
        method: 'POST',
        body: { phone }
      });

      return response;
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  // Verify OTP and complete login
  async verifyOTP(phone, otp) {
    try {
      const response = await this.apiCall('/auth/verify-otp', {
        method: 'POST',
        body: { phone, otp }
      });

      if (response.success && response.user && response.tokens) {
        this.storeAuthData(response.user, response.tokens);
        return {
          success: true,
          message: response.message,
          user: response.user,
          userType: response.user.userType
        };
      }

      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'OTP verification failed'
      };
    }
  }

  // Email/password login
  async loginWithEmail(email, password) {
    try {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success && response.user && response.tokens) {
        this.storeAuthData(response.user, response.tokens);
        return {
          success: true,
          message: response.message,
          user: response.user,
          userType: response.user.userType
        };
      }

      return response;
    } catch (error) {
      console.error('Email login error:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        return { success: false, message: 'No refresh token available' };
      }

      const response = await this.apiCall('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: this.refreshToken }
      });

      if (response.success && response.accessToken) {
        this.token = response.accessToken;
        localStorage.setItem('easymed_token', response.accessToken);
        return { success: true };
      }

      // Refresh failed, clear auth data
      this.clearAuthData();
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  // Logout
  async logout() {
    try {
      if (this.refreshToken) {
        await this.apiCall('/auth/logout', {
          method: 'POST',
          body: { refreshToken: this.refreshToken }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }

    return { success: true, message: 'Logged out successfully' };
  }

  // Get current user profile
  async getProfile() {
    try {
      if (!this.token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await this.apiCall('/auth/profile');
      return response;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        message: 'Failed to fetch profile'
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await this.apiCall('/auth/profile', {
        method: 'PUT',
        body: profileData
      });

      if (response.success && response.user) {
        this.user = response.user;
        localStorage.setItem('easymed_user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Failed to update profile'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Legacy compatibility methods for existing frontend code
  async authenticateUser(identifier, userType) {
    // For phone numbers, send OTP first
    if (/^[6-9]\d{9}$/.test(identifier)) {
      const otpResult = await this.sendOTP(identifier);
      if (otpResult.success) {
        return {
          requiresOTP: true,
          phone: identifier,
          userType: userType,
          message: 'OTP sent to your phone'
        };
      }
      return null;
    }

    // For email, we need a password (this should be handled by the login form)
    return null;
  }

  // Demo credentials compatibility (for gradual migration)
  async checkDemoCredentials(identifier, userType) {
    // This method helps with backward compatibility
    // In a real migration, you'd check if demo users exist in the real database
    const demoUsers = {
      'patient@demo.com': { userType: 'patient', name: 'Demo Patient' },
      '9876543210': { userType: 'patient', name: 'Demo Patient' },
      'doctor@demo.com': { userType: 'doctor', name: 'Demo Doctor' },
      '9876543230': { userType: 'doctor', name: 'Demo Doctor' },
      'asha@demo.com': { userType: 'asha', name: 'Demo ASHA Worker' },
      '9876543220': { userType: 'asha', name: 'Demo ASHA Worker' },
      'admin@easymed.in': { userType: 'admin', name: 'Super Admin' },
      '9060328119': { userType: 'admin', name: 'Super Admin' }
    };

    const user = demoUsers[identifier];
    return user && user.userType === userType ? user : null;
  }

  // Get API base URL for external use
  getApiBaseUrl() {
    return API_BASE_URL;
  }
}

// Create and export singleton instance
const authService = new AuthenticationService();
export default authService;