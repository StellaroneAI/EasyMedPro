import * as i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as languageDetectorModule from 'i18next-browser-languagedetector';

// Import translation files
import auth_en from './locales/en/auth.json';
import common_en from './locales/en/common.json';
import dashboard_en from './locales/en/dashboard.json';

import common_hi from './locales/hi/common.json';
import common_ta from './locales/ta/common.json';
import common_te from './locales/te/common.json';

const i18n = ((i18next as any).default ?? i18next);
const LanguageDetector = (languageDetectorModule as any).default ?? languageDetectorModule;
const unwrap = (mod: any) => mod?.default ?? mod;

export const resources = {
  en: {
    auth: unwrap(auth_en),
    common: unwrap(common_en),
    dashboard: unwrap(dashboard_en),
  },
  hi: {
    auth: unwrap(auth_en),
    common: unwrap(common_hi),
    dashboard: unwrap(dashboard_en),
  },
  ta: {
    auth: unwrap(auth_en),
    common: unwrap(common_ta),
    dashboard: unwrap(dashboard_en),
  },
  te: {
    auth: unwrap(auth_en),
    common: unwrap(common_te),
    dashboard: unwrap(dashboard_en),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV !== 'production',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    ns: ['common', 'auth', 'dashboard'],
    defaultNS: 'common',
  });

export const setLanguage = (language: string) => i18n.changeLanguage(language);

export default i18n;
