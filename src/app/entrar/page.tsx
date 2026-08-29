import { Suspense } from "react";
import type { Metadata } from "next";
import { FormAuth } from "./FormAuth";
import { Marca } from "@/components/Marca";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <main className="tela-fixa grid place-items-center px-page safe-t safe-b">
      <div className="w-full max-w-sm rise">
        <div className="text-center mb-6">
          <Marca className="justify-center mb-4" />
          <h1 className="font-serif text-xl leading-snug mb-1.5">
            Trinta dias para recuperar a autoria da sua presença
          </h1>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
            Os três primeiros capítulos são livres.
          </p>
        </div>
        <Suspense fallback={<div className="card h-72" />}>
          <FormAuth />
        </Suspense>
      </div>
    </main>
  );
}
