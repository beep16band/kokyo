"use strict";
self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("kotoba-gundan-offline-")).map(name => caches.delete(name)));
    await self.clients.claim();
    const tabs = await self.clients.matchAll({type:"window"});
    for (const tab of tabs) {
      const url = new URL(tab.url);
      url.search = ""; url.hash = "";
      if (url.href === self.registration.scope || url.href === new URL("index.html", self.registration.scope).href) {
        tab.navigate(tab.url).catch(() => {});
      }
    }
  })());
});
// Use normal network loading after reopening the game.
