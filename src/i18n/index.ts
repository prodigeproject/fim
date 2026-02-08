import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import id from './locales/id.json';
import en from './locales/en.json';

// Get saved language or detect from browser
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved && ['id', 'en'].includes(saved)) {
      return saved;
    }
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'id';
  }
  return 'id';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang: 'id' | 'en') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('language', lang);
};

export default i18n;
