/// <reference lib="webworker" />

import {
  build,
  files,
  prerendered,
  version
} from "$service-worker";

declare const self: ServiceWorkerGlobalScope;

const CACHE = `hydration-${version}`;
const ASSETS = [...build, ...files, ...prerendered];
const ASSET_PATHS = new Set(ASSETS);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Never place Netlify Function responses in the app-shell cache.
  if (url.pathname.startsWith("/.netlify/functions/")) return;

  // Fingerprinted build files and static files are immutable enough for cache-first.
  if (ASSET_PATHS.has(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request))
    );
    return;
  }

  // HTML navigation is network-first with a precached fallback.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (
          (await caches.match(event.request)) ??
          (await caches.match("/")) ??
          new Response("Offline", { status: 503 })
        );
      })
    );
  }
});

interface PushPayload {
  type: "hydration-reminder";
  reminderId: string;
  revision: number;
  amountMl: number;
}

self.addEventListener("push", (event) => {
  let payload: PushPayload | null = null;

  try {
    payload = event.data ? event.data.json() : null;
  } catch {
    payload = null;
  }

  if (!payload || payload.type !== "hydration-reminder") return;

  event.waitUntil(
    self.registration.showNotification("Waktunya minum air", {
      body: `Sekitar ${payload.amountMl} ml untuk menjaga ritme hari ini.`,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: `hydration-${payload.reminderId}`,
      data: {
        url: "/",
        reminderId: payload.reminderId,
        revision: payload.revision
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url ?? "/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            await client.focus();
            return;
          }
        }

        await self.clients.openWindow(url);
      })
  );
});
