#!/usr/bin/env python3
"""Orquestrador da apostila Modo Singular.

    python3 apostila/orquestrador.py status              # onde estamos e qual é a próxima ação
    python3 apostila/orquestrador.py fonte 7             # resumo do capítulo-fonte do PWA
    python3 apostila/orquestrador.py lint 7|todos        # vícios de IA e limites de estilo
    python3 apostila/orquestrador.py marcar 7 rascunho   # rascunho | em_revisao
    python3 apostila/orquestrador.py revisao-prompt 7    # briefing do revisor cego
    python3 apostila/orquestrador.py registrar 7 apostila/revisoes/cap07-r1.yaml   # aplica o gate
    python3 apostila/orquestrador.py build [--caps 1-6] [--png] [--grafica] [--completo]
    python3 apostila/orquestrador.py decisao "texto"     # registra decisão editorial
    python3 apostila/orquestrador.py fase F2 concluida   # estado das fases do projeto
    python3 apostila/orquestrador.py figurante 3 veterinária

Estável em ORQUESTRADOR.yaml; mutável em ESTADO.yaml (só este script escreve nele).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import statistics
import sys
from html import escape
from pathlib import Path

import markdown
import yaml

RAIZ = Path(__file__).resolve().parent
sys.path.insert(0, str(RAIZ / "diagramacao"))
import figuras as FIG  # noqa: E402

ORQ = RAIZ / "ORQUESTRADOR.yaml"
EST = RAIZ / "ESTADO.yaml"
TEXTO = RAIZ / "texto"
FONTE = RAIZ / "fonte"
SAIDA = RAIZ / "saida"
DIAG = RAIZ / "diagramacao"
STATUS = ["planejado", "rascunho", "em_revisao", "reprovado", "aprovado_pendente_ordem", "aprovado"]
ROMANO = ["", "I", "II", "III", "IV", "V"]


# =====================================================================  estado
def orq() -> dict:
    return yaml.safe_load(ORQ.read_text())


def estado() -> dict:
    if EST.exists():
        return yaml.safe_load(EST.read_text()) or {}
    return {"fases_do_projeto": {}, "capitulos": {n: {"status": "planejado", "iteracoes": []} for n in range(1, 31)},
            "figurantes": {}, "decisoes": [], "pendencias": []}


def salvar(e: dict) -> None:
    cab = ("# ESTADO — gerado e mantido por orquestrador.py. Não editar à mão.\n"
           f"# atualizado: {dt.datetime.now():%Y-%m-%d %H:%M}\n")
    EST.write_text(cab + yaml.safe_dump(e, allow_unicode=True, sort_keys=False, width=110))


def arq_cap(n: int) -> Path:
    return TEXTO / f"cap{n:02d}.md"


# =====================================================================  manuscrito
BLOCO_RE = re.compile(r"^```(\w[\w-]*)\s*\n(.*?)^```\s*$", re.S | re.M)


def carregar_yaml(txt: str):
    """YAML tolerante: valores de texto com ': ' dentro são citados automaticamente."""
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


def ler_cap(n: int) -> tuple[dict, str]:
    txt = arq_cap(n).read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", txt, re.S)
    if not m:
        raise SystemExit(f"cap{n:02d}.md sem front matter")
    return yaml.safe_load(m.group(1)), m.group(2)


def prosa_de(corpo: str) -> str:
    """Só o texto corrido: tira blocos, títulos e tabelas."""
    s = BLOCO_RE.sub("\n", corpo)
    return "\n".join(l for l in s.splitlines() if not l.lstrip().startswith(("#", "|", "Tabela:")))


def textos_dos_blocos(corpo: str) -> str:
    partes = []

    def coleta(v):
        if isinstance(v, str):
            partes.append(v)
        elif isinstance(v, dict):
            for x in v.values():
                coleta(x)
        elif isinstance(v, list):
            for x in v:
                coleta(x)
    for m in BLOCO_RE.finditer(corpo):
        try:
            coleta(carregar_yaml(m.group(2)))
        except yaml.YAMLError as e:
            partes.append(f"<<YAML inválido em bloco {m.group(1)}: {e}>>")
    return "\n".join(partes)


# =====================================================================  lint
def frases(txt: str) -> list[str]:
    txt = re.sub(r"\s+", " ", txt)
    return [f for f in re.split(r"(?<=[.!?…])[”\"]?\s+(?=[—“\"A-ZÀ-Ý])", txt) if f.split()]


def lint(n: int, silencioso=False) -> dict:
    cfg = orq()["antivicios"]
    fm, corpo = ler_cap(n)
    prosa = prosa_de(corpo)
    tudo = prosa + "\n" + textos_dos_blocos(corpo) + "\n" + " ".join(str(v) for v in fm.values())
    palavras = len(re.findall(r"\b\w+\b", prosa))
    mil = max(palavras / 1000, 0.001)
    erros, avisos, metr = [], [], {"palavras_prosa": palavras}

    for pad in cfg["proibidas"]:
        rx = r"!" if pad == "!" else r"(?i)" + pad
        achados = [m.group(0) for m in re.finditer(r"(?i).{0,40}" + rx.replace("(?i)", "") + r".{0,30}", tudo)]
        if achados:
            erros.append(f"proibida /{pad}/ x{len(achados)}: " + " | ".join(c.strip() for c in achados[:3]))
    if "<<YAML inválido" in tudo:
        erros.append("bloco com YAML inválido: " + re.search(r"<<YAML inválido.*?>>", tudo, re.S).group(0)[:200])

    paragrafos = [p.strip() for p in re.split(r"\n\s*\n", prosa) if p.strip()]
    lim = cfg["limites_por_capitulo"]
    nao_e = re.findall(r"(?i)\bnão (?:é|são|era|foi|está|será)\b[^.!?\n]{1,90}?[.,;:—]\s*(?:é|são|era|foi|mas)\b", prosa)
    socos = [p for p in paragrafos if len(frases(p)) == 1 and len(p.split()) < 12 and not p.startswith(("-", "*", ">"))]
    nao_e += re.findall(r"(?i)\bnão\b[^.!?\n]{3,120}[.!?]\s+(?:É|Tem|Era|Foi|Está|São)\s", prosa)
    e_nao = re.findall(r",\s+e não\b", prosa)
    sinal = re.findall(r"(?i)\b(?:vale (?:a pena )?(?:entender|olhar|lembrar|notar|dizer)|convém|antes de seguir|por ora|como vimos|vamos ver|a seguir,|o que já é bastante|merecem? (?:uma|um) (?:observação|olhar|atenção)|é preciso olhar para)", prosa)
    repare = re.findall(r"\b(?:Repare|Perceba|Note que|Observe que)\b", prosa)
    supos = re.findall(r"\b(?:Talvez você|É provável que você|Você provavelmente|Você já deve ter|Você certamente)\b", prosa)
    blocos_sem_roteiro = textos_dos_blocos(re.sub(r"(?ms)^roteiro: \|.*?(?=^roteiro_nota:|^```)", "", corpo))
    sem_falas = re.sub(r"“[^”]*”|\"[^\"]*\"", "", prosa + "\n" + blocos_sem_roteiro)
    te = re.findall(r"(?i).{0,25}\bte\b.{0,25}", sem_falas)
    perg_resp = re.findall(r"(?:^|[.?!]\s+)(?:[A-ZÀ-Ý][^.?!\s]*(?:\s[^.?!\s]+){0,4})\?\s+[A-ZÀ-Ý][^.?!]{0,70}\.", prosa)
    for nome, lista in (("nao_e_e", nao_e), ("frase_soco", socos), ("repare_perceba", repare),
                        ("pergunta_resposta", perg_resp), ("virgula_e_nao", e_nao), ("sinalizacao", sinal),
                        ("suposicao_leitor", supos), ("te_pronome", te)):
        metr[nome] = len(lista)
        if len(lista) > lim[nome]:
            erros.append(f"{nome}: {len(lista)} (máx {lim[nome]}) -> " + " | ".join(x.strip()[:70] for x in lista[:5]))

    lpm = cfg["limites_por_mil_palavras"]
    trav = prosa.count("—") / mil
    inter = prosa.count("?") / mil
    triade = len(re.findall(r"\b[\wÀ-ÿ]+, [\wÀ-ÿ]+ e [\wÀ-ÿ]+\b", prosa)) / mil
    metr.update(travessao_pmil=round(trav, 1), interrogacao_pmil=round(inter, 1), triade_pmil=round(triade, 1))
    for nome, v in (("travessao", trav), ("interrogacao", inter), ("triade", triade)):
        if v > lpm[nome]:
            avisos.append(f"{nome} {v:.1f}/mil (máx {lpm[nome]})")

    comp = [len(f.split()) for f in frases(prosa)]
    if len(comp) > 5:
        media, desv = statistics.mean(comp), statistics.pstdev(comp)
        metr.update(frase_media=round(media, 1), frase_desvio=round(desv, 1), frases=len(comp))
        ef = cfg["estatisticas_de_frase"]
        if not ef["media_min"] <= media <= ef["media_max"]:
            avisos.append(f"média de frase {media:.1f} fora de [{ef['media_min']}, {ef['media_max']}]")
        if desv < ef["desvio_min"]:
            avisos.append(f"desvio de frase {desv:.1f} < {ef['desvio_min']} (ritmo monótono)")

    alvo = orq()["estrutura_do_capitulo"]["prosa_palavras"]
    if not alvo[0] <= palavras <= alvo[1]:
        erros.append(f"prosa com {palavras} palavras (alvo {alvo[0]}–{alvo[1]})")

    inter = len(re.findall(r"^## ", BLOCO_RE.sub("", corpo), re.M))
    metr["intertitulos"] = inter
    if not 3 <= inter <= 5:
        erros.append(f"intertítulos: {inter} (use de 3 a 5)")
    # verificação: posição das corretas e comprimento das opções
    for m in BLOCO_RE.finditer(corpo):
        if m.group(1) == "verificacao":
            qs = carregar_yaml(m.group(2))
            pos = [q["correta"] for q in qs]
            if len(qs) >= 3 and len(set(pos)) < min(3, len(qs)):
                erros.append(f"verificação: corretas pouco variadas {pos} (use ao menos 3 posições diferentes)")
            longas = sum(1 for q in qs if len(q["opcoes"][q["correta"]]) == max(len(o) for o in q["opcoes"]))
            if longas > len(qs) // 2:
                avisos.append(f"verificação: a correta é a opção mais longa em {longas} de {len(qs)} questões")
    # itens que deveriam ser texto e viraram dicionário (": " dentro de item YAML sem aspas)
    for m in BLOCO_RE.finditer(corpo):
        try:
            d = carregar_yaml(m.group(2))
        except yaml.YAMLError:
            continue
        listas = []
        if m.group(1) == "verificacao":
            listas = [q.get("opcoes", []) for q in d]
        elif m.group(1) in ("guardar",):
            listas = [d if isinstance(d, list) else d.get("itens", [])]
        elif m.group(1) == "compara":
            listas = [d["esquerda"]["itens"], d["direita"]["itens"]]
        elif m.group(1) == "rede":
            listas = [d.get("faca", []), d.get("evite", [])]
        elif m.group(1) == "oficina":
            listas = [d.get("criterios", [])]
        for lst in listas:
            for it in lst:
                if not isinstance(it, str):
                    erros.append(f"bloco {m.group(1)}: item que não é texto (ponha entre aspas): {it}")
    # parágrafos longos demais
    longos = [p[:50] for p in paragrafos if len(frases(p)) > 7]
    if longos:
        avisos.append(f"parágrafos com mais de 7 frases: {longos}")
    inicios = [" ".join(p.split()[:2]).lower() for p in paragrafos if len(p.split()) > 3]
    rep = {i: inicios.count(i) for i in set(inicios) if inicios.count(i) > 2}
    if rep:
        avisos.append(f"parágrafos que começam igual: {rep}")

    faltando = [b for b in ("conceito", "guardar", "oficina", "rede", "verificacao", "aplicacao")
                if not re.search(rf"^```{b}\s*$", corpo, re.M)]
    if faltando:
        erros.append(f"blocos obrigatórios ausentes: {faltando}")

    res = {"erros": erros, "avisos": avisos, "metricas": metr}
    if not silencioso:
        print(f"\nLINT cap{n:02d} — {palavras} palavras de prosa")
        print("  " + " · ".join(f"{k}: {v}" for k, v in metr.items()))
        for e in erros:
            print(f"  ERRO  {e}")
        for a in avisos:
            print(f"  aviso {a}")
        print("  OK: nenhum erro." if not erros else f"  {len(erros)} erro(s) — bloqueia o gate.")
    return res


# =====================================================================  render
class Ctx:
    def __init__(self, n: int):
        self.n, self.fig, self.tab = n, 0, 0


def md(s: str) -> str:
    return markdown.markdown(str(s), extensions=["extra", "smarty"])


def md_inline(s) -> str:
    return re.sub(r"^<p>(.*)</p>$", r"\1", md(s).strip(), flags=re.S)


def esc(s) -> str:
    return escape(FIG.aspas(s), quote=False)


def linhas(k) -> str:
    return '<div class="linhas">' + "<div></div>" * max(int(k), 1) + "</div>"


def lacunas(txt: str) -> str:
    return re.sub(r"\{([^}]+)\}", lambda m: f'<span class="lacuna">{m.group(1)}</span>', esc(txt))


def b_conceito(d, c):
    return (f'<div class="bloco conceito"><p class="rotulo">Conceito</p><p class="termo">{esc(d["termo"])}</p>'
            f'<p class="def">{md_inline(d["definicao"])}</p>'
            f'<p class="porque"><b>Por que importa</b>{md_inline(d["porque"])}</p></div>')


def b_figura(d, c):
    c.fig += 1
    selo = '<span class="selo">esquema ilustrativo</span>' if d.get("ilustrativo") else ""
    return (f'<figure class="fig"><div class="cab">{selo}<span class="num">Figura {c.n}.{c.fig}</span>'
            f'<p class="titulo-fig">{esc(d["titulo"])}</p></div>{FIG.figura(d)}</figure>')


def b_exemplo(d, c):
    return (f'<div class="bloco exemplo"><p class="rotulo">{esc(d.get("rotulo", "Na prática"))}</p>'
            f'<p class="titulo">{esc(d["titulo"])}</p>'
            f'<div class="painel comum"><p class="rotulo">{esc(d.get("rotulo_comum", "O comum"))}</p><p>{md_inline(d["comum"])}</p></div>'
            f'<div class="painel singular"><p class="rotulo">{esc(d.get("rotulo_singular", "O singular"))}</p><p>{md_inline(d["singular"])}</p></div>'
            f'<p class="porque"><b>Por quê. </b>{md_inline(d["porque"])}</p></div>')


def b_compara(d, c):
    def lado(x, cls):
        return (f'<div class="lado {cls}"><p class="rotulo">{esc(x["titulo"])}</p><ul>'
                + "".join(f"<li>{md_inline(i)}</li>" for i in x["itens"]) + "</ul></div>")
    return f'<div class="bloco compara">{lado(d["esquerda"], "neg")}{lado(d["direita"], "pos")}</div>'


def b_citacao(d, c):
    f = f'<p class="fonte">{esc(d["fonte"])}</p>' if d.get("fonte") else ""
    return f'<blockquote class="bloco citacao"><p>{md_inline(d["texto"])}</p>{f}</blockquote>'


def b_nota(d, c):
    t = f'<p class="titulo">{esc(d["titulo"])}</p>' if d.get("titulo") else ""
    return f'<div class="bloco nota {d.get("tipo", "")}">{t}<p>{md_inline(d["texto"])}</p></div>'


def b_guardar(d, c):
    itens = d if isinstance(d, list) else d["itens"]
    return ('<div class="bloco guardar"><p class="rotulo">Para guardar</p><ol>'
            + "".join(f'<li><span class="g">{i}</span>{md_inline(t)}</li>' for i, t in enumerate(itens, 1)) + "</ol></div>")


def cab_secao(rotulo, titulo, sub=""):
    s = f'<p class="sub">{md_inline(sub)}</p>' if sub else ""
    return f'<div class="cab-secao"><p class="rotulo">{rotulo}</p><h2>{esc(titulo)}</h2>{s}</div>'


def b_autodiagnostico(d, c):
    esc_ = d["escala"]
    k = len(esc_)
    cab = "<tr><th></th>" + "".join(f"<th>{esc(e)}</th>" for e in esc_) + "</tr>"
    corpo = ""
    eixos = d.get("eixos")  # {"O": "Oral", ...}: soma por eixo em vez de soma total
    if eixos:
        cab = "<tr><th></th><th class='ex'>Eixo</th>" + "".join(f"<th>{esc(e)}</th>" for e in esc_) + "</tr>"
    for it in d["itens"]:
        nums = list(range(k, 0, -1)) if it.get("invertido") else list(range(1, k + 1))
        tag = f'<td class="ex">{it["eixo"]}</td>' if eixos else ""
        corpo += (f'<tr><td>{md_inline(it["texto"])}</td>{tag}'
                  + "".join(f'<td class="op"><span>{v}</span></td>' for v in nums) + "</tr>")
    faixas = "".join(
        f'<div class="faixa"><div class="intervalo">{esc(f["rotulo"]) if f.get("rotulo") else str(f["min"]) + "–" + str(f["max"])}</div>'
        f'<div><b>{esc(f["titulo"])}</b><p>{md_inline(f["leitura"])}</p></div></div>' for f in d["faixas"])
    if eixos:
        somas = ('<div class="somas">' + "".join(
            f'<div><span class="txt">{esc(nome)} ({letra})</span><span class="caixa"></span></div>'
            for letra, nome in eixos.items()) + '</div>')
    else:
        somas = '<p class="soma"><span class="txt">Soma dos números circulados</span><span class="caixa"></span></p>'
    nota = f'<p class="nota-escala">{md_inline(d["nota"])}</p>' if d.get("nota") else ""
    return (f'<section class="autodiag">{cab_secao(f"Autodiagnóstico · Capítulo {c.n}", d["titulo"])}'
            f'<p class="instrucao">{md_inline(d["instrucao"])}</p><table class="escala">{cab}{corpo}</table>'
            f'{somas}{nota}<div class="faixas">{faixas}</div></section>')


def b_oficina(d, c):
    campos = ""
    for i, f in enumerate(d["campos"], 1):
        dica = f'<p class="dica">{esc(f["exemplo"])}</p>' if f.get("exemplo") else ""
        campos += (f'<div class="campo"><p class="enunciado"><span class="n">{i:02d}</span>{md_inline(f["rotulo"])}</p>'
                   f'{dica}{linhas(f.get("linhas", 3))}</div>')
    crit = "".join(f"<li>{md_inline(x)}</li>" for x in d.get("criterios", []))
    return (f'<section class="oficina">{cab_secao(f"Oficina · Capítulo {c.n}", d["titulo"], d["objetivo"])}'
            f'<div class="meta"><div class="tempo"><p class="rotulo">Tempo</p><p class="valor">{d["tempo"]} min</p></div>'
            f'<div><p class="rotulo">Ao final, você terá</p><p>{md_inline(d["entrega"])}</p></div></div>'
            f'{campos}<div class="criterios"><p class="rotulo">Confira antes de seguir</p><ul class="caixas">{crit}</ul></div></section>')


def b_rede(d, c):
    regras = "".join(f'<li><span class="g">{i}</span><p class="regra">{md_inline(r["regra"])}</p><p class="pq">{md_inline(r["porque"])}</p></li>'
                     for i, r in enumerate(d["regras"], 1))
    faca = "".join(f"<li>{md_inline(x)}</li>" for x in d["faca"])
    evite = "".join(f"<li>{md_inline(x)}</li>" for x in d["evite"])
    esq = "".join(f'<div class="parte"><div class="qual">{esc(p["rotulo"])}</div><div class="corpo">'
                  f'<p>{md_inline(p["texto"])}</p>{linhas(p.get("linhas", 2))}</div></div>' for p in d["esqueleto"])
    rot = ""
    if d.get("roteiro"):
        paras = [p.strip() for p in d["roteiro"].strip().split("\n\n")]
        nota = f'<p class="remissao">{md_inline(d["roteiro_nota"])}</p>' if d.get("roteiro_nota") else ""
        rot = ('<div class="roteiro-bloco"><p class="rotulo">Roteiro de fala — para ler em voz alta, gravando</p><div class="roteiro">'
               + "".join(f"<p>{lacunas(p)}</p>" for p in paras) + f"</div>{nota}</div>")
    return (f'<section class="rede">{cab_secao(f"Do caderno para a rede · Capítulo {c.n}", d["titulo"], d.get("intro", ""))}'
            f'<ol class="regras">{regras}</ol>'
            f'<div class="faca-evite"><div class="faca"><p class="rotulo">Faça assim</p><ul>{faca}</ul></div>'
            f'<div class="evite"><p class="rotulo">Evite</p><ul>{evite}</ul></div></div>'
            f'<p class="rotulo">Esqueleto da peça — rascunhe aqui</p><div class="esqueleto">{esq}</div>{rot}</section>')


def b_verificacao(d, c):
    qs = d if isinstance(d, list) else d["questoes"]
    corpo = ""
    for i, q in enumerate(qs, 1):
        ops = "".join(f'<li><span class="letra">{"abcde"[j]}</span>{md_inline(o)}</li>' for j, o in enumerate(q["opcoes"]))
        corpo += f'<div class="questao"><p class="enunciado"><span class="n">{i:02d}</span>{md_inline(q["pergunta"])}</p><ol>{ops}</ol></div>'
    return (f'<section class="fechamento">{cab_secao(f"Fechamento · Capítulo {c.n}", "Verificação", "Responda sem voltar ao texto. Depois confira no gabarito comentado.")}'
            f'{corpo}<p class="remissao">Respostas comentadas no Apêndice A, <a class="pg" href="#gab-{c.n}">página </a>.</p>')


def b_aplicacao(d, c):
    itens = d["itens"]
    total = sum(i["pontos"] for i in itens)
    minimo = -(-total * 7 // 10)
    linhas_t = "".join(
        f'<tr><td><span class="cx"></span></td><td><b>{md_inline(i["rotulo"])}</b><span class="aj">{md_inline(i["ajuda"])}</span></td>'
        f'<td class="pts">{i["pontos"]}</td></tr>' for i in itens)
    prox = (f"Com {minimo} pontos ou mais, siga para o capítulo {c.n + 1}. Com menos, volte à oficina: "
            "é ela que prepara o próximo passo.") if c.n < 30 else \
        f"Com {minimo} pontos ou mais, você fechou os trinta capítulos. Com menos, volte à oficina antes do plano de noventa dias."
    return (f'<div class="aplicacao"><p class="rotulo">Checklist de aplicação</p>'
            f'<table>{linhas_t}</table><div class="total"><p>{prox}</p>'
            f'<div class="caixa">Total<span></span>de {total}</div></div>'
            f'<div class="registro"><div>Concluído em</div><div>Tempo real da oficina</div></div></div></section>')


BLOCOS = {"conceito": b_conceito, "figura": b_figura, "exemplo": b_exemplo, "compara": b_compara,
          "citacao": b_citacao, "nota": b_nota, "guardar": b_guardar, "autodiagnostico": b_autodiagnostico,
          "oficina": b_oficina, "rede": b_rede, "verificacao": b_verificacao, "aplicacao": b_aplicacao}
SECOES = ("autodiagnostico", "oficina", "rede", "verificacao", "aplicacao")


NOMES = r"\b(Renata|Marcos|Otávio|Lúcia|Caio|Débora|Moura|Bezerra|Prado|Tavares)\b"


def sem_hifen(h: str) -> str:
    """Nomes próprios do elenco e palavras compostas não são hifenizados."""
    partes = re.split(r"(<[^>]+>)", h)
    for i, t in enumerate(partes):
        if not t.startswith("<"):
            t = re.sub(NOMES, r'<span class="nh">\1</span>', t)
            t = re.sub(r"(“(?:\S+\s){0,5}\S+”)", r'<span class="nh">\1</span>', t)
            partes[i] = re.sub(r"\b(\w+(?:-\w+)+)\b", r'<span class="nq">\1</span>', t)
    return "".join(partes)


def md_prosa(s: str, c: Ctx) -> str:
    h = sem_hifen(md(s))

    def legenda(m):
        c.tab += 1
        return f'<table><caption><span class="num">Tabela {c.n}.{c.tab}</span>{m.group(1)}</caption>'
    return re.sub(r"<p>Tabela:\s*(.*?)</p>\s*<table>", legenda, h, flags=re.S)


def render_cap(n: int) -> tuple[str, dict]:
    fm, corpo = ler_cap(n)
    c = Ctx(n)
    fase = orq()["livro"]["fases"][fm["fase"]]
    texto_html, secoes_html, pos, no_texto = [], [], 0, True
    for m in BLOCO_RE.finditer(corpo):
        (texto_html if no_texto else secoes_html).append(md_prosa(corpo[pos:m.start()], c))
        tipo = m.group(1)
        if tipo not in BLOCOS:
            raise SystemExit(f"cap{n:02d}: bloco desconhecido '{tipo}'")
        html = BLOCOS[tipo](carregar_yaml(m.group(2)), c)
        if tipo in SECOES:
            no_texto = False
        (texto_html if no_texto else secoes_html).append(html)
        pos = m.end()
    (texto_html if no_texto else secoes_html).append(md_prosa(corpo[pos:], c))
    abertura = (f'<header class="abertura" id="cap-{n}"><p class="fase-rotulo">Fase {ROMANO[fm["fase"]]}'
                f' · {esc(fase["nome"])}</p><p class="numero">{n:02d}</p><h1>{esc(fm["titulo"])}</h1>'
                f'<p class="subtitulo">{esc(fm["subtitulo"])}</p><p class="epigrafe">{esc(fm["epigrafe"])}</p>'
                f'<div class="ilustracao">{FIG.ilustracao(fm["ilustracao"])}'
                f'<p class="legenda">{esc(fm.get("legenda_ilustracao", ""))}</p></div></header>')
    txt = re.sub(r"^(\s*<p>)((?:\S+\s){2}\S+?)(?=[\s,.])",
                 lambda m: f'{m.group(1)}<span class="abre">{m.group(2)}</span>', "".join(texto_html), count=1)
    return (f'<section class="capitulo">{abertura}<div class="texto">{txt}</div>'
            f'{"".join(secoes_html)}</section>'), {"fm": fm, "corpo": corpo}


# ---------------------------------------------------------------------  livro
def html_livro(caps: list[int], completo: bool) -> str:
    o = orq()
    proj, livro = o["projeto"], o["livro"]
    meta = {n: render_cap(n) for n in caps}
    corpo = [f'<section class="folha-rosto"><p class="titulo">{esc(proj["titulo"])}</p>'
             f'<p class="sub">{esc(proj["subtitulo"])}</p><p class="autor">{esc(proj.get("autor") or "")}</p>'
             f'<div class="marca">{FIG.marca(46)}</div></section>',
             f'<section class="creditos"><p><b>{esc(proj["titulo"])}</b> — {esc(proj["subtitulo"])}</p>'
             f'<p>{esc(proj["edicao"])}, {dt.date.today().year}.</p>'
             '<p>Renata, Otávio, Lúcia e Caio são personagens compostos a partir de traços de muitos '
             'profissionais. Qualquer semelhança com pessoas reais é coincidência.</p>'
             '<p>Tipografia: Newsreader, Instrument Serif e Inter (SIL Open Font License).</p></section>']
    s = '<section class="sumario"><h2>Sumário</h2>'
    if completo and (TEXTO / "antes-de-comecar.md").exists():
        s += '<a href="#antes"><span class="n"></span><span class="t">Antes de começar</span></a>'
    fase_atual = None
    for n in caps:
        f = meta[n][1]["fm"]["fase"]
        if f != fase_atual:
            fase_atual = f
            s += f'<p class="fase">Fase {ROMANO[f]} · {esc(livro["fases"][f]["nome"])}</p>'
        s += f'<a href="#cap-{n}"><span class="n">{n:02d}</span><span class="t">{esc(meta[n][1]["fm"]["titulo"])}</span></a>'
    s += '<p class="fase">Apêndices</p>'
    for letra, nome, arq in (("A", "Gabarito comentado", None), ("B", "Glossário dos conceitos", None),
                             ("C", "Se você usar uma IA", "apendice-ia.md"), ("D", "Calendário dos trinta dias", "apendice-calendario.md")):
        if arq is None or (completo and (TEXTO / arq).exists()):
            s += f'<a href="#ap-{letra}"><span class="n">{letra}</span><span class="t">{nome}</span></a>'
    corpo.append(s + "</section>")
    if completo and (TEXTO / "antes-de-comecar.md").exists():
        corpo.append(f'<section class="pre prosa" id="antes">{md((TEXTO / "antes-de-comecar.md").read_text())}</section>')
    fase_atual = None
    for n in caps:
        f = meta[n][1]["fm"]["fase"]
        if f != fase_atual:
            fase_atual = f
            itens = "".join(f'<li><span>{k:02d}</span>{esc(o["capitulos"][k]["titulo"])}</li>'
                            for k in range(6 * f - 5, 6 * f + 1))
            corpo.append(f'<section class="abertura-fase"><p class="fase-num">Fase<b>{ROMANO[f]}</b></p>'
                         f'<h1>{esc(livro["fases"][f]["nome"])}</h1>'
                         f'<p class="promessa">{esc(livro["fases"][f]["abertura"])}</p><ul>{itens}</ul></section>')
        corpo.append(meta[n][0])
    gab = ('<section class="apendice" id="ap-A"><h1>A. Gabarito comentado</h1>'
           '<p class="intro">Leia o comentário mesmo quando acertar: é nele que está o raciocínio.</p>')
    glo = '<section class="apendice" id="ap-B"><h1>B. Glossário dos conceitos</h1><dl class="glossario">'
    for n in caps:
        for m in BLOCO_RE.finditer(meta[n][1]["corpo"]):
            d = carregar_yaml(m.group(2))
            if m.group(1) == "verificacao":
                qs = d if isinstance(d, list) else d["questoes"]
                gab += f'<p class="gab-cap" id="gab-{n}">Capítulo {n} · {esc(meta[n][1]["fm"]["titulo"])}</p>'
                gab += "".join(f'<p class="gab"><b>{i:02d}.</b> <span class="resp">({"abcde"[q["correta"]]})</span> '
                               f'{md_inline(q["explicacao"])}</p>' for i, q in enumerate(qs, 1))
            elif m.group(1) == "conceito":
                glo += f'<dt>{esc(d["termo"])}<small>cap. {n}</small></dt><dd>{md_inline(d["definicao"])}</dd>'
    corpo += [gab + "</section>", glo + "</dl></section>"]
    for letra, arq in (("C", "apendice-ia.md"), ("D", "apendice-calendario.md")):
        if completo and (TEXTO / arq).exists():
            corpo.append(f'<section class="apendice prosa" id="ap-{letra}">{md((TEXTO / arq).read_text())}</section>')
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{esc(proj["titulo"])}</title>'
            f'<link rel="stylesheet" href="livro.css"></head><body>{"".join(corpo)}</body></html>')


CSS_EXTRA = 'a.pg::after { content: target-counter(attr(href), page); }'


def build(caps: list[int], saida: Path, png: bool, grafica: bool, completo: bool) -> Path:
    from weasyprint import CSS, HTML
    html = html_livro(caps, True)
    SAIDA.mkdir(exist_ok=True)
    (SAIDA / "ultimo.html").write_text(html)
    extra = [CSS(string=CSS_EXTRA)]
    if grafica:
        extra.append(CSS(string="@page { bleed: 3mm; marks: crop; }"))
    doc = HTML(string=html, base_url=str(DIAG) + "/").render(stylesheets=extra)
    doc.write_pdf(saida)
    print(f"PDF: {saida}  ({len(doc.pages)} páginas)")
    if png:
        import pypdfium2 as pdfium
        qa = SAIDA / "qa" / (f"cap{caps[0]:02d}" if len(caps) == 1 else "livro")
        qa.mkdir(parents=True, exist_ok=True)
        for velho in qa.glob("*.png"):
            velho.unlink()
        pdf = pdfium.PdfDocument(str(saida))
        for i in range(len(pdf)):
            pdf[i].render(scale=1.6).to_pil().save(qa / f"p{i + 1:03d}.png")
        print(f"PNG de QA: {qa}/p001.png … p{len(pdf):03d}.png")
    return saida


# =====================================================================  gates e revisão
def nota_ponderada(notas: dict) -> tuple[float, float, list]:
    o = orq()
    crit = o["rubrica"]["criterios"]
    faltando = [k for k in crit if k not in notas]
    if faltando:
        raise SystemExit(f"revisão sem nota para: {faltando}")
    media = sum(float(notas[k]) * v["peso"] for k, v in crit.items()) / sum(v["peso"] for v in crit.values())
    minimo = o["gates"]["capitulo"]["criterio_minimo"]
    return round(media, 2), min(float(notas[k]) for k in crit), [k for k in crit if float(notas[k]) < minimo]


def registrar(n: int, arquivo: Path) -> None:
    g = orq()["gates"]["capitulo"]
    rev = yaml.safe_load(arquivo.read_text())
    media, minimo, abaixo = nota_ponderada(rev["notas"])
    bloq = rev.get("bloqueadores") or []
    li = lint(n, silencioso=True)
    e = estado()
    cap = e["capitulos"][n]
    anterior_ok = n == 1 or e["capitulos"][n - 1]["status"] == "aprovado"
    passou = media >= g["nota_minima"] and not abaixo and not bloq and not li["erros"]
    aprovado = passou and anterior_ok
    it = len(cap["iteracoes"]) + 1
    cap["iteracoes"].append({
        "iteracao": it, "data": f"{dt.datetime.now():%Y-%m-%d %H:%M}", "revisao": str(arquivo.relative_to(RAIZ.parent)),
        "media": media, "minimo": minimo, "abaixo_do_minimo": abaixo, "bloqueadores": len(bloq),
        "lint_erros": len(li["erros"]), "veredito": "aprovado" if aprovado else "reprovado"})
    cap["status"] = "aprovado" if aprovado else ("aprovado_pendente_ordem" if passou else "reprovado")
    if aprovado:  # promove em cascata quem passou e esperava a ordem
        k = n + 1
        while k <= 30 and e["capitulos"][k]["status"] == "aprovado_pendente_ordem":
            e["capitulos"][k]["status"] = "aprovado"
            print(f"cap{k:02d} promovido: aprovado (ordem liberada)")
            k += 1
    cap["nota"] = media
    if aprovado:
        cap.pop("alerta", None)
    elif it >= g["iteracoes_max"]:
        cap["alerta"] = "4ª reprovação: reescrever do zero com outro ângulo e registrar a decisão."
    salvar(e)
    motivo = "" if anterior_ok or not passou else f" (passou; aguarda a aprovação do cap. {n - 1})"
    print(f"cap{n:02d} iteração {it}: média {media} · mínimo {minimo} · abaixo de {g['criterio_minimo']}: {abaixo or '—'}"
          f" · bloqueadores {len(bloq)} · lint {len(li['erros'])} erro(s)  =>  {cap['status'].upper()}{motivo}")


def revisao_prompt(n: int) -> str:
    e = estado()
    it = len(e["capitulos"][n]["iteracoes"]) + 1
    anteriores = [x["revisao"] for x in e["capitulos"][n]["iteracoes"]]
    extra = ""
    if anteriores:
        extra += f"\n6. Revisões anteriores deste capítulo (confira se o que foi apontado foi resolvido): {', '.join(anteriores)}"
    if n > 1:
        extra += (f"\n7. Coerência: leia ao menos o capítulo {n - 1} já escrito em apostila/texto/ e confira elenco,"
                  " termos, remissões e repetição de imagens/exemplos.")
    return f"""Você é o revisor editorial independente da apostila impressa "Modo Singular".
Você NÃO escreveu o texto e não deve poupá-lo. Seu padrão é o de uma editora de não
ficção de primeira linha no Brasil. Nota 9 significa "excelente, só ajuste de linha".
Trabalhe a partir do diretório /home/user/modosingular.

LEIA, NESTA ORDEM:
0. Se `python3 -c "import weasyprint, yaml, markdown"` falhar: pip install -q weasyprint pyyaml markdown pypdfium2
1. apostila/ORQUESTRADOR.yaml — seções briefing, voz, antivicios, licoes_da_revisao (regras aprendidas
   em revisões anteriores; valem para este capítulo), elenco, estrutura_do_capitulo, figuras,
   rubrica e o plano do capítulo {n} em `capitulos`.
2. O capítulo-fonte do PWA:  python3 apostila/orquestrador.py fonte {n}
3. O manuscrito:  apostila/texto/cap{n:02d}.md  (os blocos ```...``` viram boxes, figuras,
   oficina com linhas de escrita etc. na diagramação).
4. O lint automático:  python3 apostila/orquestrador.py lint {n}
5. As páginas diagramadas: apostila/saida/qa/cap{n:02d}/pNNN.png. O capítulo começa na p011 (abertura)
   e vai até a página anterior ao "A. Gabarito comentado"; as demais são pré e pós-textuais.
   Abra com a ferramenta Read ao menos a abertura, duas páginas de texto com figura, a oficina,
   a seção de rede e o fechamento. Espaço em branco antes de uma seção que precisa de página
   inteira (autodiagnóstico, oficina) ou antes de um esqueleto de escrita indivisível é aceito
   pelo projeto; aponte os demais.{extra}

AVALIE cada critério da rubrica de 0 a 10 (use décimos). Cada nota abaixo de 9,5 precisa
de ao menos uma evidência citada entre aspas do próprio texto (ou da página, no caso de
"impresso"). Bloqueador = erro de fato, contradição com o método, violação da regra de
ouro, trecho que dependa de tela, número inventado apresentado como dado, problema ético.

ESCREVA o arquivo apostila/revisoes/cap{n:02d}-r{it}.yaml exatamente neste formato YAML:

capitulo: {n}
iteracao: {it}
notas: {{metodo: 0.0, voz: 0.0, originalidade: 0.0, clareza: 0.0, ritmo: 0.0, concretude: 0.0,
        coerencia: 0.0, aplicabilidade: 0.0, impresso: 0.0, honestidade: 0.0}}
bloqueadores: []            # lista de strings; vazia se não houver
pontos_fortes: []           # até 4
problemas:                  # do mais grave ao menos grave
  - criterio: voz
    trecho: "citação exata"
    por_que: "..."
    correcao: "reescrita sugerida ou instrução precisa"
edicoes_de_linha: []        # trocas pequenas "de -> para"
diagramacao: []             # problemas visuais concretos, com página
veredito: "uma frase"

Não edite o manuscrito nem nenhum outro arquivo além do YAML de revisão. Não rode o
comando registrar. Ao final, responda em até 80 palavras com a média estimada e os três
problemas mais graves.
"""


# =====================================================================  status
def status() -> None:
    o, e = orq(), estado()
    print(f"\n{o['projeto']['titulo'].upper()} — apostila impressa · orquestrador\n")
    for k, v in o["fases_do_projeto"].items():
        print(f"  {k} [{e.get('fases_do_projeto', {}).get(k, 'pendente'):>12}] {v}")
    print("\n  cap  status       nota  it  título")
    cont = {s: 0 for s in STATUS}
    for n in range(1, 31):
        c = e["capitulos"][n]
        cont[c["status"]] += 1
        nota = f'{c["nota"]:>5}' if c.get("nota") is not None else "    —"
        print(f"  {n:>3}  {c['status']:<11} {nota}  {len(c['iteracoes']):>2}  {o['capitulos'][n]['titulo']}"
              + (f"   ⚠ {c['alerta']}" if c.get("alerta") else ""))
    print("\n  " + " · ".join(f"{k}: {v}" for k, v in cont.items()))
    for titulo, chave in (("PENDÊNCIAS", "pendencias"), ("DECISÕES (últimas 5)", "decisoes")):
        itens = e.get(chave) or []
        if itens:
            print(f"\n  {titulo}")
            for p in itens[-5:]:
                print(f"   - {p}")
    prox = None
    for n in range(1, 31):
        s = e["capitulos"][n]["status"]
        if s == "reprovado":
            prox = f"revisar cap. {n} a partir de {e['capitulos'][n]['iteracoes'][-1]['revisao']} e pedir nova revisão"
        elif s == "em_revisao":
            prox = f"registrar a revisão do cap. {n} (apostila/revisoes/cap{n:02d}-r{len(e['capitulos'][n]['iteracoes']) + 1}.yaml)"
        elif s in ("planejado", "rascunho"):
            prox = (f"{'terminar' if s == 'rascunho' else 'escrever'} cap. {n} (plano: ORQUESTRADOR.yaml › capitulos.{n};"
                    f" fonte: `orquestrador.py fonte {n}`; modelo: texto/cap01.md)")
        if prox:
            break
    print(f"\n  PRÓXIMA AÇÃO: {prox or 'todos aprovados — revisão de livro, QA visual e entrega'}\n")


def fonte(n: int) -> None:
    c = json.loads((FONTE / f"cap{n:02d}.json").read_text())
    print(f"# FONTE cap. {n} — {c['tema']} ({c['subtitulo']})\nfrase: {c['frase']}")
    print(f"conceito: {c['conceito']['termo']} — {c['conceito']['definicao']}\n  por que: {c['conceito']['porqueImporta']}")
    print(f"ilustração: {c['ilustracao']['motivo']} — {c['ilustracao']['legenda']}\n\n## CONTEÚDO")
    for b in c["conteudo"]:
        t = b["t"]
        if t in ("p", "lead", "h"):
            print(("\n### " if t == "h" else "") + b["text"])
        elif t in ("diagram", "chart"):
            print(f"[{t}] " + json.dumps(b.get("diagram") or b.get("chart"), ensure_ascii=False))
        else:
            print(f"[{t}] " + json.dumps({k: v for k, v in b.items() if k != "t"}, ensure_ascii=False))
    print("\n## INSIGHTS\n- " + "\n- ".join(c["insights"]))
    print("\n## CRITÉRIOS\n" + "\n".join(f"- ({x['peso']}) {x['rotulo']} — {x['ajuda']}" for x in c["criterios"]))
    print("\n## QUIZ")
    for q in c["quiz"]:
        print(f"- {q['pergunta']} | " + " / ".join(f"{'*' if i == q['correta'] else ''}{o}" for i, o in enumerate(q["opcoes"])) + f" | {q['explicacao']}")
    if c.get("teste"):
        print("\n## TESTE\n" + json.dumps(c["teste"], ensure_ascii=False))
    print("\n## TAREFA\n" + json.dumps(c["tarefa"], ensure_ascii=False))
    print("\n## DIRETRIZES\n" + json.dumps(c["diretrizes"], ensure_ascii=False))
    print("\n## ESTRUTURA\n" + json.dumps(c["estrutura"], ensure_ascii=False))
    print("\n## ROTEIRO\n" + (c["roteiro"] or ""))


def faixa(s: str) -> list[int]:
    caps = []
    for parte in s.split(","):
        a, _, b = parte.partition("-")
        caps += list(range(int(a), int(b or a) + 1))
    return caps


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("status")
    for nome in ("fonte", "revisao-prompt"):
        sub.add_parser(nome).add_argument("n", type=int)
    sub.add_parser("lint").add_argument("n")
    p = sub.add_parser("marcar"); p.add_argument("n", type=int); p.add_argument("status", choices=["rascunho", "em_revisao"])
    p = sub.add_parser("registrar"); p.add_argument("n", type=int); p.add_argument("arquivo")
    sub.add_parser("decisao").add_argument("texto")
    p = sub.add_parser("pendencia"); p.add_argument("texto"); p.add_argument("--resolver", action="store_true")
    p = sub.add_parser("fase"); p.add_argument("fase"); p.add_argument("status")
    p = sub.add_parser("figurante"); p.add_argument("n", type=int); p.add_argument("profissao")
    p = sub.add_parser("build")
    p.add_argument("--caps"); p.add_argument("--png", action="store_true")
    p.add_argument("--grafica", action="store_true"); p.add_argument("--saida")
    p.add_argument("--completo", action="store_true")
    a = ap.parse_args()

    if a.cmd == "status":
        status()
    elif a.cmd == "fonte":
        fonte(a.n)
    elif a.cmd == "revisao-prompt":
        print(revisao_prompt(a.n))
    elif a.cmd == "lint":
        caps = [n for n in range(1, 31) if arq_cap(n).exists()] if a.n == "todos" else [int(a.n)]
        sys.exit(1 if any(lint(n)["erros"] for n in caps) else 0)
    elif a.cmd == "registrar":
        cand = [Path(a.arquivo), RAIZ / a.arquivo, RAIZ.parent / a.arquivo]
        registrar(a.n, next((c.resolve() for c in cand if c.exists()), cand[0]))
    elif a.cmd == "build":
        e = estado()
        caps = faixa(a.caps) if a.caps else [n for n in range(1, 31) if arq_cap(n).exists()]
        if a.completo:
            nao = [n for n in range(1, 31) if e["capitulos"][n]["status"] != "aprovado"]
            if nao:
                raise SystemExit(f"Gate final: capítulos não aprovados: {nao}")
        nome = "Modo-Singular-apostila" + ("-grafica" if a.grafica else "") + ("" if a.completo else "-parcial") + ".pdf"
        build(caps, Path(a.saida) if a.saida else SAIDA / nome, a.png, a.grafica, a.completo)
    else:
        e = estado()
        if a.cmd == "marcar":
            e["capitulos"][a.n]["status"] = a.status
        elif a.cmd == "decisao":
            e.setdefault("decisoes", []).append(f"{dt.date.today()}: {a.texto}")
        elif a.cmd == "pendencia":
            lst = e.setdefault("pendencias", [])
            if a.resolver:
                e["pendencias"] = [p for p in lst if a.texto not in p]
            else:
                lst.append(a.texto)
        elif a.cmd == "fase":
            e.setdefault("fases_do_projeto", {})[a.fase] = a.status
        elif a.cmd == "figurante":
            e.setdefault("figurantes", {}).setdefault(a.profissao, []).append(a.n)
        salvar(e)
        print("ok")


if __name__ == "__main__":
    main()
