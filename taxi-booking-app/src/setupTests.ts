import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en', // default language for tests
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false, // React already safes from xss
  },
  resources: {
    en: {
      translation: {}, // empty translation for tests
    },
  },
});