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

// Custom function to handle localise.biz interpolation format {%d}
export const t = (key: string, options?: { count?: number; [key: string]: unknown }) => {
  let translation = i18n.t(key, options);
  
  // Replace {%d} with the count value
  if (options?.count !== undefined) {
    translation = translation.replace(/\{%d\}/g, options.count.toString());
  }
  
  return translation;
};

export default i18n;