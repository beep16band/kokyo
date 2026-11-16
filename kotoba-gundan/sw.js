"use strict";

const scope = self.registration.scope;
const entry = new URL("index.html", scope).href;
const isGamePage = address => {
  const url = new URL(address);
  url.search = "";
  url.hash = "";
  return url.href === scope || url.href === entry;
};

self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("kotoba-gundan-offline-")).map(name => caches.delete(name)));
    await self.clients.claim();
    const tabs = await self.clients.matchAll({type:"window"});
    for (const tab of tabs) {
      if (isGamePage(tab.url)) tab.navigate(tab.url).catch(() => {});
    }
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.mode !== "navigate" || !isGamePage(event.request.url)) return;
  event.respondWith(fetch(event.request, {cache:"reload"}).catch(() => new Response(
    '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>コトバ軍団！｜工事中</title><main><p>コトバ軍団！</p><h1>工事中</h1><p>現在、ゲームの公開を一時停止しています。</p></main></html>',
    {headers:{"Content-Type":"text/html; charset=utf-8"}}
  )));
});
