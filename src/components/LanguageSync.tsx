import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { userDataService } from '@/services/userDataService';

export const LanguageSync = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    if (user?.id && language) {
      setSyncStatus('syncing');
      
      userDataService.updateLanguagePreference(user.id, language)
        .then((success) => {
          setSyncStatus(success ? 'synced' : 'error');
          setTimeout(() => setSyncStatus('idle'), 2000);
        })
        .catch(() => {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 2000);
        });
    }
  }, [user?.id, language]);

  if (!user || syncStatus === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
        syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {syncStatus === 'syncing' && '🔄 Syncing language...'}
        {syncStatus === 'synced' && '✅ Language synced'}
        {syncStatus === 'error' && '❌ Sync failed'}
      </div>
    </div>
  );
};