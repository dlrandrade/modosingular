import { Marca } from "@/components/Marca";

export const metadata = { title: "Sem conexão" };

export default function Offline() {
  return (
    <main className="min-h-dvh grid place-items-center px-page text-center">
      <div className="max-w-xs">
        <Marca className="justify-center mb-6" />
        <h1 className="font-serif text-[1.65rem] mb-3">Sem conexão</h1>
        <p className="text-[14.5px] leading-relaxed mb-6" style={{ color: "var(--ink-2)" }}>
          Os capítulos que você já abriu continuam disponíveis. Para salvar progresso,
          quiz e tarefas, é preciso estar online.
        </p>
        <a href="/jornada" className="btn btn-primary w-full">Tentar de novo</a>
      </div>
    </main>
  );
}
