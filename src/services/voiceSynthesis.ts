/**
 * @file voiceSynthesis.ts
 * @description Voice synthesis utility for Indian regional languages
 * Supports text-to-speech in multiple Indian languages with appropriate voice selection
 */

export interface VoiceConfig {
  lang: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Language to voice mapping for Indian languages with improved settings
const INDIAN_LANGUAGE_VOICES: Record<string, VoiceConfig> = {
  english: { lang: 'en-IN', rate: 1.0, pitch: 1.0, volume: 0.9 },
  hindi: { lang: 'hi-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  tamil: { lang: 'ta-IN', rate: 0.85, pitch: 0.9, volume: 0.9 },
  telugu: { lang: 'te-IN', rate: 0.85, pitch: 0.9, volume: 0.9 },
  bengali: { lang: 'bn-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  marathi: { lang: 'mr-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  punjabi: { lang: 'pa-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  gujarati: { lang: 'gu-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  kannada: { lang: 'kn-IN', rate: 0.85, pitch: 0.9, volume: 0.9 },
  malayalam: { lang: 'ml-IN', rate: 0.85, pitch: 0.9, volume: 0.9 },
  odia: { lang: 'or-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  assamese: { lang: 'as-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  urdu: { lang: 'ur-IN', rate: 0.9, pitch: 0.95, volume: 0.9 },
  // Improved fallback configurations for languages without direct support
  kashmiri: { lang: 'hi-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  sindhi: { lang: 'ur-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  manipuri: { lang: 'hi-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  bodo: { lang: 'as-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  konkani: { lang: 'hi-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  sanskrit: { lang: 'hi-IN', rate: 0.75, pitch: 0.85, volume: 0.9 },
  maithili: { lang: 'hi-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  santali: { lang: 'hi-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  dogri: { lang: 'hi-IN', rate: 0.85, pitch: 0.95, volume: 0.9 },
  nepali: { lang: 'ne-NP', rate: 0.9, pitch: 0.95, volume: 0.9 },
};

class VoiceSynthesisService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentLanguage: string = 'english';
  private isInitialized: boolean = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initializeVoices();
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synth.getVoices();
        this.isInitialized = true;
        resolve();
      };

      if (this.synth.getVoices().length > 0) {
        loadVoices();
      } else {
        this.synth.addEventListener('voiceschanged', loadVoices, { once: true });
        // Fallback timeout
        setTimeout(loadVoices, 1000);
      }
    });
  }

  private findBestVoice(config: VoiceConfig): SpeechSynthesisVoice | null {
    if (!this.isInitialized || this.voices.length === 0) {
      return null;
    }

    // Prioritize local/offline voices for better quality and reliability
    let voice = this.voices.find(v => 
      v.lang === config.lang && v.localService && !v.name.includes('eSpeak')
    );

    if (!voice) {
      // Try to find exact language match (any voice)
      voice = this.voices.find(v => 
        v.lang === config.lang && !v.name.includes('eSpeak')
      );
    }

    if (!voice) {
      // Try to find language family match (e.g., 'hi' from 'hi-IN')
      const langCode = config.lang.split('-')[0];
      voice = this.voices.find(v => 
        v.lang.startsWith(langCode) && v.localService && !v.name.includes('eSpeak')
      );
    }

    if (!voice) {
      // Try to find any voice with the language code (excluding poor quality voices)
      voice = this.voices.find(v => 
        v.lang.startsWith(config.lang.split('-')[0]) && !v.name.includes('eSpeak')
      );
    }

    if (!voice) {
      // Fallback to best English voice for Indian accent
      voice = this.voices.find(v => 
        (v.lang === 'en-IN' || v.lang === 'en-US') && v.localService && !v.name.includes('eSpeak')
      );
    }

    if (!voice) {
      // Last resort: any English voice
      voice = this.voices.find(v => 
        v.lang.startsWith('en') && !v.name.includes('eSpeak')
      ) || this.voices[0];
    }

    return voice;
  }

  public setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  public async speak(text: string, options?: Partial<VoiceConfig>): Promise<void> {
    if (!text.trim()) return;

    if (!this.isInitialized) {
      await this.initializeVoices();
    }

    // Stop any ongoing speech
    this.synth.cancel();

    const config = {
      ...INDIAN_LANGUAGE_VOICES[this.currentLanguage],
      ...options
    };

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.findBestVoice(config);

    if (voice) {
      utterance.voice = voice;
      console.log(`Using voice: ${voice.name} (${voice.lang}) for language: ${this.currentLanguage}`);
    } else {
      console.warn(`No suitable voice found for language: ${this.currentLanguage}, using default`);
    }

    utterance.lang = config.lang;
    utterance.rate = Math.max(0.5, Math.min(2.0, config.rate || 1.0)); // Clamp rate between 0.5-2.0
    utterance.pitch = Math.max(0.5, Math.min(2.0, config.pitch || 1.0)); // Clamp pitch between 0.5-2.0
    utterance.volume = Math.max(0.1, Math.min(1.0, config.volume || 0.9)); // Clamp volume between 0.1-1.0

    return new Promise((resolve, reject) => {
      let hasEnded = false;
      
      const cleanup = () => {
        if (!hasEnded) {
          hasEnded = true;
          resolve();
        }
      };

      utterance.onend = cleanup;
      utterance.onerror = (event) => {
        if (!hasEnded) {
          hasEnded = true;
          console.error(`Speech synthesis error: ${event.error}`);
          // Don't reject on error, just resolve to prevent UI blocking
          resolve();
        }
      };

      // Fallback timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!hasEnded) {
          console.warn('Speech synthesis timeout, cleaning up...');
          this.synth.cancel();
          cleanup();
        }
      }, Math.max(5000, text.length * 100)); // Dynamic timeout based on text length

      utterance.onstart = () => {
        clearTimeout(timeout);
      };
      
      try {
        this.synth.speak(utterance);
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error starting speech synthesis:', error);
        cleanup();
      }
    });
  }

  public async speakMedicalTerm(term: string, language?: string): Promise<void> {
    const langToUse = language || this.currentLanguage;
    const config = INDIAN_LANGUAGE_VOICES[langToUse];
    
    // Slower rate and slightly lower pitch for medical terms
    await this.speak(term, {
      ...config,
      rate: (config.rate || 1.0) * 0.8,
      pitch: (config.pitch || 1.0) * 0.95
    });
  }

  public async speakEmergencyMessage(message: string): Promise<void> {
    const config = INDIAN_LANGUAGE_VOICES[this.currentLanguage];
    
    // Faster rate and higher pitch for emergency messages
    await this.speak(message, {
      ...config,
      rate: (config.rate || 1.0) * 1.2,
      pitch: (config.pitch || 1.0) * 1.1,
      volume: 1.0
    });
  }

  public stop(): void {
    this.synth.cancel();
  }

  public pause(): void {
    this.synth.pause();
  }

  public resume(): void {
    this.synth.resume();
  }

  public isSpeaking(): boolean {
    return this.synth.speaking;
  }

  public getAvailableVoices(language?: string): SpeechSynthesisVoice[] {
    if (!language) {
      return this.voices;
    }

    const config = INDIAN_LANGUAGE_VOICES[language];
    if (!config) {
      return [];
    }

    const langCode = config.lang.split('-')[0];
    return this.voices.filter(voice => voice.lang.startsWith(langCode));
  }

  public getSupportedLanguages(): string[] {
    return Object.keys(INDIAN_LANGUAGE_VOICES);
  }

  public isLanguageSupported(language: string): boolean {
    return language in INDIAN_LANGUAGE_VOICES;
  }

  // Feature for offline TTS (future enhancement)
  public async downloadOfflineVoice(language: string): Promise<boolean> {
    // This would integrate with browser's offline TTS capabilities
    // Currently most browsers don't support programmatic voice downloads
    console.log(`Offline voice download requested for ${language}`);
    return false;
  }

  // Check if offline voice is available
  public isOfflineVoiceAvailable(language: string): boolean {
    const config = INDIAN_LANGUAGE_VOICES[language];
    if (!config) return false;

    const voice = this.findBestVoice(config);
    return voice ? voice.localService : false;
  }
}

// Singleton instance
export const voiceSynthesis = new VoiceSynthesisService();

// Hook for React components
export const useVoiceSynthesis = () => {
  return {
    speak: voiceSynthesis.speak.bind(voiceSynthesis),
    speakMedicalTerm: voiceSynthesis.speakMedicalTerm.bind(voiceSynthesis),
    speakEmergencyMessage: voiceSynthesis.speakEmergencyMessage.bind(voiceSynthesis),
    setLanguage: voiceSynthesis.setLanguage.bind(voiceSynthesis),
    stop: voiceSynthesis.stop.bind(voiceSynthesis),
    pause: voiceSynthesis.pause.bind(voiceSynthesis),
    resume: voiceSynthesis.resume.bind(voiceSynthesis),
    isSpeaking: voiceSynthesis.isSpeaking.bind(voiceSynthesis),
    getAvailableVoices: voiceSynthesis.getAvailableVoices.bind(voiceSynthesis),
    getSupportedLanguages: voiceSynthesis.getSupportedLanguages.bind(voiceSynthesis),
    isLanguageSupported: voiceSynthesis.isLanguageSupported.bind(voiceSynthesis),
    isOfflineVoiceAvailable: voiceSynthesis.isOfflineVoiceAvailable.bind(voiceSynthesis)
  };
};

// Utility functions for common medical phrases
export const speakHealthStatus = async (status: string, language: string) => {
  voiceSynthesis.setLanguage(language);
  await voiceSynthesis.speakMedicalTerm(status);
};

export const speakEmergencyAlert = async (message: string, language: string) => {
  voiceSynthesis.setLanguage(language);
  await voiceSynthesis.speakEmergencyMessage(message);
};

export const speakWelcomeMessage = async (message: string, language: string) => {
  voiceSynthesis.setLanguage(language);
  await voiceSynthesis.speak(message);
};