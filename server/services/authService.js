import jwt from 'jsonwebtoken';

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  // Generate access token
  generateAccessToken(userId, userType, additionalPayload = {}) {
    const payload = {
      userId,
      userType,
      type: 'access',
      ...additionalPayload
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'easymedpro',
      audience: 'easymedpro-users'
    });
  }

  // Generate refresh token
  generateRefreshToken(userId, userType) {
    const payload = {
      userId,
      userType,
      type: 'refresh'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'easymedpro',
      audience: 'easymedpro-users'
    });
  }

  // Generate both tokens
  generateTokens(userId, userType, additionalPayload = {}) {
    const accessToken = this.generateAccessToken(userId, userType, additionalPayload);
    const refreshToken = this.generateRefreshToken(userId, userType);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiresIn
    };
  }

  // Verify token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'easymedpro',
        audience: 'easymedpro-users'
      });
      return { success: true, decoded };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { success: false, error: 'Token expired' };
      } else if (error.name === 'JsonWebTokenError') {
        return { success: false, error: 'Invalid token' };
      } else {
        return { success: false, error: 'Token verification failed' };
      }
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authorizationHeader) {
    if (!authorizationHeader) {
      return null;
    }

    const parts = authorizationHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  // Generate a secure random string
  async generateSecureToken(length = 32) {
    const crypto = await import('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  // Decode token without verification (for expired tokens)
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  // Check if token is about to expire (within 5 minutes)
  isTokenNearExpiry(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    
    // Return true if token expires within 5 minutes
    return timeUntilExpiry < 300;
  }

  // Generate password reset token
  generatePasswordResetToken(userId) {
    const payload = {
      userId,
      type: 'password_reset',
      timestamp: Date.now()
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '1h', // Password reset tokens expire in 1 hour
      issuer: 'easymedpro',
      audience: 'easymedpro-users'
    });
  }

  // Generate email verification token
  generateEmailVerificationToken(userId, email) {
    const payload = {
      userId,
      email,
      type: 'email_verification',
      timestamp: Date.now()
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '24h', // Email verification tokens expire in 24 hours
      issuer: 'easymedpro',
      audience: 'easymedpro-users'
    });
  }

  // Validate specific token types
  validateTokenType(token, expectedType) {
    const verification = this.verifyToken(token);
    if (!verification.success) {
      return verification;
    }

    if (verification.decoded.type !== expectedType) {
      return { success: false, error: 'Invalid token type' };
    }

    return verification;
  }

  // Get user info from token
  getUserFromToken(token) {
    const verification = this.verifyToken(token);
    if (!verification.success) {
      return null;
    }

    return {
      userId: verification.decoded.userId,
      userType: verification.decoded.userType,
      type: verification.decoded.type
    };
  }

  // Generate API key for external integrations
  generateApiKey(userId, permissions = []) {
    const payload = {
      userId,
      type: 'api_key',
      permissions,
      timestamp: Date.now()
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '365d', // API keys expire in 1 year
      issuer: 'easymedpro',
      audience: 'easymedpro-api'
    });
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;