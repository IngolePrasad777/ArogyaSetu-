import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const messages = {
  en: { login: 'Login', register: 'Register', dashboard: 'Dashboard', language: 'Language', emergency: 'Emergency booking' },
  hi: { login: 'लॉगिन', register: 'रजिस्टर', dashboard: 'डैशबोर्ड', language: 'भाषा', emergency: 'आपातकालीन बुकिंग' },
  mr: { login: 'लॉगिन', register: 'नोंदणी', dashboard: 'डॅशबोर्ड', language: 'भाषा', emergency: 'आपत्कालीन बुकिंग' }
};

export const useI18nStore = create(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      t: (key) => messages[get().locale]?.[key] || messages.en[key] || key
    }),
    { name: 'arogyasetu-locale' }
  )
);
