self.addEventListener('install', (event) => {
  console.log('Service Worker installed.');
  // Optional: Add files to cache here
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
});

self.addEventListener('fetch', (event) => {
  // A basic pass-through fetch handler
  // In a production app, you can implement offline caching strategies here
  event.respondWith(fetch(event.request));
});
