import { getMCPClient } from '../mcp/client.js';

export class TriageService {
  constructor() {
    this.mcpClient = getMCPClient();
  }

  async performTriage(data) {
    try {
      const request = {
        symptoms: data.symptoms,
        patientInfo: data.patientInfo,
        severityLevel: data.severityLevel,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('symptoms', 'analyzeTriage', request);
      
      if (response && response.success) {
        return {
          success: true,
          triageId: response.triageId,
          assessment: response.assessment,
          message: 'Triage analysis completed successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Triage] Analysis failed, using fallback:', error.message);
      return this.generateBasicTriage(data.symptoms, data.patientInfo, data.severityLevel);
    }
  }

  generateBasicTriage(symptoms, patientInfo, severityLevel) {
    const triageId = `triage_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Basic risk assessment based on symptoms
    let riskLevel = 'low';
    let urgency = 'routine';
    let recommendations = [];

    const highRiskSymptoms = ['chest pain', 'difficulty breathing', 'severe headache', 'high fever'];
    const moderateRiskSymptoms = ['persistent cough', 'abdominal pain', 'dizziness'];

    const hasHighRisk = symptoms.some(symptom => 
      highRiskSymptoms.some(risk => symptom.toLowerCase().includes(risk))
    );
    
    const hasModerateRisk = symptoms.some(symptom => 
      moderateRiskSymptoms.some(risk => symptom.toLowerCase().includes(risk))
    );

    if (hasHighRisk || severityLevel === 'severe') {
      riskLevel = 'high';
      urgency = 'urgent';
      recommendations = [
        'Seek immediate medical attention',
        'Consider emergency care if symptoms worsen',
        'Do not delay treatment'
      ];
    } else if (hasModerateRisk || severityLevel === 'moderate') {
      riskLevel = 'moderate';
      urgency = 'same-day';
      recommendations = [
        'Schedule appointment within 24 hours',
        'Monitor symptoms closely',
        'Seek care if symptoms worsen'
      ];
    } else {
      recommendations = [
        'Consider scheduling routine appointment',
        'Continue monitoring symptoms',
        'Practice self-care measures'
      ];
    }

    const assessment = {
      riskLevel,
      urgency,
      recommendations,
      followUpQuestions: this.generateFollowUpQuestions(symptoms, riskLevel),
      disclaimer: 'This assessment is for informational purposes only and does not replace professional medical advice.'
    };

    // Store triage for follow-up
    global.triageCache = global.triageCache || new Map();
    global.triageCache.set(triageId, {
      symptoms,
      patientInfo,
      assessment,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      triageId,
      assessment,
      message: 'Basic triage assessment completed (fallback mode)'
    };
  }

  generateFollowUpQuestions(symptoms, riskLevel) {
    const baseQuestions = [
      'How long have you been experiencing these symptoms?',
      'Have the symptoms gotten worse, better, or stayed the same?',
      'Are you currently taking any medications?'
    ];

    const urgentQuestions = [
      'Are you experiencing any difficulty breathing?',
      'Do you have any chest pain or pressure?',
      'Have you lost consciousness or feel like you might?'
    ];

    const routineQuestions = [
      'Have you tried any treatments or remedies?',
      'Do the symptoms interfere with your daily activities?',
      'Do you have any known allergies or medical conditions?'
    ];

    if (riskLevel === 'high') {
      return [...baseQuestions, ...urgentQuestions];
    } else {
      return [...baseQuestions, ...routineQuestions];
    }
  }

  async submitFollowUpAnswers(triageId, answers) {
    try {
      const request = {
        triageId,
        answers,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('symptoms', 'submitFollowUp', request);
      
      if (response && response.success) {
        return {
          success: true,
          updatedAssessment: response.assessment,
          message: 'Follow-up answers submitted successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Triage] Follow-up submission failed, using fallback:', error.message);
      
      // Update local triage with answers
      const triageCache = global.triageCache || new Map();
      if (triageCache.has(triageId)) {
        const triageData = triageCache.get(triageId);
        triageData.followUpAnswers = answers;
        triageData.updatedAt = new Date().toISOString();
        triageCache.set(triageId, triageData);

        return {
          success: true,
          updatedAssessment: triageData.assessment,
          message: 'Follow-up answers recorded (fallback mode)'
        };
      }

      return {
        success: false,
        message: 'Triage session not found'
      };
    }
  }

  async getDisclaimers() {
    try {
      const response = await this.mcpClient.request('symptoms', 'getDisclaimers', {
        timestamp: new Date().toISOString()
      });
      
      if (response && response.success) {
        return {
          success: true,
          disclaimers: response.disclaimers,
          message: 'Disclaimers retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Triage] Disclaimers request failed, using fallback:', error.message);
      
      const fallbackDisclaimers = [
        'This triage assessment is for informational purposes only and does not constitute medical advice.',
        'Always consult with a qualified healthcare professional for proper diagnosis and treatment.',
        'In case of medical emergency, call emergency services immediately.',
        'The assessment is based on limited information and may not capture all relevant factors.',
        'EasyMedPro is not responsible for any decisions made based on this assessment.'
      ];

      return {
        success: true,
        disclaimers: fallbackDisclaimers,
        message: 'Standard disclaimers provided (fallback mode)'
      };
    }
  }

  async getSymptomSuggestions(partialSymptom) {
    try {
      const request = {
        query: partialSymptom,
        limit: 10,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('symptoms', 'getSuggestions', request);
      
      if (response && response.success) {
        return {
          success: true,
          suggestions: response.suggestions,
          message: 'Symptom suggestions retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Triage] Suggestions request failed, using fallback:', error.message);
      return this.getFallbackSuggestions(partialSymptom);
    }
  }

  getFallbackSuggestions(partialSymptom) {
    const commonSymptoms = [
      'headache', 'fever', 'cough', 'sore throat', 'fatigue',
      'nausea', 'dizziness', 'chest pain', 'abdominal pain',
      'back pain', 'joint pain', 'muscle aches', 'shortness of breath',
      'congestion', 'runny nose', 'skin rash', 'difficulty sleeping',
      'loss of appetite', 'vomiting', 'diarrhea', 'constipation',
      'anxiety', 'depression', 'memory problems', 'vision problems',
      'hearing problems', 'numbness', 'tingling', 'swelling'
    ];

    const query = partialSymptom.toLowerCase();
    const suggestions = commonSymptoms
      .filter(symptom => symptom.includes(query))
      .slice(0, 10);

    return {
      success: true,
      suggestions,
      message: 'Symptom suggestions provided (fallback mode)'
    };
  }
}
