const ASSET_VERSION = '20260329-3';
const CACHE_VERSION = `indo-sejuk-shell-v${ASSET_VERSION}`;
const SHELL_CACHE = `${CACHE_VERSION}-html`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = './offline.html';
const APP_SHELL = [
    './',
    './index.html',
    `./style.css?v=${ASSET_VERSION}`,
    `./app.js?v=${ASSET_VERSION}`,
    './manifest.webmanifest',
    OFFLINE_URL,
    './logo.png',
    './image/logo.png',
    './image/hero-ac-service.png',
    './image/technician-1.png',
    './image/service-cuci-ac.png',
    './image/service-perbaikan-ac.png',
    './image/service-bongkar-pasang.png',
    './image/service-freon.png',
    './image/service-pasang-baru.png',
    './image/service-cek-diagnosa.png',
    './image/service-berkala.png',
    './image/ac-indoor-1.png',
    './image/ac-outdoor-1.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(APP_SHELL.map((asset) => new Request(asset, { cache: 'reload' })));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((name) => ![SHELL_CACHE, STATIC_CACHE].includes(name))
                .map((name) => caches.delete(name))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

function isSameOrigin(request) {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
}

function isNavigationRequest(request) {
    return request.mode === 'navigate'
        || (request.destination === 'document' && request.headers.get('accept')?.includes('text/html'));
}

function isStaticAssetRequest(request) {
    const url = new URL(request.url);
    return isSameOrigin(request)
        && (
            ['style', 'script', 'image', 'font', 'manifest'].includes(request.destination)
            || /\.(?:css|js|png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname)
        );
}

async function networkFirst(request) {
    const cache = await caches.open(SHELL_CACHE);
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return (await cache.match(request))
            || (await caches.match('./index.html'))
            || (await caches.match(OFFLINE_URL));
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    const networkPromise = fetch(request)
        .then((response) => {
            if (response && response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    if (!isSameOrigin(request)) {
        event.respondWith(fetch(request));
        return;
    }

    if (isNavigationRequest(request)) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (isStaticAssetRequest(request)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});
