# EasyMedPro API Server

Backend API server for the EasyMedPro healthcare platform with integrated Model Context Protocol (MCP) services.

## 🚀 Features

- **MCP Integration**: Complete integration with remote MCP gateway for healthcare services
- **Authentication**: OTP-based authentication with Twilio SMS
- **Appointments**: Search, book, cancel appointments with meeting link generation
- **Triage System**: AI-powered symptom analysis and health assessment
- **EHR/Claims**: Insurance claims management and patient records
- **Security**: Helmet, CORS, rate limiting, and JWT authentication
- **Testing**: Comprehensive test suite with Jest and Supertest
- **Graceful Fallbacks**: Offline functionality when MCP services are unavailable

## 🏗️ Architecture

```
server/
├── app.js                 # Main Express application
├── package.json           # Dependencies and scripts
├── jest.config.json       # Jest test configuration
├── .env.test             # Test environment variables
├── src/
│   ├── mcp/
│   │   ├── client.js     # MCP client with retry logic
│   │   └── types.js      # TypeScript-style type definitions
│   └── services/
│       ├── otpService.js        # OTP generation and verification
│       ├── appointmentService.js # Appointment booking and management
│       ├── triageService.js     # Symptom analysis and triage
│       └── ehrService.js        # EHR and claims management
└── tests/
    ├── setup.js          # Jest test setup
    └── api.test.js       # API endpoint tests
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` from the root directory and configure:
   ```bash
   cp ../.env.example .env
   ```

3. **Configure required services:**
   - MCP Gateway credentials
   - Twilio account for SMS
   - Firebase project settings
   - MongoDB connection string

## 🚦 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health and service status

### Authentication/OTP
- `POST /api/otp/send` - Send OTP via SMS
- `POST /api/otp/verify` - Verify OTP code
- `POST /api/reminders/send` - Send appointment reminders

### Appointments
- `POST /api/appointments/search` - Search available appointment slots
- `POST /api/appointments/book` - Book an appointment
- `POST /api/appointments/cancel` - Cancel an appointment
- `POST /api/appointments/meeting-link` - Generate meeting link
- `GET /api/appointments/history/:patientId` - Get appointment history

### Triage/Symptoms
- `POST /api/triage/analyze` - Analyze symptoms and perform triage
- `POST /api/triage/followup` - Submit follow-up answers
- `GET /api/triage/disclaimers` - Get medical disclaimers
- `GET /api/symptoms/suggestions` - Get symptom suggestions

### EHR/Claims
- `GET /api/claims/status` - Get claim status information
- `GET /api/claims/denial-reasons/:claimId` - Get claim denial reasons
- `POST /api/claims/appeal` - Submit claim appeal
- `GET /api/patient/summary/:patientId` - Get patient summary
- `GET /api/patient/insurance/:patientId` - Get insurance information

## 🔒 Security Features

- **Helmet**: Security headers protection
- **CORS**: Configured for specific origins only
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request body validation
- **PHI Protection**: Patient data masking in logs
- **JWT Authentication**: Secure token-based auth

## 🌐 MCP Integration

The server integrates with the Model Context Protocol (MCP) gateway for healthcare services:

- **Base URL**: `https://mcp.stellarone.health`
- **Authentication**: JWT-based with API keys
- **Services**: Auth/Comm, Appointments, Symptoms, EHR/RCM
- **Fallbacks**: Local mock data when MCP is unavailable
- **Retry Logic**: Automatic retry with exponential backoff

### MCP Service Modules

1. **OTP Service** (`otpService.js`)
   - SMS-based authentication
   - OTP generation and verification
   - Appointment reminders

2. **Appointment Service** (`appointmentService.js`)
   - Provider search and scheduling
   - Meeting link generation
   - Appointment history

3. **Triage Service** (`triageService.js`)
   - AI-powered symptom analysis
   - Risk assessment
   - Follow-up questions

4. **EHR Service** (`ehrService.js`)
   - Insurance claims management
   - Patient records
   - Claims appeals

## 🧪 Testing

The test suite includes:

- **Unit Tests**: Individual service testing
- **Integration Tests**: API endpoint testing
- **Error Handling**: Edge case validation
- **CORS Testing**: Cross-origin request validation
- **Mock Services**: MCP service mocking for offline testing

### Test Coverage

Run tests with coverage reporting:
```bash
npm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory.

## 📝 Environment Variables

Required environment variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Origins
CORS_ORIGINS=https://easymed-8c074.web.app,http://localhost:5173

# MCP Gateway
MCP_GATEWAY_BASE_URL=https://mcp.stellarone.health
MCP_API_KEY=your-mcp-api-key
MCP_CLIENT_ID=your-mcp-client-id
MCP_CLIENT_SECRET=your-mcp-client-secret

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Firebase
FIREBASE_PROJECT_ID=easymed-8c074
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# Database
MONGODB_URI=mongodb://localhost:27017/easymedpro
```

## 🚀 Deployment

### Local Development
1. Install dependencies: `npm install`
2. Configure environment variables
3. Start development server: `npm run dev`

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure production environment variables
3. Run: `npm start`

### Docker Deployment
```bash
# Build Docker image
docker build -t easymedpro-api .

# Run container
docker run -p 5000:5000 --env-file .env easymedpro-api
```

## 📊 Monitoring

- **Health Endpoint**: `/health` provides service status
- **Error Logging**: Comprehensive error tracking
- **Rate Limiting**: Request throttling with monitoring
- **Performance**: Request timing and response monitoring

## � Development

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Jest for testing

### Scripts
- `npm run dev` - Development with hot reload
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests
- `npm start` - Production server

## 📚 Documentation

- API documentation available at `/health` endpoint
- Service documentation in individual service files
- Test documentation in `tests/` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run test suite
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**EasyMedPro API Server** - Powering modern healthcare with reliable, secure, and scalable backend services.
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