// Uso: node portas-render.cjs saida.png "ESQ1|ESQ2" "DIR1|DIR2|DIR3" [fontSize]
const {chromium}=require('playwright');
(async()=>{const [out,e,d,fs]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',x=>console.log('ERR',x.message));
const q=new URLSearchParams({e,d,...(fs?{fs}:{})}).toString();
await p.goto('file://'+process.cwd()+'/portas.html?'+q);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.screenshot({path:out});await b.close()})()
