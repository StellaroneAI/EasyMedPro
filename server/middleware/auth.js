import authService from '../services/authService.js';
import User from '../models/User.js';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const verification = authService.verifyToken(token);
    if (!verification.success) {
      return res.status(401).json({
        success: false,
        message: verification.error
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(verification.decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      userId: user._id,
      userType: user.userType,
      phone: user.phone,
      email: user.email,
      name: user.name,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to authorize specific user types
export const authorizeUserTypes = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if phone is verified
export const requirePhoneVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required'
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access anything
    if (req.user.userType === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId.toString() === req.user.id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  };
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authService.extractTokenFromHeader(authHeader);

    if (token) {
      const verification = authService.verifyToken(token);
      if (verification.success) {
        const user = await User.findById(verification.decoded.userId);
        if (user && user.isActive && !user.isLocked) {
          req.user = {
            id: user._id,
            userId: user._id,
            userType: user.userType,
            phone: user.phone,
            email: user.email,
            name: user.name,
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if auth fails
  }
};

// Middleware to validate refresh token
export const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const verification = authService.validateTokenType(refreshToken, 'refresh');
    if (!verification.success) {
      return res.status(401).json({
        success: false,
        message: verification.error
      });
    }

    // Check if user exists and token is in their refresh tokens
    const user = await User.findById(verification.decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const tokenExists = user.refreshTokens.some(
      tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    req.user = {
      id: user._id,
      userId: user._id,
      userType: user.userType,
      phone: user.phone,
      email: user.email,
      name: user.name
    };
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    console.error('Refresh token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed'
    });
  }
};