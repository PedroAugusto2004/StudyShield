import { useCookies } from '@/contexts/CookiesContext';
import { setCookie, getCookie, setUserPreferences, getUserPreferences, setAnalyticsCookie } from '@/lib/cookies';

export const useCookieConsent = () => {
  const { cookiesAccepted, acceptCookies, declineCookies, showBanner } = useCookies();

  const canUseAnalytics = () => {
    return cookiesAccepted === true;
  };

  const canUsePreferences = () => {
    return cookiesAccepted === true;
  };

  const saveUserPreference = (key: string, value: any) => {
    if (canUsePreferences()) {
      const currentPrefs = getUserPreferences() || {};
      setUserPreferences({ ...currentPrefs, [key]: value });
    }
  };

  const getUserPreference = (key: string) => {
    if (canUsePreferences()) {
      const prefs = getUserPreferences();
      return prefs ? prefs[key] : null;
    }
    return null;
  };

  const enableAnalytics = () => {
    if (canUseAnalytics()) {
      setAnalyticsCookie(true);
    }
  };

  return {
    cookiesAccepted,
    acceptCookies,
    declineCookies,
    showBanner,
    canUseAnalytics,
    canUsePreferences,
    saveUserPreference,
    getUserPreference,
    enableAnalytics,
  };
};