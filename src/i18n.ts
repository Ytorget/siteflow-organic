import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sv from '../locales/sv.json';
import en from '../locales/en.json';

// Get saved language from localStorage or default to Swedish
const savedLanguage = localStorage.getItem('language') || 'sv';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: sv },
      en: { translation: en },
    },
    lng: savedLanguage,
    fallbackLng: 'sv',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
