"use strict";

const cacheName = "kotoba-gundan-offline-v1";
const entry = new URL("./index.html", self.location.href).href;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.add(entry)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith("kotoba-gundan-offline-") && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.mode !== "navigate" || !event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(fetch(event.request).then(async response => {
    if (response.ok) {
      try {
        const cache = await caches.open(cacheName);
        await cache.put(entry, response.clone());
      } catch {
        // Online play remains available when the browser disables cache storage.
      }
    }
    return response;
  }).catch(async () => (await caches.match(entry)) || Response.error()));
});
