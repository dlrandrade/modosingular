"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { aparelhoDeToque, baixarArquivos, compartilhaArquivos } from "./png";

/* ---------------------------------------------------------------
   Salvar imagens, do jeito que cada aparelho aceita.
   - Computador: baixa os PNGs.
   - Celular: abre o menu do próprio aparelho, onde estão "Salvar
     imagens" (vai para as Fotos), Instagram, WhatsApp… No iPhone,
     baixar por link não funciona (no app instalado, nem abre nada).
   O menu só abre a partir de um toque; se desenhar as imagens levar
   tempo demais, o painel mostra um botão para tocar e, abaixo, as
   próprias imagens, que também se salvam tocando e segurando.
--------------------------------------------------------------- */

type Estado =
  | null
  | { fase: "preparando"; titulo: string; n: number; total: number }
  | { fase: "pronto"; titulo: string; arquivos: File[]; urls: string[] }
  | { fase: "erro"; titulo: string };

export type Gerador = (avancar: (n: number) => void) => Promise<File[]>;

export function useSalvar() {
  const [estado, setEstado] = useState<Estado>(null);
  const [toque, setToque] = useState(false);
  const urls = useRef<string[]>([]);
  useEffect(() => { setToque(aparelhoDeToque() && compartilhaArquivos()); }, []);

  const fechar = useCallback(() => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setEstado(null);
  }, []);

  const abrirMenu = async (arquivos: File[]) => {
    await navigator.share({ files: arquivos });
  };

  /** pronto: arquivos já desenhados (então o menu abre ainda dentro do toque). */
  const salvar = useCallback(async (titulo: string, total: number, gerar: Gerador, pronto?: File[] | null) => {
    if (!toque) {
      try { await baixarArquivos(pronto || (await gerar(() => {}))); } catch { setEstado({ fase: "erro", titulo }); }
      return;
    }
    let arquivos = pronto || null;
    if (!arquivos) {
      setEstado({ fase: "preparando", titulo, n: 0, total });
      try {
        arquivos = await gerar((n) => setEstado((e) => (e && e.fase === "preparando" ? { ...e, n } : e)));
      } catch {
        setEstado({ fase: "erro", titulo });
        return;
      }
    }
    try {
      await abrirMenu(arquivos);
      fechar();
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") { fechar(); return; } // a pessoa fechou o menu
    }
    // o toque "venceu" enquanto desenhava: um toque novo abre o menu, ou toque e segure numa imagem
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = arquivos.map((f) => URL.createObjectURL(f));
    setEstado({ fase: "pronto", titulo, arquivos, urls: urls.current });
  }, [toque, fechar]);

  const painel = estado && (
    <div className="salvar" role="dialog" aria-live="polite" onClick={fechar}>
      <div className="caixa" onClick={(e) => e.stopPropagation()}>
        {estado.fase === "preparando" && (
          <>
            <p className="rot">Salvar {estado.titulo}</p>
            <p className="msg">preparando {estado.total > 1 ? `${estado.n} de ${estado.total}` : "a imagem"}…</p>
            <div className="fio"><i style={{ width: `${Math.max(8, (100 * estado.n) / Math.max(1, estado.total))}%` }} /></div>
          </>
        )}
        {estado.fase === "pronto" && (
          <>
            <p className="rot">{estado.arquivos.length > 1 ? `${estado.arquivos.length} imagens prontas` : "Imagem pronta"}</p>
            <button className="principal" data-emo="salvar" onClick={async () => {
              try { await abrirMenu(estado.arquivos); fechar(); } catch (e) { if ((e as Error).name === "AbortError") fechar(); }
            }}>Salvar nas Fotos</button>
            <p className="msg">Abre o menu do celular: escolha “Salvar {estado.arquivos.length > 1 ? "imagens" : "imagem"}”. Ou toque e segure numa imagem abaixo.</p>
            <div className="imgs">
              {estado.urls.map((u, i) => <img key={u} src={u} alt={estado.arquivos[i].name} />)}
            </div>
          </>
        )}
        {estado.fase === "erro" && (
          <>
            <p className="rot">Salvar {estado.titulo}</p>
            <p className="msg">Não consegui desenhar a imagem agora. Tente de novo.</p>
          </>
        )}
        <button className="bt fechar" data-emo="fechar" onClick={fechar}>fechar</button>
      </div>
    </div>
  );

  return { salvar, painel, toque };
}
