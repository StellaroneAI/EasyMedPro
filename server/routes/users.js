import express from 'express';
import { authenticateToken, authorizeUserTypes } from '../middleware/auth.js';
import User from '../models/User.js';
import {
  registerUser,
  findUserByPhone,
  findUserByEmail,
  updateUserProfile,
  removeUser,
  listAllUsers
} from '../services/userService.firebase.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const users = await listAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userType !== 'admin' && req.user.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const user = await findUserByPhone(userId) || await findUserByEmail(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user status (admin only)
router.patch('/:userId/status', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const update = { isActive };
    const user = await updateUserProfile(userId, update);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    // Implement stats aggregation in Firebase or return a placeholder
    // For now, return an empty stats object
    res.json({ success: true, stats: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;