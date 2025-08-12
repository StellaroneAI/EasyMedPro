/**
 * Demo User Service for environments without MongoDB
 * This provides a fallback authentication system using in-memory storage
 */

import bcrypt from 'bcryptjs';

// In-memory storage for demo users
const demoUsers = new Map();
const demoOTPs = new Map();

// Default demo users
const defaultUsers = [
  {
    id: 'patient_1',
    name: 'Demo Patient',
    phone: '9876543210',
    email: 'patient@demo.com',
    password: 'patient123',
    userType: 'patient',
    isPhoneVerified: true,
    isEmailVerified: false,
    isActive: true,
    profile: {
      age: 30,
      gender: 'male'
    }
  },
  {
    id: 'doctor_1', 
    name: 'Dr. Demo',
    phone: '9876543230',
    email: 'doctor@demo.com',
    password: 'doctor123',
    userType: 'doctor',
    isPhoneVerified: true,
    isEmailVerified: false,
    isActive: true,
    profile: {
      specialty: 'General Medicine',
      qualification: 'MBBS'
    }
  },
  {
    id: 'asha_1',
    name: 'Demo ASHA Worker',
    phone: '9876543220',
    email: 'asha@demo.com', 
    password: 'asha123',
    userType: 'asha',
    isPhoneVerified: true,
    isEmailVerified: false,
    isActive: true,
    profile: {
      village: 'Demo Village',
      district: 'Demo District'
    }
  }
];

class DemoUserService {
  constructor() {
    this.initializeDefaultUsers();
  }

  async initializeDefaultUsers() {
    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const userWithHashedPassword = {
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
        refreshTokens: []
      };
      demoUsers.set(user.phone, userWithHashedPassword);
      if (user.email) {
        demoUsers.set(user.email, userWithHashedPassword);
      }
    }
    console.log('✅ Demo users initialized');
  }

  // Find user by phone or email
  async findUser(identifier) {
    return demoUsers.get(identifier) || null;
  }

  // Create new user
  async createUser(userData) {
    const userId = `${userData.userType}_${Date.now()}`;
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : null;
    
    const newUser = {
      id: userId,
      ...userData,
      password: hashedPassword,
      isPhoneVerified: false,
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date(),
      refreshTokens: [],
      otpCode: null,
      otpExpires: null,
      otpAttempts: 0
    };

    demoUsers.set(userData.phone, newUser);
    if (userData.email) {
      demoUsers.set(userData.email, newUser);
    }

    return newUser;
  }

  // Update user
  async updateUser(identifier, updates) {
    const user = demoUsers.get(identifier);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    demoUsers.set(identifier, updatedUser);
    
    // Update both phone and email keys if they exist
    if (user.phone) demoUsers.set(user.phone, updatedUser);
    if (user.email) demoUsers.set(user.email, updatedUser);

    return updatedUser;
  }

  // Compare password
  async comparePassword(user, candidatePassword) {
    if (!user.password) return false;
    return bcrypt.compare(candidatePassword, user.password);
  }

  // Generate OTP
  generateOTP(phone) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      code: otp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0
    };
    
    demoOTPs.set(phone, otpData);
    
    // For demo, also log the OTP
    console.log(`📱 Demo OTP for ${phone}: ${otp}`);
    
    return otp;
  }

  // Verify OTP
  verifyOTP(phone, candidateOTP) {
    const otpData = demoOTPs.get(phone);
    
    if (!otpData) {
      return { success: false, message: 'No OTP found' };
    }

    if (otpData.expires < new Date()) {
      demoOTPs.delete(phone);
      return { success: false, message: 'OTP has expired' };
    }

    if (otpData.attempts >= 3) {
      demoOTPs.delete(phone);
      return { success: false, message: 'Too many OTP attempts' };
    }

    // Allow demo OTP '123456' or the actual generated OTP
    if (candidateOTP !== otpData.code && candidateOTP !== '123456') {
      otpData.attempts += 1;
      return { success: false, message: 'Invalid OTP' };
    }

    // OTP is valid
    demoOTPs.delete(phone);
    
    // Mark user as phone verified
    const user = this.findUser(phone);
    if (user) {
      this.updateUser(phone, { isPhoneVerified: true });
    }

    return { success: true, message: 'OTP verified successfully' };
  }

  // Add refresh token
  async addRefreshToken(user, token) {
    const refreshTokens = user.refreshTokens || [];
    refreshTokens.push({
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return this.updateUser(user.phone, { refreshTokens });
  }

  // Remove refresh token
  async removeRefreshToken(user, token) {
    const refreshTokens = (user.refreshTokens || []).filter(rt => rt.token !== token);
    return this.updateUser(user.phone, { refreshTokens });
  }

  // Get all users (for admin)
  async getAllUsers(filter = {}) {
    const users = Array.from(demoUsers.values())
      .filter(user => user.phone.length === 10) // Avoid duplicates (keep phone-based entries)
      .filter(user => {
        if (filter.userType && user.userType !== filter.userType) return false;
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          return user.name.toLowerCase().includes(searchLower) ||
                 user.phone.includes(filter.search) ||
                 (user.email && user.email.toLowerCase().includes(searchLower));
        }
        return true;
      });

    return users;
  }

  // Get user statistics
  async getUserStats() {
    const users = await this.getAllUsers();
    
    return {
      totalUsers: users.length,
      patients: users.filter(u => u.userType === 'patient').length,
      doctors: users.filter(u => u.userType === 'doctor').length,
      ashaWorkers: users.filter(u => u.userType === 'asha').length,
      admins: users.filter(u => u.userType === 'admin').length,
      activeUsers: users.filter(u => u.isActive).length,
      verifiedUsers: users.filter(u => u.isPhoneVerified).length,
      newUsersThisMonth: users.filter(u => {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return u.createdAt > monthAgo;
      }).length
    };
  }
}

// Create singleton instance
const demoUserService = new DemoUserService();

export default demoUserService;