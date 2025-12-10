import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Save language preference when it changes and update document title
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  console.log('Language changed to:', lng);
  
  // Update document title based on current language
  document.title = i18n.t('navbar.appName');
  
  // Update html lang attribute
  document.documentElement.lang = lng;
});

export default i18n;
