import React from 'react';
import { setLanguage, useI18n } from '../i18n';
import { Language } from '../translations';

const options = [
  { code: Language.English, label: 'English' },
  { code: Language.Hindi, label: 'Hindi' },
  { code: Language.Tamil, label: 'Tamil' }
];

export const LanguageToggle: React.FC = () => {
  const { lang } = useI18n();
  return (
    <select
      value={lang}
      onChange={e => setLanguage(e.target.value)}
      className="border rounded p-1 text-sm"
    >
      {options.map(o => (
        <option key={o.code} value={o.code}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageToggle;
