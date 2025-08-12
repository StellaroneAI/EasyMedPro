import twilio from 'twilio';

class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      console.warn('⚠️ Twilio credentials not configured. SMS features will be disabled.');
      this.client = null;
    } else {
      this.client = twilio(this.accountSid, this.authToken);
      console.log('✅ Twilio service initialized');
    }
  }

  // Send OTP SMS
  async sendOTP(phoneNumber, otp, userName = '') {
    if (!this.client) {
      console.log('📱 Twilio not configured - OTP would be sent to:', phoneNumber, 'OTP:', otp);
      return { success: true, message: 'Demo mode - check console for OTP' };
    }

    try {
      const message = `Hello${userName ? ` ${userName}` : ''}! Your EasyMedPro verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: `+91${phoneNumber}` // Assuming Indian phone numbers
      });

      console.log('✅ OTP SMS sent successfully:', result.sid);
      return {
        success: true,
        message: 'OTP sent successfully',
        sid: result.sid
      };
    } catch (error) {
      console.error('❌ Failed to send OTP SMS:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      };
    }
  }

  // Send appointment confirmation SMS
  async sendAppointmentConfirmation(phoneNumber, appointmentDetails) {
    if (!this.client) {
      console.log('📱 Appointment confirmation would be sent to:', phoneNumber);
      return { success: true, message: 'Demo mode - check console' };
    }

    try {
      const { doctorName, date, time, type } = appointmentDetails;
      const message = `EasyMedPro: Your appointment with Dr. ${doctorName} is confirmed for ${date} at ${time}. Type: ${type}. Please arrive 10 minutes early. For any queries, contact support.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: `+91${phoneNumber}`
      });

      console.log('✅ Appointment confirmation SMS sent:', result.sid);
      return {
        success: true,
        message: 'Appointment confirmation sent',
        sid: result.sid
      };
    } catch (error) {
      console.error('❌ Failed to send appointment confirmation:', error);
      return {
        success: false,
        message: 'Failed to send confirmation',
        error: error.message
      };
    }
  }

  // Send appointment reminder SMS
  async sendAppointmentReminder(phoneNumber, appointmentDetails) {
    if (!this.client) {
      console.log('📱 Appointment reminder would be sent to:', phoneNumber);
      return { success: true, message: 'Demo mode - check console' };
    }

    try {
      const { doctorName, date, time, type } = appointmentDetails;
      const message = `EasyMedPro Reminder: You have an appointment with Dr. ${doctorName} tomorrow at ${time}. Type: ${type}. Please prepare any medical reports and arrive on time.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: `+91${phoneNumber}`
      });

      console.log('✅ Appointment reminder SMS sent:', result.sid);
      return {
        success: true,
        message: 'Reminder sent',
        sid: result.sid
      };
    } catch (error) {
      console.error('❌ Failed to send appointment reminder:', error);
      return {
        success: false,
        message: 'Failed to send reminder',
        error: error.message
      };
    }
  }

  // Send emergency alert SMS
  async sendEmergencyAlert(phoneNumber, patientDetails, location = '') {
    if (!this.client) {
      console.log('🚨 Emergency alert would be sent to:', phoneNumber);
      return { success: true, message: 'Demo mode - check console' };
    }

    try {
      const { patientName, emergencyType, contactNumber } = patientDetails;
      const locationText = location ? ` Location: ${location}.` : '';
      const message = `🚨 EMERGENCY ALERT - EasyMedPro: ${patientName} needs immediate medical assistance. Emergency: ${emergencyType}.${locationText} Contact: ${contactNumber}. Please respond immediately.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: `+91${phoneNumber}`
      });

      console.log('🚨 Emergency alert SMS sent:', result.sid);
      return {
        success: true,
        message: 'Emergency alert sent',
        sid: result.sid
      };
    } catch (error) {
      console.error('❌ Failed to send emergency alert:', error);
      return {
        success: false,
        message: 'Failed to send emergency alert',
        error: error.message
      };
    }
  }

  // Send general notification SMS
  async sendNotification(phoneNumber, message, category = 'general') {
    if (!this.client) {
      console.log('📱 Notification would be sent to:', phoneNumber, 'Message:', message);
      return { success: true, message: 'Demo mode - check console' };
    }

    try {
      const prefixedMessage = `EasyMedPro: ${message}`;
      
      const result = await this.client.messages.create({
        body: prefixedMessage,
        from: this.phoneNumber,
        to: `+91${phoneNumber}`
      });

      console.log(`✅ ${category} notification SMS sent:`, result.sid);
      return {
        success: true,
        message: 'Notification sent',
        sid: result.sid
      };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return {
        success: false,
        message: 'Failed to send notification',
        error: error.message
      };
    }
  }

  // Verify phone number format
  isValidPhoneNumber(phoneNumber) {
    // Indian phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Get SMS delivery status
  async getMessageStatus(messageSid) {
    if (!this.client) {
      return { success: false, message: 'Twilio not configured' };
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        success: true,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error('❌ Failed to get message status:', error);
      return {
        success: false,
        message: 'Failed to get status',
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const twilioService = new TwilioService();
export default twilioService;