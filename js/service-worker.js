"use strict";

const CACHE_NAME = 'morro-digital-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/modals.css',
  '/css/botoes.css',
  '/css/gamificação&marketing.css',
  '/css/navegacao.css',
  '/css/rotas.css',
  '/css/menus.css',
  '/css/tutorial-assistant.css',
  '/css/voiceInteraction.css',
  '/js/config.js',
  '/js/globals.js',
  '/js/events.js',
  '/js/permissions.js',
  '/js/cache.js',
  '/js/stateManagement.js',
  '/js/mapInitialization.js',
  '/js/mapVisualizations.js',
  '/js/osmInteraction.js',
  '/js/locationTracking.js',
  '/js/routeCreation.js',
  '/js/navigation.js',
  '/js/tutorial.js',
  '/js/uiController.js',
  '/js/menuController.js',
  '/js/submenuController.js',
  '/js/translationController.js',
  '/js/voiceInteractionController.js',
  '/js/gamificationMarketing.js',
  '/js/notifications.js',
  '/js/utils.js',
  '/js/service-worker.js',
  '/img/icon-192.png',
  '/img/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching recursos offline');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      // Fallback opcional, ex.: return caches.match('/offline.html');
    })
  );
});
