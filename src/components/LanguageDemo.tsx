/**
 * @file LanguageDemo.tsx
 * @description Demo component to showcase comprehensive Indian language support
 */

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceSynthesis } from '../services/voiceSynthesis';

const LanguageDemo: React.FC = () => {
  const { currentLanguage, setLanguage, t, getSupportedLanguages, isRTL, getLanguageClass } = useLanguage();
  const { speak, speakMedicalTerm, speakEmergencyMessage, isLanguageSupported } = useVoiceSynthesis();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceDemo = async (text: string, type: 'normal' | 'medical' | 'emergency' = 'normal') => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      switch (type) {
        case 'medical':
          await speakMedicalTerm(text, currentLanguage);
          break;
        case 'emergency':
          await speakEmergencyMessage(text);
          break;
        default:
          await speak(text);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const supportedLanguages = getSupportedLanguages();
  const medicalTerms = [t('fever'), t('cough'), t('headache'), t('bloodPressure')];
  const emergencyPhrase = t('urgentCare');
  const welcomeMessage = t('goodMorning');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ${getLanguageClass()}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className={`text-center mb-8 ${isRTL() ? 'text-right' : 'text-left'}`}>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🌍 EasyMed - Indian Language Support Demo
            </h1>
            <p className="text-gray-600">
              Comprehensive healthcare platform supporting 23+ Indian languages
            </p>
          </div>

          {/* Language Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🗣️ Select Language / भाषा चुनें / ভাষা নির্বাচন করুন
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentLanguage === lang.code
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{lang.flag}</span>
                    <span className={`language-${lang.code}`}>{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language Information */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Current Language: {supportedLanguages.find(l => l.code === currentLanguage)?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Direction:</span> {isRTL() ? 'Right-to-Left' : 'Left-to-Right'}
              </div>
              <div>
                <span className="font-medium">Voice Support:</span> {isLanguageSupported(currentLanguage) ? '✅ Available' : '⚠️ Fallback'}
              </div>
              <div>
                <span className="font-medium">Script:</span> Native ({currentLanguage})
              </div>
            </div>
          </div>

          {/* Healthcare Content Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Greetings */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                👋 {t('namaste')} - Greetings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('goodMorning')}</span>
                  <button
                    onClick={() => handleVoiceDemo(welcomeMessage)}
                    disabled={isPlaying}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    🔊
                  </button>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('takeCareBlessings')}</span>
                </div>
              </div>
            </div>

            {/* Medical Terms */}
            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                🏥 Medical Terms
              </h3>
              <div className="space-y-3">
                {medicalTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium medical-term">{term}</span>
                    <button
                      onClick={() => handleVoiceDemo(term, 'medical')}
                      disabled={isPlaying}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Healthcare Actions */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                ⚕️ Healthcare Actions
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('scheduleAppointment')}</span>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('viewReport')}</span>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('contactDoctor')}</span>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                🚨 Emergency Care
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="font-bold emergency-text">{emergencyPhrase}</span>
                  <button
                    onClick={() => handleVoiceDemo(emergencyPhrase, 'emergency')}
                    disabled={isPlaying}
                    className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    🔊
                  </button>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('callAmbulance')}</span>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{t('emergency108')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Context */}
          <div className="mt-8 p-6 bg-purple-50 rounded-xl">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              🕉️ Cultural Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <span className="cultural-greeting">{t('familyWellbeing')}</span>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <span className="cultural-greeting">{t('communityHealth')}</span>
              </div>
            </div>
          </div>

          {/* Voice Status */}
          {isPlaying && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-pulse w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800 font-medium">Playing audio in {currentLanguage}...</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-gray-600 text-sm">
            <p>✨ Comprehensive Indian Language Support for Inclusive Healthcare ✨</p>
            <p className="mt-2">Supporting rural communities with native language healthcare access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageDemo;