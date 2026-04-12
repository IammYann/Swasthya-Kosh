import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import nepalese from './locales/np.json';
import english from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    np: { translation: nepalese },
    en: { translation: english }
  },
  lng: localStorage.getItem('language') || 'np',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

export default i18n;
