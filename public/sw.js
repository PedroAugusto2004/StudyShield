const VERSION = '1760461117736';
const CACHE_NAME = `studyshield-v${VERSION}`;
const STATIC_CACHE = `studyshield-static-v${VERSION}`;

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Icon.png',
  '/studyshield-logo.png'
];

// Install event - cache static assets and skip waiting
self.addEventListener('install', (event) => {
  console.log('SW: Installing new version', VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => {
        console.log('SW: Skip waiting and take control');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('SW: Activating new version', VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Delete ALL caches to prevent 404 errors from old assets
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('SW: Deleting cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('SW: Claiming all clients');
      return self.clients.claim();
    }).then(() => {
      // Force reload all clients to get the latest version
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests - always try network first
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If API fails and it's the chat endpoint, return offline message
          if (request.url.includes('/api/chat')) {
            return new Response(
              JSON.stringify({ 
                error: 'offline',
                message: 'You are offline. Please check your connection or use offline mode with Gemini Nano.' 
              }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          throw new Error('Network unavailable');
        })
    );
    return;
  }

  // Handle static assets - cache first
  if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // Handle hashed assets (JS/CSS with hash in filename) - always fetch fresh
  if (request.url.includes('/assets/') && /\-[a-f0-9]{8,}\.(js|css)/.test(request.url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle app routes - network first with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Always return fresh content for HTML files and hashed assets
        if (request.url.includes('.html') || request.url === self.location.origin + '/') {
          return response;
        }
        return response;
      })
      .catch(() => {
        // Only fallback to cache for non-hashed assets
        if (!request.url.includes('/assets/') || !/\-[a-f0-9]{8,}\.(js|css)/.test(request.url)) {
          return caches.match(request)
            .then(response => {
              if (response) {
                return response;
              }
              // Fallback to index.html for SPA routes
              return caches.match('/index.html');
            });
        }
        // For hashed assets that fail, don't fallback to cache
        throw new Error('Asset not found');
      })
  );
});

// Handle background sync for offline messages (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Could implement offline message queue here
      Promise.resolve()
    );
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/Icon.png',
        badge: '/Icon.png'
      })
    );
  }
});