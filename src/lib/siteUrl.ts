/**
 * Get the correct site URL, ensuring www prefix for studyshield.site domain
 */
export const getCorrectSiteUrl = (): string => {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return envUrl;
  
  const currentOrigin = window.location.origin;
  
  // In development, use localhost as-is
  if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
    return currentOrigin;
  }
  
  // If we're on studyshield.site without www, add www
  if (currentOrigin.includes('studyshield.site') && !currentOrigin.includes('www.')) {
    return currentOrigin.replace('studyshield.site', 'www.studyshield.site');
  }
  
  return currentOrigin;
};