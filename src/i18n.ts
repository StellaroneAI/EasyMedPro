import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';

export const resources = {
  en: { translation: enCommon },
  hi: { translation: hiCommon }
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
