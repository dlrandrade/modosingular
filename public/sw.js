/* Modo Singular — service worker
   Estratégia:
   - navegação: rede primeiro, cai para cache e, em último caso, /offline
   - estáticos do Next: cache primeiro (são versionados por hash)
   - nunca cacheia API, auth ou Supabase — dados sempre frescos
*/
const VERSAO = "ms-v1";
const SHELL = `${VERSAO}-shell`;
const ESTATICO = `${VERSAO}-estatico`;

const ESSENCIAIS = ["/offline", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(
        chaves.filter((k) => !k.startsWith(VERSAO)).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  // Navegação: rede primeiro.
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((r) => {
          const copia = r.clone();
          caches.open(SHELL).then((c) => c.put(request, copia));
          return r;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match("/offline"))),
    );
    return;
  }

  // Estáticos versionados: cache primeiro.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(
      caches.match(request).then((c) =>
        c || fetch(request).then((r) => {
          const copia = r.clone();
          caches.open(ESTATICO).then((cache) => cache.put(request, copia));
          return r;
        }),
      ),
    );
  }
});
