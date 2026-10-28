import type { Metadata, Viewport } from "next";
import "./estudio.css";

/* O estúdio é um app à parte do PWA do curso: manifesto, ícone e service worker próprios (escopo /estudio). */
export const metadata: Metadata = {
  title: "Estúdio",
  robots: { index: false, follow: false },
  manifest: "/estudio/manifest.webmanifest",
  icons: {
    icon: [{ url: "/estudio/icones/favicon-32.png", sizes: "32x32" }, { url: "/estudio/icones/icon-192.png", sizes: "192x192" }],
    apple: "/estudio/icones/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Estúdio", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#faf9f6" };

export default function LayoutEstudio({ children }: { children: React.ReactNode }) {
  return children;
}
