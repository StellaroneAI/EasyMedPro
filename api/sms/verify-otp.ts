/**
 * Vercel Serverless Function for Verifying SMS OTP
 * API: /api/sms/verify-otp
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import crypto from 'crypto-js';

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
 * Verify OTP session token (stateless verification)
 */
function verifyOTPSession(sessionToken: string): { valid: boolean; session?: any; error?: string } {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    const decoded = jwt.verify(sessionToken, jwtSecret) as any;
    
    // Check if session is expired
    const now = Date.now();
    if (now > decoded.expiresAt) {
      return { valid: false, error: 'OTP session expired' };
    }
    
    return { valid: true, session: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid session token' };
  }
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
 * Create or get user data (stateless approach)
 */
function createOrUpdateUser(phoneNumber: string, userType: string): any {
  // In a stateless approach, we create a new user object each time
  // In production, this would query/create in a database
  const userId = crypto.SHA256(phoneNumber + userType).toString().substring(0, 24);
  
  return {
    id: userId,
    phone: phoneNumber,
    userType,
    name: `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    loginCount: 1,
    isActive: true
  };
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
    const { phoneNumber, otp, userType, sessionToken } = req.body;

    // Validate required fields
    if (!phoneNumber || !otp || !userType || !sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, user type, and session token are required'
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

    // Verify OTP session token
    const sessionResult = verifyOTPSession(sessionToken);
    if (!sessionResult.valid) {
      return res.status(400).json({
        success: false,
        message: sessionResult.error || 'Invalid or expired session'
      });
    }

    const otpSession = sessionResult.session!;

    // Verify phone number matches session
    if (otpSession.phone !== formattedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number does not match session'
      });
    }

    // Verify user type matches session
    if (otpSession.userType !== userType) {
      return res.status(400).json({
        success: false,
        message: 'User type does not match session'
      });
    }

    // Verify OTP
    const hashedInputOTP = crypto.SHA256(otp.toString()).toString();
    if (hashedInputOTP !== otpSession.otpHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is valid - create user and generate tokens
    const user = createOrUpdateUser(formattedPhone, userType);
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

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}