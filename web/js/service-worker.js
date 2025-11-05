/// <reference lib="webworker" />
const CACHE_NAME = "podcastly-static-v1";
const BASE_PATH = "/podcastly";
const STATIC_ASSETS = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/css/styles.css`,
    `${BASE_PATH}/js/app.js`,
    `${BASE_PATH}/manifest.webmanifest`,
    `${BASE_PATH}/icons/icon-192.svg`,
    `${BASE_PATH}/icons/icon-512.svg`,
];
self.addEventListener("install", (event) => {
    event.waitUntil(caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(STATIC_ASSETS))
        .then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
    event.waitUntil(caches
        .keys()
        .then((keys) => Promise.all(keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
        .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== "GET") {
        return;
    }
    if (url.origin === self.location.origin) {
        if (url.pathname.startsWith(`${BASE_PATH}/api/`)) {
            event.respondWith(networkFirst(request));
            return;
        }
        if (url.pathname.startsWith(BASE_PATH)) {
            event.respondWith(cacheFirst(request));
            return;
        }
    }
    event.respondWith(networkFirst(request));
});
function cacheFirst(request) {
    return caches.match(request).then((cached) => {
        if (cached) {
            return cached;
        }
        return fetch(request).then((response) => {
            if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
        });
    });
}
function networkFirst(request) {
    return fetch(request)
        .then((response) => {
        if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
    })
        .catch(() => caches.match(request).then((cached) => {
        if (cached) {
            return cached;
        }
        // Return a basic response if nothing is cached
        return new Response("Network error", { status: 503 });
    }));
}
export {};
//# sourceMappingURL=service-worker.js.map