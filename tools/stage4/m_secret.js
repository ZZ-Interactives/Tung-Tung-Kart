
/* ---------- the owner's secret key: unlocks every stage ----------
   Tap the chapter title ("Dustbowl Valley") on the story map 5 times quickly, then enter the code.
   Only a salted SHA-256 of the code lives here, so reading the page doesn't reveal it. */
const S4KEY='1c9153ef972804a5cd986bba2e6224ccd232ae3819357632cf51288fdaf0c498';
async function s4Sha(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}catch(e){return '';}}
function s4SecretHook(){const el=$('stTitle');if(!el||el.dataset.s4k)return;el.dataset.s4k=1;let taps=[];
  el.addEventListener('pointerdown',()=>{const t=performance.now();taps=taps.filter(v=>t-v<2500);taps.push(t);if(taps.length>=5){taps=[];s4SecretAsk();}});}
function s4SecretAsk(){if($('s4Sec'))return;const st=document.createElement('style');st.textContent=`
#s4Sec{position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:rgba(10,8,28,.55)}
#s4Sec form{background:#17142e;border:3px solid #fffaf0;border-radius:14px;padding:16px;display:flex;gap:8px;box-shadow:0 6px 0 #000}
#s4Sec input{width:9em;font:700 22px monospace;letter-spacing:.3em;text-align:center;padding:8px;border-radius:8px;border:2px solid #3ee0ff;background:#0c0a20;color:#fffaf0}
#s4Sec button{font:800 16px sans-serif;padding:0 14px;border-radius:8px;border:2px solid #17142e;background:#3ee0ff;color:#17142e}
#s4Sec.no form{animation:s4no .35s}@keyframes s4no{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}`;
  const w=document.createElement('div');w.id='s4Sec';w.innerHTML='<form autocomplete="off"><input type="password" inputmode="numeric" maxlength="8" aria-label="Code"><button type="submit">OK</button></form>';w.appendChild(st);document.body.appendChild(w);
  const inp=w.querySelector('input'),close=()=>w.remove();setTimeout(()=>inp.focus(),30);
  w.addEventListener('pointerdown',e=>{if(e.target===w)close();});
  w.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const ok=(await s4Sha('tung4:'+inp.value.trim()))===S4KEY;
    if(!ok){w.classList.add('no');setTimeout(close,400);return;}
    close();if(!STORY.data)return;STORY.data.dev4=true;try{sSave();}catch(_){}SFX.tick&&SFX.tick();showMsg&&showMsg('All stages unlocked',2,'good');showHub();});}
