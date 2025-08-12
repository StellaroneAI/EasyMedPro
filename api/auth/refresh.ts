/**
 * Vercel Serverless Function for Refreshing JWT Token
 * API: /api/auth/refresh
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// User database simulation (should match verify-otp)
const userDatabase = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-development';
    
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Get user data
    const user = userDatabase.get(decoded.phone);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new access token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone, 
        userType: user.userType,
        name: user.name 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Log token refresh (without sensitive data)
    console.log(`Token refreshed for user ${user.phone.replace(/\d(?=\d{4})/g, '*')}`);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}