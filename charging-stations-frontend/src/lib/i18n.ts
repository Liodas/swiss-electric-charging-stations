import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
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
      format: function(value, format) {
        if (format === 'd') return value;
        return value;
      },
    },
    
    parseMissingKeyHandler: (key) => {
      return key;
    },
  });

export const t = (key: string, ...args: (string | number)[]) => {
  let translation = i18n.t(key);
  
  // Replace numbered placeholders {0}, {1}, {2}, etc. with provided arguments
  args.forEach((arg, index) => {
    translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
  });
  
  return translation;
};

export default i18n;