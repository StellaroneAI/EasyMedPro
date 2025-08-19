import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import authService from '../services/authService.js';
import twilioService from '../services/twilioService.js';
import demoUserService from '../services/demoUserService.js';
import otpDebugService from '../services/otpDebugService.js';
import emailOTPService from '../services/emailOTPService.js';
import firebaseSMSMonitor from '../services/firebaseSMSMonitor.js';
import { authenticateToken, validateRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Register new user
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('userType').isIn(['patient', 'asha', 'doctor']).withMessage('Invalid user type'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
    try {
      const { name, phone, email, userType, password, profile } = req.body;
      const user = {
        name,
        phone,
        email,
        userType,
        isPhoneVerified: false,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        profile: profile || {},
      };
      // Register user in Firestore
      const result = await require('../services/userService.firebase.js').registerUser(user);
      res.json({ success: true, user: result });
    } catch (error) {
 res.status(500).json({ success: false, message: error.message });
    }
  }
);
// Send OTP for phone verification
router.post('/login', [
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    let user;
    if (phone) {
      user = await require('../services/userService.firebase.js').findUserByPhone(phone);
    } else if (email) {
      user = await require('../services/userService.firebase.js').findUserByEmail(email);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Password check (if applicable)
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    // ...existing code for token generation...
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
      const user = await User.findOne({ phone });
      if (!user) {
        // Log failed attempt
        otpDebugService.logOTPEvent(phone, 'FAILED', 'User not found', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          error: 'user_not_found'
        });

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isLocked) {
        // Log locked account attempt
        otpDebugService.logOTPEvent(phone, 'FAILED', 'Account locked', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          error: 'account_locked'
        });

        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked'
        });
      }

      const otp = user.generateOTP();
      await user.save();

      const smsResult = await twilioService.sendOTP(phone, otp, user.name);

      // Log OTP attempt
      otpDebugService.logOTPEvent(phone, smsResult.success ? 'SENT' : 'FAILED', 
        smsResult.message || 'OTP send attempt', smsResult.success, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userType: user.userType,
        smsProvider: 'twilio',
        messageSid: smsResult.sid
      });

      res.json({
        success: true,
        message: 'OTP sent successfully',
        otpSent: smsResult.success,
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } else {
      // Use demo service
      let user = await demoUserService.findUser(phone);
      
      // If user doesn't exist, create a demo user
      if (!user) {
        user = await demoUserService.createUser({
          name: 'Demo User',
          phone,
          userType: 'patient', // Default to patient for new users
          password: null
        });
      }

      const otp = demoUserService.generateOTP(phone);
      const smsResult = await twilioService.sendOTP(phone, otp, user.name);

      // Log OTP attempt for demo mode
      otpDebugService.logOTPEvent(phone, smsResult.success ? 'SENT' : 'FAILED', 
        smsResult.message || 'Demo OTP send attempt', smsResult.success, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userType: user.userType,
        smsProvider: 'demo_mode'
      });

      res.json({
        success: true,
        message: 'OTP sent successfully',
        otpSent: smsResult.success,
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    }
   catch (error) {
    console.error('Send OTP error:', error);
    
    // Log error
    otpDebugService.logOTPEvent(req.body.phone || 'unknown', 'ERROR', 
      `Send OTP error: ${error.message}`, false, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], validateRequest, async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Check if phone is whitelisted (admin bypass)
    if (otpDebugService.isPhoneWhitelisted(phone)) {
      // For whitelisted numbers, accept any 6-digit OTP or specific bypass codes
      if (otp === '000000' || otp === '123456' || otp.length === 6) {
        // Log successful bypass
        otpDebugService.logOTPEvent(phone, 'VERIFIED_BYPASS', 'Admin whitelist - OTP verification bypassed', true, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          bypassReason: 'admin_whitelist',
          otpUsed: otp
        });

        // Create or find user for whitelisted phone
        // Firebase phone OTP verification
        const user = await require('../services/userService.firebase.js').findUserByPhone(phone);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        // For demo, assume OTP is always valid
        await require('../services/userService.firebase.js').updateUserProfile(phone, { isPhoneVerified: true });
        // Generate tokens (replace with Firebase Auth tokens if needed)
        const tokens = { accessToken: 'firebase-access-token', refreshToken: 'firebase-refresh-token' };
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.phone,
            name: user.name,
            phone: user.phone,
            email: user.email,
            userType: user.userType,
            isPhoneVerified: true,
            isEmailVerified: user.isEmailVerified,
            profile: user.profile
          },
          tokens
        });
          profile: user.profile
        },
        tokens
      });
    } else {
      // Use demo service
      const otpResult = demoUserService.verifyOTP(phone, otp);
      if (!otpResult.success) {
        otpDebugService.logOTPEvent(phone, 'VERIFY_FAILED', otpResult.message, false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          otpUsed: otp,
          mode: 'demo'
        });

        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      const user = await demoUserService.findUser(phone);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Log successful demo verification
      otpDebugService.logOTPEvent(phone, 'VERIFIED', 'Demo OTP verification successful', true, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userType: user.userType,
        mode: 'demo'
      });

      const tokens = authService.generateTokens(user.id, user.userType, {
        name: user.name,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified
      });

      await demoUserService.addRefreshToken(user, tokens.refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile
        },
        tokens
      });
    }
  catch (error) {
    console.error('OTP verification error:', error);
    
    otpDebugService.logOTPEvent(req.body.phone || 'unknown', 'ERROR', 
      `OTP verification error: ${error.message}`, false, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
);

// Login with email/password
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email is whitelisted (admin bypass)
    if (otpDebugService.isEmailWhitelisted(email)) {
      // For whitelisted emails, allow specific admin passwords
      const adminPasswords = ['admin123', 'dummy123', 'easymed2025', 'admin@123'];
      
      if (adminPasswords.includes(password)) {
        // Log successful bypass
        otpDebugService.logOTPEvent(email, 'EMAIL_BYPASS', 'Admin email whitelist login', true, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          bypassReason: 'email_whitelist'
        });

        // Create admin user info
        const adminUser = {
          id: 'admin_whitelist_' + Date.now(),
          name: email === 'gilboj@gmail.com' ? 'StellaroneAI Admin' : 'Admin User',
          phone: email === 'gilboj@gmail.com' ? '9060328119' : '0000000000',
          email: email,
          userType: 'admin',
          isPhoneVerified: true,
          isEmailVerified: true,
          profile: {
            role: 'super_admin',
            whitelisted: true
          }
        };

        const tokens = authService.generateTokens(adminUser.id, adminUser.userType, {
          name: adminUser.name,
          email: adminUser.email,
          isEmailVerified: true,
          whitelisted: true
        });

        return res.json({
          success: true,
          message: 'Admin email login successful (whitelisted)',
          user: adminUser,
          tokens
        });
      }
    }

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        otpDebugService.logOTPEvent(email, 'LOGIN_FAILED', 'User not found for email login', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          error: 'user_not_found'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (user.isLocked) {
        otpDebugService.logOTPEvent(email, 'LOGIN_FAILED', 'Account locked for email login', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          error: 'account_locked'
        });

        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        
        otpDebugService.logOTPEvent(email, 'LOGIN_FAILED', 'Invalid password for email login', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          userType: user.userType,
          error: 'invalid_password'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      await user.resetLoginAttempts();

      // Log successful email login
      otpDebugService.logOTPEvent(email, 'EMAIL_LOGIN', 'Email login successful', true, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userType: user.userType
      });

      const tokens = authService.generateTokens(user._id, user.userType, {
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      });

      user.refreshTokens.push({
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile
        },
        tokens
      });
    } else {
      // Use demo service
      const user = await demoUserService.findUser(email.toLowerCase());
      if (!user) {
        otpDebugService.logOTPEvent(email, 'LOGIN_FAILED', 'User not found for demo email login', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          error: 'user_not_found',
          mode: 'demo'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await demoUserService.comparePassword(user, password);
      if (!isPasswordValid) {
        otpDebugService.logOTPEvent(email, 'LOGIN_FAILED', 'Invalid password for demo email login', false, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          userType: user.userType,
          error: 'invalid_password',
          mode: 'demo'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Log successful demo email login
      otpDebugService.logOTPEvent(email, 'EMAIL_LOGIN', 'Demo email login successful', true, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userType: user.userType,
        mode: 'demo'
      });

      const tokens = authService.generateTokens(user.id, user.userType, {
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      });

      await demoUserService.addRefreshToken(user, tokens.refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile
        },
        tokens
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    
    otpDebugService.logOTPEvent(req.body.email || 'unknown', 'ERROR', 
      `Email login error: ${error.message}`, false, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Refresh access token
router.post('/refresh', validateRefreshToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Generate new access token
    const newAccessToken = authService.generateAccessToken(user._id, user.userType, {
      name: user.name,
      phone: user.phone,
      email: user.email,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      expiresIn: authService.jwtExpiresIn
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user.userId);

    if (refreshToken) {
      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens.filter(
        tokenObj => tokenObj.token !== refreshToken
      );
    } else {
      // Remove all refresh tokens (logout from all devices)
      user.refreshTokens = [];
    }

    await user.save();

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshTokens -otpCode');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], validateRequest, async (req, res) => {
  try {
    const { name, email, profile } = req.body;
    const user = await User.findById(req.user.userId);

    if (name) user.name = name;
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      user.email = email.toLowerCase();
      user.isEmailVerified = false;
    }
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

// OTP Debug Routes for Admin
// Get OTP statistics and logs
router.get('/otp-debug/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const timeframe = req.query.timeframe || '24h';
    const stats = otpDebugService.getOTPStats(timeframe);
    const recentLogs = otpDebugService.getRecentOTPLogs(20);

    res.json({
      success: true,
      data: {
        statistics: stats,
        recentLogs,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('OTP debug stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP statistics'
    });
  }
});

// Get full diagnostic report
router.get('/otp-debug/report', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const report = otpDebugService.generateDiagnosticReport();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('OTP debug report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate diagnostic report'
    });
  }
});

// Test SMS functionality
router.post('/otp-debug/test-sms', authenticateToken, [
  body('phoneNumber').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('message').optional().isLength({ min: 1, max: 160 }).withMessage('Message must be 1-160 characters')
], validateRequest, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { phoneNumber, message } = req.body;
    const testMessage = message || `Test SMS from EasyMedPro Admin at ${new Date().toLocaleString()}`;

    const result = await otpDebugService.testSMSDelivery(phoneNumber, testMessage);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('SMS test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test SMS'
    });
  }
});

// Admin whitelist management
router.post('/otp-debug/whitelist/add', authenticateToken, [
  body('phoneNumber').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number')
], validateRequest, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { phoneNumber } = req.body;
    const added = otpDebugService.addPhoneToWhitelist(phoneNumber);

    res.json({
      success: true,
      data: {
        phoneNumber,
        added,
        message: added ? 'Phone number added to whitelist' : 'Phone number already in whitelist'
      }
    });
  } catch (error) {
    console.error('Whitelist add error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add phone to whitelist'
    });
  }
});

router.delete('/otp-debug/whitelist/:phoneNumber', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { phoneNumber } = req.params;
    const removed = otpDebugService.removePhoneFromWhitelist(phoneNumber);

    res.json({
      success: true,
      data: {
        phoneNumber,
        removed,
        message: removed ? 'Phone number removed from whitelist' : 'Phone number not found in whitelist'
      }
    });
  } catch (error) {
    console.error('Whitelist remove error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove phone from whitelist'
    });
  }
});

// Emergency bypass creation
router.post('/otp-debug/emergency-bypass', authenticateToken, [
  body('identifier').isLength({ min: 1 }).withMessage('Identifier is required'),
  body('reason').optional().isLength({ min: 1, max: 200 }).withMessage('Reason must be 1-200 characters')
], validateRequest, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { identifier, reason } = req.body;
    const bypass = otpDebugService.createEmergencyBypass(identifier, reason);

    res.json({
      success: true,
      data: bypass
    });
  } catch (error) {
    console.error('Emergency bypass error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency bypass'
    });
  }
});

// Email OTP Routes
// Send OTP via email
router.post('/send-email-otp', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('userType').optional().isIn(['patient', 'asha', 'doctor', 'admin']).withMessage('Invalid user type')
], validateRequest, async (req, res) => {
  try {
    const { email, userType = 'patient' } = req.body;

    // Check if email is whitelisted (admin bypass)
    if (otpDebugService.isEmailWhitelisted(email)) {
      otpDebugService.logOTPEvent(email, 'EMAIL_BYPASSED', 'Admin email whitelist - OTP bypass used', true, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        bypassReason: 'email_whitelist'
      });

      return res.json({
        success: true,
        message: 'Admin email access - OTP bypass enabled',
        otpSent: true,
        bypass: true,
        ...(process.env.NODE_ENV === 'development' && { otp: '000000' })
      });
    }

    // Determine user name for personalized email
    let userName = 'User';
    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        userName = user.name;
      }
    } else {
      const user = await demoUserService.findUser(email.toLowerCase());
      if (user) {
        userName = user.name;
      }
    }

    // Send email OTP
    const result = await emailOTPService.sendOTPEmail(email, userType, userName);

    res.json({
      success: result.success,
      message: result.message,
      otpSent: result.success,
      ...(process.env.NODE_ENV === 'development' && result.otp && { otp: result.otp })
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    
    otpDebugService.logOTPEvent(req.body.email || 'unknown', 'ERROR', 
      `Send email OTP error: ${error.message}`, false, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send email OTP'
    });
  }
});

// Verify email OTP
router.post('/verify-email-otp', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], validateRequest, async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if email is whitelisted (admin bypass)
    if (otpDebugService.isEmailWhitelisted(email)) {
      // For whitelisted emails, accept any 6-digit OTP or specific bypass codes
      if (otp === '000000' || otp === '123456' || otp.length === 6) {
        otpDebugService.logOTPEvent(email, 'EMAIL_VERIFIED_BYPASS', 'Admin email whitelist - OTP verification bypassed', true, {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          bypassReason: 'email_whitelist',
          otpUsed: otp
        });

        // Create admin user info for whitelisted email
        const adminUser = {
          id: 'admin_email_' + Date.now(),
          name: email === 'gilboj@gmail.com' ? 'StellaroneAI Admin' : 'Admin User',
          phone: email === 'gilboj@gmail.com' ? '9060328119' : '0000000000',
          email: email,
          userType: 'admin',
          isPhoneVerified: false,
          isEmailVerified: true,
          profile: {
            role: 'super_admin',
            whitelisted: true,
            loginMethod: 'email'
          }
        };

        const tokens = authService.generateTokens(adminUser.id, adminUser.userType, {
          name: adminUser.name,
          email: adminUser.email,
          isEmailVerified: true,
          whitelisted: true
        });

        return res.json({
          success: true,
          message: 'Admin email verification successful (whitelisted)',
          user: adminUser,
          tokens
        });
      }
    }

    // Verify email OTP
    const verificationResult = emailOTPService.verifyEmailOTP(email, otp);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    // Find or create user
    let user;
    if (isMongoConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Create new user with email
        user = new User({
          name: verificationResult.userName || 'Email User',
          email: email.toLowerCase(),
          userType: verificationResult.userType || 'patient',
          isEmailVerified: true,
          phone: '', // No phone for email-only registration
          profile: {
            loginMethod: 'email'
          }
        });
        await user.save();
      } else {
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Demo mode
      user = await demoUserService.findUser(email.toLowerCase());
      if (!user) {
        user = await demoUserService.createUser({
          name: verificationResult.userName || 'Email User',
          email: email.toLowerCase(),
          userType: verificationResult.userType || 'patient',
          isEmailVerified: true,
          phone: ''
        });
      }
    }

    const tokens = authService.generateTokens(user._id || user.id, user.userType, {
      name: user.name,
      email: user.email,
      isEmailVerified: true
    });

    if (isMongoConnected()) {
      user.refreshTokens.push({
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await user.save();
    } else {
      await demoUserService.addRefreshToken(user, tokens.refreshToken);
    }

    res.json({
      success: true,
      message: 'Email verification successful',
      user: {
        id: user._id || user.id,
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        userType: user.userType,
        isPhoneVerified: user.isPhoneVerified || false,
        isEmailVerified: true,
        profile: user.profile
      },
      tokens
    });

  } catch (error) {
    console.error('Email OTP verification error:', error);
    
    otpDebugService.logOTPEvent(req.body.email || 'unknown', 'ERROR', 
      `Email OTP verification error: ${error.message}`, false, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Email OTP verification failed'
    });
  }
});

// Test email functionality
router.post('/otp-debug/test-email', authenticateToken, [
  body('email').isEmail().withMessage('Invalid email format'),
  body('message').optional().isLength({ min: 1, max: 200 }).withMessage('Message must be 1-200 characters')
], validateRequest, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { email, message } = req.body;
    const testMessage = message || `Test email from EasyMedPro Admin at ${new Date().toLocaleString()}`;

    const result = await emailOTPService.testEmail(email, testMessage);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

// Firebase SMS Monitoring Routes
// Get Firebase SMS statistics
router.get('/otp-debug/firebase-stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = firebaseSMSMonitor.getSMSStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Firebase stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Firebase statistics'
    });
  }
});

// Check Firebase billing status
router.get('/otp-debug/firebase-billing', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const billingStatus = await firebaseSMSMonitor.checkFirebaseBilling();

    res.json({
      success: billingStatus.success,
      data: billingStatus.success ? billingStatus.data : null,
      error: billingStatus.error || null
    });
  } catch (error) {
    console.error('Firebase billing check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Firebase billing'
    });
  }
});

// Test Firebase configuration
router.post('/otp-debug/test-firebase', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const configTest = await firebaseSMSMonitor.testFirebaseConfig();

    res.json({
      success: configTest.success,
      message: configTest.message,
      data: configTest.data || null
    });
  } catch (error) {
    console.error('Firebase config test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Firebase configuration'
    });
  }
});

// Get Firebase diagnostic report
router.get('/otp-debug/firebase-report', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const report = firebaseSMSMonitor.generateFirebaseReport();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Firebase report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Firebase report'
    });
  }
});

// Get quota status for specific phone number
router.get('/otp-debug/quota-status/:phoneNumber', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { phoneNumber } = req.params;
    
    if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const quotaStatus = firebaseSMSMonitor.getQuotaStatus(phoneNumber);

    res.json({
      success: true,
      data: quotaStatus
    });
  } catch (error) {
    console.error('Quota status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quota status'
    });
  }
});

// Reset SMS usage counters (emergency admin function)
router.post('/otp-debug/reset-counters', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const result = firebaseSMSMonitor.resetUsageCounters();

    res.json({
      success: true,
      message: 'Usage counters reset successfully',
      data: { reset: result }
    });
  } catch (error) {
    console.error('Reset counters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset usage counters'
    });
  }
});

export default router;