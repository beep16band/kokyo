"use strict";

const cacheName = "kotoba-gundan-offline-v10";
const scope = self.registration.scope;
const entry = new URL("index.html", scope).href;
const artwork = new Set([
  ...Array.from({length:12}, (_, index) => `${index+1}.webp`),
  "seed-imp.webp"
].map(file => new URL(`monsters/${file}`, scope).href));
artwork.add(new URL("campaign-map.webp", scope).href);

self.addEventListener("install", event => {
  const files = [entry, ...artwork].map(url => new Request(url, {cache:"reload"}));
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith("kotoba-gundan-offline-") && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (artwork.has(event.request.url)) {
    event.respondWith(caches.open(cacheName).then(cache => cache.match(event.request)).then(
      response => response || fetch(event.request), () => fetch(event.request)
    ));
    return;
  }
  if (event.request.mode !== "navigate") return;
  const url = new URL(event.request.url);
  url.search = "";
  if (url.href !== scope && url.href !== entry) return;
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
