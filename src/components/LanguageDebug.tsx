import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService } from '@/services/userDataService';

export const LanguageDebug = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    browserLanguage: '',
    localStorageLanguage: '',
    databaseLanguage: '',
    currentLanguage: language,
    navigatorLanguage: ''
  });

  useEffect(() => {
    const updateDebugInfo = async () => {
      const browserLang = navigator.language.toLowerCase();
      const localStorageLang = localStorage.getItem('userLanguage') || 'none';
      let dbLang = 'none';
      
      if (user?.id) {
        try {
          const dbLanguage = await userDataService.getLanguagePreference(user.id);
          dbLang = dbLanguage || 'none';
        } catch (error) {
          dbLang = 'error';
        }
      }

      setDebugInfo({
        browserLanguage: browserLang,
        localStorageLanguage: localStorageLang,
        databaseLanguage: dbLang,
        currentLanguage: language,
        navigatorLanguage: navigator.language
      });
    };

    updateDebugInfo();
  }, [language, user?.id]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Language Debug</div>
      <div>Navigator: {debugInfo.navigatorLanguage}</div>
      <div>Browser: {debugInfo.browserLanguage}</div>
      <div>LocalStorage: {debugInfo.localStorageLanguage}</div>
      <div>Database: {debugInfo.databaseLanguage}</div>
      <div>Current: {debugInfo.currentLanguage}</div>
      <div>User ID: {user?.id ? 'logged in' : 'not logged in'}</div>
    </div>
  );
};