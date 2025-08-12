/**
 * Vercel Serverless Function for Sending SMS OTP
 * API: /api/sms/send-otp
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import crypto from 'crypto-js';

// Initialize rate limiter
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip || 'unknown',
  points: 5, // Number of requests
  duration: 900, // Per 15 minutes (900 seconds)
});

// OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Validate Indian phone number
 */
function validateIndianPhoneNumber(phoneNumber: string): { isValid: boolean; formatted?: string } {
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length === 10 && digits.match(/^[6-9]\d{9}$/)) {
    return { isValid: true, formatted: `+91${digits}` };
  } else if (digits.length === 12 && digits.startsWith('91') && digits.substring(2).match(/^[6-9]\d{9}$/)) {
    return { isValid: true, formatted: `+${digits}` };
  }
  
  return { isValid: false };
}

/**
 * Generate OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get OTP message template
 */
function getOTPMessage(otp: string, language: string): string {
  const templates = {
    english: `Your EasyMed verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    hindi: `आपका EasyMed सत्यापन कोड है: ${otp}। 10 मिनट के लिए वैध। इस कोड को साझा न करें।`,
    tamil: `உங்கள் EasyMed சரிபார்ப்பு குறியீடு: ${otp}। 10 நிமிடங்களுக்கு செல்லுபடியாகும்।`,
    telugu: `మీ EasyMed ధృవీకరణ కోడ్: ${otp}. 10 నిమిషాలు చెల్లుబాటు।`,
    bengali: `আপনার EasyMed যাচাইকরণ কোড: ${otp}। ১০ মিনিটের জন্য বৈধ।`,
    marathi: `तुमचा EasyMed सत्यापन कोड: ${otp}. १० मिनिटांसाठी वैध।`,
    punjabi: `ਤੁਹਾਡਾ EasyMed ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ: ${otp}। 10 ਮਿੰਟਾਂ ਲਈ ਵੈਧ।`,
    gujarati: `તમારો EasyMed વેરિફિકેશન કોડ: ${otp}. 10 મિનિટ માટે માન્ય।`,
    kannada: `ನಿಮ್ಮ EasyMed ಪರಿಶೀಲನೆ ಕೋಡ್: ${otp}. 10 ನಿಮಿಷಗಳವರೆಗೆ ಮಾನ್ಯ।`,
    malayalam: `നിങ്ങളുടെ EasyMed സ്ഥിരീകരണ കോഡ്: ${otp}. 10 മിനിറ്റ് സാധുവാണ്।`
  };

  return templates[language] || templates.english;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Rate limiting
    await rateLimiter.consume(req.ip || 'unknown');

    const { phoneNumber, userType, language = 'english' } = req.body;

    // Validate required fields
    if (!phoneNumber || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and user type are required'
      });
    }

    // Validate phone number
    const phoneValidation = validateIndianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Indian mobile number'
      });
    }

    const formattedPhone = phoneValidation.formatted!;

    // Check if OTP was sent recently (prevent spam)
    const lastOTPKey = `lastOTP_${formattedPhone}`;
    const lastOTPTime = otpStorage.get(lastOTPKey);
    const now = Date.now();
    
    if (lastOTPTime && (now - lastOTPTime) < 60000) { // 1 minute cooldown
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting another OTP'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpKey = `otp_${formattedPhone}`;
    const attemptKey = `attempts_${formattedPhone}`;

    // Store OTP with expiration (10 minutes)
    const otpData = {
      otp: crypto.SHA256(otp).toString(), // Hash the OTP for security
      userType,
      language,
      createdAt: now,
      expiresAt: now + (10 * 60 * 1000), // 10 minutes
      attempts: 0
    };

    otpStorage.set(otpKey, otpData);
    otpStorage.set(lastOTPKey, now);

    // Clear previous attempt count
    otpStorage.delete(attemptKey);

    // Send SMS using Twilio
    const message = getOTPMessage(otp, language);
    
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    // Log for audit (without sensitive data)
    console.log(`OTP sent to ${formattedPhone.replace(/\d(?=\d{4})/g, '*')} for ${userType}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      sessionId: crypto.SHA256(`${formattedPhone}_${now}`).toString().substring(0, 16)
    });

  } catch (rateLimiterRes) {
    if (rateLimiterRes?.remainingHits !== undefined) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000)
      });
    }

    console.error('Error sending OTP:', rateLimiterRes);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? rateLimiterRes.message : undefined
    });
  }
}