/**
 * AI4Bharat Medical Assistant Component
 * Provides specialized healthcare guidance using AI4Bharat and medical terminology
 * Optimized for rural India with cultural context and traditional medicine integration
 */

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Heart, 
  MessageSquare, 
  AlertTriangle, 
  Phone, 
  BookOpen,
  Loader2,
  MapPin,
  Wifi,
  WifiOff,
  Leaf
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  medicalTerminologyService, 
  SymptomAnalysis, 
  MedicalCategory 
} from '../services/medicalTerminology';
import { ai4bharatService, MedicalQuery } from '../services/ai4bharat';
import { enhancedTranslationService } from '../services/enhancedTranslation';
import { Language } from '../translations';

interface AI4BharatMedicalAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo?: {
    age?: number;
    gender?: 'male' | 'female';
    medicalHistory?: string[];
  };
  ruralMode?: boolean;
}

interface MedicalSession {
  id: string;
  timestamp: Date;
  symptoms: string;
  analysis: SymptomAnalysis | null;
  aiResponse: string;
  language: Language;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  traditionalRemedies?: string[];
}

export default function AI4BharatMedicalAssistant({
  isOpen,
  onClose,
  patientInfo,
  ruralMode = false
}: AI4BharatMedicalAssistantProps) {
  const [currentSession, setCurrentSession] = useState<MedicalSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<MedicalSession[]>([]);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTraditionalMedicine, setShowTraditionalMedicine] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'ai4bharat' | 'local'>('ai4bharat');
  const [error, setError] = useState<string>('');

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

  // Auto-switch mode based on connectivity
  useEffect(() => {
    if (!isOnline || ruralMode) {
      setAnalysisMode('local');
    } else {
      setAnalysisMode('ai4bharat');
    }
  }, [isOnline, ruralMode]);

  if (!isOpen) return null;

  /**
   * Analyze symptoms using AI4Bharat or local medical terminology
   */
  const analyzeSymptoms = async () => {
    if (!symptomsInput.trim()) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const sessionId = `session_${Date.now()}`;
      
      // Create new session
      const newSession: MedicalSession = {
        id: sessionId,
        timestamp: new Date(),
        symptoms: symptomsInput,
        analysis: null,
        aiResponse: '',
        language: currentLanguage as Language,
        urgencyLevel: 'low'
      };

      setCurrentSession(newSession);

      // Analyze symptoms using medical terminology service
      const analysis = await medicalTerminologyService.analyzeSymptoms(
        symptomsInput,
        currentLanguage as Language,
        patientInfo?.age,
        patientInfo?.gender,
        patientInfo?.medicalHistory
      );

      // Get AI4Bharat response if online
      let aiResponse = '';
      if (analysisMode === 'ai4bharat' && isOnline) {
        aiResponse = await getAI4BharatMedicalGuidance(symptomsInput, analysis);
      } else {
        aiResponse = await generateLocalMedicalGuidance(analysis);
      }

      // Get traditional medicine recommendations
      let traditionalRemedies: string[] = [];
      if (showTraditionalMedicine && analysis.possibleConditions.length > 0) {
        traditionalRemedies = await getTraditionalMedicineRecommendations(
          analysis.possibleConditions[0].name
        );
      }

      // Update session with results
      const updatedSession: MedicalSession = {
        ...newSession,
        analysis,
        aiResponse,
        urgencyLevel: analysis.urgencyLevel,
        traditionalRemedies
      };

      setCurrentSession(updatedSession);
      setSessionHistory(prev => [updatedSession, ...prev.slice(0, 4)]); // Keep last 5 sessions

      // Clear input
      setSymptomsInput('');

    } catch (error) {
      console.error('Symptom analysis failed:', error);
      setError('Analysis failed. Please try again or consult a healthcare provider.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Get AI4Bharat medical guidance
   */
  const getAI4BharatMedicalGuidance = async (
    symptoms: string, 
    analysis: SymptomAnalysis
  ): Promise<string> => {
    try {
      const medicalQuery: MedicalQuery = {
        query: `Patient presents with: ${symptoms}. Possible conditions: ${analysis.possibleConditions.map(c => c.name).join(', ')}. Provide guidance in ${currentLanguage}.`,
        language: currentLanguage,
        symptoms: analysis.symptoms
      };

      const result = await ai4bharatService.processMedicalQuery(medicalQuery);
      
      if (result.success && result.data) {
        return result.data.guidance || result.data.response || 'Please consult a healthcare provider for proper diagnosis.';
      }
    } catch (error) {
      console.warn('AI4Bharat medical query failed:', error);
    }

    return await generateLocalMedicalGuidance(analysis);
  };

  /**
   * Generate local medical guidance
   */
  const generateLocalMedicalGuidance = async (analysis: SymptomAnalysis): Promise<string> => {
    let guidance = '';

    // Base guidance on urgency level
    switch (analysis.urgencyLevel) {
      case 'emergency':
        guidance = 'This appears to be a medical emergency. Call 108 immediately and seek urgent medical attention.';
        break;
      case 'high':
        guidance = 'These symptoms require prompt medical attention. Please consult a doctor as soon as possible.';
        break;
      case 'medium':
        guidance = 'Monitor these symptoms closely and consider consulting a healthcare provider within 24-48 hours.';
        break;
      case 'low':
        guidance = 'These symptoms may be managed with rest and self-care, but consult a doctor if they persist or worsen.';
        break;
    }

    // Add condition-specific guidance
    if (analysis.possibleConditions.length > 0) {
      const primaryCondition = analysis.possibleConditions[0];
      guidance += ` Based on your symptoms, this may be related to ${primaryCondition.name}.`;
    }

    // Add next steps
    const nextSteps = analysis.nextSteps.get(currentLanguage as Language);
    if (nextSteps && nextSteps.length > 0) {
      guidance += ` Recommended next steps: ${nextSteps.join(', ')}.`;
    }

    // Translate if needed
    if (currentLanguage !== Language.English) {
      try {
        const translated = await enhancedTranslationService.translate({
          text: guidance,
          sourceLanguage: Language.English,
          targetLanguage: currentLanguage as Language,
          context: 'medical',
          useAI4Bharat: isOnline
        });
        return translated.translatedText;
      } catch (error) {
        console.warn('Translation failed, returning English text');
      }
    }

    return guidance;
  };

  /**
   * Get traditional medicine recommendations
   */
  const getTraditionalMedicineRecommendations = async (
    condition: string
  ): Promise<string[]> => {
    try {
      const traditionalInfo = medicalTerminologyService.getTraditionalMedicineInfo(
        condition,
        currentLanguage as Language,
        'ayurveda'
      );
      
      return traditionalInfo.remedies;
    } catch (error) {
      console.warn('Traditional medicine lookup failed:', error);
      return [];
    }
  };

  /**
   * Call emergency services
   */
  const callEmergency = () => {
    if (confirm('Call 108 emergency services?')) {
      window.open('tel:108', '_blank');
    }
  };

  /**
   * Get urgency color
   */
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">AI4Bharat Medical Assistant</h2>
                <p className="text-blue-100 text-sm">Healthcare guidance in your language</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connectivity Status */}
              <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
                isOnline 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-red-500/20 text-red-100'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {isOnline ? 'AI4Bharat Online' : 'Offline Mode'}
              </div>

              {/* Rural Mode */}
              {ruralMode && (
                <div className="flex items-center px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-100">
                  <MapPin className="w-3 h-3 mr-1" />
                  Rural Mode
                </div>
              )}

              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* Symptom Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your symptoms:
              </label>
              <div className="flex space-x-3">
                <textarea
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="Describe how you're feeling, what symptoms you're experiencing..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isAnalyzing}
                />
                <button
                  onClick={analyzeSymptoms}
                  disabled={!symptomsInput.trim() || isAnalyzing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Stethoscope className="w-5 h-5" />
                  )}
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Options */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowTraditionalMedicine(!showTraditionalMedicine)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showTraditionalMedicine 
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Leaf className="w-4 h-4" />
                <span>Include Traditional Medicine</span>
              </button>
            </div>

            {/* Current Analysis */}
            {currentSession && (
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Analysis Results
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(currentSession.urgencyLevel)}`}>
                    {currentSession.urgencyLevel.toUpperCase()}
                  </div>
                </div>

                {/* Symptoms Detected */}
                {currentSession.analysis?.symptoms && currentSession.analysis.symptoms.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Symptoms Detected:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSession.analysis.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Guidance */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Medical Guidance:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentSession.aiResponse}
                  </p>
                </div>

                {/* Possible Conditions */}
                {currentSession.analysis?.possibleConditions && currentSession.analysis.possibleConditions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Possible Conditions:
                    </h4>
                    <ul className="space-y-2">
                      {currentSession.analysis.possibleConditions.slice(0, 3).map((condition, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{condition.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Traditional Medicine */}
                {showTraditionalMedicine && currentSession.traditionalRemedies && currentSession.traditionalRemedies.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                      <Leaf className="w-4 h-4 mr-2" />
                      Traditional Medicine Suggestions:
                    </h4>
                    <ul className="space-y-1">
                      {currentSession.traditionalRemedies.map((remedy, index) => (
                        <li key={index} className="text-green-700 dark:text-green-300 text-sm">
                          • {remedy}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Note: Traditional remedies should complement, not replace, modern medical treatment.
                    </p>
                  </div>
                )}

                {/* Warning Flags */}
                {currentSession.analysis?.warningFlags && currentSession.analysis.warningFlags.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Important Considerations:
                    </h4>
                    <ul className="space-y-1">
                      {currentSession.analysis.warningFlags.map((flag, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300 text-sm">
                          • {flag.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emergency Call */}
                {currentSession.urgencyLevel === 'emergency' && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <button
                      onClick={callEmergency}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call 108 Emergency Services</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Consultations
                </h3>
                <div className="space-y-3">
                  {sessionHistory.map((session, index) => (
                    <div key={session.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {session.timestamp.toLocaleDateString()} {session.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(session.urgencyLevel)}`}>
                          {session.urgencyLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {session.symptoms}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-700 p-6 border-l border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={callEmergency}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Emergency 108</span>
              </button>
              
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Talk to Doctor</span>
              </button>
              
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Health Education</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Important Disclaimer
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">
                This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}