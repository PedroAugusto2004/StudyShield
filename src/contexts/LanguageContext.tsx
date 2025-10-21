import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { userDataService } from '@/services/userDataService';

type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();

  const language = i18n.language as Language;

  const setLanguage = async (lang: Language) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('userLanguage', lang);
    
    // Sync to database if user is logged in
    if (user?.id) {
      try {
        const success = await userDataService.updateLanguagePreference(user.id, lang);
        if (!success) {
          console.warn('Failed to sync language preference to database');
        }
      } catch (error) {
        console.error('Failed to sync language preference:', error);
      }
    }
  };

  // Load language preference from database on user login
  useEffect(() => {
    if (user?.id) {
      const loadLanguagePreference = async () => {
        try {
          const dbLanguage = await userDataService.getLanguagePreference(user.id);
          
          if (dbLanguage && ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'].includes(dbLanguage)) {
            if (dbLanguage !== language) {
              await i18n.changeLanguage(dbLanguage);
            }
          } else {
            // No database preference found, save current language to database
            await userDataService.updateLanguagePreference(user.id, language);
          }
        } catch (error) {
          console.error('Failed to load language preference:', error);
        }
      };

      loadLanguagePreference();
    }
  }, [user?.id, language, i18n]);

  // Initialize language from localStorage on first load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage && ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'].includes(savedLanguage)) {
      if (savedLanguage !== language) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
