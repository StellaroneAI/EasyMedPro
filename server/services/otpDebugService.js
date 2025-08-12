import fs from 'fs/promises';
import path from 'path';

class OTPDebugService {
  constructor() {
    // Admin whitelist - phone numbers that bypass OTP verification
    this.adminWhitelist = [
      '9060328119', // StellaroneAI - main admin
      '+919060328119',
      '919060328119'
    ];
    
    // Email whitelist for admin bypass
    this.emailWhitelist = [
      'gilboj@gmail.com', // StellaroneAI email
      'admin@easymed.in',
      'superadmin@easymed.in',
      'praveen@stellaronehealth.com'
    ];

    // OTP delivery tracking
    this.otpDeliveryLogs = [];
    this.maxLogEntries = 1000;
    
    console.log('✅ OTP Debug Service initialized with admin whitelist');
    console.log('📱 Whitelisted phones:', this.adminWhitelist);
    console.log('📧 Whitelisted emails:', this.emailWhitelist);
  }

  // Check if phone number is in admin whitelist
  isPhoneWhitelisted(phoneNumber) {
    if (!phoneNumber) return false;
    
    // Normalize phone number
    const normalizedPhone = phoneNumber.toString().replace(/^\+91/, '').replace(/^91/, '');
    
    const isWhitelisted = this.adminWhitelist.some(whitelistedPhone => {
      const normalizedWhitelisted = whitelistedPhone.replace(/^\+91/, '').replace(/^91/, '');
      return normalizedWhitelisted === normalizedPhone;
    });
    
    if (isWhitelisted) {
      console.log(`🔓 Phone number ${phoneNumber} is whitelisted - bypassing OTP`);
      this.logOTPEvent(phoneNumber, 'BYPASSED', 'Admin whitelist bypass', true);
    }
    
    return isWhitelisted;
  }

  // Check if email is in admin whitelist
  isEmailWhitelisted(email) {
    if (!email) return false;
    
    const isWhitelisted = this.emailWhitelist.includes(email.toLowerCase());
    
    if (isWhitelisted) {
      console.log(`🔓 Email ${email} is whitelisted - bypassing OTP`);
      this.logOTPEvent(email, 'BYPASSED', 'Admin email whitelist bypass', true);
    }
    
    return isWhitelisted;
  }

  // Log OTP delivery events for debugging
  logOTPEvent(recipient, status, message, success = false, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      recipient,
      status, // SENT, DELIVERED, FAILED, BYPASSED, EXPIRED
      message,
      success,
      metadata: {
        userAgent: metadata.userAgent || 'Unknown',
        ip: metadata.ip || 'Unknown',
        userType: metadata.userType || 'Unknown',
        ...metadata
      }
    };

    this.otpDeliveryLogs.unshift(logEntry);
    
    // Keep only the most recent entries
    if (this.otpDeliveryLogs.length > this.maxLogEntries) {
      this.otpDeliveryLogs = this.otpDeliveryLogs.slice(0, this.maxLogEntries);
    }

    console.log(`📊 OTP Event: ${status} - ${recipient} - ${message}`);
    return logEntry;
  }

  // Get OTP delivery statistics
  getOTPStats(timeframe = '24h') {
    const now = new Date();
    let cutoffTime;
    
    switch (timeframe) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const relevantLogs = this.otpDeliveryLogs.filter(log => 
      new Date(log.timestamp) >= cutoffTime
    );

    const stats = {
      total: relevantLogs.length,
      successful: relevantLogs.filter(log => log.success).length,
      failed: relevantLogs.filter(log => !log.success && log.status !== 'BYPASSED').length,
      bypassed: relevantLogs.filter(log => log.status === 'BYPASSED').length,
      pending: relevantLogs.filter(log => log.status === 'SENT').length,
      timeframe,
      successRate: 0
    };

    if (stats.total > 0) {
      stats.successRate = ((stats.successful + stats.bypassed) / stats.total * 100).toFixed(2);
    }

    return stats;
  }

  // Get recent OTP logs for admin dashboard
  getRecentOTPLogs(limit = 50) {
    return this.otpDeliveryLogs.slice(0, limit);
  }

  // Generate diagnostic report
  generateDiagnosticReport() {
    const stats1h = this.getOTPStats('1h');
    const stats24h = this.getOTPStats('24h');
    const stats7d = this.getOTPStats('7d');
    
    return {
      timestamp: new Date().toISOString(),
      whitelistStatus: {
        phoneNumbers: this.adminWhitelist.length,
        emails: this.emailWhitelist.length
      },
      statistics: {
        lastHour: stats1h,
        last24Hours: stats24h,
        last7Days: stats7d
      },
      recentLogs: this.getRecentOTPLogs(10),
      systemStatus: {
        logBufferSize: this.otpDeliveryLogs.length,
        maxLogEntries: this.maxLogEntries,
        uptime: process.uptime()
      }
    };
  }

  // Test SMS functionality for admin
  async testSMSDelivery(phoneNumber, testMessage = 'Test SMS from EasyMedPro OTP Debug System') {
    try {
      console.log(`🧪 Testing SMS delivery to ${phoneNumber}`);
      
      // Log the test attempt
      this.logOTPEvent(phoneNumber, 'TEST_SENT', 'Admin initiated SMS test', false, {
        testMessage,
        testType: 'admin_manual'
      });

      // For demonstration - in real implementation, this would use Twilio/Firebase
      const testResult = {
        success: true,
        message: 'Test SMS would be sent (demo mode)',
        timestamp: new Date().toISOString(),
        recipient: phoneNumber,
        testMessage
      };

      this.logOTPEvent(phoneNumber, 'TEST_SUCCESS', 'SMS test completed successfully', true, {
        testResult
      });

      return testResult;
    } catch (error) {
      console.error('❌ SMS test failed:', error);
      
      this.logOTPEvent(phoneNumber, 'TEST_FAILED', `SMS test failed: ${error.message}`, false, {
        error: error.message
      });

      return {
        success: false,
        message: `SMS test failed: ${error.message}`,
        error: error.message
      };
    }
  }

  // Add phone number to whitelist (admin function)
  addPhoneToWhitelist(phoneNumber) {
    const normalizedPhone = phoneNumber.toString().replace(/^\+91/, '').replace(/^91/, '');
    
    if (!this.adminWhitelist.includes(normalizedPhone)) {
      this.adminWhitelist.push(normalizedPhone);
      console.log(`✅ Added ${phoneNumber} to admin whitelist`);
      
      this.logOTPEvent(phoneNumber, 'WHITELIST_ADDED', 'Phone number added to admin whitelist', true, {
        action: 'add_to_whitelist'
      });
      
      return true;
    }
    
    return false; // Already exists
  }

  // Remove phone number from whitelist (admin function)
  removePhoneFromWhitelist(phoneNumber) {
    const normalizedPhone = phoneNumber.toString().replace(/^\+91/, '').replace(/^91/, '');
    const index = this.adminWhitelist.indexOf(normalizedPhone);
    
    if (index > -1) {
      this.adminWhitelist.splice(index, 1);
      console.log(`❌ Removed ${phoneNumber} from admin whitelist`);
      
      this.logOTPEvent(phoneNumber, 'WHITELIST_REMOVED', 'Phone number removed from admin whitelist', true, {
        action: 'remove_from_whitelist'
      });
      
      return true;
    }
    
    return false; // Not found
  }

  // Emergency bypass for specific user (StellaroneAI)
  createEmergencyBypass(identifier, reason = 'Emergency access') {
    const bypassToken = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logOTPEvent(identifier, 'EMERGENCY_BYPASS', `Emergency bypass created: ${reason}`, true, {
      bypassToken,
      reason,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    console.log(`🚨 Emergency bypass created for ${identifier}: ${bypassToken}`);
    
    return {
      success: true,
      bypassToken,
      identifier,
      reason,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Validate emergency bypass token
  validateEmergencyBypass(token, identifier) {
    const bypassLog = this.otpDeliveryLogs.find(log => 
      log.status === 'EMERGENCY_BYPASS' && 
      log.metadata.bypassToken === token &&
      log.recipient === identifier
    );

    if (bypassLog) {
      const expiresAt = new Date(bypassLog.metadata.expiresAt);
      const now = new Date();
      
      if (now <= expiresAt) {
        console.log(`✅ Valid emergency bypass for ${identifier}`);
        return true;
      } else {
        console.log(`❌ Emergency bypass expired for ${identifier}`);
      }
    }

    return false;
  }
}

// Create and export singleton instance
const otpDebugService = new OTPDebugService();
export default otpDebugService;