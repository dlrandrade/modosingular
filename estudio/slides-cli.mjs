// Ponte entre o gerador de PNG (Python) e o renderizador único dos slides (src/estudio/slides.ts).
// Entrada (stdin): {"slides": [...], "ctx": {...}}   Saída (stdout): ["<!doctype html>…", …]
import { pagina } from "../src/estudio/slides.ts";

let entrada = "";
process.stdin.setEncoding("utf8");
for await (const pedaco of process.stdin) entrada += pedaco;
const { slides, ctx } = JSON.parse(entrada);
process.stdout.write(JSON.stringify(slides.map((s, i) => pagina(s, i + 1, slides.length, ctx))));
