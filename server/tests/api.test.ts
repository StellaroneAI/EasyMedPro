import request from 'supertest';
import app from '../app.js';

describe('EasyMedPro API Tests', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('mcp_auth_comm', 'available');
    });
  });

  // OTP Service Tests
  describe('OTP Service', () => {
    describe('POST /api/otp/send', () => {
      it('should send OTP successfully', async () => {
        const response = await request(app)
          .post('/api/otp/send')
          .send({
            phoneNumber: '+1234567890',
            userName: 'Test User'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('otpId');
      });

      it('should fail without phone number', async () => {
        const response = await request(app)
          .post('/api/otp/send')
          .send({
            userName: 'Test User'
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('Phone number is required');
      });
    });

    describe('POST /api/otp/verify', () => {
      it('should require OTP ID and code', async () => {
        const response = await request(app)
          .post('/api/otp/verify')
          .send({
            otpId: 'test-id'
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('OTP ID and code are required');
      });
    });
  });

  // Appointment Service Tests
  describe('Appointment Service', () => {
    describe('POST /api/appointments/search', () => {
      it('should search available slots', async () => {
        const response = await request(app)
          .post('/api/appointments/search')
          .send({
            specialty: 'General Medicine',
            dateRange: {
              start: '2024-01-15',
              end: '2024-01-20'
            },
            location: 'Downtown Clinic'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('slots');
        expect(Array.isArray(response.body.slots)).toBe(true);
      });

      it('should fail without date range', async () => {
        const response = await request(app)
          .post('/api/appointments/search')
          .send({
            specialty: 'General Medicine'
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('Date range is required');
      });
    });

    describe('POST /api/appointments/book', () => {
      it('should require slot ID and patient ID', async () => {
        const response = await request(app)
          .post('/api/appointments/book')
          .send({
            slotId: 'slot-123'
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('Slot ID and patient ID are required');
      });
    });
  });

  // Triage Service Tests
  describe('Triage Service', () => {
    describe('POST /api/triage/analyze', () => {
      it('should analyze symptoms successfully', async () => {
        const response = await request(app)
          .post('/api/triage/analyze')
          .send({
            symptoms: ['headache', 'fever'],
            patientInfo: {
              age: 30,
              gender: 'female',
              weight: 65,
              height: 165
            },
            severityLevel: 'moderate'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('triageId');
        expect(response.body).toHaveProperty('assessment');
      });

      it('should fail without symptoms', async () => {
        const response = await request(app)
          .post('/api/triage/analyze')
          .send({
            patientInfo: {
              age: 30,
              gender: 'female'
            }
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('Symptoms array is required');
      });

      it('should fail without patient info', async () => {
        const response = await request(app)
          .post('/api/triage/analyze')
          .send({
            symptoms: ['headache', 'fever']
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('Patient info with age and gender is required');
      });
    });

    describe('GET /api/symptoms/suggestions', () => {
      it('should return symptom suggestions', async () => {
        const response = await request(app)
          .get('/api/symptoms/suggestions')
          .query({ q: 'head' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('suggestions');
        expect(Array.isArray(response.body.suggestions)).toBe(true);
      });

      it('should fail without query parameter', async () => {
        const response = await request(app)
          .get('/api/symptoms/suggestions')
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('Query parameter "q" is required');
      });
    });
  });

  // EHR Service Tests
  describe('EHR Service', () => {
    describe('GET /api/claims/status', () => {
      it('should return claim status', async () => {
        const response = await request(app)
          .get('/api/claims/status')
          .query({ 
            patientId: 'patient-123',
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('claims');
        expect(Array.isArray(response.body.claims)).toBe(true);
      });
    });

    describe('GET /api/patient/summary/:patientId', () => {
      it('should return patient summary', async () => {
        const response = await request(app)
          .get('/api/patient/summary/patient-123')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('patient');
      });
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Endpoint not found');
    });
  });

  // CORS tests
  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/otp/send')
        .set('Origin', 'https://easymed-8c074.web.app')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });
});
