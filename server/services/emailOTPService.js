import nodemailer from 'nodemailer';
import otpDebugService from './otpDebugService.js';

class EmailOTPService {
  constructor() {
    // Email configuration
    this.emailConfig = {
      service: 'gmail', // Can be changed to other providers
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'noreply@easymedpro.com',
        pass: process.env.EMAIL_PASSWORD || 'dummy_password' // App-specific password
      }
    };

    // Initialize transporter
    this.transporter = null;
    this.initializeTransporter();
    
    // Email OTP storage (in production, use Redis or database)
    this.emailOTPs = new Map();
    this.otpExpiryTime = 10 * 60 * 1000; // 10 minutes

    console.log('📧 Email OTP Service initialized');
  }

  async initializeTransporter() {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        this.transporter = nodemailer.createTransporter(this.emailConfig);
        
        // Verify connection
        await this.transporter.verify();
        console.log('✅ Email transporter configured and verified');
      } else {
        console.log('⚠️ Email credentials not configured - Email OTP will be in demo mode');
      }
    } catch (error) {
      console.error('❌ Email transporter setup failed:', error.message);
      this.transporter = null;
    }
  }

  // Generate OTP for email
  generateEmailOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email
  async sendOTPEmail(email, userType = 'patient', userName = 'User') {
    try {
      const otp = this.generateEmailOTP();
      const otpKey = `${email}_${Date.now()}`;
      
      // Store OTP with expiry
      this.emailOTPs.set(email, {
        otp,
        expiresAt: Date.now() + this.otpExpiryTime,
        attempts: 0,
        userType,
        userName
      });

      // Clean up expired OTPs
      this.cleanupExpiredOTPs();

      const emailContent = this.generateEmailTemplate(otp, userName, userType);

      if (this.transporter) {
        // Send actual email
        const mailOptions = {
          from: `"EasyMedPro Healthcare" <${this.emailConfig.auth.user}>`,
          to: email,
          subject: 'EasyMedPro - Email Verification Code',
          html: emailContent,
          text: `Your EasyMedPro verification code is: ${otp}. This code will expire in 10 minutes.`
        };

        const result = await this.transporter.sendMail(mailOptions);
        
        // Log successful email send
        otpDebugService.logOTPEvent(email, 'EMAIL_OTP_SENT', 'Email OTP sent successfully', true, {
          emailProvider: 'gmail',
          messageId: result.messageId,
          userType,
          userName
        });

        console.log(`✅ Email OTP sent to ${email}:`, result.messageId);
        
        return {
          success: true,
          message: 'Email OTP sent successfully',
          messageId: result.messageId,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
      } else {
        // Demo mode - log OTP
        console.log(`📧 Demo Email OTP for ${email}: ${otp}`);
        
        otpDebugService.logOTPEvent(email, 'EMAIL_OTP_DEMO', 'Demo email OTP generated', true, {
          otp: otp,
          userType,
          userName,
          mode: 'demo'
        });

        return {
          success: true,
          message: 'Demo mode - Email OTP logged to console',
          otp: otp // Return OTP in demo mode
        };
      }
    } catch (error) {
      console.error('❌ Failed to send email OTP:', error);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_OTP_FAILED', `Email OTP failed: ${error.message}`, false, {
        error: error.message,
        userType,
        userName
      });

      return {
        success: false,
        message: 'Failed to send email OTP',
        error: error.message
      };
    }
  }

  // Verify email OTP
  verifyEmailOTP(email, otp) {
    const storedOTPData = this.emailOTPs.get(email);
    
    if (!storedOTPData) {
      otpDebugService.logOTPEvent(email, 'EMAIL_OTP_VERIFY_FAILED', 'No OTP found for email', false, {
        providedOTP: otp,
        error: 'no_otp_found'
      });

      return {
        success: false,
        message: 'No OTP found for this email. Please request a new one.'
      };
    }

    // Check if OTP is expired
    if (Date.now() > storedOTPData.expiresAt) {
      this.emailOTPs.delete(email);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_OTP_EXPIRED', 'Email OTP expired', false, {
        providedOTP: otp,
        expiredAt: new Date(storedOTPData.expiresAt).toISOString()
      });

      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempts
    if (storedOTPData.attempts >= 3) {
      this.emailOTPs.delete(email);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded', false, {
        providedOTP: otp,
        attempts: storedOTPData.attempts
      });

      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (storedOTPData.otp === otp) {
      // Successful verification
      this.emailOTPs.delete(email);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_OTP_VERIFIED', 'Email OTP verified successfully', true, {
        userType: storedOTPData.userType,
        userName: storedOTPData.userName
      });

      return {
        success: true,
        message: 'Email OTP verified successfully',
        userType: storedOTPData.userType,
        userName: storedOTPData.userName
      };
    } else {
      // Incorrect OTP
      storedOTPData.attempts += 1;
      this.emailOTPs.set(email, storedOTPData);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_OTP_INVALID', 'Invalid email OTP provided', false, {
        providedOTP: otp,
        attempts: storedOTPData.attempts,
        remainingAttempts: 3 - storedOTPData.attempts
      });

      return {
        success: false,
        message: `Invalid OTP. ${3 - storedOTPData.attempts} attempts remaining.`
      };
    }
  }

  // Generate HTML email template
  generateEmailTemplate(otp, userName, userType) {
    const userTypeText = {
      patient: 'Patient',
      asha: 'ASHA Worker',
      doctor: 'Doctor',
      admin: 'Administrator'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>EasyMedPro - Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
            .otp-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 EasyMedPro Healthcare</h1>
                <p>Email Verification Code</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>You are logging in as a <strong>${userTypeText[userType] || 'User'}</strong> in the EasyMedPro healthcare platform.</p>
                
                <div class="otp-box">
                    <h3>Your Verification Code:</h3>
                    <div class="otp-code">${otp}</div>
                    <p><small>Enter this code to complete your login</small></p>
                </div>

                <div class="warning">
                    <strong>⚠️ Important Security Information:</strong>
                    <ul>
                        <li>This code is valid for <strong>10 minutes</strong> only</li>
                        <li>Do not share this code with anyone</li>
                        <li>EasyMedPro will never ask for your verification code via phone or other means</li>
                        <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                </div>

                <p>This email verification is a backup authentication method for the EasyMedPro healthcare platform. If you prefer SMS verification, please use the phone number option on the login page.</p>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} EasyMedPro Healthcare Platform</p>
                    <p>Empowering rural healthcare across India</p>
                    <p><small>This is an automated email. Please do not reply to this message.</small></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, otpData] of this.emailOTPs.entries()) {
      if (now > otpData.expiresAt) {
        this.emailOTPs.delete(email);
        console.log(`🧹 Cleaned up expired OTP for ${email}`);
      }
    }
  }

  // Get email OTP statistics
  getEmailOTPStats() {
    const activeOTPs = Array.from(this.emailOTPs.values());
    return {
      activeOTPs: activeOTPs.length,
      expiredOTPs: activeOTPs.filter(otp => Date.now() > otp.expiresAt).length,
      validOTPs: activeOTPs.filter(otp => Date.now() <= otp.expiresAt).length,
      emailTransporterActive: !!this.transporter
    };
  }

  // Test email functionality
  async testEmail(email, testMessage = 'Test email from EasyMedPro Email OTP Service') {
    try {
      if (!this.transporter) {
        return {
          success: false,
          message: 'Email transporter not configured'
        };
      }

      const mailOptions = {
        from: `"EasyMedPro Test" <${this.emailConfig.auth.user}>`,
        to: email,
        subject: 'EasyMedPro - Email Service Test',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>📧 Email Service Test</h2>
            <p>This is a test email from the EasyMedPro Email OTP Service.</p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Test Message:</strong> ${testMessage}
            </div>
            <p><small>Test sent at: ${new Date().toLocaleString()}</small></p>
          </div>
        `,
        text: `EasyMedPro Email Service Test\n\n${testMessage}\n\nTest sent at: ${new Date().toLocaleString()}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_TEST_SUCCESS', 'Email service test successful', true, {
        messageId: result.messageId,
        testMessage
      });

      return {
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Email test failed:', error);
      
      otpDebugService.logOTPEvent(email, 'EMAIL_TEST_FAILED', `Email test failed: ${error.message}`, false, {
        error: error.message
      });

      return {
        success: false,
        message: `Email test failed: ${error.message}`,
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const emailOTPService = new EmailOTPService();
export default emailOTPService;