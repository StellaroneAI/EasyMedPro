/**
 * Vercel Serverless Function for Verifying SMS OTP
 * API: /api/sms/verify-otp
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import crypto from 'crypto-js';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for verification attempts
const verifyLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip || 'unknown',
  points: 10, // Number of attempts
  duration: 900, // Per 15 minutes
});

// OTP storage (same as send-otp - should be shared storage in production)
const otpStorage = new Map();

// User database simulation (in production, use MongoDB/PostgreSQL)
const userDatabase = new Map();

/**
 * Validate Indian phone number
 */
function validateIndianPhoneNumber(phoneNumber: string): { isValid: boolean; formatted?: string } {
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length === 10 && digits.match(/^[6-9]\d{9}$/)) {
    return { isValid: true, formatted: `+91${digits}` };
  } else if (digits.length === 12 && digits.startsWith('91') && digits.substring(2).match(/^[6-9]\d{9}$/)) {
    return { isValid: true, formatted: `+${digits}` };
  }
  
  return { isValid: false };
}

/**
 * Generate JWT tokens
 */
function generateTokens(user: any) {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-development';

  const token = jwt.sign(
    { 
      userId: user.id, 
      phone: user.phone, 
      userType: user.userType,
      name: user.name 
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, phone: user.phone },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { token, refreshToken };
}

/**
 * Create or update user in database
 */
function createOrUpdateUser(phoneNumber: string, userType: string): any {
  const existingUser = userDatabase.get(phoneNumber);
  
  if (existingUser) {
    // Update last login
    existingUser.lastLogin = new Date().toISOString();
    existingUser.loginCount = (existingUser.loginCount || 0) + 1;
    userDatabase.set(phoneNumber, existingUser);
    return existingUser;
  } else {
    // Create new user
    const newUser = {
      id: crypto.SHA256(phoneNumber + Date.now()).toString().substring(0, 24),
      phone: phoneNumber,
      userType,
      name: `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
      isVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      isActive: true
    };
    
    userDatabase.set(phoneNumber, newUser);
    return newUser;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Rate limiting
    await verifyLimiter.consume(req.ip || 'unknown');

    const { phoneNumber, otp, userType } = req.body;

    // Validate required fields
    if (!phoneNumber || !otp || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and user type are required'
      });
    }

    // Validate phone number
    const phoneValidation = validateIndianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Indian mobile number'
      });
    }

    const formattedPhone = phoneValidation.formatted!;
    const otpKey = `otp_${formattedPhone}`;
    const attemptKey = `attempts_${formattedPhone}`;

    // Get stored OTP data
    const storedOTPData = otpStorage.get(otpKey);
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    const now = Date.now();
    if (now > storedOTPData.expiresAt) {
      otpStorage.delete(otpKey);
      otpStorage.delete(attemptKey);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check attempt count
    let attempts = otpStorage.get(attemptKey) || 0;
    const maxAttempts = parseInt(process.env.SMS_MAX_RETRY_ATTEMPTS || '3');
    
    if (attempts >= maxAttempts) {
      otpStorage.delete(otpKey);
      otpStorage.delete(attemptKey);
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    const hashedInputOTP = crypto.SHA256(otp.toString()).toString();
    if (hashedInputOTP !== storedOTPData.otp) {
      attempts++;
      otpStorage.set(attemptKey, attempts);
      
      const remainingAttempts = maxAttempts - attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        remainingAttempts
      });
    }

    // OTP is valid - clean up
    otpStorage.delete(otpKey);
    otpStorage.delete(attemptKey);

    // Create or update user
    const user = createOrUpdateUser(formattedPhone, userType);

    // Generate JWT tokens
    const tokens = generateTokens(user);

    // Log successful authentication (without sensitive data)
    console.log(`Successful authentication for ${formattedPhone.replace(/\d(?=\d{4})/g, '*')} as ${userType}`);

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        userType: user.userType,
        name: user.name,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });

  } catch (rateLimiterRes) {
    if (rateLimiterRes?.remainingHits !== undefined) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification attempts. Please try again later.',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000)
      });
    }

    console.error('Error verifying OTP:', rateLimiterRes);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? rateLimiterRes.message : undefined
    });
  }
}