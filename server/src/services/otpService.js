import { getMCPClient } from '../mcp/client.js';
import twilio from 'twilio';

export class OTPService {
  constructor() {
    this.mcpClient = getMCPClient();
    
    // Initialize Twilio client with validation
    this.twilioClient = null;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      // Validate Twilio credentials format
      if (accountSid.startsWith('AC') && authToken.length > 10) {
        try {
          this.twilioClient = twilio(accountSid, authToken);
          console.log('[OTP] Twilio client initialized successfully');
        } catch (error) {
          console.log('[OTP] Twilio initialization failed:', error.message);
          this.twilioClient = null;
        }
      } else {
        console.log('[OTP] Invalid Twilio credentials format, using demo mode');
      }
    } else {
      console.log('[OTP] Twilio credentials not configured, using demo mode');
    }
    
    this.mockOtps = new Map(); // Store for fallback OTPs
  }

  async sendOTP(phoneNumber, userName) {
    try {
      // Try MCP service first
      const request = {
        phoneNumber,
        userName,
        timestamp: new Date().toISOString()
      };

      const mcpResponse = await this.mcpClient.request('auth-comm', 'sendOTP', request);
      
      if (mcpResponse && mcpResponse.success) {
        console.log('[OTP] MCP service successfully sent OTP');
        return {
          success: true,
          otpId: mcpResponse.otpId,
          message: 'OTP sent successfully',
          fallbackUsed: false
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[OTP] MCP service unavailable, using fallback:', error.message);
      return this.fallbackOTPGeneration(phoneNumber, userName);
    }
  }

  async fallbackOTPGeneration(phoneNumber, userName) {
    try {
      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store OTP for verification (expires in 10 minutes)
      const otpData = {
        code: otpCode,
        phoneNumber,
        userName,
        expiresAt: Date.now() + (10 * 60 * 1000),
        attempts: 0
      };
      
      this.mockOtps.set(otpId, otpData);

      // Try to send via Twilio if configured
      if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        const message = `Your EasyMedPro verification code is: ${otpCode}. Valid for 10 minutes.`;
        
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        console.log(`[OTP] Twilio SMS sent to ${this.maskPhoneNumber(phoneNumber)}`);
      } else {
        console.log(`[OTP] Demo mode - OTP for ${this.maskPhoneNumber(phoneNumber)}: ${otpCode}`);
      }

      return {
        success: true,
        otpId,
        message: 'OTP sent successfully (fallback mode)',
        fallbackUsed: true
      };

    } catch (error) {
      console.error('[OTP] Fallback OTP generation failed:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        fallbackUsed: true
      };
    }
  }

  async verifyOTP(otpId, enteredOTP) {
    try {
      // Try MCP service first
      const mcpResponse = await this.mcpClient.request('auth-comm', 'verifyOTP', {
        otpId,
        otpCode: enteredOTP,
        timestamp: new Date().toISOString()
      });

      if (mcpResponse && mcpResponse.success !== undefined) {
        return {
          success: mcpResponse.success,
          message: mcpResponse.success ? 'OTP verified successfully' : 'Invalid or expired OTP'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[OTP] MCP verification unavailable, using fallback:', error.message);
      return this.fallbackOTPVerification(otpId, enteredOTP);
    }
  }

  fallbackOTPVerification(otpId, enteredOTP) {
    const otpData = this.mockOtps.get(otpId);
    
    if (!otpData) {
      return {
        success: false,
        message: 'Invalid OTP ID'
      };
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      this.mockOtps.delete(otpId);
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    // Check attempt limit
    if (otpData.attempts >= 3) {
      this.mockOtps.delete(otpId);
      return {
        success: false,
        message: 'Too many verification attempts'
      };
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.code === enteredOTP) {
      this.mockOtps.delete(otpId);
      console.log(`[OTP] Successful verification for ${this.maskPhoneNumber(otpData.phoneNumber)}`);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid OTP code'
      };
    }
  }

  async sendReminder(recipient, type, message, scheduledFor) {
    try {
      // Try MCP service first
      const request = {
        recipient,
        type,
        message,
        scheduledFor,
        timestamp: new Date().toISOString()
      };

      const mcpResponse = await this.mcpClient.request('auth-comm', 'sendReminder', request);
      
      if (mcpResponse && mcpResponse.success) {
        return {
          success: true,
          reminderId: mcpResponse.reminderId,
          message: 'Reminder scheduled successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[OTP] MCP reminder service unavailable, using fallback:', error.message);
      return this.fallbackReminderSend(recipient, type, message, scheduledFor);
    }
  }

  async fallbackReminderSend(recipient, type, message, scheduledFor) {
    try {
      if (type === 'sms' && this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient
        });
        
        console.log(`[Reminder] SMS sent to ${this.maskPhoneNumber(recipient)}`);
      } else {
        console.log(`[Reminder] Demo mode - ${type} reminder for ${recipient}: ${message}`);
      }

      return {
        success: true,
        reminderId: `reminder_${Date.now()}`,
        message: 'Reminder sent successfully (fallback mode)'
      };

    } catch (error) {
      console.error('[Reminder] Fallback reminder failed:', error);
      return {
        success: false,
        message: 'Failed to send reminder'
      };
    }
  }

  maskPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length < 4) return '****';
    return phoneNumber.slice(0, 2) + '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-2);
  }
}
