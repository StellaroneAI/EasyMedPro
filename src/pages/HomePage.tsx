import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/index';

interface HomePageProps {
  onNavigateToLogin: () => void;
}

const FeatureCard = ({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) => (
  <div className={`bg-gradient-to-br from-${color}-100 to-white p-6 rounded-2xl shadow-lg border border-gray-200/50`}>
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigateToLogin }) => {
  const { currentLanguage, setLanguage, getSupportedLanguages } = useLanguage();

  const t = (key: string): string => {
    const langKey = currentLanguage as keyof typeof translations;
    const homePageKeys = (translations[langKey] as any)?.homepage as any;
    return homePageKeys?.[key] || `[${key}]`;
  };

  const features = [
    { icon: '⚡️', title: t('feature1Title'), description: t('feature1Desc'), color: 'yellow' },
    { icon: '🎯', title: t('feature2Title'), description: t('feature2Desc'), color: 'green' },
    { icon: '🌍', title: t('feature3Title'), description: t('feature3Desc'), color: 'purple' },
    { icon: '💰', title: t('feature4Title'), description: t('feature4Desc'), color: 'orange' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="EasyMed Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-800">EasyMed-TeleHealth</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {getSupportedLanguages().map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <button
              onClick={onNavigateToLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('getStarted')}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          {t('mainHeading')}
        </h2>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
          {t('subHeading')}
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </main>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">{t('whyChooseUs')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('why1Title')}</h3>
              <p className="opacity-80">{t('why1Desc')}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('why2Title')}</h3>
              <p className="opacity-80">{t('why2Desc')}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('why3Title')}</h3>
              <p className="opacity-80">{t('why3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
