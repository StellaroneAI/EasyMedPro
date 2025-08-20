import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import taCommon from './locales/ta/common.json';
import teCommon from './locales/te/common.json';
import knCommon from './locales/kn/common.json';
import mlCommon from './locales/ml/common.json';
import mrCommon from './locales/mr/common.json';

export const resources = {
  en: { translation: enCommon },
  hi: { translation: hiCommon },
  ta: { translation: taCommon },
  te: { translation: teCommon },
  kn: { translation: knCommon },
  ml: { translation: mlCommon },
  mr: { translation: mrCommon }
} as const;

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export function setLanguage(lang: string) {
  localStorage.setItem('lang', lang);
  void i18n.changeLanguage(lang);
}

export default i18n;
