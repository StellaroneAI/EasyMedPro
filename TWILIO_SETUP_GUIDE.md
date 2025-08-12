# Twilio SMS Authentication Setup Guide

## Overview
This guide will help you set up Twilio SMS authentication for the EasyMed healthcare platform, providing secure phone number-based authentication for Indian users.

## Prerequisites
1. Twilio Account (Sign up at https://twilio.com)
2. Verified Indian phone number for testing
3. Basic understanding of SMS OTP authentication

## Step 1: Twilio Account Setup

### 1.1 Create Twilio Account
- Visit https://twilio.com
- Sign up for a free account
- Verify your email and phone number

### 1.2 Get Twilio Credentials
- Go to Twilio Console Dashboard
- Note down your **Account SID** and **Auth Token**
- These will be used in environment variables

### 1.3 Get a Twilio Phone Number
- In Twilio Console, go to Phone Numbers > Manage > Buy a number
- Choose a number that supports SMS in India
- Note down this phone number (format: +1234567890)

### 1.4 Set up Twilio Verify Service (Recommended)
- Go to Verify > Services in Twilio Console
- Create a new Verify Service
- Note down the **Service SID**
- Configure settings:
  - Service Name: "EasyMed Healthcare"
  - Code Length: 6 digits
  - Attempt Limit: 3
  - Time to Live: 10 minutes

## Step 2: Environment Configuration

### 2.1 Copy Environment Template
```bash
cp .env.example .env
```

### 2.2 Update Twilio Configuration
Edit your `.env` file and add your Twilio credentials:

```env
# Twilio SMS Authentication Configuration
TWILIO_ACCOUNT_SID=your_account_sid_from_twilio_console
TWILIO_AUTH_TOKEN=your_auth_token_from_twilio_console
TWILIO_PHONE_NUMBER=your_twilio_phone_number_with_country_code
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# JWT Authentication Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_32_characters_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMS Configuration for Indian Healthcare
SMS_OTP_LENGTH=6
SMS_OTP_EXPIRY_MINUTES=10
SMS_MAX_RETRY_ATTEMPTS=3
SMS_RATE_LIMIT_WINDOW=15
SMS_RATE_LIMIT_MAX_REQUESTS=5

# Indian Phone Number Configuration
PHONE_COUNTRY_CODE=+91
PHONE_MIN_LENGTH=10
PHONE_MAX_LENGTH=10
```

## Step 3: Testing the Authentication Flow

### 3.1 Development Testing
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser
3. Navigate to the login page
4. Select user type (Patient, ASHA, Doctor, Admin)
5. Choose "Phone Login" method
6. Enter a valid Indian mobile number (10 digits starting with 6-9)
7. Click "Send OTP"
8. Check your SMS for the 6-digit verification code
9. Enter the OTP and click "Verify OTP"

### 3.2 Phone Number Formats Supported
- `9876543210` (10 digits)
- `+919876543210` (with country code)
- `919876543210` (without + but with country code)

### 3.3 Error Handling
The system handles various error scenarios:
- Invalid phone number format
- OTP expiry (10 minutes)
- Maximum retry attempts (3 attempts)
- Rate limiting (5 requests per 15 minutes)
- Network errors
- Twilio service errors

## Step 4: Security Features

### 4.1 OTP Security
- 6-digit random OTP generation
- 10-minute expiry time
- Maximum 3 verification attempts
- OTP hashing for storage

### 4.2 Rate Limiting
- 5 OTP requests per phone number per 15 minutes
- 1-minute cooldown between OTP requests
- IP-based rate limiting for verification attempts

### 4.3 JWT Token Security
- 15-minute access token expiry
- 7-day refresh token expiry
- Secure token storage in localStorage
- Automatic token refresh

### 4.4 Indian Healthcare Compliance
- Phone number privacy protection
- Audit logging for authentication events
- HIPAA-compliant data handling
- Secure storage of user data

## Step 5: Multi-language Support

### 5.1 Supported Languages
The SMS OTP messages support multiple Indian languages:
- English
- Hindi (हिंदी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Punjabi (ਪੰਜਾਬੀ)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Odia (ଓଡ଼ିଆ)
- Assamese (অসমীয়া)

### 5.2 Example SMS Messages
**English**: "Your EasyMed verification code is: 123456. Valid for 10 minutes. Do not share this code."

**Hindi**: "आपका EasyMed सत्यापन कोड है: 123456। 10 मिनट के लिए वैध। इस कोड को साझा न करें।"

## Step 6: Production Deployment

### 6.1 Vercel Environment Variables
In your Vercel dashboard, add the following environment variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_VERIFY_SERVICE_SID`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### 6.2 Security Considerations
- Never commit `.env` files to version control
- Use strong, unique JWT secrets in production
- Enable Twilio webhook validation
- Monitor SMS usage and costs
- Set up alerts for authentication failures

### 6.3 Monitoring and Analytics
- Track OTP delivery success rates
- Monitor authentication failure patterns
- Set up alerts for unusual activity
- Log authentication events for audit

## Step 7: Troubleshooting

### 7.1 Common Issues
1. **OTP not received**
   - Check phone number format
   - Verify Twilio account has SMS enabled for India
   - Check Twilio console for delivery status

2. **"Invalid phone number" error**
   - Ensure number starts with 6-9
   - Use 10-digit format without country code
   - Remove any spaces or special characters

3. **"Too many requests" error**
   - Wait 15 minutes before trying again
   - Check rate limiting configuration

4. **JWT token errors**
   - Check JWT secret configuration
   - Verify token expiry settings
   - Clear browser localStorage

### 7.2 Debugging
- Check browser console for detailed error messages
- Monitor Twilio console for SMS delivery logs
- Use Vercel function logs for server-side debugging

## Step 8: Cost Optimization

### 8.1 Twilio Costs
- SMS costs vary by country (~$0.0075 per SMS to India)
- Use Twilio Verify service for better rates
- Set up billing alerts

### 8.2 Usage Monitoring
- Track monthly SMS volume
- Monitor authentication success rates
- Optimize OTP retry logic

## Support
For technical support:
- Check Twilio documentation: https://www.twilio.com/docs/verify
- EasyMed platform documentation
- Contact development team

## Security Compliance
This implementation follows:
- HIPAA compliance guidelines
- Indian healthcare data protection standards
- SMS security best practices
- JWT security standards