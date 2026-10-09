import re,sys
import os
HERE=os.path.dirname(os.path.abspath(__file__))
P=os.path.join(HERE,'..','public','index.html')
s=open(P).read()
fd=open(os.path.join(HERE,'free_drive.js')).read()
def rep(a,b,cnt=1):
    global s
    if b in s: return  # already applied
    n=s.count(a); assert n==cnt,(n,a[:90]); s=s.replace(a,b)
# module
if '/* ==== FREE DRIVE BEGIN ==== */' in s:
    s=re.sub(r'/\* ==== FREE DRIVE BEGIN ==== \*/.*?/\* ==== FREE DRIVE END ==== \*/\n',lambda m:fd,s,flags=re.S)
else:
    rep('/* ============ boot ============ */',fd+'/* ============ boot ============ */')
# engine hooks
rep("function locate(o){\n","function locate(o){\n  if(FD&&FD.on){o.idx=0;o.segA=0;o.segT=0;o.lat=0;o.deckY=o.y||0;return;}\n")
rep("function groundY(o){if(o.roam)","function groundY(o){if(FD&&FD.on)return fdGround(o);if(o.roam)")
rep("const onGrass=!k.air&&!ELEV[k.idx]&&Math.abs(k.lat)>HALF+KERB&&!k.roam;","const onGrass=k.free?(!k.air&&!!k.off):(!k.air&&!ELEV[k.idx]&&Math.abs(k.lat)>HALF+KERB&&!k.roam);")
rep("else if(onGrass&&k.prismT<=0)top*=.45;","else if(onGrass&&k.prismT<=0)top*=k.free?.66:.45;")
rep("if(k.roam){const dx=k.x-MCX,dz=k.z-MCZ,dd=Math.hypot(dx,dz);if(dd>560)","if(k.roam&&!k.free){const dx=k.x-MCX,dz=k.z-MCZ,dd=Math.hypot(dx,dz);if(dd>560)")
rep("if(k.fly){const gy=GAP[k.idx]?","if(k.fly){const gy=k.free?Math.max(groundY(k),FDK.WL):GAP[k.idx]?")
rep("const sl=((C[(k.segA+1)%N].y-C[k.segA].y)/Math.max(.1,SEG[k.segA]));","const sl=k.free?(k.fdSl||0):((C[(k.segA+1)%N].y-C[k.segA].y)/Math.max(.1,SEG[k.segA]));")
rep("const onGrass=!ELEV[k.idx]&&Math.abs(k.lat)>HALF+KERB;","const onGrass=k.free?(k.off&&!k.wet):(!ELEV[k.idx]&&Math.abs(k.lat)>HALF+KERB);")
rep("if(k.isPlayer&&SET.cam===1&&!(input.look||pad.look)&&(S.mode==='race'||S.mode==='countdown'))vis=false;","if(k.isPlayer&&SET.cam===1&&!(input.look||pad.look)&&(S.mode==='race'||S.mode==='countdown'||(S.mode==='free'&&!(FD&&FD.cine.on))))vis=false;")
rep("  if(S.mode==='menu'){showroomFrame(dt);draw(showScene);return;}\n","  if(FD&&FD.on&&(S.mode==='free'||S.mode==='paused')){fdFrame(dt,rawDt);draw(scene);return;}\n  if(S.mode==='menu'){showroomFrame(dt);draw(showScene);return;}\n")
rep("if(on&&(S.mode==='race'||S.mode==='countdown'||S.mode==='roam'||S.mode==='fly'||S.mode==='flyend')){","if(on&&(S.mode==='race'||S.mode==='countdown'||S.mode==='roam'||S.mode==='free'||S.mode==='fly'||S.mode==='flyend')){")
rep("function toMenu(){if(STORY.on)return storyExitRace();","function toMenu(){if(FD&&FD.on)return fdExit();if(STORY.on)return storyExitRace();")
rep("$('eRestart').onclick=()=>{stopMusic();closeEsc();startRace(true);};","$('eRestart').onclick=()=>{stopMusic();closeEsc();if(FD&&FD.on)return fdStart();startRace(true);};")
rep("$('go').onclick=()=>{initAudio();if(MODE==='gp')","$('go').onclick=()=>{initAudio();if(MODE==='free')return fdStart();if(MODE==='gp')")
rep("function itemDown(){if(STORY.s3)","function itemDown(){if(FD&&FD.on){if(S.mode==='free')fdHorn();return;}if(STORY.s3)")
rep("function itemUp(){if(STORY.s3)","function itemUp(){if(FD&&FD.on)return;if(STORY.s3)")
rep("const MODES=['gp','arcade','online','story'];","const MODES=['gp','arcade','online','free','story'];")
rep("  MODE=m;store.set('tungtung-mode',m);$('modes').hidden=true;","  MODE=m;if(m!=='free')store.set('tungtung-mode',m);$('modes').hidden=true;")
# syncMenu end hook: append call at end of syncMenu
rep("$('best').textContent=!gp&&b?'Your best lap here at '+SET.cc+'cc: '+fmt(b,true):gp?'Points after every race: 15 for 1st down to 1 for 12th.':'';\n}",
    "$('best').textContent=!gp&&b?'Your best lap here at '+SET.cc+'cc: '+fmt(b,true):gp?'Points after every race: 15 for 1st down to 1 for 12th.':'';\n  fdSyncMenu();\n}")
rep("$('artOnline').src=onlineArt();buildOnlineUI();","$('artOnline').src=onlineArt();buildOnlineUI();fdMenuInit();")
# HTML: mode card (between arcade and online)
rep('''    <button class="mcard" data-mode="story" role="radio">''','''    <button class="mcard" data-mode="free" role="radio"><span class="art"><img id="artFree" alt=""></span><span class="tag">Chill</span><span class="mlab"><b>Free Drive</b><small>An endless road that builds itself. No timer, just cruise.</small></span></button>
    <button class="mcard" data-mode="story" role="radio">''')
rep('<div class="mcards four" role="radiogroup" aria-label="Game mode">','<div class="mcards four five" role="radiogroup" aria-label="Game mode">')
# menu options panel
rep('''    <h2 id="mapH">Choose a track</h2>''','''    <div class="fdopts">
      <div id="fdBig"><img id="fdImg" alt=""><div class="mbcap"><b id="fdName"></b><span id="fdSub"></span></div></div>
      <h2>Scenery</h2><div class="seg wrap" id="fdBioSeg" role="radiogroup" aria-label="Scenery"></div>
      <h2>Time of day</h2><div class="seg" id="fdTimeSeg" role="radiogroup" aria-label="Time of day"></div>
      <p class="fdnote">The road never ends and is different every time. Drive off it whenever you like.<span class="fdkeys"><kbd>T</kbd> auto-drive <kbd>V</kbd> cinematic camera <kbd>R</kbd> back to road <kbd>H</kbd> hide HUD <kbd>Space</kbd> honk</span></p>
    </div>
    <h2 id="mapH">Choose a track</h2>''')
# HUD
rep('''  <div id="rank"></div>''','''  <div id="rank"></div>
  <div id="fdHud" hidden><div class="fdcard"><small>Free Drive</small><b id="fdBio">On the road</b><span><i id="fdOdo">0.0 km</i><em id="fdAuto">AUTO</em></span></div><div id="fdToast"></div></div>''')
rep("if(j&&j.ok&&Array.isArray(j.iceServers)&&j.iceServers.length){window.TT_PEER_CFG=","if(j&&j.ok&&Array.isArray(j.iceServers)&&j.iceServers.length){RELAY.via=j.via;window.TT_PEER_CFG=")
rep("if(ok)netLog('Relay: Cloudflare ready');","if(ok)netLog('Relay: ready ('+(RELAY.via||'relay')+')');")
# CSS
css='''
/* free drive */
/* five mode cards always fit on one screen: sized by both width and height */
.mcards.four.five{flex-direction:row;flex-wrap:nowrap;overflow:visible;gap:clamp(8px,1.6vw,26px);padding:clamp(8px,2vh,20px) clamp(10px,2vw,22px) clamp(54px,9vh,70px)}
.mcards.four.five .mcard{flex:none;width:min(17.4vw,calc((100vh - 200px)*.78),270px);aspect-ratio:5/6.4}
.mcards.four.five .mcard.sel{transform:translateY(-6px) scale(1.03)}
.mcards.five .mcard .mlab{padding:clamp(6px,1.2vh,12px) clamp(8px,1vw,14px)}
.mcards.five .mcard .mlab b{font-size:clamp(13px,1.85vw,26px)}
.mcards.five .mcard .mlab small{font-size:clamp(9.5px,1vw,13px);margin-top:3px}
.mcards.five .mcard .tag{left:clamp(6px,.8vw,12px);top:clamp(6px,.8vw,12px);padding:clamp(2px,.3vw,5px) clamp(5px,.7vw,10px);font-size:clamp(8.5px,.85vw,12px);border-width:2px}
@media (max-height:520px){.mcards.four.five{padding-bottom:12px}.mcards.five .mcard .mlab small{display:none}}
@media (max-width:760px) and (orientation:portrait){
  .mcards.four.five{display:grid;grid-template-columns:1fr 1fr;align-content:center;gap:10px;padding:10px 14px 14px}
  .mcards.four.five .mcard{width:auto;aspect-ratio:auto;height:calc((100svh - 130px)/3 - 7px);min-height:120px}
  .mcards.four.five .mcard:last-child{grid-column:1/-1}
  .mcards.five .mcard .mlab b{font-size:17px}.mcards.five .mcard .mlab small{font-size:11px}.mcards.five .mcard .tag{font-size:10px}
}
.mcard[data-mode="free"] .tag{background:#ff8a1a}
.fdopts{display:none;flex-direction:column;gap:2px}
#menu.free .fdopts{display:flex}
#menu.free #segMode,#menu.free #mapH,#menu.free #mapBig,#menu.free #maps,#menu.free #best,#menu.free .row>div:nth-child(n+2){display:none!important}
#fdBig{position:relative;border:3px solid #17142e;border-radius:10px;overflow:hidden;aspect-ratio:16/10;background:#17142e;flex:none}
#fdBig img{width:100%;height:100%;object-fit:cover;display:block}
.seg.wrap{flex-wrap:wrap}
.fdnote{margin:8px 0 0;font-size:12.5px;font-weight:600;color:#4a4566;line-height:1.45}
.fdkeys{display:block;margin-top:6px;font-size:12px;font-weight:700;color:#17142e}
.fdkeys kbd{font:800 10.5px var(--body);border:2px solid #17142e;border-radius:4px;padding:0 4px;margin:0 2px 0 6px;color:#17142e;background:none;min-width:0;display:inline-block;line-height:1.4}
.fdkeys kbd:first-child{margin-left:0}
body.touch .fdkeys{display:none}
body.free #timer,body.free #tower,body.free #rank,body.free #bottomL,body.free #itemSlot,body.free #warn{display:none!important}
body.free #speedo{display:block!important}
#fdHud{position:absolute;left:calc(var(--u)*2);top:calc(var(--u)*2 + env(safe-area-inset-top,0px));pointer-events:none}
#fdHud[hidden]{display:none}
.fdcard{display:flex;flex-direction:column;gap:3px;padding:10px 14px;border:3px solid #17142e;border-radius:12px;background:rgba(255,250,240,.94);color:#17142e;box-shadow:4px 5px 0 #17142e;min-width:170px}
.fdcard small{font:800 10.5px var(--body);letter-spacing:.16em;text-transform:uppercase;color:#6a6582}
.fdcard b{font-family:var(--display);font-weight:400;font-size:clamp(15px,1.6vw,20px);line-height:1}
.fdcard span{display:flex;gap:10px;align-items:center;font:800 14px var(--body)}
.fdcard i{font-style:normal}
.fdcard em{display:none;font:800 10.5px var(--body);font-style:normal;letter-spacing:.1em;padding:2px 6px;border-radius:5px;background:#21a05a;color:#fff}
.fdcard em.on{display:inline-block}
#fdToast{position:fixed;left:50%;top:18%;transform:translate(-50%,-8px);padding:9px 18px;border-radius:10px;background:rgba(23,20,46,.82);color:#fffaf0;font:800 15px var(--body);letter-spacing:.04em;white-space:nowrap;opacity:0;transition:opacity .4s,transform .4s}
#fdToast.on{opacity:1;transform:translate(-50%,0)}
body.free #mm{top:auto;bottom:calc(var(--u)*2);left:calc(var(--u)*2);border-radius:50%}
body.touch.free #mm{bottom:auto;top:calc(var(--u)*2 + 96px);width:calc(var(--u)*14);height:calc(var(--u)*14)}
body.fdclean #hud>*:not(#msg){display:none!important}
'''
rep('#tower,#speedo{display:none!important}\n','#tower,#speedo{display:none!important}\n'+css.lstrip('\n'))
rep("get MAP(){return MAP;},hitKart,finishKart};","get MAP(){return MAP;},hitKart,finishKart,get FD(){return FD;},fdStart,fdSim:(n,dt)=>{dt=dt||1/30;const t0=performance.now();for(let i=0;i<n;i++){S.t+=dt;fdFrame(dt,dt);}return performance.now()-t0;},fdBench:(lvl,n)=>{const out=[];for(let i=0;i<n;i++){const t0=performance.now();const ch=fdBuildChunk(Math.floor(player.x/128)+i-2,Math.floor(player.z/128)+3,lvl);out.push(+(performance.now()-t0).toFixed(1));fdFree(ch.g);}return out;},get FDA(){return FDA;}};")

rep('''    <button id="bMute" aria-label="Sound on or off" title="Sound (M)">''','''    <button id="bAuto" class="fdonly" aria-label="Auto-drive" title="Auto-drive (T)"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M3.8 10.5h6M14.2 10.5h6M12 14.2v6.2"/></svg></button>
    <button id="bReset" class="fdonly" aria-label="Back to the road" title="Back to the road (R)"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg></button>
    <button id="bMute" aria-label="Sound on or off" title="Sound (M)">''')
rep("body.fdclean #hud>*:not(#msg){display:none!important}\n","body.fdclean #hud>*:not(#msg){display:none!important}\nbody:not(.free) .fdonly{display:none!important}\nbody.free #bAuto.on{background:#21a05a}\n")
rep("$('bPause').onclick=()=>pause(true);","$('bPause').onclick=()=>pause(true);$('bAuto').onclick=()=>{if(FD&&FD.on&&S.mode==='free'){FD.auto=!FD.auto;fdToast(FD.auto?'Auto-drive on':'Auto-drive off',1.6);}};$('bReset').onclick=()=>{if(FD&&FD.on&&S.mode==='free')fdReset();};")
open(P,'w').write(s)
print('ok',len(s))
