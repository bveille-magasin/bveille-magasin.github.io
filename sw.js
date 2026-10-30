/* B·Veille iPhone : garde une copie de la page pour fonctionner même si le Wi-Fi coupe.
   Changer VERSION à chaque mise à jour pour que les iPhone récupèrent la nouvelle version. */
var VERSION = 'bveille-ios-1.5';
var FILES = [
  './',
  './boulanger-intro.gif',
  './demo.css',
  './demo.js',
  './fonts/Poppins-Bold.ttf',
  './fonts/Poppins-Medium.ttf',
  './fonts/Poppins-Regular.ttf',
  './fonts/WorkSans-Black.ttf',
  './fonts/WorkSans-ExtraBold.ttf',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './index.html',
  './legal.js',
  './logo-infinity.png',
  './logos/boulanger-horizontal.svg',
  './logos/boulanger-signature.svg',
  './manifest.webmanifest',
  './qr.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Réseau d'abord (pour recevoir les mises à jour), copie locale si le Wi-Fi ne répond pas.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // Vidéo : laissée au navigateur (Safari exige des réponses partielles). Hors ligne, la page repasse au GIF.
  if (new URL(e.request.url).pathname.endsWith('.mp4')) return;
  // Mesure de l'heure : toujours directement au serveur.
  if (new URL(e.request.url).searchParams.has('clock')) return;
  e.respondWith(
    fetch(new URL(e.request.url).origin === location.origin ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : e.request).then(function (res) {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
