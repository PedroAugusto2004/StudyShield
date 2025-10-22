import React from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Switch } from '@/components/ui/switch';
import { Cookie } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import './CookieSettings.css';

const CookieSettings: React.FC = () => {
  const { cookiesAccepted, acceptCookies, declineCookies } = useCookieConsent();
  const { actualTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = actualTheme === 'dark';

  const handleAnalyticsToggle = (checked: boolean) => {
    if (checked) {
      acceptCookies();
    } else {
      declineCookies();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Cookie className={`h-5 w-5 ${isDark ? 'text-white' : 'text-black'}`} />
          <div>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{t('analytics.cookies')}</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('analytics.cookies.description')}
            </p>
          </div>
        </div>
        <div className={`custom-switch ${isDark ? 'dark-theme' : 'light-theme'}`}>
          <Switch 
            checked={cookiesAccepted === true} 
            onCheckedChange={handleAnalyticsToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;