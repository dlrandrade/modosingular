/** Embute vídeo do capítulo. Aceita YouTube, Vimeo, Panda ou MP4 direto. */
export function Video({ url, provider }: { url: string; provider?: string | null }) {
  const src = normalizar(url, provider);
  if (!src) return null;

  if (src.tipo === "arquivo") {
    return (
      <figure className="my-7 rounded-xl overflow-hidden border" style={{ borderColor: "var(--line)" }}>
        <video controls preload="metadata" playsInline className="w-full block" src={src.url} />
      </figure>
    );
  }

  return (
    <figure className="my-7 rounded-xl overflow-hidden border" style={{ borderColor: "var(--line)" }}>
      <div style={{ position: "relative", paddingTop: "56.25%", background: "var(--bg-2)" }}>
        <iframe
          src={src.url}
          title="Vídeo do capítulo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    </figure>
  );
}

function normalizar(url: string, provider?: string | null): { tipo: "embed" | "arquivo"; url: string } | null {
  try {
    const u = new URL(url);
    if (/\.(mp4|webm|mov)$/i.test(u.pathname) || provider === "mp4") return { tipo: "arquivo", url };

    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? { tipo: "embed", url: `https://www.youtube-nocookie.com/embed/${id}?rel=0` } : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? { tipo: "embed", url: `https://player.vimeo.com/video/${id}` } : null;
    }
    // Panda Video e demais players já entregam URL de embed.
    return { tipo: "embed", url };
  } catch {
    return null;
  }
}
