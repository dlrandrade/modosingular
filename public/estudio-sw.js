/* Estúdio Singular — service worker (escopo /estudio)
   - instala o estúdio como app próprio, separado do PWA do curso
   - navegação: rede primeiro; sem rede, a última versão da página
   - fontes, ícones e estáticos do Next: cache primeiro (são versionados)
   - nunca guarda /api (a geração e os kits vivem no servidor)
   - recebe a notificação "o estúdio terminou" e abre o resultado */
const VERSAO = "estudio-v1";
const PAGINAS = `${VERSAO}-paginas`;
const ESTATICO = `${VERSAO}-estatico`;
const ESSENCIAIS = ["/estudio", "/estudio/manifest.webmanifest", "/estudio/icones/icon-192.png",
  "/estudio/fontes/eb-garamond-latin-wght-normal.woff2", "/estudio/fontes/eb-garamond-latin-wght-italic.woff2",
  "/estudio/fontes/inter-tight-latin-wght-normal.woff2"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGINAS).then((c) => c.addAll(ESSENCIAIS).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("estudio-") && !k.startsWith(VERSAO)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((r) => {
          if (r.ok && url.pathname.startsWith("/estudio")) { const c = r.clone(); caches.open(PAGINAS).then((x) => x.put(url.pathname, c)); }
          return r;
        })
        .catch(() => caches.match(url.pathname).then((c) => c || caches.match("/estudio"))),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/estudio/fontes/") || url.pathname.startsWith("/estudio/icones/")) {
    e.respondWith(
      caches.match(request).then((c) => c || fetch(request).then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(ESTATICO).then((x) => x.put(request, copia)); }
        return r;
      })),
    );
  }
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { corpo: e.data ? e.data.text() : "" }; }
  const titulo = d.titulo || "Estúdio Singular";
  e.waitUntil(Promise.all([
    self.registration.showNotification(titulo, {
      body: d.corpo || "O conteúdo do dia está pronto.",
      icon: "/estudio/icones/icon-192.png",
      badge: "/estudio/icones/icon-192.png",
      tag: "estudio-pronto",
      renotify: true,
      data: { url: d.url || "/estudio" },
    }),
    self.navigator && self.navigator.setAppBadge ? self.navigator.setAppBadge(1).catch(() => {}) : Promise.resolve(),
  ]));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const destino = new URL((e.notification.data && e.notification.data.url) || "/estudio", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((abertas) => {
      const ja = abertas.find((c) => new URL(c.url).pathname.startsWith("/estudio"));
      if (ja) return ja.focus().then((c) => (c && "navigate" in c ? c.navigate(destino) : null));
      return self.clients.openWindow(destino);
    }),
  );
});
