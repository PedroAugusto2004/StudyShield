import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

// Service Worker Registration with Update Handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW: Registered successfully');
        
        // Check for updates every 30 seconds
        setInterval(() => {
          registration.update();
        }, 30000);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available, reloading...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('SW: Registration failed', error);
      });
  });
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log('SW: Received update message, reloading...');
      window.location.reload();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
