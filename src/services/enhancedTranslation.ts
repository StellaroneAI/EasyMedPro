/**
 * Enhanced Translation Service with AI4Bharat Integration
 * Provides medical terminology translation and rural India optimizations
 */

import { ai4bharatService, TranslationRequest } from './ai4bharat';
import { translations, Language, TranslationData } from '../translations';

export interface MedicalTranslationContext {
  symptoms?: string[];
  medications?: string[];
  procedures?: string[];
  bodyParts?: string[];
  medicalConditions?: string[];
}

export interface EnhancedTranslationRequest {
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  context?: 'medical' | 'general' | 'emergency';
  medicalContext?: MedicalTranslationContext;
  useAI4Bharat?: boolean;
  priority?: 'accuracy' | 'speed' | 'offline';
}

export interface TranslationResult {
  translatedText: string;
  confidence: number;
  method: 'ai4bharat' | 'static' | 'hybrid';
  medicalTermsDetected?: string[];
  suggestions?: string[];
  culturalNotes?: string;
}

class EnhancedTranslationService {
  private medicalTerminology: Map<string, Map<Language, string>>;
  private commonPhrases: Map<string, Map<Language, string>>;
  private emergencyPhrases: Map<string, Map<Language, string>>;

  constructor() {
    this.initializeMedicalTerminology();
    this.initializeCommonPhrases();
    this.initializeEmergencyPhrases();
  }

  /**
   * Main translation method with AI4Bharat integration
   */
  async translate(request: EnhancedTranslationRequest): Promise<TranslationResult> {
    // For static UI translations, use existing system
    if (this.isStaticUITranslation(request.text)) {
      return this.translateStaticContent(request);
    }

    // Detect medical terms
    const medicalTerms = this.detectMedicalTerms(request.text);
    
    // Choose translation method based on context and connectivity
    if (request.useAI4Bharat !== false && (request.context === 'medical' || medicalTerms.length > 0)) {
      try {
        const ai4bharatResult = await this.translateWithAI4Bharat(request, medicalTerms);
        if (ai4bharatResult.success) {
          return {
            translatedText: ai4bharatResult.data || request.text,
            confidence: ai4bharatResult.confidence || 0.8,
            method: 'ai4bharat',
            medicalTermsDetected: medicalTerms,
            suggestions: this.generateSuggestions(request.text, request.targetLanguage),
            culturalNotes: this.getCulturalNotes(request.text, request.targetLanguage)
          };
        }
      } catch (error) {
        console.warn('AI4Bharat translation failed, falling back to static translation');
      }
    }

    // Fallback to enhanced static translation
    return this.translateWithStaticEnhancement(request, medicalTerms);
  }

  /**
   * Translate using AI4Bharat with medical context
   */
  private async translateWithAI4Bharat(
    request: EnhancedTranslationRequest, 
    medicalTerms: string[]
  ) {
    const ai4bharatRequest: TranslationRequest = {
      text: request.text,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      domain: request.context === 'medical' ? 'medical' : 'general',
      context: this.buildMedicalContext(request.medicalContext, medicalTerms)
    };

    return await ai4bharatService.translateText(ai4bharatRequest);
  }

  /**
   * Enhanced static translation with medical terminology
   */
  private translateWithStaticEnhancement(
    request: EnhancedTranslationRequest,
    medicalTerms: string[]
  ): TranslationResult {
    let translatedText = request.text;
    let confidence = 0.6;
    const method = 'hybrid';

    // Translate medical terms first
    medicalTerms.forEach(term => {
      const translation = this.getMedicalTermTranslation(term, request.targetLanguage);
      if (translation) {
        translatedText = translatedText.replace(new RegExp(term, 'gi'), translation);
        confidence += 0.1;
      }
    });

    // Translate common healthcare phrases
    const commonPhraseTranslation = this.translateCommonPhrases(translatedText, request.targetLanguage);
    if (commonPhraseTranslation !== translatedText) {
      translatedText = commonPhraseTranslation;
      confidence += 0.1;
    }

    // Handle emergency phrases with priority
    if (request.context === 'emergency') {
      const emergencyTranslation = this.translateEmergencyPhrases(translatedText, request.targetLanguage);
      if (emergencyTranslation !== translatedText) {
        translatedText = emergencyTranslation;
        confidence = 0.9; // High confidence for emergency translations
      }
    }

    return {
      translatedText,
      confidence: Math.min(confidence, 1.0),
      method,
      medicalTermsDetected: medicalTerms,
      suggestions: this.generateSuggestions(request.text, request.targetLanguage),
      culturalNotes: this.getCulturalNotes(request.text, request.targetLanguage)
    };
  }

  /**
   * Translate static UI content
   */
  private translateStaticContent(request: EnhancedTranslationRequest): TranslationResult {
    const translationData = translations[request.targetLanguage];
    const key = request.text.toLowerCase().replace(/\s+/g, '');
    
    // Try to find exact match in translations
    const match = Object.entries(translationData).find(([k, v]) => 
      k.toLowerCase() === key || v.toLowerCase() === request.text.toLowerCase()
    );

    if (match) {
      return {
        translatedText: match[1],
        confidence: 1.0,
        method: 'static'
      };
    }

    // Return original text if no translation found
    return {
      translatedText: request.text,
      confidence: 0.3,
      method: 'static'
    };
  }

  /**
   * Detect medical terms in text
   */
  private detectMedicalTerms(text: string): string[] {
    const medicalKeywords = [
      // Symptoms
      'fever', 'headache', 'cough', 'cold', 'pain', 'ache', 'sore', 'swelling',
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'dizziness', 'fatigue',
      'shortness of breath', 'chest pain', 'abdominal pain', 'back pain',
      
      // Body parts
      'head', 'neck', 'chest', 'abdomen', 'back', 'arm', 'leg', 'hand', 'foot',
      'heart', 'lung', 'stomach', 'liver', 'kidney', 'brain', 'eye', 'ear', 'nose',
      
      // Medical terms
      'medicine', 'medication', 'tablet', 'capsule', 'injection', 'surgery',
      'diagnosis', 'treatment', 'prescription', 'dosage', 'side effect',
      
      // Emergency terms
      'emergency', 'ambulance', 'hospital', 'doctor', 'nurse', 'urgent', 'critical',
      
      // Common conditions
      'diabetes', 'hypertension', 'asthma', 'arthritis', 'infection', 'allergy',
      'cancer', 'pneumonia', 'tuberculosis', 'malaria', 'dengue'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return medicalKeywords.filter(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word))
    );
  }

  /**
   * Build medical context for AI4Bharat
   */
  private buildMedicalContext(
    medicalContext?: MedicalTranslationContext,
    detectedTerms?: string[]
  ): string {
    const context = [];
    
    if (medicalContext?.symptoms) {
      context.push(`Symptoms: ${medicalContext.symptoms.join(', ')}`);
    }
    
    if (medicalContext?.medications) {
      context.push(`Medications: ${medicalContext.medications.join(', ')}`);
    }
    
    if (detectedTerms && detectedTerms.length > 0) {
      context.push(`Medical terms detected: ${detectedTerms.join(', ')}`);
    }
    
    return context.join('. ');
  }

  /**
   * Get medical term translation from static dictionary
   */
  private getMedicalTermTranslation(term: string, targetLanguage: Language): string | null {
    const termMap = this.medicalTerminology.get(term.toLowerCase());
    return termMap?.get(targetLanguage) || null;
  }

  /**
   * Translate common healthcare phrases
   */
  private translateCommonPhrases(text: string, targetLanguage: Language): string {
    let translatedText = text;
    
    this.commonPhrases.forEach((translations, phrase) => {
      const translation = translations.get(targetLanguage);
      if (translation && text.toLowerCase().includes(phrase)) {
        translatedText = translatedText.replace(new RegExp(phrase, 'gi'), translation);
      }
    });
    
    return translatedText;
  }

  /**
   * Translate emergency phrases with high priority
   */
  private translateEmergencyPhrases(text: string, targetLanguage: Language): string {
    let translatedText = text;
    
    this.emergencyPhrases.forEach((translations, phrase) => {
      const translation = translations.get(targetLanguage);
      if (translation && text.toLowerCase().includes(phrase)) {
        translatedText = translatedText.replace(new RegExp(phrase, 'gi'), translation);
      }
    });
    
    return translatedText;
  }

  /**
   * Generate alternative translation suggestions
   */
  private generateSuggestions(text: string, targetLanguage: Language): string[] {
    const suggestions = [];
    
    // Add regional variations for common terms
    if (text.toLowerCase().includes('doctor')) {
      switch (targetLanguage) {
        case Language.Hindi:
          suggestions.push('वैद्य', 'चिकित्सक', 'हकीम');
          break;
        case Language.Tamil:
          suggestions.push('வைத்தியர்', 'மருத்துவர்');
          break;
      }
    }
    
    return suggestions;
  }

  /**
   * Get cultural notes for better understanding
   */
  private getCulturalNotes(text: string, targetLanguage: Language): string | undefined {
    // Add cultural context for better healthcare communication
    if (text.toLowerCase().includes('traditional medicine')) {
      switch (targetLanguage) {
        case Language.Hindi:
          return 'आयुर्वेद और पारंपरिक चिकित्सा भारत में व्यापक रूप से प्रयोग की जाती है';
        case Language.Tamil:
          return 'சித்த மருத்துவம் தமிழ் மருத்துவ முறையில் முக்கியமானது';
      }
    }
    
    return undefined;
  }

  /**
   * Check if text is a static UI translation
   */
  private isStaticUITranslation(text: string): boolean {
    const staticKeys = [
      'welcome', 'dashboard', 'appointments', 'telemedicine', 'familyHealth',
      'vitalsMonitoring', 'healthRecords', 'education', 'insurance', 'emergency'
    ];
    
    return staticKeys.some(key => 
      text.toLowerCase().includes(key) || 
      text.toLowerCase().replace(/\s+/g, '') === key.toLowerCase()
    );
  }

  /**
   * Initialize medical terminology dictionary
   */
  private initializeMedicalTerminology(): void {
    this.medicalTerminology = new Map();
    
    // Common medical terms with translations
    const medicalTerms = [
      {
        english: 'fever',
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
        ])
      },
      {
        english: 'headache',
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
      },
      {
        english: 'cough',
        translations: new Map([
          [Language.Hindi, 'खांसी'],
          [Language.Tamil, 'இருமல்'],
          [Language.Telugu, 'దగ్గు'],
          [Language.Bengali, 'কাশি'],
          [Language.Marathi, 'खोकला'],
          [Language.Punjabi, 'ਖੰਘ'],
          [Language.Gujarati, 'ઉધરસ'],
          [Language.Kannada, 'ಕೆಮ್ಮು'],
          [Language.Malayalam, 'ചുമ'],
          [Language.Odia, 'କାଶ'],
          [Language.Assamese, 'কাহ']
        ])
      },
      {
        english: 'medicine',
        translations: new Map([
          [Language.Hindi, 'दवा'],
          [Language.Tamil, 'மருந்து'],
          [Language.Telugu, 'మందు'],
          [Language.Bengali, 'ওষুধ'],
          [Language.Marathi, 'औषध'],
          [Language.Punjabi, 'ਦਵਾਈ'],
          [Language.Gujarati, 'દવા'],
          [Language.Kannada, 'ಔಷಧ'],
          [Language.Malayalam, 'മരുന്ന്'],
          [Language.Odia, 'ଔଷଧ'],
          [Language.Assamese, 'ঔষধ']
        ])
      },
      {
        english: 'doctor',
        translations: new Map([
          [Language.Hindi, 'डॉक्टर'],
          [Language.Tamil, 'மருத்துவர்'],
          [Language.Telugu, 'వైద్యుడు'],
          [Language.Bengali, 'ডাক্তার'],
          [Language.Marathi, 'डॉक्टर'],
          [Language.Punjabi, 'ਡਾਕਟਰ'],
          [Language.Gujarati, 'ડૉક્ટર'],
          [Language.Kannada, 'ವೈದ್ಯ'],
          [Language.Malayalam, 'ഡോക്ടർ'],
          [Language.Odia, 'ଡାକ୍ତର'],
          [Language.Assamese, 'চিকিৎসক']
        ])
      }
    ];

    medicalTerms.forEach(term => {
      this.medicalTerminology.set(term.english, term.translations);
    });
  }

  /**
   * Initialize common healthcare phrases
   */
  private initializeCommonPhrases(): void {
    this.commonPhrases = new Map();
    
    const phrases = [
      {
        english: 'how are you feeling',
        translations: new Map([
          [Language.Hindi, 'आप कैसा महसूस कर रहे हैं'],
          [Language.Tamil, 'நீங்கள் எப்படி உணர்கிறீர்கள்'],
          [Language.Telugu, 'మీరు ఎలా అనుభవిస్తున్నారు']
        ])
      },
      {
        english: 'take your medicine',
        translations: new Map([
          [Language.Hindi, 'अपनी दवा लें'],
          [Language.Tamil, 'உங்கள் மருந்தை எடுத்துக் கொள்ளுங்கள்'],
          [Language.Telugu, 'మీ మందు తీసుకోండి']
        ])
      },
      {
        english: 'call ambulance',
        translations: new Map([
          [Language.Hindi, 'एम्बुलेंस बुलाएं'],
          [Language.Tamil, 'ஆம்புலன்ஸை அழைக்கவும்'],
          [Language.Telugu, 'అంబులెన్స్‌ని పిలవండి']
        ])
      }
    ];

    phrases.forEach(phrase => {
      this.commonPhrases.set(phrase.english, phrase.translations);
    });
  }

  /**
   * Initialize emergency phrases
   */
  private initializeEmergencyPhrases(): void {
    this.emergencyPhrases = new Map();
    
    const emergencyPhrases = [
      {
        english: 'medical emergency',
        translations: new Map([
          [Language.Hindi, 'मेडिकल इमरजेंसी'],
          [Language.Tamil, 'மருத்துவ அவசரநிலை'],
          [Language.Telugu, 'వైద్య అత్యవసర పరిస్థితి']
        ])
      },
      {
        english: 'call 108',
        translations: new Map([
          [Language.Hindi, '108 पर कॉल करें'],
          [Language.Tamil, '108 ஐ அழைக்கவும்'],
          [Language.Telugu, '108కి కాల్ చేయండి']
        ])
      },
      {
        english: 'need help urgently',
        translations: new Map([
          [Language.Hindi, 'तुरंत मदद चाहिए'],
          [Language.Tamil, 'உடனே உதவி தேவை'],
          [Language.Telugu, 'అత్యవసరంగా సహాయం కావాలి']
        ])
      }
    ];

    emergencyPhrases.forEach(phrase => {
      this.emergencyPhrases.set(phrase.english, phrase.translations);
    });
  }
}

// Export singleton instance
export const enhancedTranslationService = new EnhancedTranslationService();

export default EnhancedTranslationService;