import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { storage } from '@core/storage';
import { translations, LanguageKey, TranslationKey, Language } from '../translations/index';
import { gujaratiTranslation, kannadaTranslation, malayalamTranslation } from '../translations/languages/comprehensive';
import { urduTranslation, odiaTranslation, assameseTranslation } from '../translations/languages/additionalLanguages';
import '../styles/rtl-support.css';

interface LanguageContextType {
  currentLanguage: LanguageKey;
  setLanguage: (language: LanguageKey) => void;
  t: (key: TranslationKey) => string;
  getVoiceCommand: (command: keyof typeof translations.english.voiceCommands) => string;
  getSupportedLanguages: () => { code: string; name: string; flag: string; }[];
  isRTL: () => boolean;
  getLanguageClass: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Extended translations with additional languages
const extendedTranslations = {
  ...translations,
  [Language.Gujarati]: gujaratiTranslation,
  [Language.Kannada]: kannadaTranslation,
  [Language.Malayalam]: malayalamTranslation,
  [Language.Urdu]: urduTranslation,
  [Language.Odia]: odiaTranslation,
  [Language.Assamese]: assameseTranslation
};

// RTL languages
const RTL_LANGUAGES = ['urdu', 'sindhi'];

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageKey>('english');

  const setLanguage = (language: LanguageKey) => {
    setCurrentLanguage(language);
    // Store preference using cross-platform storage
    void storage.setItem('easymed-language', language);
    
    // Update document direction for RTL languages
    if (RTL_LANGUAGES.includes(language)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.classList.add('rtl-layout');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.classList.remove('rtl-layout');
    }
    
    // Update document language attribute
    document.documentElement.setAttribute('lang', language);
    
    // Add language-specific class to body for styling
    document.body.className = document.body.className.replace(/language-\w+/g, '');
    document.body.classList.add(`language-${language}`);
  };

  // Load saved language and set initial direction on mount
  useEffect(() => {
    const init = async () => {
      const saved = await storage.getItem('easymed-language');
      const lang = (saved as LanguageKey) || currentLanguage;
      setLanguage(lang);
    };
    init();
  }, []);

  const t = (key: TranslationKey): string => {
    try {
      const translationObj = extendedTranslations[currentLanguage];
      const value = translationObj?.[key as keyof typeof translationObj];
      if (typeof value === 'string') {
        return value;
      }
      // Fallback to English
      const englishObj = extendedTranslations.english;
      const fallbackValue = englishObj[key as keyof typeof englishObj];
      if (typeof fallbackValue === 'string') {
        return fallbackValue;
      }
      // If key doesn't exist, return a placeholder or the key itself
      console.warn(`Missing translation for key: ${key} in language: ${currentLanguage}`);
      return `[${key}]`; // Show missing translation clearly
    } catch (error) {
      // In case of any error, return the key itself
      console.error(`Translation error for key: ${key}`, error);
      return `[${key}]`;
    }
  };

  const getVoiceCommand = (command: keyof typeof translations.english.voiceCommands): string => {
    const currentTranslations = extendedTranslations[currentLanguage];
    return currentTranslations?.voiceCommands?.[command] || 
           extendedTranslations.english.voiceCommands[command] || 
           command;
  };

  const isRTL = (): boolean => {
    return RTL_LANGUAGES.includes(currentLanguage);
  };

  const getLanguageClass = (): string => {
    return `language-${currentLanguage}${isRTL() ? ' rtl-text' : ''}`;
  };

  const getSupportedLanguages = () => [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bengali', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'marathi', name: 'मराठी', flag: '🇮🇳' },
    { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'gujarati', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kannada', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'malayalam', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'odia', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'assamese', name: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'urdu', name: 'اردو', flag: '🇮🇳' },
    { code: 'kashmiri', name: 'कॉशुर', flag: '🇮🇳' },
    { code: 'sindhi', name: 'سنڌي', flag: '🇮🇳' },
    { code: 'manipuri', name: 'ꯃꯤꯇꯩꯂꯣꯟ', flag: '🇮🇳' },
    { code: 'bodo', name: 'बर\'', flag: '🇮🇳' },
    { code: 'konkani', name: 'कोंकणी', flag: '🇮🇳' },
    { code: 'sanskrit', name: 'संस्कृतम्', flag: '🇮🇳' },
    { code: 'maithili', name: 'मैथिली', flag: '🇮🇳' },
    { code: 'santali', name: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' },
    { code: 'dogri', name: 'डोगरी', flag: '🇮🇳' },
    { code: 'nepali', name: 'नेपाली', flag: '🇮🇳' }
  ];

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    getVoiceCommand,
    getSupportedLanguages,
    isRTL,
    getLanguageClass
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
