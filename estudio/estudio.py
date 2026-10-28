#!/usr/bin/env python3
"""Estúdio Singular: um conhecimento do livro por dia, em Reels (teleprompter) + carrossel + legenda.

  python3 estudio/estudio.py indexar          # (re)monta banco.yaml a partir das figuras do livro
  python3 estudio/estudio.py proximo          # mostra a próxima pauta e o material do capítulo
  python3 estudio/estudio.py lint N           # confere o kit do dia N (voz, tamanhos, estrutura)
  python3 estudio/estudio.py render N         # lint + roteiro.md + legenda.md + slides PNG
  python3 estudio/estudio.py publicado N      # marca o dia N como publicado
  python3 estudio/estudio.py status           # panorama do banco
  python3 estudio/estudio.py exportar         # atualiza os dados da plataforma /estudio (o render já faz isso)

Requer: pip install pyyaml playwright
"""
import datetime as dt
import re
import sys
from pathlib import Path

import yaml

AQUI = Path(__file__).parent
RAIZ = AQUI.parent
TEXTO = RAIZ / "apostila" / "texto"
BANCO = AQUI / "banco.yaml"
KITS = AQUI / "kits"

# Sequência editorial dos 14 primeiros dias: (capítulo, índice da figura no capítulo).
# Escolhida para contar uma história: por que o conhecimento não aparece, o que fazer, como sustentar.
ORDEM = [(9, 0), (1, 0), (2, 0), (3, 0), (5, 0), (10, 0), (4, 1), (15, 1), (17, 0), (18, 0), (13, 1), (20, 1), (25, 1), (27, 0)]
PRONTOS = {"camadas", "fluxo", "passos", "barras", "balanca", "escada", "funil", "gap", "quadrante", "espectro"}  # = FIGURAS_PRONTAS em src/estudio/slides.ts
FORMAS_EXEMPLO = ["post", "antes_depois", "rascunho", "conversa"]
ORCAMENTO = {"hook": {45: (9, 12), 60: (10, 14)}, "lead": {45: (14, 20), 60: (16, 22)}, "body1": {45: (22, 28), 60: (26, 34)}, "loop1": {45: (8, 12), 60: (8, 14)}, "body2": {45: (18, 24), 60: (20, 28)}, "loop2": {45: (6, 10), 60: (6, 12)}, "body3": {45: (26, 34), 60: (36, 48)}, "cta": {45: (18, 24), 60: (30, 40)}}  # MANUAL, seção 2.1
CAMPOS_FICHA = ["ideia", "conceito", "cena", "detalhe", "figura", "virada", "aplicacao", "exercicio"]                # MANUAL, seção 1                                       # = FORMAS_EXEMPLO em src/estudio/slides.ts
ETAPAS = [("hook", "GANCHO (hook) · quebra o padrão de rolagem"), ("lead", "INTRODUÇÃO (lead) · segura a atenção até ~10 s"),
          ("body1", "DESENVOLVIMENTO 1 (body 1) · primeira informação de valor"), ("loop1", "GANCHO DE CURIOSIDADE 1 (open loop 1)"),
          ("body2", "DESENVOLVIMENTO 2 (body 2) · resolve o loop 1 e entrega mais"), ("loop2", "GANCHO DE CURIOSIDADE 2 (open loop 2)"),
          ("body3", "DESENVOLVIMENTO 3 (body 3) · resolve o loop 2 e conclui"), ("cta", "CTA · recompensa a atenção e conduz ao próximo passo")]
LIMITE_HOOK = 14          # palavras: a primeira frase tem que cair em ~3 s
LIMITE_INTRO = 34         # palavras de hook + lead: ~11 s a 3 palavras/s. A introdução termina por volta dos 10 s
FAIXAS = {30: (80, 100), 45: (118, 142), 60: (158, 192)}   # palavras faladas por duração (~3 palavras/s, ritmo de teleprompter)
PALAVRAS_POR_SEG = 3.0


def carregar_yaml(p):
    return yaml.safe_load(Path(p).read_text()) or {}


def marca():
    return carregar_yaml(AQUI / "marca.yaml")


def palavras(t):
    return len(re.findall(r"\w[\w'’-]*", t or ""))


# ------------------------------------------------------------------ banco
def yaml_tolerante(txt):
    """Mesmo leitor do orquestrador do livro: valores de texto com ': ' dentro são citados automaticamente."""
    try:
        return yaml.safe_load(txt)
    except yaml.YAMLError:
        linhas = []
        for l in txt.splitlines():
            m = re.match(r'^(\s*(?:- )?\w+: )(.+)$', l)
            if m and ": " in m.group(2) and m.group(2)[0] not in "\"'[{|>":
                v = m.group(2).replace("\\", "\\\\").replace('"', '\\"')
                l = f'{m.group(1)}"{v}"'
            linhas.append(l)
        return yaml.safe_load("\n".join(linhas))


def figuras_do_livro():
    out = []
    for f in sorted(TEXTO.glob("cap*.md")):
        n = int(re.search(r"cap(\d+)", f.name).group(1))
        s = f.read_text()
        for i, b in enumerate(re.findall(r"```figura\n(.*?)```", s, re.S)):
            d = yaml_tolerante(b)
            out.append({"cap": n, "fig": i, "tipo": d.get("tipo"), "titulo": d.get("titulo")})
    return out


def indexar():
    figs = {(f["cap"], f["fig"]): f for f in figuras_do_livro()}
    antigo = {(p["cap"], p["fig"]): p for p in (carregar_yaml(BANCO).get("pautas", []) if BANCO.exists() else [])}
    ordem = [k for k in ORDEM if k in figs] + [k for k in sorted(figs) if k not in ORDEM]
    pautas = []
    for dia, k in enumerate(ordem, 1):
        f = figs[k]
        a = antigo.get(k, {})
        pautas.append({"dia": dia, "cap": k[0], "fig": k[1], "tipo": f["tipo"], "titulo": f["titulo"],
                       "template": f["tipo"] in PRONTOS, "status": a.get("status", "pendente"), **({"publicado_em": a["publicado_em"]} if a.get("publicado_em") else {})})
    cab = ("# Banco de pautas do Estúdio Singular. Uma pauta = uma figura do livro (apostila/texto/capNN.md).\n"
           "# Gerado por `estudio.py indexar`; só 'status' e 'publicado_em' devem ser editados à mão (ou por `publicado N`).\n"
           "# status: pendente | pronto (kit escrito e renderizado) | publicado\n"
           "# template: false = o carrossel ainda não sabe desenhar esse tipo de figura (criar em carrossel.py antes do dia chegar).\n")
    BANCO.write_text(cab + yaml.safe_dump({"pautas": pautas}, allow_unicode=True, sort_keys=False, width=140))
    print(f"banco.yaml: {len(pautas)} pautas, {sum(p['template'] for p in pautas)} com template pronto")


def pauta(dia):
    for p in carregar_yaml(BANCO).get("pautas", []):
        if p["dia"] == dia:
            return p
    sys.exit(f"dia {dia} não existe no banco")


def nivel_cta(dia):
    c = marca()["cadencia_cta"]
    d = (dia - 1) % 7 + 1
    return next((k for k in ("pratica", "conversa", "convite") if d in c[k]), "pratica")


def proximo():
    for p in carregar_yaml(BANCO).get("pautas", []):
        if p["status"] == "pendente":
            break
    else:
        sys.exit("banco esgotado: todas as pautas têm kit")
    cap = TEXTO / f"cap{p['cap']:02d}.md"
    s = cap.read_text()
    fig = re.findall(r"```figura\n(.*?)```", s, re.S)[p["fig"]]
    print(f"DIA {p['dia']:02d} · cap. {p['cap']} · figura {p['fig']} ({p['tipo']}) · {p['titulo']}")
    print(f"template do carrossel: {'pronto' if p['template'] else 'FALTA (criar em carrossel.py ou escolher outra pauta)'}")
    print(f"nível de CTA da semana: {nivel_cta(p['dia'])}")
    print(f"capítulo: {cap.relative_to(RAIZ)}   kit a criar: estudio/kits/dia-{p['dia']:03d}/kit.yaml")
    print("\n--- FIGURA (dados YAML do livro) ---\n" + fig)
    print("--- CONCEITOS DO CAPÍTULO ---")
    for b in re.findall(r"```conceito\n(.*?)```", s, re.S):
        print(b)


# ------------------------------------------------------------------ lint
def antivicios():
    cfg = carregar_yaml(RAIZ / "apostila" / "ORQUESTRADOR.yaml")["antivicios"]["proibidas"]
    return [re.compile(p, re.I) for p in cfg]


NAO_E_E = re.compile(r"\bnão é\b[^.?!\n]{1,90}?[,;:—–-]\s*(é|e sim|mas)\b|\bnão (é|são|foi) [^.?!\n]{1,80}[.!]\s+(É|São|Foi)\b", re.I)
EXTRAS = [re.compile(p, re.I) for p in (r"\bvoc[eê] sabia\b", r"\bvou te contar\b", r"\bsegredo\b", r"(?:^|[.!?]\s+)gente\b", r"\bolá\b", r"\bbom dia\b",
                                          r"\boi,? pessoal\b", r"\bfala,? (galera|pessoal)\b", r"\bsalve\b[,!]", r"\bgarant(o|ido|e|ia)\b", r"\bresultado garantido\b",
                                          r"\bcliente meu\b", r"\bpaciente meu\b", r"\bminha cliente\b", r"\bminha paciente\b", r"\bcomo eu sempre digo\b")]
ACOES = {"salve": r"\bsalv(e|ar)\b", "compartilhe": r"\bcompartilh(e|ar)\b", "comente": r"\bcoment(e|ar)\b", "siga": r"\bsig(a|ar)\b",
         "link": r"\blink\b", "mensagem": r"\b(mande|envie) (uma )?mensagem\b", "escreva": r"\bescreva\b"}


def textos_do_kit(k):
    r = k.get("roteiro", {})
    out = [("roteiro." + e, r.get(e, "")) for e, _ in ETAPAS]
    for i, s in enumerate(k.get("carrossel", []), 1):
        for ch in ("titulo", "sub", "fala", "apoio", "tag", "acao", "quem", "texto", "comum", "singular", "porque", "pergunta", "resposta", "nota"):
            if s.get(ch):
                out.append((f"slide{i}.{ch}", s[ch]))
        for x in s.get("itens", []) or []:
            out.append((f"slide{i}.item", f"{x['rotulo']} {x['texto']}"))
        fg = s.get("figura") or {}
        for c in ("camadas", "nos", "passos", "etapas", "degraus", "series"):
            for x in fg.get(c, []) or []:
                out.append((f"slide{i}.fig", f"{x['rotulo']} {x.get('nota', '')}"))
    out.append(("legenda", k.get("legenda", "")))
    return out


def lint(dia, silencioso=False):
    kit_p = KITS / f"dia-{dia:03d}" / "kit.yaml"
    if not kit_p.exists():
        sys.exit(f"não existe {kit_p.relative_to(RAIZ)}")
    k = carregar_yaml(kit_p)
    erros, avisos = [], []
    r = k.get("roteiro", {})
    dur = k.get("duracao", marca().get("duracao_padrao_reels", 45))
    for e, _ in ETAPAS:
        if not (r.get(e) or "").strip():
            erros.append(f"roteiro: etapa '{e}' vazia")
    total = sum(palavras(r.get(e)) for e, _ in ETAPAS)
    lo, hi = FAIXAS.get(dur, (100, 150))
    if not lo <= total <= hi:
        erros.append(f"roteiro tem {total} palavras (~{total / PALAVRAS_POR_SEG:.0f} s); para {dur} s o alvo é {lo}–{hi}")
    if palavras(r.get("hook")) > LIMITE_HOOK:
        erros.append(f"hook com {palavras(r.get('hook'))} palavras (máx. {LIMITE_HOOK}): o gancho vive nos primeiros segundos")
    intro = palavras(r.get("hook")) + palavras(r.get("lead"))
    if intro > LIMITE_INTRO:
        erros.append(f"hook + lead com {intro} palavras (máx. {LIMITE_INTRO}, ~{LIMITE_INTRO / PALAVRAS_POR_SEG:.0f} s): a introdução tem que terminar por volta dos 10 s")
    for e, faixas in ORCAMENTO.items():
        lo_e, hi_e = faixas.get(dur, faixas[60])
        n_e = palavras(r.get(e))
        if n_e and not lo_e <= n_e <= hi_e:
            avisos.append(f"{e} com {n_e} palavras; o manual pede {lo_e}–{hi_e} para {dur} s")
    for e in ("loop1", "loop2"):
        if palavras(r.get(e)) > 30:
            avisos.append(f"{e} longo ({palavras(r.get(e))} palavras): a lacuna deve ser uma frase")
    if palavras(r.get("cta")) > 50:
        avisos.append("cta longo (> 50 palavras)")
    pedidos = [n for n, p in ACOES.items() if re.search(p, r.get("cta", ""), re.I)]
    if len(pedidos) > 1:
        avisos.append(f"cta pede mais de uma ação ({', '.join(pedidos)}): uma ação por peça")
    # vícios em tudo que é texto
    av = antivicios()
    for onde, t in textos_do_kit(k):
        for rx in av + EXTRAS:
            m = rx.search(t or "")
            if m and not (rx.pattern == "!" and False):
                erros.append(f"{onde}: expressão vetada '{m.group(0)}'")
        if NAO_E_E.search(t or ""):
            erros.append(f"{onde}: fórmula 'não é X, é Y'")
        if re.search(r"\{[^}]*\}", t or ""):
            erros.append(f"{onde}: marcador não preenchido")
    # carrossel
    sl = k.get("carrossel", [])
    if not 6 <= len(sl) <= 10:
        erros.append(f"carrossel com {len(sl)} slides (6 a 10)")
    if sl and sl[0]["tipo"] != "capa":
        erros.append("o primeiro slide deve ser 'capa'")
    if sl and sl[-1]["tipo"] != "cta":
        erros.append("o último slide deve ser 'cta'")
    if not any(s["tipo"] == "figura" for s in sl):
        erros.append("o carrossel precisa de um slide 'figura' (o elemento gráfico do livro)")
    exs = [s for s in sl if s["tipo"] == "exemplo"]
    if not exs:
        erros.append("o carrossel precisa de um slide 'exemplo' (como ficaria, na prática)")
    for s in exs:
        if s.get("forma") not in FORMAS_EXEMPLO:
            erros.append(f"exemplo com forma '{s.get('forma')}' (use {', '.join(FORMAS_EXEMPLO)})")
    anterior = KITS / f"dia-{dia - 1:03d}" / "kit.yaml"
    if exs and anterior.exists():
        formas_ant = [s.get("forma") for s in carregar_yaml(anterior).get("carrossel", []) if s["tipo"] == "exemplo"]
        if exs[0].get("forma") in formas_ant:
            avisos.append(f"exemplo na mesma forma do dia anterior ({exs[0].get('forma')}): varie o modo de mostrar a aplicação")
    for i, s in enumerate(sl, 1):
        n = sum(palavras(s.get(c)) for c in ("titulo", "sub", "fala", "apoio", "tag")) + sum(palavras(x["rotulo"] + " " + x["texto"]) for x in s.get("itens", []) or [])
        if n > 55:
            avisos.append(f"slide {i} com {n} palavras: um slide, uma ideia")
    # legenda
    lg = k.get("legenda", "")
    if not 350 <= len(lg) <= 2200:
        erros.append(f"legenda com {len(lg)} caracteres (350 a 2200)")
    if len(re.findall(r"#\w+", lg)) > 5:
        erros.append("legenda com mais de 5 hashtags")
    ficha = k.get("ficha") or {}
    for campo in CAMPOS_FICHA:
        if not str(ficha.get(campo) or "").strip():
            erros.append(f"ficha: campo '{campo}' vazio (MANUAL, seção 1)")
    if not k.get("fonte", {}).get("cap"):
        erros.append("kit sem 'fonte.cap' (de qual capítulo vem a ideia)")
    if not silencioso:
        print(f"DIA {dia:02d}: roteiro {total} palavras (~{total / PALAVRAS_POR_SEG:.0f} s), {len(sl)} slides, legenda {len(lg)} caracteres")
        for a in avisos:
            print("  AVISO", a)
        for e in erros:
            print("  ERRO ", e)
        print("  OK" if not erros else f"  {len(erros)} erro(s)")
    return k, erros


# ------------------------------------------------------------------ render
def montar_roteiro(k, dia):
    r = k["roteiro"]
    total = sum(palavras(r[e]) for e, _ in ETAPAS)
    dur = k.get("duracao", marca().get("duracao_padrao_reels", 45))
    L = [f"# Dia {dia:02d} · {k.get('tema', '')}", "",
         f"Capítulo {k['fonte']['cap']} · figura: {k['fonte'].get('figura', '')} · objetivo: {k.get('objetivo', 'ensinar')} · "
         f"{dur} s (≈ {total} palavras, {total / PALAVRAS_POR_SEG:.0f} s falados) · CTA: {k.get('cta_nivel', '')}", "",
         "## Roteiro por etapa", ""]
    for e, nome in ETAPAS:
        L += [f"**{nome}**", r[e].strip(), ""]
    L += ["---", "", "## Versão final para gravação", ""]
    L += [r[e].strip() + "\n" for e, _ in ETAPAS]
    return "\n".join(L).rstrip() + "\n"


def render(dia):
    k, erros = lint(dia)
    if erros:
        sys.exit("corrija os erros antes de renderizar")
    pasta = KITS / f"dia-{dia:03d}"
    (pasta / "roteiro.md").write_text(montar_roteiro(k, dia))
    (pasta / "legenda.md").write_text(k["legenda"].strip() + "\n")
    import carrossel
    m = marca()
    ctx = {"handle": m.get("handle", ""), "rotuloDia": f"Dia {dia:02d}", "assinatura": m["oferta"]["nome"]}
    n = carrossel.renderizar(k["carrossel"], ctx, pasta / "slides")
    print(f"{pasta.relative_to(RAIZ)}: roteiro.md, legenda.md, {n} slides")
    bancar(dia, "pronto")
    exportar()


def bancar(dia, status):
    b = carregar_yaml(BANCO)
    for p in b["pautas"]:
        if p["dia"] == dia and p["status"] != "publicado" or (p["dia"] == dia and status == "publicado"):
            p["status"] = status
            if status == "publicado":
                p["publicado_em"] = dt.date.today().isoformat()
    cab = "".join(l for l in BANCO.read_text().splitlines(True) if l.startswith("#"))
    BANCO.write_text(cab + yaml.safe_dump(b, allow_unicode=True, sort_keys=False, width=140))


def exportar():
    """Leva o estúdio para o app: src/estudio/dados/{publico,fontes}.json.
    publico.json vai para o navegador (pautas e kits prontos); fontes.json só para o servidor (livro, playbook, regras)."""
    import json
    destino = RAIZ / "src" / "estudio" / "dados"
    destino.mkdir(parents=True, exist_ok=True)
    m = marca()
    pautas = carregar_yaml(BANCO).get("pautas", [])
    caps, figuras = {}, {}
    for p in pautas:
        txt = (TEXTO / f"cap{p['cap']:02d}.md").read_text()
        fm = re.match(r"^---\n(.*?)\n---\n(.*)$", txt, re.S)
        meta = yaml.safe_load(fm.group(1)) if fm else {}
        p["capTitulo"] = meta.get("titulo", "")
        caps[str(p["cap"])] = {"titulo": meta.get("titulo", ""), "subtitulo": meta.get("subtitulo", ""), "texto": fm.group(2) if fm else txt}
        figuras[str(p["dia"])] = yaml_tolerante(re.findall(r"```figura\n(.*?)```", txt, re.S)[p["fig"]])
    kits = {}
    for kp in sorted(KITS.glob("dia-*/kit.yaml")):
        k = carregar_yaml(kp)
        kits[str(k["dia"])] = k
    publico = {"marca": {"autor": m.get("autor"), "handle": m.get("handle"), "oferta": m.get("oferta"),
                         "duracao": m.get("duracao_padrao_reels", 45)},
               "pautas": pautas, "kits": kits}
    fontes = {"playbook": (AQUI / "PLAYBOOK.md").read_text(), "manual": (AQUI / "MANUAL.md").read_text(),
              "antivicios": carregar_yaml(RAIZ / "apostila" / "ORQUESTRADOR.yaml")["antivicios"]["proibidas"],
              "cadencia": m.get("cadencia_cta"), "capitulos": caps, "figuras": figuras,
              "exemploKit": kits.get("1")}
    (destino / "publico.json").write_text(json.dumps(publico, ensure_ascii=False, indent=1))
    (destino / "fontes.json").write_text(json.dumps(fontes, ensure_ascii=False))
    print(f"src/estudio/dados: {len(pautas)} pautas, {len(kits)} kits, {len(caps)} capítulos")


def status():
    ps = carregar_yaml(BANCO).get("pautas", [])
    por = {}
    for p in ps:
        por[p["status"]] = por.get(p["status"], 0) + 1
    print(f"{len(ps)} pautas · " + " · ".join(f"{k}: {v}" for k, v in por.items()))
    print(f"templates prontos para {sum(p['template'] for p in ps)} delas; faltam: {sorted({p['tipo'] for p in ps if not p['template']})}")
    for p in ps[:14]:
        print(f"  dia {p['dia']:02d} cap {p['cap']:>2} {p['tipo']:<9} {p['status']:<10} {'' if p['template'] else '(sem template)'} {p['titulo'][:50]}")


if __name__ == "__main__":
    sys.path.insert(0, str(AQUI))
    a = sys.argv[1:]
    if not a or a[0] not in ("indexar", "proximo", "lint", "render", "publicado", "status", "exportar"):
        sys.exit(__doc__)
    if a[0] == "indexar": indexar()
    elif a[0] == "proximo": proximo()
    elif a[0] == "status": status()
    elif a[0] == "exportar": exportar()
    elif a[0] == "lint": lint(int(a[1]))
    elif a[0] == "render": render(int(a[1]))
    elif a[0] == "publicado": bancar(int(a[1]), "publicado"); print(f"dia {a[1]} marcado como publicado")
