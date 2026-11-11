// Uso: node render.mjs cena.html saida.mp4   (precisa de playwright, ffmpeg e python3+numpy)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const html = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]), FPS = 30;
const base = out.replace(/\.mp4$/, '');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const D = await p.evaluate(() => window.D), N = Math.round(D * FPS);
// eventos de sincronia: cada linha entra em a+t; cada cena termina em b
const ev = await p.evaluate(() => ({ D: window.D, cenas: window.S.map(sc => ({ a: sc.a, b: sc.b, linhas: sc.L.map(l => ({ t: sc.a + l.t, c: l.c })) })) }));
fs.writeFileSync(base + '.eventos.json', JSON.stringify(ev));
const mudo = base + '.mudo.mp4';
const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-movflags','+faststart',mudo,'-loglevel','error'], { stdio: ['pipe','inherit','inherit'] });
for (let i = 0; i < N; i++) { await p.evaluate(t => window.render(t), i / FPS); ff.stdin.write(await p.screenshot({ type: 'jpeg', quality: 95 })); }
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
const here = path.dirname(new URL(import.meta.url).pathname);
execFileSync('python3', ['-I', path.join(here, 'audio.py'), base + '.eventos.json', base + '.wav'], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-y','-i',mudo,'-i',base + '.wav','-c:v','copy','-c:a','aac','-b:a','256k','-shortest','-movflags','+faststart',out,'-loglevel','error'], { stdio: 'inherit' });
fs.rmSync(mudo); fs.rmSync(base + '.eventos.json'); fs.rmSync(base + '.wav');
