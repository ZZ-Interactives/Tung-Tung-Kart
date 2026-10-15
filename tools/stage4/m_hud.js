
/* ---------- HUD ---------- */
function s4HudInit(){if(!$('s4Css')){const st=document.createElement('style');st.id='s4Css';st.textContent=`
#s4Hud{position:fixed;inset:0;pointer-events:none;z-index:6;font-family:Bungee,Impact,sans-serif;transition:opacity .6s}#s4Hud.fade{opacity:0}
#s4Mirror{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;width:min(30vw,380px);aspect-ratio:3/1;border-radius:10px;border:3px solid #17142e;box-shadow:0 0 0 2px #fffaf0,0 4px 0 2px #17142e;overflow:hidden;transition:box-shadow .2s}
#s4Mirror::after{content:'';position:absolute;inset:0;border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,0) 40%);}
#s4Mirror.danger{box-shadow:0 0 0 3px #ff3a4a,0 6px 0 3px #17142e,0 0 28px 6px rgba(255,40,60,.7)}
#s4MirL{display:none}
#s4Turn{position:absolute;bottom:calc(46vh + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);opacity:0;transition:opacity .25s;filter:drop-shadow(0 4px 0 #17142e)}
#s4Turn.on{opacity:1}#s4Turn i{display:block;width:64px;height:64px;background:#3ee0ff;clip-path:polygon(0 38%,55% 38%,55% 12%,100% 50%,55% 88%,55% 62%,0 62%)}#s4Turn i.l{transform:scaleX(-1)}#s4Turn i.u{transform:rotate(-90deg)}#s4Turn.near i{animation:s4t .5s ease-in-out infinite alternate}@keyframes s4t{to{background:#fffaf0}}
#s4Route{position:absolute;left:calc(var(--u)*2.2);top:calc(var(--u)*10.2 + 54px);width:min(24vw,260px);padding-top:4px}#s4Route .ln{position:relative;height:10px;border-radius:6px;background:rgba(23,20,46,.75);border:2px solid #17142e;box-shadow:0 0 0 2px rgba(255,250,240,.85)}#s4Route .fl{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:linear-gradient(90deg,#ffd23f,#ff8a3a)}
#s4Route .dt{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#17142e;border:2px solid #fffaf0;transition:background .3s}#s4Route .dt.done{background:#ffd23f}#s4Route .dt.end{width:16px;height:16px;margin:-8px 0 0 -8px;background:#ff3a4a}
#s4Route b{position:absolute;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#c98a4e;border:3px solid #fffaf0;box-shadow:0 2px 0 #17142e;z-index:2}
#s4RouteN{display:block;margin-top:10px;font-size:13px;color:#fffaf0;text-shadow:0 2px 0 #17142e,0 0 6px rgba(0,0,0,.6);letter-spacing:.04em;white-space:nowrap}#s4RouteN small{font-size:10px;color:#ffd23f;margin-right:6px}
#s4Count{position:absolute;right:14px;top:calc(14px + min(10vw,126.7px) + 14px);display:flex;flex-direction:column;align-items:flex-end;gap:6px}#s4Count span{background:rgba(23,20,46,.78);color:#fffaf0;border:3px solid #17142e;border-radius:10px;padding:3px 10px;font-size:15px;box-shadow:0 3px 0 #17142e}#s4Count span i{font-style:normal;color:#5fd8ff}#s4Count span u{text-decoration:none;color:#ff6a7a}
#s4Zone{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);font-size:min(6vw,54px);color:#fffaf0;text-shadow:0 5px 0 #17142e,0 0 24px rgba(0,0,0,.5);opacity:0;white-space:nowrap;letter-spacing:.04em}
#s4Zone.on{animation:s4z 3.2s ease forwards}@keyframes s4z{0%{opacity:0;transform:translate(-50%,-30%) scale(.9)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%)}}
#s4Danger{position:absolute;left:0;right:0;bottom:0;height:26vh;background:linear-gradient(0deg,rgba(255,30,50,.42),rgba(255,30,50,0));opacity:0;transition:opacity .2s}
#s4Danger.on{opacity:1;animation:s4p .5s ease-in-out infinite alternate}@keyframes s4p{from{opacity:.55}to{opacity:1}}
#s4Chev{position:absolute;left:50%;bottom:5vh;transform:translateX(-50%);display:flex;gap:6px;opacity:0}#s4Chev.on{opacity:1}#s4Chev i{width:22px;height:14px;background:#ff3a4a;clip-path:polygon(0 0,50% 70%,100% 0,100% 30%,50% 100%,0 30%);animation:s4c .6s infinite}#s4Chev i:nth-child(2){animation-delay:.12s}#s4Chev i:nth-child(3){animation-delay:.24s}@keyframes s4c{0%,100%{opacity:.3}50%{opacity:1}}
body.city #timer{display:none!important}body.city #sBoss{top:auto!important;bottom:calc(16px + env(safe-area-inset-bottom,0px))}
body.city #banner{font-size:calc(var(--u)*4.6);top:23%}body.city #banner.big{font-size:calc(var(--u)*4.2)}body.city #banner small{font-size:.5em}
#hud.cine4{opacity:0;transition:opacity .3s}body.city #msg{font-size:calc(var(--u)*2.1);padding:4px 14px}
@media (max-width:700px){#s4Route{width:38vw;top:calc(var(--u)*10.2 + 40px)}#s4Mirror{width:40vw}#s4Count{top:calc(14px + 13.3vw + 14px)}#s4Turn i{width:48px;height:48px}}
`;document.head.appendChild(st);}
  let h=$('s4Hud');if(!h){h=document.createElement('div');h.id='s4Hud';h.innerHTML='<div id="s4Danger"></div><div id="s4Mirror"></div>'+
    '<div id="s4Route"><div class="ln" id="s4RouteLn"><div class="fl" id="s4RouteF"></div><b id="s4RouteB"></b></div><span id="s4RouteN"></span></div><div id="s4Count"><span>💧 <i id="s4Bot">0</i>/5</span><span>🤖 <u id="s4Wr">0</u> wrecked</span></div><div id="s4Zone"></div><div id="s4Chev"><i></i><i></i><i></i></div>';document.body.appendChild(h);}
  h.hidden=false;h.classList.remove('fade');
  /* route landmarks: evenly spaced dots, so the marker moves steadily from one to the next */const P=S4.path,L=P.L;S4.marks4=[['RUNWAY',0],['PIPE STREET',P.ns[5]],['GROK-MART',P.ns[7]],['THE FOUR-WAY',P.ns[10]],['GRAND AVENUE',P.ns[11]],['THE CASTLE',L]];
  const n=S4.marks4.length;$('s4RouteLn').querySelectorAll('.dt').forEach(e=>e.remove());S4.dots4=S4.marks4.map((m,i)=>{const d=document.createElement('i');d.className='dt'+(i===n-1?' end':'');d.style.left=(i/(n-1)*100)+'%';$('s4RouteLn').appendChild(d);return d;});S4.routeI=-1;
  S4.mirrorEl=$('s4Mirror');}
function s4Hud(dt){const c=S4;if(!c||!$('s4Hud'))return;const P=S4.path;
  {const M=c.marks4,n=M.length,ps=Math.max(c.ps||0,0);let i=0;while(i<n-2&&ps>=M[i+1][1])i++;const f=Math.min(1,(i+Math.min(1,(ps-M[i][1])/Math.max(1,M[i+1][1]-M[i][1])))/(n-1)),pc=(f*100).toFixed(1)+'%';
    $('s4RouteF').style.width=pc;$('s4RouteB').style.left=pc;if(c.routeI!==i){c.routeI=i;c.dots4.forEach((d,k)=>d.classList.toggle('done',k<=i));$('s4RouteN').innerHTML='<small>NEXT</small>'+M[i+1][0];}}$('s4Bot').textContent=c.bottlesGot;$('s4Wr').textContent=c.wrecked;
  /* (turn arrows live over the intersections themselves, not on the screen) */
  /* danger: a bot is right behind you */
  const close=c.closest!=null&&c.closest<16&&c.mode==='play',bossClose=c.boss&&c.boss.mode==='chase'&&(c.ps-c.boss.s)<16;
  $('s4Danger').classList.toggle('on',!!(close||bossClose));$('s4Chev').classList.toggle('on',!!(close||bossClose));c.mirrorEl.classList.toggle('danger',!!(close||bossClose||(c.closest!=null&&c.closest<32)));
  drawSpeedo(player);}
/* ---------- the rear-view mirror: a second camera looking back, drawn into the frame at the top ---------- */
function s4MirrorInit(){const c=S4;const w=QUAL==='low'?360:QUAL==='ultra'?720:560,h=Math.round(w/3);const rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
  const mc=new THREE.PerspectiveCamera(46,3,.5,900);const qs=new THREE.Scene(),qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);const mm=new THREE.MeshBasicMaterial({map:rt.texture,toneMapped:false,depthTest:false,depthWrite:false});
  rt.texture.wrapS=THREE.RepeatWrapping;rt.texture.repeat.x=-1;rt.texture.offset.x=1;/* a mirror is flipped */
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mm);qs.add(quad);c.mirror={rt,mc,qs,qc,frame:0};}
function s4Mirror(){try{s4MirrorIn();}catch(e){console.error('s4 mirror',e);try{renderer.setRenderTarget(null);renderer.setScissorTest(false);}catch(_){}}}
function s4MirrorIn(){const c=S4;if(!c||!c.mirror||S.mode!=='city'&&S.mode!=='paused'||!c.mirrorEl)return;const M=c.mirror;M.frame++;
  const k=player,fx=Math.sin(k.h),fz=Math.cos(k.h);
  if(QUAL!=='low'||M.frame%2===0){M.mc.position.set(k.x+fx*.4,k.y+2.3,k.z+fz*.4);M.mc.lookAt(k.x-fx*40,k.y+.8,k.z-fz*40);M.mc.updateMatrixWorld();
    const au=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;const kv=k.model.group.visible;k.model.group.visible=false;
    /* the mirror only needs what's close behind you: hide far chunks for this pass */const hid=[];for(const ch of c.chunks.values()){if(ch.g&&ch.g.visible&&Math.hypot(ch.cx-k.x,ch.cz-k.z)>330){ch.g.visible=false;hid.push(ch.g);}}
    renderer.setRenderTarget(M.rt);renderer.render(scene,M.mc);renderer.setRenderTarget(null);for(const g of hid)g.visible=true;k.model.group.visible=kv;renderer.shadowMap.autoUpdate=au;}
  const r=c.mirrorEl.getBoundingClientRect(),H=renderer.domElement.clientHeight||innerHeight;if(r.width<4)return;
  renderer.setScissorTest(true);renderer.setViewport(r.left,H-r.bottom,r.width,r.height);renderer.setScissor(r.left,H-r.bottom,r.width,r.height);
  renderer.render(M.qs,M.qc);renderer.setScissorTest(false);renderer.setViewport(0,0,renderer.domElement.clientWidth||innerWidth,renderer.domElement.clientHeight||innerHeight);}

