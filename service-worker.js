const CACHE_NAME = ‘pilot-logbook-v9’;

const ASSETS_TO_CACHE = [
‘./’,
‘./index.html’,
‘./manifest.json’,
‘https://unpkg.com/react@18/umd/react.production.min.js’,
‘https://unpkg.com/react-dom@18/umd/react-dom.production.min.js’,
‘https://unpkg.com/@babel/standalone/babel.min.js’,
‘https://cdn.tailwindcss.com’,
‘https://unpkg.com/tesseract.js@5/dist/tesseract.min.js’,
‘https://unpkg.com/tesseract.js-core@5/tesseract-core.wasm.js’,
‘https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz’
];

self.addEventListener(‘install’, (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => cache.addAll(ASSETS_TO_CACHE))
.catch((err) => console.log(’Cache install error (some assets may not have cached): ’, err))
);
self.skipWaiting();
});

self.addEventListener(‘activate’, (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
)
)
);
self.clients.claim();
});

self.addEventListener(‘fetch’, (event) => {
event.respondWith(
caches.match(event.request).then((cachedResponse) => {
if (cachedResponse) return cachedResponse;

```
        return fetch(event.request)
            .then((networkResponse) => {
                // Cache new GET requests for offline use next time (best-effort, ignore failures)
                if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone).catch(() => {});
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Offline and not cached — nothing more we can do for this request
                return new Response('Offline and resource not cached.', {
                    status: 503,
                    statusText: 'Offline'
                });
            });
    })
);
```

});
