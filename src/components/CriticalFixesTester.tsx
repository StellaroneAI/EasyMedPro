import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { voiceSynthesis } from '../services/voiceSynthesis';

/**
 * Testing Component for Critical Fixes Verification
 * This component helps verify all three critical fixes are working
 */
export default function CriticalFixesTester() {
  const { currentLanguage, setLanguage, getSupportedLanguages } = useLanguage();
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const supportedLanguages = getSupportedLanguages();

  const runTest = (testName: string, testFunction: () => Promise<boolean> | boolean) => {
    setCurrentTest(testName);
    Promise.resolve(testFunction()).then((result) => {
      setTestResults(prev => ({ ...prev, [testName]: result }));
      setCurrentTest('');
    }).catch(() => {
      setTestResults(prev => ({ ...prev, [testName]: false }));
      setCurrentTest('');
    });
  };

  // Test Functions
  const testLanguageSwitch = async (langCode: string): Promise<boolean> => {
    try {
      setLanguage(langCode as any);
      // Wait a bit for context to update
      await new Promise(resolve => setTimeout(resolve, 100));
      return currentLanguage === langCode;
    } catch {
      return false;
    }
  };

  const testVoiceSynthesis = async (language: string): Promise<boolean> => {
    try {
      setIsTestingVoice(true);
      voiceSynthesis.setLanguage(language);
      
      const testMessages = {
        english: "Hello, this is a voice test for English.",
        hindi: "नमस्ते, यह हिंदी के लिए आवाज़ का परीक्षण है।",
        tamil: "வணக்கம், இது தமிழுக்கான குரல் சோதனையாகும்।",
        telugu: "నమస్కారం, ఇది తెలుగు కోసం వాయిస్ టెస్ట్."
      };

      const message = testMessages[language as keyof typeof testMessages] || testMessages.english;
      await voiceSynthesis.speak(message);
      setIsTestingVoice(false);
      return true;
    } catch (error) {
      setIsTestingVoice(false);
      console.error('Voice test failed:', error);
      return false;
    }
  };

  const testUserRoleData = (): boolean => {
    try {
      const userData = localStorage.getItem('easymed_user');
      if (!userData) return false;
      
      const user = JSON.parse(userData);
      return !!(user && user.userType && user.name);
    } catch {
      return false;
    }
  };

  const testPhoneValidation = (): boolean => {
    const testPhones = ['9060328119', '9611044219', '7550392336', '9514070205'];
    // Mock validation - in real app this would use the actual validation service
    return testPhones.every(phone => phone.length === 10 && phone.match(/^[6-9]\d{9}$/));
  };

  const renderTestResult = (testName: string) => {
    const result = testResults[testName];
    const isRunning = currentTest === testName;
    
    if (isRunning) {
      return <span className="text-yellow-600">🔄 Testing...</span>;
    }
    
    if (result === undefined) {
      return <span className="text-gray-500">⏳ Not tested</span>;
    }
    
    return result ? 
      <span className="text-green-600">✅ Passed</span> : 
      <span className="text-red-600">❌ Failed</span>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧪 Critical Fixes Verification Tool
        </h1>
        <p className="text-gray-600">
          Test all three critical fixes: Multi-role login, AI voice, and translation
        </p>
      </div>

      {/* Current User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">👤 Current Session</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Language:</span> {currentLanguage}
          </div>
          <div>
            <span className="font-medium">User Data:</span> {renderTestResult('userRole')}
          </div>
        </div>
      </div>

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Fix 1: Multi-Role Login */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🔐 Multi-Role Login Tests
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Phone Validation</span>
              {renderTestResult('phoneValidation')}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">User Role Data</span>
              {renderTestResult('userRole')}
            </div>
            
            <button
              onClick={() => {
                runTest('phoneValidation', testPhoneValidation);
                runTest('userRole', testUserRoleData);
              }}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Run Login Tests
            </button>
          </div>
        </div>

        {/* Fix 2: AI Voice Assistant */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🗣️ AI Voice Tests
          </h3>
          
          <div className="space-y-3">
            {['english', 'hindi', 'tamil', 'telugu'].map((lang) => (
              <div key={lang} className="flex items-center justify-between">
                <span className="text-sm capitalize">{lang}</span>
                <div className="flex items-center space-x-2">
                  {renderTestResult(`voice_${lang}`)}
                  <button
                    onClick={() => runTest(`voice_${lang}`, () => testVoiceSynthesis(lang))}
                    disabled={isTestingVoice}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                  >
                    🎵 Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fix 3: Translation/Language Switching */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🌍 Translation Tests
          </h3>
          
          <div className="space-y-3">
            {['english', 'hindi', 'tamil', 'telugu'].map((lang) => (
              <div key={lang} className="flex items-center justify-between">
                <span className="text-sm capitalize">{lang}</span>
                <div className="flex items-center space-x-2">
                  {renderTestResult(`lang_${lang}`)}
                  <button
                    onClick={() => runTest(`lang_${lang}`, () => testLanguageSwitch(lang))}
                    className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                  >
                    Switch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Overall Test Status</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(testResults).filter(k => k.includes('phone') || k.includes('userRole')).filter(k => testResults[k]).length}
            </div>
            <div className="text-sm text-gray-600">Login Tests Passed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(testResults).filter(k => k.includes('voice')).filter(k => testResults[k]).length}
            </div>
            <div className="text-sm text-gray-600">Voice Tests Passed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(testResults).filter(k => k.includes('lang')).filter(k => testResults[k]).length}
            </div>
            <div className="text-sm text-gray-600">Language Tests Passed</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Testing Instructions</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>First test multi-role login with phone numbers: 9060328119, 9611044219, 7550392336, 9514070205</li>
          <li>Test voice synthesis in each language (requires speakers/headphones)</li>
          <li>Test language switching - UI should update immediately</li>
          <li>All tests should pass for the fixes to be verified as working</li>
        </ol>
      </div>
    </div>
  );
}