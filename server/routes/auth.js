import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import authService from '../services/authService.js';
import twilioService from '../services/twilioService.js';
import demoUserService from '../services/demoUserService.js';
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

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({
        $or: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this phone number or email'
        });
      }

      const user = new User({
        name,
        phone,
        email,
        userType,
        password,
        profile: profile || {}
      });

      const otp = user.generateOTP();
      await user.save();

      const smsResult = await twilioService.sendOTP(phone, otp, name);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your phone number.',
        userId: user._id,
        otpSent: smsResult.success,
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } else {
      // Use demo service
      const existingUser = await demoUserService.findUser(phone);
      if (existingUser || (email && await demoUserService.findUser(email))) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this phone number or email'
        });
      }

      const user = await demoUserService.createUser({
        name,
        phone,
        email,
        userType,
        password,
        profile: profile || {}
      });

      const otp = demoUserService.generateOTP(phone);
      const smsResult = await twilioService.sendOTP(phone, otp, name);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your phone number.',
        userId: user.id,
        otpSent: smsResult.success,
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Send OTP for phone verification
router.post('/send-otp', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number')
], validateRequest, async (req, res) => {
  try {
    const { phone } = req.body;

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked'
        });
      }

      const otp = user.generateOTP();
      await user.save();

      const smsResult = await twilioService.sendOTP(phone, otp, user.name);

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

      res.json({
        success: true,
        message: 'OTP sent successfully',
        otpSent: smsResult.success,
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
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

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked'
        });
      }

      const otpResult = user.verifyOTP(otp);
      if (!otpResult.success) {
        await user.save();
        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      await user.resetLoginAttempts();
      await user.save();

      const tokens = authService.generateTokens(user._id, user.userType, {
        name: user.name,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified
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
      const otpResult = demoUserService.verifyOTP(phone, otp);
      if (!otpResult.success) {
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
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
});

// Login with email/password
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      await user.resetLoginAttempts();

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
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await demoUserService.comparePassword(user, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

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

export default router;