// Offline support: keeps a copy of the app's own files on this device.
// It never sees or stores your photos; they are never sent over the network.
const CACHE = "redact-studio-98b9ea7192";
const FILES = ["./", "./app.js", "./fonts/inter-400.woff2", "./fonts/inter-500.woff2", "./fonts/jetbrains-mono-400.woff2", "./fonts/jetbrains-mono-500.woff2", "./fonts/jetbrains-mono-600.woff2", "./gps-core.js", "./icons/apple-touch-icon.png", "./icons/favicon-32.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./index.html", "./manifest.webmanifest", "./styles.css", "./vendor/react-dom.production.min.js", "./vendor/react.production.min.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("redact-studio-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).catch(() => (req.mode === "navigate" ? caches.match("./index.html") : Response.error()));
    })
  );
});
