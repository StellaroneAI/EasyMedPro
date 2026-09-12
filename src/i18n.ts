import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import auth_en from './locales/en/auth.json';
import common_en from './locales/en/common.json';
import dashboard_en from './locales/en/dashboard.json';

import common_hi from './locales/hi/common.json';
import common_ta from './locales/ta/common.json';
import common_te from './locales/te/common.json';

export const resources = {
  en: {
    auth: auth_en,
    common: common_en,
    dashboard: dashboard_en,
  },
  hi: {
    auth: auth_en,
    common: common_hi,
    dashboard: dashboard_en,
  },
  ta: {
    auth: auth_en,
    common: common_ta,
    dashboard: dashboard_en,
  },
  te: {
    auth: auth_en,
    common: common_te,
    dashboard: dashboard_en,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    ns: ['common', 'auth', 'dashboard'],
    defaultNS: 'common',
  });

export const setLanguage = (language: string) => i18n.changeLanguage(language);

export default i18n;
