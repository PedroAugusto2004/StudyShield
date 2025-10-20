import React from 'react';
import { useCookies } from '@/contexts/CookiesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

const CookiesBanner: React.FC = () => {
  const { showBanner, acceptCookies, declineCookies } = useCookies();
  const { t } = useLanguage();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-3 mb-3 sm:mx-4 sm:mb-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6 shadow-2xl">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 mt-1">
            <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                {t('cookies.title')}
              </h3>
              <p className="text-xs sm:text-sm text-white leading-relaxed">
                {t('cookies.description')}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button
                onClick={acceptCookies}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto sm:flex-none"
                size="sm"
              >
                {t('cookies.accept')}
              </Button>
              <Button
                onClick={declineCookies}
                className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto sm:flex-none"
                size="sm"
              >
                {t('cookies.decline')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white text-xs border border-white w-full sm:w-auto hover:bg-transparent"
                asChild
              >
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  {t('cookies.learn.more')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesBanner;