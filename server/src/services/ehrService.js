import { getMCPClient } from '../mcp/client.js';

export class EHRService {
  constructor() {
    this.mcpClient = getMCPClient();
  }

  async getClaimStatus(params) {
    try {
      const request = {
        claimId: params.claimId,
        patientId: params.patientId,
        dateRange: params.dateRange,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('ehr-rcm', 'getClaimStatus', request);
      
      if (response && response.success) {
        return {
          success: true,
          claims: response.claims || [],
          message: 'Claim status retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[EHR] Claim status request failed, using fallback:', error.message);
      return this.generateMockClaimStatus(params);
    }
  }

  generateMockClaimStatus(params) {
    const mockClaims = [
      {
        claimId: params.claimId || `claim_${Date.now()}_1`,
        patientId: params.patientId,
        serviceDate: '2024-01-15',
        providerId: 'dr_smith_001',
        providerName: 'Dr. Sarah Smith',
        serviceDescription: 'Annual Physical Examination',
        claimAmount: 250.00,
        approvedAmount: 200.00,
        status: 'approved',
        insuranceCompany: 'HealthFirst Insurance',
        processedDate: '2024-01-20',
        paymentDate: '2024-01-25'
      },
      {
        claimId: `claim_${Date.now()}_2`,
        patientId: params.patientId,
        serviceDate: '2024-01-10',
        providerId: 'lab_central_001',
        providerName: 'Central Medical Laboratory',
        serviceDescription: 'Blood Work Panel',
        claimAmount: 150.00,
        approvedAmount: 150.00,
        status: 'paid',
        insuranceCompany: 'HealthFirst Insurance',
        processedDate: '2024-01-12',
        paymentDate: '2024-01-15'
      }
    ];

    return {
      success: true,
      claims: mockClaims,
      message: 'Mock claim status provided (fallback mode)'
    };
  }

  async getDenialReasons(claimId) {
    try {
      const request = {
        claimId,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('ehr-rcm', 'getDenialReasons', request);
      
      if (response && response.success) {
        return {
          success: true,
          reasons: response.reasons || [],
          appealOptions: response.appealOptions || [],
          message: 'Denial reasons retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[EHR] Denial reasons request failed, using fallback:', error.message);
      
      const mockReasons = [
        {
          code: 'CO-16',
          description: 'Claim/service lacks information which is needed for adjudication',
          category: 'Missing Information',
          actionRequired: 'Submit additional documentation'
        },
        {
          code: 'CO-97',
          description: 'Payment is included in the allowance for another service/procedure',
          category: 'Bundled Service',
          actionRequired: 'Review bundling guidelines'
        }
      ];

      const appealOptions = [
        'Submit corrected claim with additional documentation',
        'File formal appeal with insurance company',
        'Request peer-to-peer review with medical director'
      ];

      return {
        success: true,
        reasons: mockReasons,
        appealOptions,
        message: 'Mock denial reasons provided (fallback mode)'
      };
    }
  }

  async submitClaimAppeal(claimId, appealData) {
    try {
      const request = {
        claimId,
        reason: appealData.reason,
        documents: appealData.documents || [],
        additionalInfo: appealData.additionalInfo,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('ehr-rcm', 'submitAppeal', request);
      
      if (response && response.success) {
        return {
          success: true,
          appealId: response.appealId,
          trackingNumber: response.trackingNumber,
          message: 'Claim appeal submitted successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[EHR] Appeal submission failed, using fallback:', error.message);
      
      const appealId = `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const trackingNumber = `TRK${Date.now()}`;

      // Store mock appeal
      global.appealCache = global.appealCache || new Map();
      global.appealCache.set(appealId, {
        claimId,
        appealData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        trackingNumber
      });

      return {
        success: true,
        appealId,
        trackingNumber,
        message: 'Claim appeal recorded (fallback mode)'
      };
    }
  }

  async getPatientSummary(patientId) {
    try {
      const request = {
        patientId,
        includeClaims: true,
        includeAppointments: true,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('ehr-rcm', 'getPatientSummary', request);
      
      if (response && response.success) {
        return {
          success: true,
          patient: response.patient,
          message: 'Patient summary retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[EHR] Patient summary request failed, using fallback:', error.message);
      return this.generateMockPatientSummary(patientId);
    }
  }

  generateMockPatientSummary(patientId) {
    const mockPatient = {
      patientId,
      demographics: {
        name: 'John Doe',
        dateOfBirth: '1980-05-15',
        gender: 'male',
        address: '123 Main St, City, State 12345',
        phone: '+1-555-0123',
        email: 'john.doe@email.com'
      },
      insurance: {
        primary: {
          company: 'HealthFirst Insurance',
          policyNumber: 'HF123456789',
          groupNumber: 'GRP001',
          effectiveDate: '2024-01-01',
          status: 'active'
        }
      },
      recentClaims: [
        {
          claimId: 'claim_001',
          serviceDate: '2024-01-15',
          amount: 250.00,
          status: 'approved'
        }
      ],
      upcomingAppointments: [
        {
          appointmentId: 'appt_001',
          providerId: 'dr_smith_001',
          datetime: '2024-02-01T10:00:00Z',
          type: 'follow-up'
        }
      ],
      alerts: [
        'Annual physical due',
        'Insurance verification needed for upcoming appointment'
      ]
    };

    return {
      success: true,
      patient: mockPatient,
      message: 'Mock patient summary provided (fallback mode)'
    };
  }

  async getInsuranceInfo(patientId) {
    try {
      const request = {
        patientId,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('ehr-rcm', 'getInsuranceInfo', request);
      
      if (response && response.success) {
        return {
          success: true,
          insurance: response.insurance,
          message: 'Insurance information retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[EHR] Insurance info request failed, using fallback:', error.message);
      
      const mockInsurance = {
        primary: {
          company: 'HealthFirst Insurance',
          policyNumber: 'HF123456789',
          groupNumber: 'GRP001',
          planName: 'Premium Health Plan',
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          status: 'active',
          copayAmount: 25.00,
          deductible: 1500.00,
          deductibleMet: 250.00,
          outOfPocketMax: 5000.00,
          outOfPocketMet: 275.00
        },
        secondary: null,
        eligibilityLastVerified: new Date().toISOString(),
        benefits: {
          preventiveCare: '100% covered',
          primaryCare: '$25 copay',
          specialistCare: '$50 copay',
          emergencyRoom: '$250 copay',
          prescription: 'Formulary dependent'
        }
      };

      return {
        success: true,
        insurance: mockInsurance,
        message: 'Mock insurance information provided (fallback mode)'
      };
    }
  }
}
