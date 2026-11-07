const V = "zeka-kupleri-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./solver.js", "./lessons.js", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const EXTRA = [
  ["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "no-cors"],
  ["https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;800&family=JetBrains+Mono:wght@500&display=swap", "cors"]
];
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(SHELL);
    await Promise.all(EXTRA.map(async ([u, mode]) => {
      try { const r = await fetch(u, { mode }); await c.put(u, r); } catch (err) {}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  e.respondWith((async () => {
    const hit = await caches.match(r, { ignoreSearch: r.mode === "navigate" });
    const net = fetch(r).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  })());
});
