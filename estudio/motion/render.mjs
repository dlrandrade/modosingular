import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import path from 'node:path';
const html = path.resolve(process.argv[2]), out = process.argv[3], FPS = 30;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const D = await p.evaluate(() => window.D), N = Math.round(D * FPS);
const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-movflags','+faststart',out,'-loglevel','error'], { stdio: ['pipe','inherit','inherit'] });
for (let i = 0; i < N; i++) { await p.evaluate(t => window.render(t), i / FPS); ff.stdin.write(await p.screenshot({ type: 'jpeg', quality: 95 })); }
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
