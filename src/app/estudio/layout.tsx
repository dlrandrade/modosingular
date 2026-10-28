import type { Metadata, Viewport } from "next";
import "./estudio.css";

export const metadata: Metadata = {
  title: "Estúdio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f2ede4" };

export default function LayoutEstudio({ children }: { children: React.ReactNode }) {
  return children;
}
