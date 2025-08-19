import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/index';

interface HomePageProps {
  onNavigateToLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToLogin }) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Helper function to get homepage translations
  const getHomepageTranslation = (key: string): string => {
    try {
      const langKey = currentLanguage === 'english' ? 'english' : 
                     currentLanguage === 'hindi' ? 'hindi' :
                     currentLanguage === 'tamil' ? 'tamil' :
                     currentLanguage === 'telugu' ? 'telugu' :
                     currentLanguage === 'bengali' ? 'bengali' :
                     currentLanguage === 'marathi' ? 'marathi' :
                     currentLanguage === 'kannada' ? 'kannada' : 'english';
      
      const langTranslations = translations[langKey as keyof typeof translations];
      const homepageTranslations = langTranslations.homepage;
      
      if (homepageTranslations && homepageTranslations[key as keyof typeof homepageTranslations]) {
        return homepageTranslations[key as keyof typeof homepageTranslations];
      }
      
      // Fallback to English
      return translations.english.homepage[key as keyof typeof translations.english.homepage] || `[${key}]`;
    } catch (error) {
      console.error(`Translation error for homepage key: ${key}`, error);
      return `[${key}]`;
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏥</span>
              <h1 className="text-2xl font-bold text-gray-800">EasyMed-TeleHealth</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                  }}
                  className="appearance-none bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="english">🌐 English</option>
                  <option value="hindi">🇮🇳 हिंदी</option>
                  <option value="tamil">🇮🇳 தமிழ்</option>
                  <option value="telugu">🇮🇳 తెలుగు</option>
                  <option value="bengali">🇮🇳 বাংলা</option>
                  <option value="marathi">🇮🇳 मराठी</option>
                  <option value="Kannada">🇮🇳 ಕನ್ನಡ</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              
              <button 
                onClick={onNavigateToLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {getHomepageTranslation('getStarted')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16 sm:py-24">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            <span className="block">{getHomepageTranslation('heroTitle1')}</span>
            <span className="block text-blue-600">{getHomepageTranslation('heroTitle2')}</span>
          </h2>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-gray-600 leading-relaxed">
            {getHomepageTranslation('heroDescription')}
          </p>
          
          {/* Enhanced Features Grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <span className="text-3xl mb-3 block">⚡</span>
              <h3 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('ai24Doctor')}</h3>
              <p className="text-sm text-gray-600">{getHomepageTranslation('ai24DoctorDesc')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <span className="text-3xl mb-3 block">🎯</span>
              <h3 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('smartDiagnosis')}</h3>
              <p className="text-sm text-gray-600">{getHomepageTranslation('smartDiagnosisDesc')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <span className="text-3xl mb-3 block">🌍</span>
              <h3 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('multiLanguage')}</h3>
              <p className="text-sm text-gray-600">{getHomepageTranslation('multiLanguageDesc')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <span className="text-3xl mb-3 block">💰</span>
              <h3 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('saveCosts')}</h3>
              <p className="text-sm text-gray-600">{getHomepageTranslation('saveCostsDesc')}</p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">{getHomepageTranslation('whyChoose')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-300 text-xl">✨</span>
                <div>
                  <h4 className="font-semibold mb-1">{getHomepageTranslation('voiceAI')}</h4>
                  <p className="text-blue-100 text-sm">{getHomepageTranslation('voiceAIDesc')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-yellow-300 text-xl">🔒</span>
                <div>
                  <h4 className="font-semibold mb-1">{getHomepageTranslation('abhaIntegrated')}</h4>
                  <p className="text-blue-100 text-sm">{getHomepageTranslation('abhaIntegratedDesc')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-yellow-300 text-xl">👨‍👩‍👧‍👦</span>
                <div>
                  <h4 className="font-semibold mb-1">{getHomepageTranslation('familyHub')}</h4>
                  <p className="text-blue-100 text-sm">{getHomepageTranslation('familyHubDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button 
              onClick={onNavigateToLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              {getHomepageTranslation('startJourney')}
            </button>
            <p className="mt-3 text-sm text-gray-500">{getHomepageTranslation('noCreditCard')}</p>
          </div>
        </div>

        {/* Services Section */}
        <div className="py-16 sm:py-24 bg-white rounded-2xl shadow-xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">{getHomepageTranslation('whatWeOffer')}</h3>
            <p className="mt-4 text-lg text-gray-600">{getHomepageTranslation('aiPoweredTools')}</p>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-8 border border-gray-100 rounded-xl shadow-lg bg-gray-50">
              <span className="text-5xl">🔍</span>
              <h4 className="mt-4 text-2xl font-semibold text-gray-800">{getHomepageTranslation('intelligentSymptomChecker')}</h4>
              <p className="mt-2 text-gray-600">{getHomepageTranslation('symptomCheckerDesc')}</p>
            </div>
            <div className="text-center p-8 border border-gray-100 rounded-xl shadow-lg bg-gray-50">
              <span className="text-5xl">💊</span>
              <h4 className="mt-4 text-2xl font-semibold text-gray-800">{getHomepageTranslation('medicationAIAssistant')}</h4>
              <p className="mt-2 text-gray-600">{getHomepageTranslation('medicationAssistantDesc')}</p>
            </div>
            <div className="text-center p-8 border border-gray-100 rounded-xl shadow-lg bg-gray-50">
              <span className="text-5xl">📊</span>
              <h4 className="mt-4 text-2xl font-semibold text-gray-800">{getHomepageTranslation('healthAnalyticsAI')}</h4>
              <p className="mt-2 text-gray-600">{getHomepageTranslation('healthAnalyticsDesc')}</p>
            </div>
          </div>
        </div>

        {/* Video Demo Section */}
        <div className="py-16 sm:py-24">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">{getHomepageTranslation('seeInAction')}</h3>
            <p className="mt-4 text-lg text-gray-600">{getHomepageTranslation('quickTour')}</p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 rounded-2xl shadow-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
              {/* Placeholder for video */}
              <span className="text-gray-500">{getHomepageTranslation('videoDemoSoon')}</span>
            </div>
          </div>
        </div>

        {/* About Us/Team Section */}
        <div className="py-16 sm:py-24 bg-white rounded-2xl shadow-xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">{getHomepageTranslation('drivenByPurpose')}</h3>
            <p className="mt-4 max-w-4xl mx-auto text-lg text-gray-600 leading-relaxed">
              {getHomepageTranslation('founderStory')}
            </p>
          </div>
          
          {/* Mission Statement */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
              <blockquote className="text-center">
                <p className="text-xl italic text-gray-700 mb-4">
                  "{getHomepageTranslation('missionQuote')}"
                </p>
                <cite className="text-lg font-semibold text-blue-600">— {getHomepageTranslation('founderName')}</cite>
                <p className="text-sm text-gray-500 mt-1">{getHomepageTranslation('founderTitle')}</p>
              </blockquote>
            </div>
          </div>
          
          {/* Values */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('simplicityTitle')}</h4>
              <p className="text-gray-600 text-sm">{getHomepageTranslation('simplicityDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('empathyTitle')}</h4>
              <p className="text-gray-600 text-sm">{getHomepageTranslation('empathyDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{getHomepageTranslation('purposeTitle')}</h4>
              <p className="text-gray-600 text-sm">{getHomepageTranslation('purposeDesc')}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600">
          &copy; {new Date().getFullYear()} EasyMed-TeleHealth. {getHomepageTranslation('allRightsReserved')}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
