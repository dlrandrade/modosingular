import { Suspense } from "react";
import type { Metadata } from "next";
import { FormAuth } from "./FormAuth";
import { Marca } from "@/components/Marca";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <main className="min-h-dvh grid place-items-center px-5 py-10 safe-t safe-b">
      <div className="w-full max-w-sm rise">
        <div className="text-center mb-8">
          <Marca className="justify-center mb-5" />
          <h1 className="font-serif text-2xl leading-tight mb-1.5">Trinta dias para recuperar a autoria da sua presença</h1>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
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
