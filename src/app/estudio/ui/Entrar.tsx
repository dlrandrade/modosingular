"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { marca } from "@/estudio/slides";
import Cursor from "./Cursor";
import Titulo from "./Titulo";

export default function Entrar() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [indo, setIndo] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!senha || indo) return;
    setIndo(true); setMsg("");
    const r = await fetch("/api/estudio/entrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senha }) });
    if (r.ok) { router.refresh(); return; }
    setIndo(false); setSenha(""); setMsg("Não é essa.");
    form.current?.classList.remove("treme"); void form.current?.offsetWidth; form.current?.classList.add("treme");
  }

  return (
    <div className="est">
      <main className="portal">
        <div className="caixa">
          <div style={{ display: "flex", justifyContent: "center", color: "var(--t3)" }} dangerouslySetInnerHTML={{ __html: marca(30) }} />
          <p className="rot" style={{ marginTop: 22 }}>Modo Singular</p>
          <Titulo partes={[{ t: "Estúdio", it: true }]} pesoItalico={420} />
          <p className="sub">Um conhecimento do livro por dia.</p>
          <form ref={form} onSubmit={entrar}>
            <input type="password" inputMode="numeric" autoComplete="current-password" autoFocus value={senha}
              onChange={(e) => setSenha(e.target.value)} placeholder="a senha" aria-label="Senha" />
            <button className="ir" type="submit" data-emo="entrar" aria-label="Entrar">→</button>
          </form>
          <p className="msg" role="status">{msg}</p>
        </div>
      </main>
      <Cursor />
    </div>
  );
}
