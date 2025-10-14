import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCookies } from "@/contexts/CookiesContext";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { cookiesAccepted, showBanner } = useCookies();

  useEffect(() => {
    // Don't show if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    
    if (isStandalone || isInWebAppiOS || isMinimalUI || isFullscreen) return;

    // Don't show if user dismissed it
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show popup only after cookies are handled
      const checkCookiesAndShow = () => {
        if (!showBanner && cookiesAccepted !== null) {
          setTimeout(() => {
            setShowPopup(true);
          }, 1000);
        }
      };
      
      checkCookiesAndShow();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showBanner, cookiesAccepted]);
  
  // Watch for cookies banner dismissal
  useEffect(() => {
    if (!showBanner && cookiesAccepted !== null && deferredPrompt) {
      setTimeout(() => {
        setShowPopup(true);
      }, 1000);
    }
  }, [showBanner, cookiesAccepted, deferredPrompt]);

  const handleInstall = async () => {
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    
    if (isSafari) {
      // Safari instructions
      alert('To install on Safari:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install the app');
      setShowPopup(false);
      return;
    }

    if (!deferredPrompt) {
      alert('Installation not available. Please use your browser\'s install option.');
      setShowPopup(false);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
      }
      
      setDeferredPrompt(null);
      setShowPopup(false);
    } catch (error) {
      console.error('Install failed:', error);
      setShowPopup(false);
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm sm:max-w-xs"
        >
          <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 text-white shadow-2xl"
               style={{
                 background: 'rgba(0, 0, 0, 0.7)',
                 border: '2px solid rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(15px)'
               }}>
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-30"
                 style={{
                   background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
                   backgroundSize: '400% 400%',
                   animation: 'gradient 8s ease infinite'
                 }} />
            
            {/* Close button */}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-1 h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <img src="/white-icon.png" alt="StudyShield" className="w-5 h-5 sm:w-6 sm:h-6" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">Install StudyShield</h3>
                  <p className="text-white/80 text-xs sm:text-sm">Get the app experience</p>
                </div>
              </div>

              <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                Install StudyShield for faster access, offline features, and a native app experience.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-2 px-3 sm:px-4 text-sm rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-3 sm:px-4 py-2 text-sm rounded-xl"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPopup;