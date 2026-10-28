// Ponte entre o gerador de PNG (Python) e o renderizador único dos slides (src/estudio/slides.ts).
// Entrada (stdin): {"slides": [...], "ctx": {...}, "reels"?: true}   Saída (stdout): ["<!doctype html>…", …]
// Com "reels": as figuras em 1080 × 1920, para ficar acima da cabeça no Reels gravado em selfie.
// Com "verificador": devolve o código de textosQueEncostam, para o Chromium do gerador rodar em cada slide.
import { pagina, paginaReels, textosQueEncostam } from "../src/estudio/slides.ts";

let entrada = "";
process.stdin.setEncoding("utf8");
for await (const pedaco of process.stdin) entrada += pedaco;
const { slides, ctx, reels, verificador } = JSON.parse(entrada);
if (verificador) { process.stdout.write(JSON.stringify(String(textosQueEncostam))); process.exit(0); }
process.stdout.write(JSON.stringify(slides.map((s, i) => (reels ? paginaReels(s, ctx) : pagina(s, i + 1, slides.length, ctx)))));
