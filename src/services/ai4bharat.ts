/**
 * AI4Bharat Integration Service
 * Provides enhanced language processing capabilities for Indian languages
 * including IndicTrans, IndicBERT, IndicNLG, IndicWav2Vec, and IndicTTS
 */

export interface AI4BharatConfig {
  apiEndpoint: string;
  apiKey?: string;
  enableOfflineMode: boolean;
  cacheEnabled: boolean;
  ruralOptimizations: boolean;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  domain?: 'medical' | 'general';
  context?: string;
}

export interface VoiceRequest {
  audioData?: Blob;
  text?: string;
  language: string;
  dialect?: string;
  medicalContext?: boolean;
}

export interface MedicalQuery {
  query: string;
  language: string;
  symptoms?: string[];
  medicalHistory?: string;
}

export interface AI4BharatResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  cached?: boolean;
  offlineMode?: boolean;
}

class AI4BharatService {
  private config: AI4BharatConfig;
  private cache: Map<string, any> = new Map();
  private isOffline: boolean = false;

  constructor(config: AI4BharatConfig) {
    this.config = config;
    this.initializeService();
  }

  private async initializeService() {
    // Check connectivity and initialize appropriate mode
    try {
      await this.checkConnectivity();
      this.isOffline = false;
    } catch {
      this.isOffline = true;
      console.log('🌐 AI4Bharat: Operating in offline mode for rural connectivity');
    }
  }

  private async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) return false;
    
    try {
      const response = await fetch(this.config.apiEndpoint + '/health', {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Enhanced Translation using IndicTrans
   * Supports 22+ Indian languages with medical terminology
   */
  async translateText(request: TranslationRequest): Promise<AI4BharatResponse<string>> {
    const cacheKey = `translate_${request.sourceLanguage}_${request.targetLanguage}_${request.text}`;
    
    // Check cache first for rural optimization
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        success: true,
        data: this.cache.get(cacheKey),
        cached: true
      };
    }

    // Offline fallback
    if (this.isOffline || this.config.enableOfflineMode) {
      return this.offlineTranslation(request);
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: JSON.stringify({
          text: request.text,
          source_language: this.mapLanguageCode(request.sourceLanguage),
          target_language: this.mapLanguageCode(request.targetLanguage),
          domain: request.domain || 'medical',
          context: request.context
        })
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.translated_text;

      // Cache for rural optimization
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, translatedText);
      }

      return {
        success: true,
        data: translatedText,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('AI4Bharat translation error:', error);
      return this.offlineTranslation(request);
    }
  }

  /**
   * Speech Recognition using IndicWav2Vec
   * Supports regional dialects and medical voice commands
   */
  async speechToText(request: VoiceRequest): Promise<AI4BharatResponse<string>> {
    if (!request.audioData) {
      return { success: false, error: 'No audio data provided' };
    }

    const cacheKey = `speech_${request.language}_${request.audioData.size}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        success: true,
        data: this.cache.get(cacheKey),
        cached: true
      };
    }

    // Offline mode
    if (this.isOffline || this.config.enableOfflineMode) {
      return this.offlineSpeechRecognition(request);
    }

    try {
      const formData = new FormData();
      formData.append('audio', request.audioData, 'audio.wav');
      formData.append('language', this.mapLanguageCode(request.language));
      if (request.dialect) {
        formData.append('dialect', request.dialect);
      }
      if (request.medicalContext) {
        formData.append('medical_context', 'true');
      }

      const response = await fetch(`${this.config.apiEndpoint}/speech-to-text`, {
        method: 'POST',
        headers: {
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Speech recognition failed: ${response.statusText}`);
      }

      const data = await response.json();
      const transcript = data.transcript;

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, transcript);
      }

      return {
        success: true,
        data: transcript,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('AI4Bharat speech recognition error:', error);
      return this.offlineSpeechRecognition(request);
    }
  }

  /**
   * Text-to-Speech using IndicTTS
   * Natural voice synthesis in native languages
   */
  async textToSpeech(request: VoiceRequest): Promise<AI4BharatResponse<Blob>> {
    if (!request.text) {
      return { success: false, error: 'No text provided' };
    }

    const cacheKey = `tts_${request.language}_${request.text}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        success: true,
        data: this.cache.get(cacheKey),
        cached: true
      };
    }

    // Offline mode
    if (this.isOffline || this.config.enableOfflineMode) {
      return this.offlineTextToSpeech(request);
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: JSON.stringify({
          text: request.text,
          language: this.mapLanguageCode(request.language),
          dialect: request.dialect,
          medical_context: request.medicalContext,
          quality: this.config.ruralOptimizations ? 'standard' : 'high'
        })
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech failed: ${response.statusText}`);
      }

      const audioBlob = await response.blob();

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, audioBlob);
      }

      return {
        success: true,
        data: audioBlob
      };
    } catch (error) {
      console.error('AI4Bharat text-to-speech error:', error);
      return this.offlineTextToSpeech(request);
    }
  }

  /**
   * Medical Query Understanding using IndicBERT
   * Processes medical queries in Indian languages
   */
  async processMedicalQuery(query: MedicalQuery): Promise<AI4BharatResponse<any>> {
    const cacheKey = `medical_${query.language}_${query.query}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        success: true,
        data: this.cache.get(cacheKey),
        cached: true
      };
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/medical-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: JSON.stringify({
          query: query.query,
          language: this.mapLanguageCode(query.language),
          symptoms: query.symptoms,
          medical_history: query.medicalHistory
        })
      });

      if (!response.ok) {
        throw new Error(`Medical query processing failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, data);
      }

      return {
        success: true,
        data: data,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('AI4Bharat medical query error:', error);
      return {
        success: false,
        error: error.message,
        offlineMode: true
      };
    }
  }

  /**
   * Generate Healthcare Content using IndicNLG
   * Creates health recommendations in native languages
   */
  async generateHealthContent(prompt: string, language: string): Promise<AI4BharatResponse<string>> {
    const cacheKey = `nlg_${language}_${prompt}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        success: true,
        data: this.cache.get(cacheKey),
        cached: true
      };
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: JSON.stringify({
          prompt: prompt,
          language: this.mapLanguageCode(language),
          domain: 'healthcare',
          cultural_context: 'rural_india'
        })
      });

      if (!response.ok) {
        throw new Error(`Content generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.generated_text;

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, content);
      }

      return {
        success: true,
        data: content,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('AI4Bharat content generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Offline fallback methods for rural areas
  private async offlineTranslation(request: TranslationRequest): Promise<AI4BharatResponse<string>> {
    // Basic offline translation using stored medical terminology
    const medicalTerms = this.getMedicalTerminologyMap();
    const words = request.text.toLowerCase().split(' ');
    
    let translatedWords = words.map(word => {
      const termKey = `${request.sourceLanguage}_${request.targetLanguage}_${word}`;
      return medicalTerms.get(termKey) || word;
    });

    return {
      success: true,
      data: translatedWords.join(' '),
      offlineMode: true
    };
  }

  private async offlineSpeechRecognition(request: VoiceRequest): Promise<AI4BharatResponse<string>> {
    // Fallback to browser speech recognition with language hints
    return new Promise((resolve) => {
      try {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = this.getBrowserLanguageCode(request.language);
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve({
            success: true,
            data: transcript,
            offlineMode: true
          });
        };

        recognition.onerror = () => {
          resolve({
            success: false,
            error: 'Speech recognition failed',
            offlineMode: true
          });
        };

        recognition.start();
      } catch (error) {
        resolve({
          success: false,
          error: 'Speech recognition not supported',
          offlineMode: true
        });
      }
    });
  }

  private async offlineTextToSpeech(request: VoiceRequest): Promise<AI4BharatResponse<Blob>> {
    // Fallback to browser speech synthesis
    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(request.text);
        utterance.lang = this.getBrowserLanguageCode(request.language);
        utterance.rate = 0.8;
        utterance.pitch = 1;

        // Convert speech to blob (simplified for demo)
        speechSynthesis.speak(utterance);
        
        // Return empty blob for now - in real implementation, would capture audio
        const emptyBlob = new Blob([''], { type: 'audio/wav' });
        resolve({
          success: true,
          data: emptyBlob,
          offlineMode: true
        });
      } catch (error) {
        resolve({
          success: false,
          error: 'Text-to-speech failed',
          offlineMode: true
        });
      }
    });
  }

  // Language code mapping for AI4Bharat APIs
  private mapLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      'english': 'eng',
      'hindi': 'hin',
      'tamil': 'tam',
      'telugu': 'tel',
      'bengali': 'ben',
      'marathi': 'mar',
      'punjabi': 'pan',
      'gujarati': 'guj',
      'kannada': 'kan',
      'malayalam': 'mal',
      'odia': 'ori',
      'assamese': 'asm'
    };
    return languageMap[language] || 'eng';
  }

  // Browser language codes for fallback
  private getBrowserLanguageCode(language: string): string {
    const browserLangMap: { [key: string]: string } = {
      'english': 'en-US',
      'hindi': 'hi-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'bengali': 'bn-IN',
      'marathi': 'mr-IN',
      'punjabi': 'pa-IN',
      'gujarati': 'gu-IN',
      'kannada': 'kn-IN',
      'malayalam': 'ml-IN',
      'odia': 'or-IN',
      'assamese': 'as-IN'
    };
    return browserLangMap[language] || 'en-US';
  }

  // Medical terminology for offline translation
  private getMedicalTerminologyMap(): Map<string, string> {
    // This would be loaded from a comprehensive medical dictionary
    // For now, including basic medical terms
    const terms = new Map();
    
    // English to Hindi medical terms
    terms.set('english_hindi_fever', 'बुखार');
    terms.set('english_hindi_headache', 'सिरदर्द');
    terms.set('english_hindi_cough', 'खांसी');
    terms.set('english_hindi_cold', 'सर्दी');
    terms.set('english_hindi_medicine', 'दवा');
    terms.set('english_hindi_doctor', 'डॉक्टर');
    terms.set('english_hindi_hospital', 'अस्पताल');
    terms.set('english_hindi_pain', 'दर्द');
    
    // English to Tamil medical terms
    terms.set('english_tamil_fever', 'காய்ச்சல்');
    terms.set('english_tamil_headache', 'தலைவலி');
    terms.set('english_tamil_cough', 'இருமல்');
    terms.set('english_tamil_cold', 'சளி');
    terms.set('english_tamil_medicine', 'மருந்து');
    terms.set('english_tamil_doctor', 'மருத்துவர்');
    terms.set('english_tamil_hospital', 'மருத்துவமனை');
    terms.set('english_tamil_pain', 'வலி');
    
    // Add more terms for other languages...
    
    return terms;
  }

  // Clear cache for memory management in rural devices
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 AI4Bharat cache cleared');
  }

  // Get cache size for monitoring
  getCacheSize(): number {
    return this.cache.size;
  }

  // Update configuration
  updateConfig(newConfig: Partial<AI4BharatConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default configuration for rural India
export const defaultAI4BharatConfig: AI4BharatConfig = {
  apiEndpoint: import.meta.env.VITE_AI4BHARAT_API_ENDPOINT || 'https://api.ai4bharat.org/v1',
  apiKey: import.meta.env.VITE_AI4BHARAT_API_KEY,
  enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true' || true,
  cacheEnabled: import.meta.env.VITE_CACHE_ENABLED === 'true' || true,
  ruralOptimizations: import.meta.env.VITE_ENABLE_RURAL_OPTIMIZATIONS === 'true' || true
};

// Export singleton instance
export const ai4bharatService = new AI4BharatService(defaultAI4BharatConfig);

export default AI4BharatService;