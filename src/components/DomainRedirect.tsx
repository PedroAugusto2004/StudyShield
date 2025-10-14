import { useEffect } from 'react';

/**
 * Component to handle domain redirects for OAuth consistency
 * Redirects studyshield.site to www.studyshield.site to ensure OAuth callbacks work
 */
const DomainRedirect = () => {
  useEffect(() => {
    const currentUrl = window.location.href;
    const hostname = window.location.hostname;
    
    // Only redirect in production and if we're on studyshield.site without www
    if (hostname === 'studyshield.site' && !import.meta.env.DEV) {
      const newUrl = currentUrl.replace('studyshield.site', 'www.studyshield.site');
      window.location.replace(newUrl);
    }
  }, []);

  return null;
};

export default DomainRedirect;