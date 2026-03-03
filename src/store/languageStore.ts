import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, zh, en, Translations } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'zh',
      translations: zh,
      setLanguage: (lang: Language) => {
        set({
          language: lang,
          translations: lang === 'zh' ? zh : en,
        });
      },
    }),
    {
      name: 'meridian-language',
    }
  )
);
