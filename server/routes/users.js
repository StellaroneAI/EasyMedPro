import express from 'express';
import { authenticateToken, authorizeUserTypes } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const { userType, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (userType) query.userType = userType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshTokens -otpCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own profile unless they are admin
    if (req.user.userType !== 'admin' && req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId).select('-password -refreshTokens -otpCode');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user status (admin only)
router.patch('/:userId/status', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ userType: 'patient' }),
      User.countDocuments({ userType: 'doctor' }),
      User.countDocuments({ userType: 'asha' }),
      User.countDocuments({ userType: 'admin' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isPhoneVerified: true }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    const [patients, doctors, ashaWorkers, admins, activeUsers, verifiedUsers, newUsers] = stats;

    res.json({
      success: true,
      stats: {
        totalUsers: patients + doctors + ashaWorkers + admins,
        patients,
        doctors,
        ashaWorkers,
        admins,
        activeUsers,
        verifiedUsers,
        newUsersThisMonth: newUsers
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

export default router;