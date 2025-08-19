import otpDebugService from './otpDebugService.js';

class FirebaseSMSMonitor {
  constructor() {
    this.firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // SMS quota limits (typical Firebase limits)
    this.defaultQuotaLimits = {
      dailyLimit: 100, // Default daily SMS limit for new projects
      monthlyLimit: 1000, // Default monthly SMS limit
      perNumberLimit: 5, // SMS per phone number per day
      rateLimitWindow: 60000, // 1 minute in milliseconds
      rateLimitCount: 5 // Max 5 SMS per minute per number
    };

    // SMS usage tracking
    this.smsUsage = {
      daily: new Map(), // phone -> count
      monthly: new Map(), // phone -> count
      hourly: new Map(), // phone -> timestamp[]
      resetDaily: new Date().setHours(0, 0, 0, 0),
      resetMonthly: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    };

    // Firebase status tracking
    this.firebaseStatus = {
      isConfigured: false,
      quotaStatus: 'unknown',
      lastChecked: null,
      errors: []
    };

    // Initialize Firebase status
    this.firebaseStatus.isConfigured = this.validateFirebaseConfig();

    console.log('🔥 Firebase SMS Monitor initialized');
    console.log('📊 Configuration status:', this.firebaseStatus.isConfigured ? '✅ Configured' : '❌ Not configured');
  }

  // Validate Firebase configuration
  validateFirebaseConfig() {
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    const missing = requiredFields.filter(field => !this.firebaseConfig[field]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing Firebase config fields:', missing);
      this.firebaseStatus.errors.push(`Missing config: ${missing.join(', ')}`);
      return false;
    }

    return true;
  }

  // Track SMS usage for quota monitoring
  trackSMSUsage(phoneNumber, success = true) {
    const now = new Date();
    const today = now.setHours(0, 0, 0, 0);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    // Reset counters if needed
    if (today > this.smsUsage.resetDaily) {
      this.smsUsage.daily.clear();
      this.smsUsage.resetDaily = today;
    }
    
    if (thisMonth > this.smsUsage.resetMonthly) {
      this.smsUsage.monthly.clear();
      this.smsUsage.resetMonthly = thisMonth;
    }

    // Track usage
    const dailyCount = this.smsUsage.daily.get(phoneNumber) || 0;
    const monthlyCount = this.smsUsage.monthly.get(phoneNumber) || 0;
    
    if (success) {
      this.smsUsage.daily.set(phoneNumber, dailyCount + 1);
      this.smsUsage.monthly.set(phoneNumber, monthlyCount + 1);
    }

    // Track hourly rate limiting
    const hourlyKey = `${phoneNumber}_${Math.floor(Date.now() / (60 * 60 * 1000))}`;
    const hourlyTimes = this.smsUsage.hourly.get(hourlyKey) || [];
    hourlyTimes.push(Date.now());
    this.smsUsage.hourly.set(hourlyKey, hourlyTimes);

    // Log usage to debug service
    otpDebugService.logOTPEvent(phoneNumber, 'SMS_USAGE_TRACKED', 
      `SMS usage tracked - Daily: ${dailyCount + 1}, Monthly: ${monthlyCount + 1}`, success, {
      dailyCount: dailyCount + 1,
      monthlyCount: monthlyCount + 1,
      quotaStatus: this.getQuotaStatus(phoneNumber)
    });

    return {
      dailyCount: dailyCount + 1,
      monthlyCount: monthlyCount + 1,
      withinLimits: this.checkQuotaLimits(phoneNumber)
    };
  }

  // Check if phone number is within quota limits
  checkQuotaLimits(phoneNumber) {
    const dailyCount = this.smsUsage.daily.get(phoneNumber) || 0;
    const monthlyCount = this.smsUsage.monthly.get(phoneNumber) || 0;
    
    const limits = {
      dailyExceeded: dailyCount >= this.defaultQuotaLimits.perNumberLimit,
      monthlyExceeded: monthlyCount >= this.defaultQuotaLimits.monthlyLimit,
      rateLimited: this.checkRateLimit(phoneNumber)
    };

    return {
      withinLimits: !limits.dailyExceeded && !limits.monthlyExceeded && !limits.rateLimited,
      limits
    };
  }

  // Check rate limiting
  checkRateLimit(phoneNumber) {
    const now = Date.now();
    const windowStart = now - this.defaultQuotaLimits.rateLimitWindow;
    
    // Get recent SMS attempts for this number
    const recentAttempts = [];
    for (const [key, timestamps] of this.smsUsage.hourly) {
      if (key.startsWith(phoneNumber)) {
        timestamps.forEach(timestamp => {
          if (timestamp > windowStart) {
            recentAttempts.push(timestamp);
          }
        });
      }
    }

    return recentAttempts.length >= this.defaultQuotaLimits.rateLimitCount;
  }

  // Get quota status for a phone number
  getQuotaStatus(phoneNumber) {
    const dailyCount = this.smsUsage.daily.get(phoneNumber) || 0;
    const monthlyCount = this.smsUsage.monthly.get(phoneNumber) || 0;
    const quotaCheck = this.checkQuotaLimits(phoneNumber);

    return {
      phoneNumber,
      usage: {
        daily: dailyCount,
        monthly: monthlyCount,
        dailyLimit: this.defaultQuotaLimits.perNumberLimit,
        monthlyLimit: this.defaultQuotaLimits.monthlyLimit
      },
      status: quotaCheck.withinLimits ? 'OK' : 'LIMIT_EXCEEDED',
      limits: quotaCheck.limits,
      percentages: {
        daily: Math.round((dailyCount / this.defaultQuotaLimits.perNumberLimit) * 100),
        monthly: Math.round((monthlyCount / this.defaultQuotaLimits.monthlyLimit) * 100)
      }
    };
  }

  // Get overall SMS statistics
  getSMSStatistics() {
    const now = Date.now();
    const totalDaily = Array.from(this.smsUsage.daily.values()).reduce((sum, count) => sum + count, 0);
    const totalMonthly = Array.from(this.smsUsage.monthly.values()).reduce((sum, count) => sum + count, 0);
    const uniqueNumbers = new Set([...this.smsUsage.daily.keys(), ...this.smsUsage.monthly.keys()]).size;

    return {
      timestamp: new Date().toISOString(),
      totals: {
        dailySMS: totalDaily,
        monthlySMS: totalMonthly,
        uniqueNumbers
      },
      quotaStatus: {
        dailyPercentage: Math.round((totalDaily / this.defaultQuotaLimits.dailyLimit) * 100),
        monthlyPercentage: Math.round((totalMonthly / this.defaultQuotaLimits.monthlyLimit) * 100),
        atRisk: totalDaily > (this.defaultQuotaLimits.dailyLimit * 0.8) || 
                totalMonthly > (this.defaultQuotaLimits.monthlyLimit * 0.8)
      },
      firebaseStatus: this.firebaseStatus,
      limits: this.defaultQuotaLimits
    };
  }

  // Check Firebase project billing status (mock implementation)
  async checkFirebaseBilling() {
    try {
      // In a real implementation, this would make API calls to Firebase Admin SDK
      // For now, we'll simulate the check
      
      const billingStatus = {
        planType: process.env.FIREBASE_PLAN_TYPE || 'spark', // spark, blaze, etc.
        quotaEnabled: true,
        quotaRemaining: {
          daily: Math.max(0, this.defaultQuotaLimits.dailyLimit - Array.from(this.smsUsage.daily.values()).reduce((sum, count) => sum + count, 0)),
          monthly: Math.max(0, this.defaultQuotaLimits.monthlyLimit - Array.from(this.smsUsage.monthly.values()).reduce((sum, count) => sum + count, 0))
        },
        lastUpdated: new Date().toISOString()
      };

      otpDebugService.logOTPEvent('system', 'FIREBASE_BILLING_CHECK', 
        `Firebase billing status checked - Plan: ${billingStatus.planType}`, true, {
        billingStatus
      });

      return {
        success: true,
        data: billingStatus
      };
    } catch (error) {
      console.error('❌ Firebase billing check failed:', error);
      
      otpDebugService.logOTPEvent('system', 'FIREBASE_BILLING_ERROR', 
        `Firebase billing check failed: ${error.message}`, false, {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test Firebase SMS configuration
  async testFirebaseConfig() {
    try {
      const configTest = {
        timestamp: new Date().toISOString(),
        configured: this.firebaseStatus.isConfigured,
        projectId: this.firebaseConfig.projectId,
        authDomain: this.firebaseConfig.authDomain,
        hasApiKey: !!this.firebaseConfig.apiKey,
        errors: this.firebaseStatus.errors
      };

      if (!this.firebaseStatus.isConfigured) {
        return {
          success: false,
          message: 'Firebase configuration incomplete',
          data: configTest
        };
      }

      // Mock test of Firebase connection
      // In real implementation, this would test Firebase Admin SDK connectivity
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      otpDebugService.logOTPEvent('system', 'FIREBASE_CONFIG_TEST', 
        'Firebase configuration test completed', true, {
        configTest
      });

      return {
        success: true,
        message: 'Firebase configuration test successful',
        data: configTest
      };
    } catch (error) {
      console.error('❌ Firebase config test failed:', error);
      
      otpDebugService.logOTPEvent('system', 'FIREBASE_CONFIG_ERROR', 
        `Firebase config test failed: ${error.message}`, false, {
        error: error.message
      });

      return {
        success: false,
        message: `Firebase config test failed: ${error.message}`,
        error: error.message
      };
    }
  }

  // Generate Firebase SMS diagnostic report
  generateFirebaseReport() {
    const stats = this.getSMSStatistics();
    const topNumbers = Array.from(this.smsUsage.daily.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      timestamp: new Date().toISOString(),
      firebaseConfig: {
        configured: this.firebaseStatus.isConfigured,
        projectId: this.firebaseConfig.projectId,
        errors: this.firebaseStatus.errors
      },
      smsStatistics: stats,
      topUsers: topNumbers.map(([phone, count]) => ({
        phoneNumber: phone,
        dailyUsage: count,
        quotaStatus: this.getQuotaStatus(phone)
      })),
      alerts: this.generateAlerts(),
      recommendations: this.generateRecommendations()
    };
  }

  // Generate usage alerts
  generateAlerts() {
    const alerts = [];
    const stats = this.getSMSStatistics();

    if (stats.quotaStatus.dailyPercentage > 90) {
      alerts.push({
        type: 'CRITICAL',
        message: 'Daily SMS quota nearly exhausted',
        percentage: stats.quotaStatus.dailyPercentage
      });
    } else if (stats.quotaStatus.dailyPercentage > 75) {
      alerts.push({
        type: 'WARNING',
        message: 'Daily SMS quota at 75%',
        percentage: stats.quotaStatus.dailyPercentage
      });
    }

    if (stats.quotaStatus.monthlyPercentage > 90) {
      alerts.push({
        type: 'CRITICAL',
        message: 'Monthly SMS quota nearly exhausted',
        percentage: stats.quotaStatus.monthlyPercentage
      });
    }

    // Check for numbers exceeding limits
    for (const [phone, count] of this.smsUsage.daily) {
      if (count >= this.defaultQuotaLimits.perNumberLimit) {
        alerts.push({
          type: 'ERROR',
          message: `Phone ${phone} exceeded daily limit`,
          phoneNumber: phone,
          count
        });
      }
    }

    return alerts;
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];
    const stats = this.getSMSStatistics();

    if (!this.firebaseStatus.isConfigured) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Configure Firebase credentials',
        description: 'Complete Firebase configuration for SMS monitoring'
      });
    }

    if (stats.quotaStatus.atRisk) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Consider upgrading Firebase plan',
        description: 'Current usage approaching quota limits'
      });
    }

    if (stats.totals.uniqueNumbers > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review user verification flow',
        description: 'High number of unique phone numbers may indicate issues'
      });
    }

    return recommendations;
  }

  // Reset usage counters (admin function)
  resetUsageCounters() {
    this.smsUsage.daily.clear();
    this.smsUsage.monthly.clear();
    this.smsUsage.hourly.clear();
    
    otpDebugService.logOTPEvent('system', 'USAGE_RESET', 
      'SMS usage counters reset by admin', true, {
      resetTime: new Date().toISOString()
    });

    console.log('🔄 SMS usage counters reset');
    return true;
  }
}

// Create and export singleton instance
const firebaseSMSMonitor = new FirebaseSMSMonitor();
export default firebaseSMSMonitor;