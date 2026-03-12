/**
 * i18n Configuration
 * ==================
 * Internationalization setup for English and Arabic languages
 * with RTL support and localStorage persistence
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    fallbackLng: 'en', // Fallback language
    lng: localStorage.getItem('language') || 'en', // Default language from localStorage or English

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language in localStorage
      caches: ['localStorage'],
      // Key to use in localStorage
      lookupLocalStorage: 'language'
    }
  });

// Function to update document direction based on language
export const updateDocumentDirection = (language) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language);
};

// Set initial direction
updateDocumentDirection(i18n.language);

// Listen for language changes and update direction
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  updateDocumentDirection(lng);
});

export default i18n;
