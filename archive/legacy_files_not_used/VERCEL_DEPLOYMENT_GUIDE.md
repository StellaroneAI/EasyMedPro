# EasyMed Healthcare Platform - Vercel Deployment Guide
# EasyMed Healthcare Platform - Vercel Deployment Guide

## 🚀 Production Deployment with Twilio SMS Authentication

This guide will help you deploy the EasyMed healthcare platform to Vercel with full Twilio SMS authentication support.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Twilio Account**: Sign up at [twilio.com](https://twilio.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## 🔧 Environment Variables Setup

### Required Environment Variables for Vercel

Set these in your Vercel dashboard under **Settings > Environment Variables**:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_actual_twilio_account_sid
TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token
TWILIO_PHONE_NUMBER=your_actual_twilio_phone_number
TWILIO_VERIFY_SERVICE_SID=your_actual_twilio_verify_service_sid

# JWT Authentication Configuration
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here_at_least_32_chars
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

# Security Configuration
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=30

# Environment
NODE_ENV=production
```

## 📱 Twilio Setup Instructions

### 1. Create Twilio Account
1. Go to [twilio.com](https://twilio.com) and sign up
2. Verify your phone number
3. Get $15 free trial credit

### 2. Get Your Credentials
From your Twilio Console Dashboard:
- **Account SID**: Found on the main dashboard
- **Auth Token**: Found on the main dashboard (click "show" to reveal)

### 3. Get a Phone Number
1. Go to **Phone Numbers > Manage > Buy a number**
2. Select a number from India (+91) for better delivery rates
3. Enable SMS capabilities
4. Note the phone number (format: +91XXXXXXXXXX)

### 4. Create Verify Service (Recommended)
1. Go to **Verify > Services**
2. Click "Create new Service"
3. Name it "EasyMed Healthcare"
4. Save the Service SID

## 🌐 Vercel Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Connect your repo to Vercel
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Go to **Settings > Environment Variables**
   - Add all variables from the list above

3. **Deploy**
   - Push to your main branch
   - Vercel will automatically deploy

### Method 2: CLI Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd /path/to/EasyMedPro
   vercel --prod
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add TWILIO_ACCOUNT_SID
   vercel env add TWILIO_AUTH_TOKEN
   vercel env add JWT_SECRET
   # ... repeat for all variables
   ```

## ✅ Post-Deployment Testing

### 1. Test SMS Authentication Flow

1. **Access your deployed app**: `https://your-app.vercel.app`

2. **Test Phone Login**:
   - Select "Patient" user type
   - Choose "Phone Login"
   - Enter Indian mobile number: `9876543210`
   - Click "Send OTP"
   - Check SMS for OTP code
   - Enter OTP and verify

3. **Verify All User Types**:
   - Test Patient login
   - Test ASHA Worker login
   - Test Doctor login
   - Test Admin login (use: admin@easymed.in / admin123)

### 2. Test API Endpoints

Use curl or Postman to test:

```bash
# Test OTP Send
curl -X POST https://your-app.vercel.app/api/sms/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "userType": "patient", "language": "english"}'

# Test OTP Verify (use sessionToken from above response)
curl -X POST https://your-app.vercel.app/api/sms/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "otp": "123456", "userType": "patient", "sessionToken": "your_session_token"}'
```

## 🔒 Security Best Practices

### 1. JWT Secrets
- Use strong, random secrets (minimum 32 characters)
- Never commit secrets to version control
- Rotate secrets periodically

### 2. Twilio Security
- Enable Twilio Webhook authentication
- Use Verify Service for better security
- Monitor usage and set up alerts

### 3. Rate Limiting
- Current implementation has basic rate limiting
- For production, consider adding Redis-based rate limiting
- Monitor for abuse patterns

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor performance and usage

### 2. Twilio Console
- Monitor SMS delivery rates
- Track usage and costs
- Set up usage alerts

### 3. Application Logs
- Check Vercel Function logs
- Monitor authentication success/failure rates
- Set up error alerting

## 🌍 Indian Market Optimizations

### 1. SMS Delivery
- Use Indian Twilio phone numbers for better delivery
- Test with major Indian carriers (Airtel, Jio, VI)
- Consider local number for WhatsApp integration

### 2. Performance
- CDN is automatically handled by Vercel
- Images are optimized for Indian bandwidth
- Low-bandwidth mode is implemented

### 3. Compliance
- HIPAA-compliant data handling
- Indian healthcare regulation compliance
- Data residency considerations

## 🚨 Troubleshooting

### Common Issues

1. **OTP Not Delivered**
   - Check Twilio console for delivery status
   - Verify phone number format (+91XXXXXXXXXX)
   - Check if number is verified in trial account

2. **Authentication Errors**
   - Verify all environment variables are set
   - Check JWT secret configuration
   - Ensure time synchronization

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Support Contacts

- **Twilio Support**: [help.twilio.com](https://help.twilio.com)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **EasyMed Team**: Create an issue in the GitHub repository

## 📈 Scaling Considerations

For production scaling:

1. **Database**: Implement MongoDB/PostgreSQL for user data
2. **Redis**: Add Redis for session storage and rate limiting
3. **Load Balancing**: Vercel handles this automatically
4. **Monitoring**: Implement comprehensive logging and monitoring
5. **Backup**: Set up automated data backups

---

## 🎉 Congratulations!

Your EasyMed healthcare platform is now deployed and ready to serve India's 1.4 billion users with secure SMS authentication!

For ongoing support and feature requests, please refer to the main README.md or create an issue in the GitHub repository.