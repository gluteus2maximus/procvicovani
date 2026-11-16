// Offline provoz: při každé nové verzi aplikace zvyšte VERSION.
const VERSION = "v2.0.2";
const CACHE = "procvicovani-" + VERSION;
const FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./fonts/nunito-latin-wght-normal.woff2", "./fonts/nunito-latin-ext-wght-normal.woff2",
  "./icons/icon-180.png", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Stránka: nejdřív síť (aby se načetla nová verze), bez internetu z mezipaměti.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("./index.html", c)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // Ostatní soubory: z mezipaměti, jinak ze sítě.
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
