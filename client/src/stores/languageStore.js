import { create } from 'zustand';

const useLanguageStore = create((set) => ({
  language: localStorage.getItem('language') || 'np',
  
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  
  getLanguage: () => localStorage.getItem('language') || 'np',
}));

export default useLanguageStore;
