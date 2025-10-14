import React, { createContext, useContext, useState, useEffect } from 'react';

interface CookiesContextType {
  cookiesAccepted: boolean | null;
  acceptCookies: () => void;
  declineCookies: () => void;
  showBanner: boolean;
}

const CookiesContext = createContext<CookiesContextType | undefined>(undefined);

export const useCookies = () => {
  const context = useContext(CookiesContext);
  if (context === undefined) {
    throw new Error('useCookies must be used within a CookiesProvider');
  }
  return context;
};

export const CookiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('studyshield-cookies-consent');
    if (consent === null) {
      setShowBanner(true);
      setCookiesAccepted(null);
    } else {
      setCookiesAccepted(consent === 'accepted');
      setShowBanner(false);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('studyshield-cookies-consent', 'accepted');
    setCookiesAccepted(true);
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('studyshield-cookies-consent', 'declined');
    setCookiesAccepted(false);
    setShowBanner(false);
  };

  return (
    <CookiesContext.Provider value={{
      cookiesAccepted,
      acceptCookies,
      declineCookies,
      showBanner
    }}>
      {children}
    </CookiesContext.Provider>
  );
};