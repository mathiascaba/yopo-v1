// sw.js - Service Worker Nivel Producción (Anti-fallos)
const CACHE_NAME = 'yape-v4'; // Cambiado a v4 para forzar la descarga de la bóveda total

// Lista VIP de memoria: cacheamos todo el núcleo de la app para que cargue en 0 segundos
const urlsToCache = [
  '/',
  '/index.html',
  '/inicio.html',
  '/login_pin.html',
  '/escanear.html',
  '/yapear.html',
  '/monto.html',
  '/exito.html',
  '/exito_editable.html',
  '/exito_servicios.html',
  '/servicios.html',
  '/perfil.html',
  '/opciones.html',
  '/sobre.html',
  '/style.css',
  '/seguridad.js',
  '/manifest.json',
  '/img/favicon.png',
  '/img/animationyape.gif',
  '/img/campana-icon.svg',
  '/img/qr-icon.svg',
  '/img/icono_yapear.png',
  '/img/icono_movimientos.png',
  '/img/iconoperfil.png',
  '/img/logo_yape_header.png',
  '/img/homeanim1.gif',
  '/img/loginanim1.gif',
  '/img/check_exito.png',
  '/img/codigo-seguridad.png',
  '/img/compartiricon.png',
  '/img/fechaicon.png',
  '/img/hora-icon.png',
  '/img/mensaje-icon1.png',
  '/img/ojo_abierto.png',
  '/img/ojo_cerrado.png',
  '/img/qr_login.png',
  '/img/flecha-icon.svg',
  '/img/descarga.gif',
  '/img/download.png',
  '/img/download1.png',
  '/img/download2.png',
  '/img/download3.png',
  '/img/download4.png',
  '/img/download5.png',
  '/img/download6.png',
  '/img/download7.png',
  '/img/download8.png',
  '/img/download9.png',
  '/img/download10.png',
  '/img/download11.png',
  '/img/download13.png',
  '/img/download14.png'
];

// 1. INSTALACIÓN (Sin morir en el intento)
self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza a que la nueva versión tome el control de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error al cachear, pero seguimos vivos:', err))
  );
});

// 2. ACTIVACIÓN (El limpiador de basura vieja)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si encuentra un caché viejo, lo destruye
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de todas las pantallas abiertas
  );
});

// 3. INTERCEPTOR DE RED
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve lo del caché si existe, si no, lo busca en internet normalmente
        return response || fetch(event.request);
      })
  );
});
