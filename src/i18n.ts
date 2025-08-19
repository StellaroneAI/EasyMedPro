import { useState, useEffect } from 'react';
import { translations, Language, TranslationData } from './translations';

let currentLang: Language = Language.English;
let current: TranslationData = translations[currentLang];
const listeners: Array<() => void> = [];

export const setLanguage = (lang: string) => {
  const key = (lang.toLowerCase() as Language);
  if (translations[key]) {
    currentLang = key;
    current = translations[key];
    listeners.forEach(l => l());
  }
};

export const useI18n = () => {
  const [t, setT] = useState<TranslationData>(current);
  const [lang, setLang] = useState<Language>(currentLang);

  useEffect(() => {
    const update = () => {
      setT(current);
      setLang(currentLang);
    };
    listeners.push(update);
    return () => {
      const i = listeners.indexOf(update);
      if (i >= 0) listeners.splice(i, 1);
    };
  }, []);

  return { t, lang };
};

export default { setLanguage, useI18n };
