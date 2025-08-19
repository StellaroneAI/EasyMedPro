import React from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n';

const options = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' }
];

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <select
      value={i18n.language}
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
