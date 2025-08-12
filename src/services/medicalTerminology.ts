/**
 * Medical Terminology Service for Rural India
 * Specialized healthcare language processing with AI4Bharat integration
 * Includes regional medical terms, traditional medicine, and emergency protocols
 */

import { Language } from '../translations';
import { ai4bharatService, MedicalQuery } from './ai4bharat';
import { enhancedTranslationService } from './enhancedTranslation';

export interface MedicalTerm {
  english: string;
  category: MedicalCategory;
  translations: Map<Language, string>;
  alternativeTerms?: Map<Language, string[]>; // Regional variations
  traditionalEquivalents?: Map<Language, string>; // Ayurveda, Siddha equivalents
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  ruralTerms?: Map<Language, string[]>; // Common rural terminology
}

export interface MedicalCondition {
  id: string;
  name: string;
  symptoms: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  homeRemedies?: Map<Language, string[]>;
  whenToSeekHelp: Map<Language, string>;
  preventionTips: Map<Language, string[]>;
}

export interface Medication {
  name: string;
  genericName: string;
  category: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment';
  translations: Map<Language, string>;
  dosageInstructions: Map<Language, string>;
  sideEffects: Map<Language, string[]>;
  interactions: string[];
}

export interface SymptomAnalysis {
  symptoms: string[];
  possibleConditions: MedicalCondition[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: Map<Language, string>;
  nextSteps: Map<Language, string[]>;
  warningFlags: string[];
}

export type MedicalCategory = 
  | 'symptoms'
  | 'body_parts'
  | 'medications'
  | 'procedures'
  | 'conditions'
  | 'emergency'
  | 'traditional_medicine'
  | 'nutrition'
  | 'maternal_health'
  | 'child_health'
  | 'elderly_care';

class MedicalTerminologyService {
  private medicalTerms: Map<string, MedicalTerm> = new Map();
  private medicalConditions: Map<string, MedicalCondition> = new Map();
  private medications: Map<string, Medication> = new Map();
  private emergencyProtocols: Map<Language, Map<string, string>> = new Map();
  private traditionalMedicine: Map<Language, Map<string, string>> = new Map();

  constructor() {
    this.initializeMedicalDatabase();
  }

  /**
   * Analyze symptoms and provide medical guidance
   */
  async analyzeSymptoms(
    symptomsText: string, 
    language: Language,
    patientAge?: number,
    gender?: 'male' | 'female',
    medicalHistory?: string[]
  ): Promise<SymptomAnalysis> {
    
    // Extract symptoms from text
    const detectedSymptoms = this.extractSymptomsFromText(symptomsText, language);
    
    // Get possible conditions
    const possibleConditions = this.matchSymptomsToConditions(detectedSymptoms);
    
    // Determine urgency level
    const urgencyLevel = this.calculateUrgencyLevel(detectedSymptoms, possibleConditions);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      detectedSymptoms, 
      possibleConditions, 
      urgencyLevel,
      language
    );
    
    // Generate next steps
    const nextSteps = this.generateNextSteps(urgencyLevel, language);
    
    // Check for warning flags
    const warningFlags = this.checkWarningFlags(detectedSymptoms, patientAge, gender);

    return {
      symptoms: detectedSymptoms,
      possibleConditions,
      urgencyLevel,
      recommendations,
      nextSteps,
      warningFlags
    };
  }

  /**
   * Translate medical terminology with regional context
   */
  async translateMedicalTerm(
    term: string, 
    targetLanguage: Language,
    includeRegionalVariations: boolean = true
  ): Promise<{
    translation: string;
    alternativeTerms?: string[];
    traditionalEquivalent?: string;
    ruralTerms?: string[];
    confidence: number;
  }> {
    
    // Check local medical terminology first
    const medicalTerm = this.findMedicalTerm(term);
    
    if (medicalTerm) {
      const translation = medicalTerm.translations.get(targetLanguage);
      const alternativeTerms = includeRegionalVariations 
        ? medicalTerm.alternativeTerms?.get(targetLanguage)
        : undefined;
      const traditionalEquivalent = medicalTerm.traditionalEquivalents?.get(targetLanguage);
      const ruralTerms = medicalTerm.ruralTerms?.get(targetLanguage);
      
      return {
        translation: translation || term,
        alternativeTerms,
        traditionalEquivalent,
        ruralTerms,
        confidence: translation ? 0.95 : 0.3
      };
    }

    // Use AI4Bharat for complex medical terms
    try {
      const medicalQuery: MedicalQuery = {
        query: term,
        language: targetLanguage
      };
      
      const result = await ai4bharatService.processMedicalQuery(medicalQuery);
      
      if (result.success && result.data) {
        return {
          translation: result.data.translation || term,
          confidence: result.confidence || 0.7
        };
      }
    } catch (error) {
      console.warn('AI4Bharat medical translation failed:', error);
    }

    // Fallback to enhanced translation service
    const translationResult = await enhancedTranslationService.translate({
      text: term,
      sourceLanguage: Language.English,
      targetLanguage,
      context: 'medical',
      useAI4Bharat: true
    });

    return {
      translation: translationResult.translatedText,
      confidence: translationResult.confidence
    };
  }

  /**
   * Get emergency protocols in local language
   */
  getEmergencyProtocol(
    emergency: string, 
    language: Language
  ): {
    protocol: string;
    immediateSteps: string[];
    emergencyNumber: string;
    warningText: string;
  } {
    
    const protocols = this.emergencyProtocols.get(language);
    const protocol = protocols?.get(emergency.toLowerCase());
    
    const immediateSteps = this.getEmergencySteps(emergency, language);
    
    return {
      protocol: protocol || this.getDefaultEmergencyProtocol(language),
      immediateSteps,
      emergencyNumber: '108', // India's emergency number
      warningText: this.getEmergencyWarningText(language)
    };
  }

  /**
   * Get traditional medicine information
   */
  getTraditionalMedicineInfo(
    condition: string, 
    language: Language,
    medicineSystem: 'ayurveda' | 'siddha' | 'unani' | 'homeopathy' = 'ayurveda'
  ): {
    remedies: string[];
    preparations: string[];
    precautions: string[];
    disclaimer: string;
  } {
    
    const traditionMap = this.traditionalMedicine.get(language);
    const remedyKey = `${medicineSystem}_${condition.toLowerCase()}`;
    
    return {
      remedies: this.getTraditionalRemedies(condition, language, medicineSystem),
      preparations: this.getPreparationMethods(condition, language, medicineSystem),
      precautions: this.getTraditionalPrecautions(language),
      disclaimer: this.getTraditionalMedicineDisclaimer(language)
    };
  }

  /**
   * Medication information and instructions
   */
  async getMedicationInfo(
    medicationName: string, 
    language: Language
  ): Promise<{
    name: string;
    instructions: string;
    sideEffects: string[];
    precautions: string[];
    interactions: string[];
  }> {
    
    const medication = this.findMedication(medicationName);
    
    if (medication) {
      return {
        name: medication.translations.get(language) || medication.name,
        instructions: medication.dosageInstructions.get(language) || 'Consult doctor for dosage',
        sideEffects: medication.sideEffects.get(language) || [],
        precautions: this.getMedicationPrecautions(medication.name, language),
        interactions: medication.interactions
      };
    }

    // Use AI4Bharat for medication information
    try {
      const result = await ai4bharatService.processMedicalQuery({
        query: `medication information for ${medicationName}`,
        language
      });
      
      if (result.success && result.data) {
        return {
          name: result.data.name || medicationName,
          instructions: result.data.instructions || 'Consult healthcare provider',
          sideEffects: result.data.sideEffects || [],
          precautions: result.data.precautions || [],
          interactions: result.data.interactions || []
        };
      }
    } catch (error) {
      console.warn('AI4Bharat medication query failed:', error);
    }

    return {
      name: medicationName,
      instructions: 'Please consult with a healthcare provider for medication information',
      sideEffects: [],
      precautions: ['Always consult a doctor before taking any medication'],
      interactions: []
    };
  }

  // Private helper methods

  private extractSymptomsFromText(text: string, language: Language): string[] {
    const symptoms: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check against known symptoms in the language
    this.medicalTerms.forEach((term, key) => {
      if (term.category === 'symptoms') {
        const translation = term.translations.get(language);
        const alternatives = term.alternativeTerms?.get(language) || [];
        const ruralTerms = term.ruralTerms?.get(language) || [];
        
        const allTerms = [translation, ...alternatives, ...ruralTerms].filter(Boolean);
        
        if (allTerms.some(termVariant => 
          termVariant && lowerText.includes(termVariant.toLowerCase())
        )) {
          symptoms.push(term.english);
        }
      }
    });
    
    return symptoms;
  }

  private matchSymptomsToConditions(symptoms: string[]): MedicalCondition[] {
    const matches: MedicalCondition[] = [];
    
    this.medicalConditions.forEach(condition => {
      const matchCount = condition.symptoms.filter(symptom => 
        symptoms.includes(symptom)
      ).length;
      
      if (matchCount > 0) {
        matches.push(condition);
      }
    });
    
    // Sort by number of matching symptoms
    return matches.sort((a, b) => {
      const aMatches = a.symptoms.filter(s => symptoms.includes(s)).length;
      const bMatches = b.symptoms.filter(s => symptoms.includes(s)).length;
      return bMatches - aMatches;
    });
  }

  private calculateUrgencyLevel(
    symptoms: string[], 
    conditions: MedicalCondition[]
  ): 'low' | 'medium' | 'high' | 'emergency' {
    
    // Check for emergency symptoms
    const emergencySymptoms = [
      'chest pain', 'difficulty breathing', 'severe bleeding', 
      'unconsciousness', 'severe burns', 'poisoning'
    ];
    
    if (symptoms.some(symptom => emergencySymptoms.includes(symptom))) {
      return 'emergency';
    }
    
    // Check condition urgency levels
    const maxUrgency = conditions.reduce((max, condition) => {
      const urgencyLevels = { low: 1, medium: 2, high: 3, emergency: 4 };
      return Math.max(max, urgencyLevels[condition.urgencyLevel]);
    }, 0);
    
    const urgencyMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'emergency' };
    return urgencyMap[maxUrgency as keyof typeof urgencyMap] || 'low';
  }

  private async generateRecommendations(
    symptoms: string[],
    conditions: MedicalCondition[],
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency',
    language: Language
  ): Promise<Map<Language, string>> {
    
    const recommendations = new Map<Language, string>();
    
    let recommendation = '';
    
    switch (urgencyLevel) {
      case 'emergency':
        recommendation = 'Seek immediate medical attention. Call 108 or go to the nearest hospital emergency room.';
        break;
      case 'high':
        recommendation = 'Consult a doctor as soon as possible. Do not delay medical attention.';
        break;
      case 'medium':
        recommendation = 'Consider seeing a healthcare provider within 24-48 hours. Monitor symptoms closely.';
        break;
      case 'low':
        recommendation = 'Monitor symptoms and consider consulting a healthcare provider if symptoms persist or worsen.';
        break;
    }
    
    // Translate recommendation
    try {
      const translatedRecommendation = await enhancedTranslationService.translate({
        text: recommendation,
        sourceLanguage: Language.English,
        targetLanguage: language,
        context: 'medical',
        useAI4Bharat: true
      });
      
      recommendations.set(language, translatedRecommendation.translatedText);
    } catch (error) {
      recommendations.set(language, recommendation);
    }
    
    return recommendations;
  }

  private generateNextSteps(
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency',
    language: Language
  ): Map<Language, string[]> {
    
    const nextSteps = new Map<Language, string[]>();
    
    let steps: string[] = [];
    
    switch (urgencyLevel) {
      case 'emergency':
        steps = [
          'Call 108 immediately',
          'If safe, move to a comfortable position',
          'Stay with the patient until help arrives',
          'Prepare list of medications and medical history'
        ];
        break;
      case 'high':
        steps = [
          'Contact your doctor or visit a clinic',
          'Monitor vital signs if possible',
          'Avoid strenuous activities',
          'Keep track of symptom changes'
        ];
        break;
      case 'medium':
        steps = [
          'Schedule a doctor appointment',
          'Rest and stay hydrated',
          'Monitor symptoms daily',
          'Avoid activities that worsen symptoms'
        ];
        break;
      case 'low':
        steps = [
          'Rest and monitor symptoms',
          'Stay hydrated',
          'Maintain good hygiene',
          'Consult a doctor if symptoms persist beyond 3-5 days'
        ];
        break;
    }
    
    nextSteps.set(language, steps);
    return nextSteps;
  }

  private checkWarningFlags(
    symptoms: string[],
    patientAge?: number,
    gender?: 'male' | 'female'
  ): string[] {
    
    const warningFlags: string[] = [];
    
    // Age-related warnings
    if (patientAge && patientAge > 65) {
      warningFlags.push('elderly_patient');
    }
    
    if (patientAge && patientAge < 5) {
      warningFlags.push('young_child');
    }
    
    // Symptom-specific warnings
    if (symptoms.includes('chest pain')) {
      warningFlags.push('cardiac_risk');
    }
    
    if (symptoms.includes('difficulty breathing')) {
      warningFlags.push('respiratory_emergency');
    }
    
    return warningFlags;
  }

  private findMedicalTerm(term: string): MedicalTerm | undefined {
    return this.medicalTerms.get(term.toLowerCase());
  }

  private findMedication(name: string): Medication | undefined {
    return this.medications.get(name.toLowerCase());
  }

  private getEmergencySteps(emergency: string, language: Language): string[] {
    // Basic emergency steps - would be expanded with comprehensive database
    const basicSteps = [
      'Stay calm and assess the situation',
      'Call 108 immediately',
      'Provide basic first aid if trained',
      'Wait for professional help'
    ];
    
    return basicSteps;
  }

  private getDefaultEmergencyProtocol(language: Language): string {
    return 'In case of medical emergency, call 108 immediately and seek professional medical help.';
  }

  private getEmergencyWarningText(language: Language): string {
    return 'This is for informational purposes only. In emergencies, always call 108 and seek immediate professional medical help.';
  }

  private getTraditionalRemedies(
    condition: string, 
    language: Language, 
    system: string
  ): string[] {
    // Basic traditional remedies - would be expanded with comprehensive database
    return [
      'Consult a qualified traditional medicine practitioner',
      'Traditional remedies should complement, not replace, modern medicine'
    ];
  }

  private getPreparationMethods(
    condition: string, 
    language: Language, 
    system: string
  ): string[] {
    return [
      'Follow traditional preparation methods carefully',
      'Use authentic ingredients and proper proportions'
    ];
  }

  private getTraditionalPrecautions(language: Language): string[] {
    return [
      'Consult qualified practitioners only',
      'Inform your doctor about traditional medicines you are taking',
      'Watch for any adverse reactions'
    ];
  }

  private getTraditionalMedicineDisclaimer(language: Language): string {
    return 'Traditional medicine information is for educational purposes. Always consult qualified practitioners and inform your doctor about all treatments you are receiving.';
  }

  private getMedicationPrecautions(medication: string, language: Language): string[] {
    return [
      'Take as prescribed by your doctor',
      'Do not exceed the recommended dosage',
      'Inform your doctor of any side effects',
      'Complete the full course as prescribed'
    ];
  }

  /**
   * Initialize comprehensive medical database
   */
  private initializeMedicalDatabase(): void {
    this.initializeSymptoms();
    this.initializeBodyParts();
    this.initializeMedications();
    this.initializeConditions();
    this.initializeEmergencyProtocols();
    this.initializeTraditionalMedicine();
  }

  private initializeSymptoms(): void {
    const symptoms = [
      {
        english: 'fever',
        category: 'symptoms' as MedicalCategory,
        urgencyLevel: 'medium' as const,
        translations: new Map([
          [Language.Hindi, 'बुखार'],
          [Language.Tamil, 'காய்ச்சல்'],
          [Language.Telugu, 'జ్వరం'],
          [Language.Bengali, 'জ্বর'],
          [Language.Marathi, 'ताप'],
          [Language.Punjabi, 'ਬੁਖਾਰ'],
          [Language.Gujarati, 'તાવ'],
          [Language.Kannada, 'ಜ್ವರ'],
          [Language.Malayalam, 'പനി'],
          [Language.Odia, 'ଜ୍ୱର'],
          [Language.Assamese, 'জ্বৰ']
        ]),
        ruralTerms: new Map([
          [Language.Hindi, ['ताप', 'गर्मी']],
          [Language.Tamil, ['வெப்பம்', 'உடல் சூடு']]
        ])
      },
      {
        english: 'headache',
        category: 'symptoms' as MedicalCategory,
        urgencyLevel: 'low' as const,
        translations: new Map([
          [Language.Hindi, 'सिरदर्द'],
          [Language.Tamil, 'தலைவலி'],
          [Language.Telugu, 'తలనొప్పి'],
          [Language.Bengali, 'মাথাব্যথা'],
          [Language.Marathi, 'डोकेदुखी'],
          [Language.Punjabi, 'ਸਿਰਦਰਦ'],
          [Language.Gujarati, 'માથાનો દુખાવો'],
          [Language.Kannada, 'ತಲೆನೋವು'],
          [Language.Malayalam, 'തലവേദന'],
          [Language.Odia, 'ମୁଣ୍ଡବିନ୍ଧା'],
          [Language.Assamese, 'মূৰৰ বিষ']
        ])
      }
    ];

    symptoms.forEach(symptom => {
      this.medicalTerms.set(symptom.english, symptom);
    });
  }

  private initializeBodyParts(): void {
    // Initialize body parts terminology
    const bodyParts = [
      {
        english: 'heart',
        category: 'body_parts' as MedicalCategory,
        urgencyLevel: 'high' as const,
        translations: new Map([
          [Language.Hindi, 'दिल'],
          [Language.Tamil, 'இதயம்'],
          [Language.Telugu, 'గుండె']
        ])
      }
    ];

    bodyParts.forEach(part => {
      this.medicalTerms.set(part.english, part);
    });
  }

  private initializeMedications(): void {
    // Initialize common medications
    const medications = [
      {
        name: 'paracetamol',
        genericName: 'acetaminophen',
        category: 'tablet' as const,
        translations: new Map([
          [Language.Hindi, 'पैरासिटामोल'],
          [Language.Tamil, 'பாராசிட்டமால்']
        ]),
        dosageInstructions: new Map([
          [Language.Hindi, 'डॉक्टर की सलाह के अनुसार लें'],
          [Language.Tamil, 'மருத்துவரின் ஆலோசனையின் படி எடுத்துக் கொள்ளுங்கள்']
        ]),
        sideEffects: new Map([
          [Language.Hindi, ['पेट में दर्द', 'चक्कर आना']],
          [Language.Tamil, ['வயிற்று வலி', 'தலை சுற்றல்']]
        ]),
        interactions: ['alcohol', 'warfarin']
      }
    ];

    medications.forEach(med => {
      this.medications.set(med.name, med);
    });
  }

  private initializeConditions(): void {
    // Initialize medical conditions
    const conditions = [
      {
        id: 'common_cold',
        name: 'Common Cold',
        symptoms: ['cough', 'runny nose', 'sore throat'],
        urgencyLevel: 'low' as const,
        homeRemedies: new Map([
          [Language.Hindi, ['गर्म पानी पिएं', 'आराम करें']],
          [Language.Tamil, ['சூடான நீர் குடிக்கவும்', 'ஓய்வு எடுக்கவும்']]
        ]),
        whenToSeekHelp: new Map([
          [Language.Hindi, 'यदि 7 दिन में सुधार न हो'],
          [Language.Tamil, '7 நாட்களில் மேம்பாடு இல்லையென்றால்']
        ]),
        preventionTips: new Map([
          [Language.Hindi, ['हाथ धोएं', 'भीड़ से बचें']],
          [Language.Tamil, ['கைகளை கழுவவும்', 'கூட்டத்தை தவிர்க்கவும்']]
        ])
      }
    ];

    conditions.forEach(condition => {
      this.medicalConditions.set(condition.id, condition);
    });
  }

  private initializeEmergencyProtocols(): void {
    // Initialize emergency protocols for each language
    const hindiProtocols = new Map([
      ['heart attack', 'तुरंत 108 पर कॉल करें और अस्पताल जाएं'],
      ['stroke', 'तुरंत चिकित्सा सहायता लें']
    ]);

    const tamilProtocols = new Map([
      ['heart attack', 'உடனே 108க்கு அழைத்து மருத்துவமனைக்கு செல்லுங்கள்'],
      ['stroke', 'உடனே மருத்துவ உதவி பெறுங்கள்']
    ]);

    this.emergencyProtocols.set(Language.Hindi, hindiProtocols);
    this.emergencyProtocols.set(Language.Tamil, tamilProtocols);
  }

  private initializeTraditionalMedicine(): void {
    // Initialize traditional medicine information
    const hindiTraditional = new Map([
      ['ayurveda_fever', 'तुलसी की चाय पिएं'],
      ['ayurveda_cough', 'अदरक और शहद का सेवन करें']
    ]);

    const tamilTraditional = new Map([
      ['siddha_fever', 'துளசி தேநீர் குடிக்கவும்'],
      ['siddha_cough', 'இஞ்சி மற்றும் தேன் எடுத்துக் கொள்ளுங்கள்']
    ]);

    this.traditionalMedicine.set(Language.Hindi, hindiTraditional);
    this.traditionalMedicine.set(Language.Tamil, tamilTraditional);
  }
}

// Export singleton instance
export const medicalTerminologyService = new MedicalTerminologyService();

export default MedicalTerminologyService;