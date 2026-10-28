#!/usr/bin/env python3
"""Imposição do PDF de leitura em A4 paisagem, duas páginas por face, frente e verso.

Uso:
  python3 apostila/imposicao.py caderno   # cadernos para dobrar ao meio (miolo grampeado/costurado/colado)
  python3 apostila/imposicao.py corte     # folhas para cortar ao meio e encadernar

Imprimir sempre: A4, paisagem, tamanho real (100%, sem "ajustar à página"), frente e verso,
virar pela borda CURTA. As páginas do livro (170 x 240 mm) entram a 87%, sem cortar nada.
"""
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter, Transformation, PageObject

AQUI = Path(__file__).parent
ORIGEM = AQUI / "saida" / "Modo-Singular-apostila.pdf"
A4_L, A4_A = 841.89, 595.28          # A4 paisagem, em pt
CADERNO = 32                          # páginas por caderno (8 folhas dobradas)


def folha(leitor, esq, dir_, escala, larg, alt):
    """Uma face A4: página `esq` à esquerda, `dir_` à direita (None = em branco)."""
    p = PageObject.create_blank_page(width=A4_L, height=A4_A)
    for n, x0 in ((esq, 0), (dir_, A4_L / 2)):
        if n is None or n > len(leitor.pages):
            continue
        t = Transformation().scale(escala).translate(x0 + (A4_L / 2 - larg * escala) / 2, (A4_A - alt * escala) / 2)
        p.merge_transformed_page(leitor.pages[n - 1], t)
    return p


def main(modo):
    leitor = PdfReader(str(ORIGEM))
    total = len(leitor.pages)
    larg, alt = float(leitor.pages[0].mediabox.width), float(leitor.pages[0].mediabox.height)
    escala = min(A4_L / 2 / larg, A4_A / alt)
    faces = []  # (esq, dir) por face, na ordem de impressão
    if modo == "caderno":
        n_pag = -(-total // 4) * 4
        inicio = 0
        while inicio < n_pag:
            n = min(CADERNO, n_pag - inicio)
            for k in range(n // 4):
                faces.append((inicio + n - 2 * k, inicio + 2 * k + 1))      # frente
                faces.append((inicio + 2 * k + 2, inicio + n - 2 * k - 1))  # verso
            inicio += n
        nome = "Modo-Singular-apostila-A4-caderno.pdf"
    else:
        folhas = -(-total // 4)          # cada folha A4 tem 2 folhas de livro (4 páginas)
        for s in range(1, folhas + 1):
            faces.append((2 * s - 1, 2 * s - 1 + 2 * folhas))   # frente: folha s | folha s + N
            faces.append((2 * s + 2 * folhas, 2 * s))            # verso, virando na borda curta
        nome = "Modo-Singular-apostila-A4-corte.pdf"
    w = PdfWriter()
    for e, d in faces:
        w.add_page(folha(leitor, e, d, escala, larg, alt))
    w.add_metadata({"/Title": "Modo Singular (A4, 2 páginas por face, " + modo + ")", "/Author": "Daniel Luzz"})
    saida = AQUI / "saida" / nome
    w.write(str(saida))
    print(f"{saida}: {len(faces)} faces = {len(faces) // 2} folhas A4, escala {escala:.4f}, {total} páginas de livro")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in ("caderno", "corte"):
        sys.exit(__doc__)
    main(sys.argv[1])
