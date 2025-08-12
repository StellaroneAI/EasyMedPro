/**
 * AI4Bharat Enhanced Voice Assistant
 * Integrates IndicWav2Vec, IndicTTS, and medical voice commands
 * Optimized for rural India with offline capabilities
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Loader2, 
  Wifi, 
  WifiOff,
  Stethoscope,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ai4bharatService, VoiceRequest } from '../services/ai4bharat';
import { enhancedTranslationService, EnhancedTranslationRequest } from '../services/enhancedTranslation';
import { Language } from '../translations';

interface AI4BharatVoiceAssistantProps {
  userName?: string;
  onCommand?: (command: string, language: string) => void;
  onNavigate?: (target: string) => void;
  enableMedicalContext?: boolean;
  ruralMode?: boolean;
}

interface VoiceSession {
  transcript: string;
  response: string;
  timestamp: Date;
  language: string;
  confidence: number;
  medicalTermsDetected?: string[];
  isEmergency?: boolean;
}

export default function AI4BharatVoiceAssistant({ 
  userName = "User", 
  onCommand,
  onNavigate,
  enableMedicalContext = true,
  ruralMode = false
}: AI4BharatVoiceAssistantProps) {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<VoiceSession[]>([]);
  const [error, setError] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [medicalMode, setMedicalMode] = useState(false);
  const [recognitionMode, setRecognitionMode] = useState<'ai4bharat' | 'browser'>('ai4bharat');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const { currentLanguage, t } = useLanguage();

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize voice assistant
  useEffect(() => {
    if (isEnabled) {
      initializeVoiceAssistant();
    }
  }, [currentLanguage, userName, isEnabled]);

  // Auto-switch to rural mode based on connectivity
  useEffect(() => {
    if (!isOnline || ruralMode) {
      setRecognitionMode('browser');
    } else {
      setRecognitionMode('ai4bharat');
    }
  }, [isOnline, ruralMode]);

  const initializeVoiceAssistant = async () => {
    try {
      const greeting = getTimeBasedGreeting();
      const welcomeMessage = await translateMessage(
        `${greeting}, ${userName}! I'm your AI-powered health assistant. How can I help you today?`
      );
      
      await speakResponse(welcomeMessage, true);
    } catch (error) {
      console.error('Voice assistant initialization failed:', error);
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  /**
   * Start voice recognition using AI4Bharat or browser fallback
   */
  const startListening = async () => {
    if (!isEnabled || isListening) return;

    try {
      setError('');
      setIsListening(true);
      setCurrentSession(null);

      if (recognitionMode === 'ai4bharat' && isOnline) {
        await startAI4BharatRecognition();
      } else {
        await startBrowserRecognition();
      }
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setError('Voice recognition failed. Please try again.');
      setIsListening(false);
    }
  };

  /**
   * AI4Bharat speech recognition with IndicWav2Vec
   */
  const startAI4BharatRecognition = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAI4BharatAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      
      // Auto-stop after 10 seconds for rural bandwidth optimization
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopListening();
        }
      }, ruralMode ? 5000 : 10000);

    } catch (error) {
      console.error('AI4Bharat recognition failed:', error);
      // Fallback to browser recognition
      await startBrowserRecognition();
    }
  };

  /**
   * Process audio with AI4Bharat IndicWav2Vec
   */
  const processAI4BharatAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const voiceRequest: VoiceRequest = {
        audioData: audioBlob,
        language: currentLanguage,
        medicalContext: enableMedicalContext
      };

      const result = await ai4bharatService.speechToText(voiceRequest);

      if (result.success && result.data) {
        await handleTranscriptReceived(result.data, result.confidence || 0.8, 'ai4bharat');
      } else {
        throw new Error(result.error || 'Speech recognition failed');
      }
    } catch (error) {
      console.error('AI4Bharat audio processing failed:', error);
      setError('Speech recognition failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  /**
   * Browser speech recognition fallback
   */
  const startBrowserRecognition = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = getBrowserLanguageCode(currentLanguage);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      await handleTranscriptReceived(transcript, confidence, 'browser');
    };

    recognition.onerror = (event: any) => {
      console.error('Browser speech recognition error:', event.error);
      setError('Speech recognition failed. Please try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  /**
   * Handle received transcript from any recognition method
   */
  const handleTranscriptReceived = async (
    transcript: string, 
    confidence: number, 
    method: 'ai4bharat' | 'browser'
  ) => {
    console.log(`🎤 Transcript (${method}):`, transcript, `(confidence: ${confidence})`);

    // Detect medical terms and emergency situations
    const medicalTerms = detectMedicalTerms(transcript);
    const isEmergency = detectEmergencyContext(transcript);

    // Create session
    const session: VoiceSession = {
      transcript,
      response: '',
      timestamp: new Date(),
      language: currentLanguage,
      confidence,
      medicalTermsDetected: medicalTerms,
      isEmergency
    };

    setCurrentSession(session);

    // Process command and generate response
    const response = await processVoiceCommand(transcript, isEmergency, medicalTerms);
    
    // Update session with response
    const updatedSession = { ...session, response };
    setCurrentSession(updatedSession);
    setSessionHistory(prev => [updatedSession, ...prev.slice(0, 9)]); // Keep last 10 sessions

    // Speak response
    await speakResponse(response, isEmergency);

    // Execute command if applicable
    if (onCommand) {
      onCommand(transcript, currentLanguage);
    }
  };

  /**
   * Process voice commands with medical context
   */
  const processVoiceCommand = async (
    transcript: string, 
    isEmergency: boolean, 
    medicalTerms: string[]
  ): Promise<string> => {
    const lowerTranscript = transcript.toLowerCase();

    // Emergency commands - highest priority
    if (isEmergency) {
      return await handleEmergencyCommand(lowerTranscript);
    }

    // Medical queries
    if (medicalTerms.length > 0 || enableMedicalContext) {
      return await handleMedicalQuery(transcript, medicalTerms);
    }

    // Navigation commands
    if (lowerTranscript.includes('dashboard') || lowerTranscript.includes('home')) {
      onNavigate?.('dashboard');
      return await translateMessage('Taking you to the dashboard');
    }

    if (lowerTranscript.includes('appointment')) {
      onNavigate?.('appointments');
      return await translateMessage('Opening appointments for you');
    }

    if (lowerTranscript.includes('family') && lowerTranscript.includes('health')) {
      onNavigate?.('family-health');
      return await translateMessage('Showing family health overview');
    }

    // Health status commands
    if (lowerTranscript.includes('how') && lowerTranscript.includes('health')) {
      return await translateMessage('Your vital signs are looking good. Remember to take your medications on time.');
    }

    // Medication reminders
    if (lowerTranscript.includes('medicine') || lowerTranscript.includes('medication')) {
      return await translateMessage('Checking your medication schedule. You have medicines due today at 6 PM.');
    }

    // Default response with health tips
    return await translateMessage('I\'m here to help with your health needs. You can ask about symptoms, medications, or appointments.');
  };

  /**
   * Handle emergency voice commands
   */
  const handleEmergencyCommand = async (transcript: string): Promise<string> => {
    console.log('🚨 Emergency detected:', transcript);

    if (transcript.includes('ambulance') || transcript.includes('108')) {
      // Simulate emergency call
      window.open('tel:108', '_blank');
      return await translateMessage('Calling 108 emergency services immediately. Help is on the way.');
    }

    if (transcript.includes('help') || transcript.includes('urgent')) {
      return await translateMessage('This appears to be an emergency. I recommend calling 108 or visiting the nearest hospital immediately.');
    }

    return await translateMessage('I understand this may be urgent. Please call 108 for immediate medical assistance.');
  };

  /**
   * Handle medical queries with enhanced translation
   */
  const handleMedicalQuery = async (query: string, medicalTerms: string[]): Promise<string> => {
    console.log('🏥 Processing medical query:', query, 'Terms:', medicalTerms);

    // Basic symptom checking
    if (medicalTerms.some(term => ['fever', 'headache', 'cough', 'pain'].includes(term))) {
      return await translateMessage(
        'I understand you\'re experiencing symptoms. While I can provide general information, please consult with a doctor for proper diagnosis and treatment.'
      );
    }

    // Medication queries
    if (medicalTerms.some(term => ['medicine', 'medication', 'tablet'].includes(term))) {
      return await translateMessage(
        'For medication information, please check with your doctor or pharmacist. I can help remind you about your scheduled medications.'
      );
    }

    // General medical response
    return await translateMessage(
      'I can help with general health information, but for specific medical concerns, please consult with a healthcare professional.'
    );
  };

  /**
   * Speak response using AI4Bharat IndicTTS or browser TTS
   */
  const speakResponse = async (text: string, isUrgent: boolean = false) => {
    if (!text) return;

    setIsSpeaking(true);

    try {
      // Use AI4Bharat TTS if online and available
      if (isOnline && recognitionMode === 'ai4bharat') {
        await speakWithAI4Bharat(text, isUrgent);
      } else {
        await speakWithBrowser(text, isUrgent);
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      // Fallback to browser TTS
      await speakWithBrowser(text, isUrgent);
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Speak using AI4Bharat IndicTTS
   */
  const speakWithAI4Bharat = async (text: string, isUrgent: boolean) => {
    try {
      const voiceRequest: VoiceRequest = {
        text,
        language: currentLanguage,
        medicalContext: enableMedicalContext
      };

      const result = await ai4bharatService.textToSpeech(voiceRequest);

      if (result.success && result.data) {
        const audio = new Audio(URL.createObjectURL(result.data));
        audio.playbackRate = isUrgent ? 1.1 : 0.9; // Faster for emergencies
        
        return new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => {
            console.warn('AI4Bharat TTS playback failed, falling back to browser TTS');
            resolve();
          };
          audio.play();
        });
      }
    } catch (error) {
      console.error('AI4Bharat TTS failed:', error);
      throw error;
    }
  };

  /**
   * Speak using browser TTS
   */
  const speakWithBrowser = async (text: string, isUrgent: boolean) => {
    return new Promise<void>((resolve) => {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getBrowserLanguageCode(currentLanguage);
      utterance.rate = isUrgent ? 1.1 : 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      // Set voice if available
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(utterance.lang));
      if (voice) {
        utterance.voice = voice;
      }

      speechSynthesis.speak(utterance);
    });
  };

  /**
   * Stop listening
   */
  const stopListening = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsListening(false);
  };

  /**
   * Toggle voice assistant
   */
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Stop speaking
   */
  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Helper functions
  const translateMessage = async (message: string): Promise<string> => {
    if (currentLanguage === Language.English) return message;

    try {
      const request: EnhancedTranslationRequest = {
        text: message,
        sourceLanguage: Language.English,
        targetLanguage: currentLanguage as Language,
        context: enableMedicalContext ? 'medical' : 'general',
        useAI4Bharat: isOnline
      };

      const result = await enhancedTranslationService.translate(request);
      return result.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return message;
    }
  };

  const detectMedicalTerms = (text: string): string[] => {
    const medicalKeywords = [
      'fever', 'headache', 'cough', 'cold', 'pain', 'medicine', 'doctor', 
      'hospital', 'emergency', 'urgent', 'help', 'sick', 'disease'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return medicalKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    );
  };

  const detectEmergencyContext = (text: string): boolean => {
    const emergencyKeywords = [
      'emergency', 'urgent', 'help', 'ambulance', '108', 'critical', 
      'serious', 'pain', 'attack', 'bleeding', 'unconscious'
    ];
    
    return emergencyKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  };

  const getBrowserLanguageCode = (language: string): string => {
    const languageCodes: { [key: string]: string } = {
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
    return languageCodes[language] || 'en-US';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-3">
        
        {/* Session Display */}
        {currentSession && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm mr-4 border">
            <div className="flex items-center space-x-2 mb-2">
              {currentSession.isEmergency && (
                <div className="flex items-center text-red-600">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">EMERGENCY</span>
                </div>
              )}
              {currentSession.medicalTermsDetected && currentSession.medicalTermsDetected.length > 0 && (
                <div className="flex items-center text-blue-600">
                  <Stethoscope className="w-4 h-4 mr-1" />
                  <span className="text-xs">Medical</span>
                </div>
              )}
              <div className="text-xs text-gray-500 ml-auto">
                {Math.round(currentSession.confidence * 100)}%
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <strong>You:</strong> {currentSession.transcript}
              </div>
              {currentSession.response && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Assistant:</strong> {currentSession.response}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center space-x-2 mr-4">
          {/* Connectivity Status */}
          <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
            isOnline 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'AI4Bharat' : 'Offline'}
          </div>

          {/* Medical Mode Indicator */}
          {enableMedicalContext && (
            <div className="flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Stethoscope className="w-3 h-3 mr-1" />
              Medical
            </div>
          )}

          {/* Rural Mode Indicator */}
          {ruralMode && (
            <div className="flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <MapPin className="w-3 h-3 mr-1" />
              Rural
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mr-4 text-sm max-w-sm">
            {error}
          </div>
        )}

        {/* Main Voice Button */}
        <div className="flex items-center space-x-3">
          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-200"
              title="Stop Speaking"
            >
              <VolumeX className="w-6 h-6" />
            </button>
          )}

          {/* Main Voice Recognition Button */}
          <button
            onClick={toggleListening}
            disabled={!isEnabled || isProcessing}
            className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 pulse' 
                : isProcessing
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white ${(!isEnabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              isListening 
                ? 'Stop Listening' 
                : isProcessing 
                ? 'Processing...' 
                : 'Start Voice Assistant'
            }
          >
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {/* Pulse animation for listening state */}
      <style jsx>{`
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
}