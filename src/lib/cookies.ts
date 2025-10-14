// Cookie utility functions for StudyShield
export const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// StudyShield specific cookie functions
export const setUserPreferences = (preferences: Record<string, any>) => {
  if (getCookie('studyshield-cookies-consent') === 'accepted') {
    setCookie('studyshield-preferences', JSON.stringify(preferences));
  }
};

export const getUserPreferences = (): Record<string, any> | null => {
  if (getCookie('studyshield-cookies-consent') === 'accepted') {
    const prefs = getCookie('studyshield-preferences');
    return prefs ? JSON.parse(prefs) : null;
  }
  return null;
};

export const setAnalyticsCookie = (enabled: boolean) => {
  if (getCookie('studyshield-cookies-consent') === 'accepted') {
    setCookie('studyshield-analytics', enabled.toString());
  }
};