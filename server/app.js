import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { OTPService } from './src/services/otpService.js';
import { AppointmentService } from './src/services/appointmentService.js';
import { TriageService } from './src/services/triageService.js';
import { EHRService } from './src/services/ehrService.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://mcp.stellarone.health"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'https://easymed-8c074.web.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      mcp_auth_comm: 'available',
      mcp_appointments: 'available',
      mcp_symptoms: 'available',
      mcp_ehr_rcm: 'available'
    }
  });
});

// Service instances
const otpService = new OTPService();
const appointmentService = new AppointmentService();
const triageService = new TriageService();
const ehrService = new EHRService();

// Authentication/OTP Routes
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phoneNumber, userName } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const result = await otpService.sendOTP(phoneNumber, userName);
    res.json(result);

  } catch (error) {
    console.error('[API] OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  try {
    const { otpId, otpCode } = req.body;
    
    if (!otpId || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'OTP ID and code are required'
      });
    }

    const result = await otpService.verifyOTP(otpId, otpCode);
    res.json(result);

  } catch (error) {
    console.error('[API] OTP verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/reminders/send', async (req, res) => {
  try {
    const { recipient, type, message, scheduledFor } = req.body;
    
    if (!recipient || !type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, type, and message are required'
      });
    }

    const result = await otpService.sendReminder(recipient, type, message, scheduledFor);
    res.json(result);

  } catch (error) {
    console.error('[API] Reminder send error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Appointment Routes
app.post('/api/appointments/search', async (req, res) => {
  try {
    const { providerId, specialty, dateRange, location } = req.body;
    
    if (!dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({
        success: false,
        message: 'Date range is required'
      });
    }

    const result = await appointmentService.searchAvailableSlots({
      providerId,
      specialty,
      dateRange,
      location
    });
    
    res.json(result);

  } catch (error) {
    console.error('[API] Appointment search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/appointments/book', async (req, res) => {
  try {
    const { slotId, patientId, notes, paymentMethod } = req.body;
    
    if (!slotId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID and patient ID are required'
      });
    }

    const result = await appointmentService.bookAppointment(
      slotId,
      patientId,
      notes,
      paymentMethod
    );
    
    res.json(result);

  } catch (error) {
    console.error('[API] Appointment booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/appointments/cancel', async (req, res) => {
  try {
    const { appointmentId, reason } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const result = await appointmentService.cancelAppointment(appointmentId, reason);
    res.json(result);

  } catch (error) {
    console.error('[API] Appointment cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/appointments/meeting-link', async (req, res) => {
  try {
    const { appointmentId, durationMinutes } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const result = await appointmentService.createMeetingLink(appointmentId, durationMinutes);
    res.json(result);

  } catch (error) {
    console.error('[API] Meeting link creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/appointments/history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await appointmentService.getAppointmentHistory(patientId);
    res.json(result);

  } catch (error) {
    console.error('[API] Appointment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Triage/Symptoms Routes
app.post('/api/triage/analyze', async (req, res) => {
  try {
    const { symptoms, patientInfo, severityLevel } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms array is required'
      });
    }

    if (!patientInfo || !patientInfo.age || !patientInfo.gender) {
      return res.status(400).json({
        success: false,
        message: 'Patient info with age and gender is required'
      });
    }

    const result = await triageService.performTriage({
      symptoms,
      patientInfo,
      severityLevel
    });
    
    res.json(result);

  } catch (error) {
    console.error('[API] Triage analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/triage/followup', async (req, res) => {
  try {
    const { triageId, answers } = req.body;
    
    if (!triageId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Triage ID and answers are required'
      });
    }

    const result = await triageService.submitFollowUpAnswers(triageId, answers);
    res.json(result);

  } catch (error) {
    console.error('[API] Triage followup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/triage/disclaimers', async (req, res) => {
  try {
    const result = await triageService.getDisclaimers();
    res.json(result);

  } catch (error) {
    console.error('[API] Disclaimers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/symptoms/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
    }

    const result = await triageService.getSymptomSuggestions(q);
    res.json(result);

  } catch (error) {
    console.error('[API] Symptom suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// EHR/Claims Routes
app.get('/api/claims/status', async (req, res) => {
  try {
    const { claimId, patientId, startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
      start: String(startDate),
      end: String(endDate)
    } : undefined;

    const result = await ehrService.getClaimStatus({
      claimId: String(claimId || ''),
      patientId: String(patientId || ''),
      dateRange
    });
    
    res.json(result);

  } catch (error) {
    console.error('[API] Claim status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/claims/denial-reasons/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;
    
    const result = await ehrService.getDenialReasons(claimId);
    res.json(result);

  } catch (error) {
    console.error('[API] Denial reasons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/claims/appeal', async (req, res) => {
  try {
    const { claimId, reason, documents, additionalInfo } = req.body;
    
    if (!claimId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID and reason are required'
      });
    }

    const result = await ehrService.submitClaimAppeal(claimId, {
      reason,
      documents,
      additionalInfo
    });
    
    res.json(result);

  } catch (error) {
    console.error('[API] Claim appeal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/patient/summary/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await ehrService.getPatientSummary(patientId);
    res.json(result);

  } catch (error) {
    console.error('[API] Patient summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/patient/insurance/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await ehrService.getInsuranceInfo(patientId);
    res.json(result);

  } catch (error) {
    console.error('[API] Insurance info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EasyMedPro API Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origins: ${corsOptions.origin.join(', ')}`);
  console.log(`🔒 MCP Gateway: ${process.env.MCP_GATEWAY_BASE_URL || 'https://mcp.stellarone.health'}`);
  console.log('✅ All MCP services initialized with graceful fallbacks');
});

export default app;
