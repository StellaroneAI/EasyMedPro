import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/ // Indian phone number format
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    minlength: 6
  },
  
  // User type and verification
  userType: {
    type: String,
    required: true,
    enum: ['patient', 'asha', 'doctor', 'admin']
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Authentication tokens
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  
  // OTP for verification
  otpCode: String,
  otpExpires: Date,
  otpAttempts: { type: Number, default: 0 },
  
  // User-specific data based on type
  profile: {
    // Patient specific
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    
    // ASHA Worker specific
    village: String,
    district: String,
    state: String,
    certification: String,
    
    // Doctor specific
    specialty: String,
    qualification: String,
    licenseNumber: String,
    experience: Number,
    
    // Admin specific
    role: String,
    designation: String,
    permissions: [String]
  },
  
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    district: String,
    country: { type: String, default: 'India' }
  },
  
  // Activity tracking
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  accountLocked: { type: Boolean, default: false },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // Hash password with bcrypt
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      accountLocked: true
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      accountLocked: false,
      lastLogin: new Date()
    }
  });
};

// Method to generate and save OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otpCode = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpAttempts = 0;
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otpCode || !this.otpExpires) {
    return { success: false, message: 'No OTP found' };
  }
  
  if (this.otpExpires < new Date()) {
    return { success: false, message: 'OTP has expired' };
  }
  
  if (this.otpAttempts >= 3) {
    return { success: false, message: 'Too many OTP attempts' };
  }
  
  if (this.otpCode !== candidateOTP) {
    this.otpAttempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid
  this.otpCode = undefined;
  this.otpExpires = undefined;
  this.otpAttempts = 0;
  this.isPhoneVerified = true;
  
  return { success: true, message: 'OTP verified successfully' };
};

const User = mongoose.model('User', userSchema);

export default User;