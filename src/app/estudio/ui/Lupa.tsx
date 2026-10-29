"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { A, CORES_TEXTO, FUNDOS, L, limpar, slideHTML, textosQueEncostam, type Contexto, type Dados } from "@/estudio/slides";

/* ---------------------------------------------------------------
   A lupa: o slide grande, e o editor dele.
   Dois cliques em qualquer texto: ele vira editável ali mesmo, com uma
   barra mínima por cima (negrito, itálico, fonte, tamanho, largura,
   cor). Em cima, o fundo do slide. Tudo vira "ajustes" no próprio
   slide, que o renderizador aplica, então o PNG sai igual à tela.
--------------------------------------------------------------- */

const COR_FUNDO: Record<string, string> = { claro: "#faf9f6", areia: "#f2f0ea", branco: "#ffffff", "ouro-claro": "#f0e6cf", ouro: "#9a7328", escuro: "#0b0c0f" };
const NOME_COR: Record<string, string> = { tinta: "tinta", t2: "grafite", t3: "cinza", acento: "ouro", papel: "papel" };
const NOME_FONTE: Record<string, string> = { "": "a do slide", sans: "grotesca", serif: "Garamond", italico: "Garamond itálica" };
const PARAGRAFOS = new Set(["texto"]); // onde Enter abre parágrafo novo (o post e o rascunho)

type Props = {
  slides: Dados[]; indice: number; ctx: Contexto;
  ir: (i: number) => void; fechar: () => void;
  mudar: (i: number, s: Dados) => void;
  baixar: (i: number) => void;
  verbo?: string;
};

function semAjuste(a: Dados) {
  return !a || Object.keys(a).length === 0;
}

export default function Lupa({ slides, indice, ctx, ir, fechar, mudar, baixar, verbo = "baixar" }: Props) {
  const s = slides[indice];
  // o slide mais recente: duas gravações no mesmo clique (o texto e o estilo) não podem se sobrescrever
  const atual = useRef(s);
  atual.current = s;
  const palco = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<string | null>(null);
  const [barra, setBarra] = useState<{ x: number; y: number } | null>(null);
  const [larg, setLarg] = useState(600);
  const [vazou, setVazou] = useState<"" | "margem" | "encosta">("");
  const [toqueFino, setToqueFino] = useState(true);
  useEffect(() => { setToqueFino(matchMedia("(pointer: fine)").matches); }, []);
  const html = slideHTML(s, indice + 1, slides.length, ctx);
  // o React 19 reescreve o innerHTML sempre que o objeto muda; com o mesmo objeto, o texto em edição fica intacto
  const conteudo = useMemo(() => ({ __html: html }), [html]);

  useEffect(() => {
    const medir = () => setLarg(Math.max(240, Math.min(innerWidth - (innerWidth < 720 ? 24 : 160), (innerHeight - 170) * (L / A), 720)));
    medir(); addEventListener("resize", medir);
    return () => removeEventListener("resize", medir);
  }, []);

  const elemento = useCallback((chave: string | null) => (chave ? palco.current?.querySelector<HTMLElement>(`[data-ed="${CSS.escape(chave)}"]`) ?? null : null), []);

  const trocar = (novo: Dados) => { atual.current = novo; mudar(indice, novo); };
  const gravar = (chave: string, mud: (a: Dados) => Dados | null) => {
    const base = atual.current;
    const aj: Dados = { ...((base.ajustes as Dados) || {}) };
    const novo = mud({ ...(aj[chave] || {}) });
    if (!novo || semAjuste(novo)) delete aj[chave]; else aj[chave] = novo;
    trocar({ ...base, ajustes: aj });
  };

  /** Lê o texto que está sendo editado e guarda (sem mudar nada se for igual). */
  const confirmar = useCallback((manter = false) => {
    if (!ativo || ativo === "figura") return;
    const el = elemento(ativo);
    if (!el || el.contentEditable !== "true") return;
    const novo = limpar(el.innerHTML).replace(/(<br>)+$/, "");
    if (!manter) el.contentEditable = "false";
    const base0 = atual.current;
    const antes = limpar((base0.ajustes as Dados)?.[ativo]?.html ?? "");
    if (novo === antes) return;
    const original = document.createElement("div");
    original.innerHTML = slideHTML({ ...base0, ajustes: { ...((base0.ajustes as Dados) || {}), [ativo]: undefined } }, indice + 1, slides.length, ctx);
    const base = original.querySelector<HTMLElement>(`[data-ed="${CSS.escape(ativo)}"]`);
    const igualAoOriginal = base && limpar(base.innerHTML) === novo;
    gravar(ativo, (a) => {
      if (igualAoOriginal) { delete a.html; return a; }
      return { ...a, html: novo };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, indice, slides.length, ctx]);

  const sair = useCallback(() => { confirmar(); setAtivo(null); setBarra(null); window.getSelection()?.removeAllRanges(); }, [confirmar]);
  // fechar a lupa nunca descarta o texto que está sendo editado
  const fecharGravando = useCallback(() => { sair(); fechar(); }, [sair, fechar]);

  // posiciona a barra acima do elemento ativo (e o reativa depois de cada nova renderização)
  useLayoutEffect(() => {
    palco.current?.querySelectorAll(".ed-ativo").forEach((x) => { if (x.getAttribute("data-ed") !== ativo) { x.classList.remove("ed-ativo"); (x as HTMLElement).contentEditable = "false"; } });
    const el = elemento(ativo);
    if (!el) { setBarra(null); return; }
    el.classList.add("ed-ativo");
    if (ativo !== "figura" && el.contentEditable !== "true") el.contentEditable = "true";
    const r = el.getBoundingClientRect();
    setBarra({ x: Math.max(12, Math.min(r.left, innerWidth - 560)), y: Math.max(64, r.top - 58) });
  }, [ativo, html, elemento, larg]);

  // teclas: setas trocam de slide só fora da edição; Esc sai da edição, depois fecha
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const editando = (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (e.key === "Escape") { e.preventDefault(); if (ativo) sair(); else fecharGravando(); return; }
      if (editando || ativo) return;
      if (e.key === "ArrowRight" && indice < slides.length - 1) ir(indice + 1);
      if (e.key === "ArrowLeft" && indice > 0) ir(indice - 1);
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  }, [ativo, sair, fecharGravando, ir, indice, slides.length]);

  useEffect(() => { setAtivo(null); setBarra(null); }, [indice]);

  // algum texto passou da área segura do slide (o rodapé e as margens)? avisa, sem impedir
  useLayoutEffect(() => {
    const sl = palco.current?.querySelector<HTMLElement>(".sl");
    if (!sl) return;
    const base = sl.getBoundingClientRect(), k = base.width / L;
    const fora = [...sl.querySelectorAll<HTMLElement>("[data-ed]")].some((x) => {
      const r = x.getBoundingClientRect();
      return r.height > 0 && ((r.bottom - base.top) / k > A - 104 || (r.right - base.left) / k > L - 56);
    });
    setVazou(fora ? "margem" : textosQueEncostam(sl).length ? "encosta" : "");
  }, [html, larg]);

  const editar = (alvoBruto: EventTarget, ponto?: { x: number; y: number }) => {
    const alvo = (alvoBruto as HTMLElement).closest<HTMLElement>("[data-ed]");
    if (!alvo) return;
    const chave = alvo.dataset.ed!;
    if (chave === ativo) return;
    // guarda a palavra que o duplo clique selecionou (ou o ponto do toque), para continuar ali já editável
    const sel = window.getSelection();
    let faixa = sel && sel.rangeCount && !sel.isCollapsed ? sel.getRangeAt(0).cloneRange() : null;
    if (!faixa && ponto) {
      const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null };
      faixa = doc.caretRangeFromPoint?.(ponto.x, ponto.y) ?? null;
    }
    confirmar();
    setAtivo(chave);
    if (chave !== "figura") {
      requestAnimationFrame(() => {
        const el = elemento(chave);
        if (!el) return;
        el.contentEditable = "true";
        el.focus();
        if (faixa && el.contains(faixa.startContainer)) { sel?.removeAllRanges(); sel?.addRange(faixa); }
      });
    }
  };

  const doisCliques = (e: React.MouseEvent) => editar(e.target);

  // no toque, o duplo toque é detectado aqui (o navegador do celular nem sempre manda dblclick)
  const toque = useRef<{ t: number; chave: string } | null>(null);
  const soltou = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    const chave = (e.target as HTMLElement).closest<HTMLElement>("[data-ed]")?.dataset.ed;
    if (!chave) return;
    const antes = toque.current;
    if (antes && antes.chave === chave && Date.now() - antes.t < 380) { toque.current = null; editar(e.target, { x: e.clientX, y: e.clientY }); }
    else toque.current = { t: Date.now(), chave };
  };

  const clique = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ativo) return;
    const alvo = (e.target as HTMLElement).closest<HTMLElement>("[data-ed]");
    if (!alvo || alvo.dataset.ed !== ativo) sair();
  };

  const teclaNoTexto = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && ativo && !PARAGRAFOS.has(ativo)) { e.preventDefault(); document.execCommand("insertLineBreak"); }
  };
  const colar = (e: React.ClipboardEvent) => {
    if (!ativo) return;
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  };

  // ---- ações da barra (onMouseDown + preventDefault: o texto não perde o foco)
  const segura = (f: () => void) => (e: React.MouseEvent) => { e.preventDefault(); f(); };
  /** Há um trecho selecionado dentro do texto que está sendo editado? */
  const selecao = (el: HTMLElement | null) => {
    const sel = window.getSelection();
    return el && sel && sel.rangeCount && !sel.isCollapsed && el.contains(sel.anchorNode) && el.contains(sel.focusNode) ? sel : null;
  };
  /* Envolve só o trecho selecionado (negrito, itálico, cor). Se o trecho inteiro já tem essa marca, tira.
     Sem seleção, vale para o texto todo do bloco. Não usa execCommand: num título, que já é encorpado,
     o navegador entenderia "tirar o negrito". */
  const envolver = (criar: () => HTMLElement, mesma: (e: Element) => boolean, limparDentro: (e: Element) => boolean = mesma) => {
    const el = elemento(ativo);
    if (!el) return;
    let sel = selecao(el);
    if (!sel) { const t = window.getSelection(); const f = document.createRange(); f.selectNodeContents(el); t?.removeAllRanges(); t?.addRange(f); sel = selecao(el); }
    if (!sel) return;
    const faixa = sel.getRangeAt(0);
    let x: Node | null = faixa.commonAncestorContainer;
    let ja: HTMLElement | null = null;
    while (x && x !== el) { if (x instanceof HTMLElement && mesma(x)) { ja = x; break; } x = x.parentNode; }
    const desembrulhar = (e: Element) => { const p = e.parentNode!; while (e.firstChild) p.insertBefore(e.firstChild, e); p.removeChild(e); };
    if (ja && (ja.textContent || "").trim() === sel.toString().trim()) {
      const filhos = [...ja.childNodes];
      desembrulhar(ja);
      if (filhos.length) { const f = document.createRange(); f.setStartBefore(filhos[0]); f.setEndAfter(filhos[filhos.length - 1]); sel.removeAllRanges(); sel.addRange(f); }
      return;
    }
    const pedaco = faixa.extractContents();
    pedaco.querySelectorAll("*").forEach((e) => { if (limparDentro(e)) desembrulhar(e); });
    const caixa = criar();
    caixa.appendChild(pedaco);
    faixa.insertNode(caixa);
    sel.selectAllChildren(caixa);
  };
  const marcar = (cmd: "bold" | "italic") => {
    const tag = cmd === "bold" ? "STRONG" : "EM", irma = cmd === "bold" ? "B" : "I";
    envolver(() => document.createElement(tag), (e) => e.tagName === tag || e.tagName === irma);
  };
  const fonte = () => {
    const el = elemento(ativo);
    const sel = window.getSelection();
    const parcial = el && sel && !sel.isCollapsed && el.contains(sel.anchorNode) && el.contains(sel.focusNode) &&
      sel.toString().trim() !== (el.textContent || "").trim();
    if (el && sel && parcial) {
      // trecho selecionado: alterna entre a grotesca e a Garamond só nele, sem perder o itálico ou o negrito de dentro
      const serifAgora = getComputedStyle(sel.anchorNode!.parentElement || el).fontFamily.includes("Garamond");
      const faixa = sel.getRangeAt(0);
      const caixa = document.createElement("span");
      caixa.className = serifAgora ? "fs" : "fg";
      caixa.appendChild(faixa.extractContents());
      faixa.insertNode(caixa);
      sel.selectAllChildren(caixa);
      return;
    }
    confirmar();
    const ordem = ["", "sans", "serif", "italico"];
    gravar(ativo!, (a) => {
      const prox = ordem[(ordem.indexOf(a.fonte || "") + 1) % ordem.length];
      if (prox) a.fonte = prox; else delete a.fonte;
      return a;
    });
  };
  const tamanho = (fator: number) => {
    confirmar();
    gravar(ativo!, (a) => {
      const z = Math.round(Math.max(0.4, Math.min(2.2, (a.zoom || 1) * fator)) * 100) / 100;
      if (Math.abs(z - 1) < 0.01) delete a.zoom; else a.zoom = z;
      return a;
    });
  };
  const largura = (delta: number) => {
    const el = elemento(ativo);
    if (!el) return;
    confirmar();
    gravar(ativo!, (a) => ({ ...a, largura: Math.max(200, Math.min(856, (a.largura || el.offsetWidth) + delta)) }));
  };
  // com trecho selecionado, a cor vale só para ele; sem seleção, para o bloco todo
  const cor = (c: string) => {
    if (selecao(elemento(ativo))) {
      envolver(() => { const s = document.createElement("span"); s.className = `c-${c}`; return s; },
        (e) => e.classList.contains(`c-${c}`), (e) => [...e.classList].some((k) => k.startsWith("c-")) && e.tagName === "SPAN" && e.classList.length === 1);
      return;
    }
    confirmar(); gravar(ativo!, (a) => { if (a.cor === c) delete a.cor; else a.cor = c; return a; });
  };
  const original = () => { gravar(ativo!, () => null); };
  // _fundo0 guarda o fundo de antes da primeira troca, para o "original" voltar a ele
  const fundo = (f: string) => { confirmar(); const b0 = atual.current; trocar({ ...b0, fundo: f, _fundo0: "_fundo0" in b0 ? b0._fundo0 : (b0.fundo ?? null) }); };
  const tudoOriginal = () => {
    setAtivo(null);
    const { ajustes: _a, _fundo0, fundo: _f, ...resto } = atual.current;
    void _a; void _f;
    const f0 = _fundo0 === undefined ? atual.current.fundo : _fundo0;
    trocar(f0 ? { ...resto, fundo: f0 } : resto);
  };

  const aj = ativo ? ((s.ajustes as Dados) || {})[ativo] || {} : {};
  const fundoAtual = s.fundo || ({ capa: "claro", texto: "claro", lista: "areia", figura: "branco", exemplo: "ouro-claro", cta: "ouro" } as Dados)[s.tipo] || "claro";
  const editado = (!!s.ajustes && Object.keys(s.ajustes).length > 0) || ("_fundo0" in s && (s._fundo0 ?? undefined) !== s.fundo);
  const tinta = (c: string) => {
    const sl = palco.current?.querySelector<HTMLElement>(".sl");
    return sl ? getComputedStyle(sl).getPropertyValue(`--${c}`).trim() || "#999" : "#999";
  };

  return (
    <div className="lupa" onClick={() => (ativo ? sair() : fecharGravando())}>
      <div className="barra-l" onClick={(e) => e.stopPropagation()}>
        <span className="rot">{String(indice + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        <span className="fundos" aria-label="Fundo do slide">
          {FUNDOS.map((f) => (
            <button key={f} className={`amostra ${f === fundoAtual ? "on" : ""}`} style={{ background: COR_FUNDO[f] }} title={`fundo ${f}`} data-emo={f} onClick={() => fundo(f)} />
          ))}
        </span>
        <span className="acoes-l">
          {editado && <button className="bt" data-emo="desfazer" onClick={tudoOriginal}>original</button>}
          <button className="bt" data-emo={verbo} onClick={() => { sair(); baixar(indice); }}>{verbo} este</button>
          <button className="bt" data-emo="fechar" onClick={fecharGravando}>fechar</button>
        </span>
      </div>
      {indice > 0 && <button className="nav e" data-emo="anterior" onClick={(e) => { e.stopPropagation(); sair(); ir(indice - 1); }}>←</button>}
      <div className="quadro editavel" style={{ width: larg, height: larg * (A / L) }} onClick={clique} onDoubleClick={doisCliques} onPointerUp={soltou}>
        <div ref={palco} className="esc" style={{ width: L, height: A, transform: `scale(${larg / L})` }}
          onKeyDown={teclaNoTexto} onPaste={colar}
          onBlur={(e) => {
            // o teclado do celular fechou ou o foco saiu do texto: grava (um instante depois, se o foco não voltou), sem sair da edição
            const el = e.target as HTMLElement;
            if (!ativo || el.dataset?.ed !== ativo) return;
            setTimeout(() => { if (document.activeElement !== el && el.isConnected) confirmar(true); }, 300);
          }} dangerouslySetInnerHTML={conteudo} />
      </div>
      {indice < slides.length - 1 && <button className="nav d" data-emo="próximo" onClick={(e) => { e.stopPropagation(); sair(); ir(indice + 1); }}>→</button>}
      <p className={`dica ${vazou ? "alerta" : ""}`}>
        {vazou === "margem" ? "o texto passou da área do slide: diminua o tamanho ou estreite o bloco"
          : vazou === "encosta" ? "dois textos estão se tocando: diminua um deles ou estreite o bloco" : ativo ? (toqueFino ? "Esc ou um clique fora para terminar" : "um toque fora para terminar") : `${toqueFino ? "dois cliques" : "dois toques"} em qualquer texto para editar`}
      </p>

      {ativo && barra && (
        <div className="ed-barra" style={{ left: barra.x, top: barra.y }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.preventDefault()}>
          {ativo !== "figura" && (
            <>
              <button onMouseDown={segura(() => marcar("bold"))} title="negrito" data-emo="negrito"><b>N</b></button>
              <button onMouseDown={segura(() => marcar("italic"))} title="itálico" data-emo="itálico"><i>I</i></button>
              <button onMouseDown={segura(fonte)} title={`fonte: ${NOME_FONTE[aj.fonte || ""]}`} data-emo="fonte" className="fonte">Aa</button>
              <span className="sep" />
            </>
          )}
          <button onMouseDown={segura(() => tamanho(1 / 1.08))} title="menor" data-emo="menor">A−</button>
          <button onMouseDown={segura(() => tamanho(1.08))} title="maior" data-emo="maior">A+</button>
          {ativo !== "figura" && (
            <>
              <button onMouseDown={segura(() => largura(-60))} title="bloco mais estreito" data-emo="estreitar">⟩⟨</button>
              <button onMouseDown={segura(() => largura(60))} title="bloco mais largo" data-emo="alargar">⟨⟩</button>
              <span className="sep" />
              {CORES_TEXTO.map((c) => (
                <button key={c} className={`amostra ${aj.cor === c ? "on" : ""}`} style={{ background: tinta(c) }} title={NOME_COR[c]} data-emo={NOME_COR[c]} onMouseDown={segura(() => cor(c))} />
              ))}
            </>
          )}
          {!semAjuste(aj) && <><span className="sep" /><button onMouseDown={segura(original)} data-emo="original" className="txt">original</button></>}
        </div>
      )}
    </div>
  );
}
