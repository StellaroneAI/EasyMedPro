import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import auth_en from './locales/en/auth.json';
import common_en from './locales/en/common.json';
import dashboard_en from './locales/en/dashboard.json';

import auth_hi from './locales/hi/auth.json';
import common_hi from './locales/hi/common.json';
import dashboard_hi from './locales/hi/dashboard.json';

import auth_ta from './locales/ta/auth.json';
import common_ta from './locales/ta/common.json';
import dashboard_ta from './locales/ta/dashboard.json';

import auth_te from './locales/te/auth.json';
import common_te from './locales/te/common.json';
import dashboard_te from './locales/te/dashboard.json';

export const resources = {
  en: {
    auth: auth_en,
    common: common_en,
    dashboard: dashboard_en,
  },
  hi: {
    auth: auth_hi,
    common: common_hi,
    dashboard: dashboard_hi,
  },
  ta: {
    auth: auth_ta,
    common: common_ta,
    dashboard: dashboard_ta,
  },
  te: {
    auth: auth_te,
    common: common_te,
    dashboard: dashboard_te,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV, // Enable debug mode in development
    interpolation: {
      escapeValue: false, // React already protects from xss
    },
    ns: ['common', 'auth', 'dashboard'],
    defaultNS: 'common',
  });

export default i18n;