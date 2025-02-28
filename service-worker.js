
const CACHE_NAME = 'morro-digital-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS
  '/css/styles.css',
  '/css/modals.css',
  '/css/botoes.css',
  '/css/gamificação&marketing.css',
  '/css/navegacao.css',
  '/css/rotas.css',
  '/css/menus.css',
  '/css/tutorial&assistant.css',
  '/css/voiceInteraction.css',
  // JavaScript
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
  '/js/service-worker.js', // Este próprio arquivo
  // Imagens e ícones
  '/img/icon-192.png',
  '/img/icon-512.png'
  // Adicione outros recursos locais necessários
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline resources');
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
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Apenas para requisições GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Retorna do cache
        return response;
      }
      // Caso contrário, faz a requisição na rede
      return fetch(event.request).then((networkResponse) => {
        // Se a resposta for inválida, não a cacheamos
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        // Clona a resposta para armazenar no cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      // Fallback para uma página offline (opcional)
      // return caches.match('/offline.html');
    })
  );
});
