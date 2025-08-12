# EasyMedPro Backend API Server

A comprehensive healthcare authentication and management API server built with Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication System
- **JWT-based Authentication** with access and refresh tokens
- **Multi-method Login**: Phone OTP and Email/Password
- **User Registration** with phone number verification
- **Secure Password Hashing** using bcrypt
- **Account Security**: Login attempt limits and account lockout protection
- **Session Management**: Token refresh and logout functionality

### SMS Integration
- **Twilio Integration** for SMS-based OTP verification
- **Appointment Notifications**: Confirmations and reminders
- **Emergency Alerts**: SMS-based emergency communication
- **Configurable Templates**: Customizable SMS messages

### User Management
- **Multi-role Support**: Patient, Doctor, ASHA Worker, Admin
- **Profile Management**: Comprehensive user profiles with role-specific data
- **User Statistics**: Admin dashboard analytics
- **Account Status Management**: Active/inactive user controls

### Security Features
- **CORS Protection** with configurable origins
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Helmet Security Headers**
- **Environment-based Configuration**

### Database Support
- **MongoDB Integration** with Mongoose ODM
- **Demo Mode Fallback** when MongoDB unavailable
- **In-memory Storage** for development and testing
- **Data Persistence** and backup strategies

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (optional - demo mode available)
- Twilio Account (optional - demo mode available)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EasyMedPro/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## ⚙️ Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/easymedpro

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/send-otp` | Send OTP to phone |
| POST | `/verify-otp` | Verify OTP and login |
| POST | `/login` | Email/password login |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout user |
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |

### User Management (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all users (admin) |
| GET | `/:userId` | Get user by ID |
| PATCH | `/:userId/status` | Update user status |
| GET | `/stats/overview` | User statistics |

### Health Check (`/api/health`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health status |
| GET | `/db` | Database health |
| GET | `/services` | Service status |

## 📱 SMS Integration

### Twilio Setup

1. **Create Twilio Account**: Sign up at [twilio.com](https://twilio.com)
2. **Get Credentials**: Account SID, Auth Token, Phone Number
3. **Configure Environment**: Add credentials to `.env`
4. **Test SMS**: Use demo mode for development

### SMS Features

```javascript
// Send OTP
await twilioService.sendOTP(phoneNumber, otp, userName);

// Appointment confirmation
await twilioService.sendAppointmentConfirmation(phoneNumber, {
  doctorName: 'Dr. Smith',
  date: '2025-01-30',
  time: '10:00 AM',
  type: 'Video Consultation'
});

// Emergency alert
await twilioService.sendEmergencyAlert(phoneNumber, {
  patientName: 'John Doe',
  emergencyType: 'Heart Attack',
  contactNumber: '9876543210'
});
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  phone: String (unique),
  email: String (unique, optional),
  password: String (hashed),
  userType: ['patient', 'asha', 'doctor', 'admin'],
  isPhoneVerified: Boolean,
  isEmailVerified: Boolean,
  isActive: Boolean,
  profile: {
    // Role-specific data
  },
  refreshTokens: [TokenObject],
  // Security fields
}
```

### Appointment Model
```javascript
{
  appointmentId: String (unique),
  patient: ObjectId,
  doctor: ObjectId,
  ashaWorker: ObjectId (optional),
  type: ['video-consultation', 'in-person', 'phone-consultation'],
  status: ['scheduled', 'confirmed', 'completed', 'cancelled'],
  scheduledDate: Date,
  scheduledTime: String,
  // Additional fields
}
```

## 🔒 Security Best Practices

### JWT Token Management
- **Access tokens**: Short-lived (24 hours)
- **Refresh tokens**: Longer-lived (7 days)
- **Token rotation**: New refresh token on each refresh
- **Secure storage**: HttpOnly cookies recommended

### Password Security
- **bcrypt hashing** with configurable rounds
- **Minimum length**: 6 characters
- **Account lockout**: After 5 failed attempts
- **Password reset**: Secure token-based flow

### API Security
- **Rate limiting**: 100 requests per 15 minutes
- **CORS protection**: Configured origins only
- **Input validation**: All endpoints validated
- **SQL injection protection**: Mongoose ODM

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/status

# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'
```

### Demo Users
Pre-configured demo users for testing:

```javascript
// Patient
{ email: 'patient@demo.com', password: 'patient123', phone: '9876543210' }

// Doctor  
{ email: 'doctor@demo.com', password: 'doctor123', phone: '9876543230' }

// ASHA Worker
{ email: 'asha@demo.com', password: 'asha123', phone: '9876543220' }
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Install dependencies
npm install --production

# Start server
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Checks
- **API Status**: `GET /api/status`
- **Database Health**: `GET /api/health/db`
- **Service Status**: `GET /api/health/services`

### Logging
- **Console logging** for development
- **Error tracking** for production
- **Request logging** with timestamps

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string
   - Server falls back to demo mode

2. **Twilio SMS Not Working**
   - Verify account credentials
   - Check phone number format
   - Demo mode logs OTP to console

3. **JWT Token Errors**
   - Check JWT_SECRET configuration
   - Verify token expiration times
   - Clear cached tokens

### Debug Mode
```bash
NODE_ENV=development npm start
```

## 📝 API Documentation

For detailed API documentation with request/response examples, see:
- Postman Collection: `docs/EasyMedPro-API.postman_collection.json`
- OpenAPI Spec: `docs/openapi.yaml`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for India's Healthcare Future**