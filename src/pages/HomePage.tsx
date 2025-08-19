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
      const langKey = currentLanguage || 'english';
      const langTranslations = translations[langKey as keyof typeof translations];
      const value = langTranslations[key as keyof typeof langTranslations];
      if (typeof value === 'string') {
        return value;
      }
      // Fallback to English
      const fallback = translations.english[key as keyof typeof translations.english];
      if (typeof fallback === 'string') {
        return fallback;
      }
      return `[${key}]`;
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
      {/* ...existing code... */}
      {/* The rest of your HomePage JSX as provided above */}
    </div>
  );
};

export default HomePage;
