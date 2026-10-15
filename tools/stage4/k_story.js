
/* ---------- the script ---------- */
function s4Script(){const c=S4,E=(s,f,rep)=>c.ev.push({s,f,rep:!!rep,done:false});c.ev=[];c.ei=0;
  for(const [sg,t] of S4PLAN.names){const nm=S4SEG[sg].name;if(nm)E(s4S(sg,t),()=>s4Zone(nm));}
  for(const [sg,t,name] of S4PLAN.cps)if(sg>0){const s=s4S(sg,t);E(s,()=>s4CP(name,s));}
  for(const [sg,t,n,msg] of S4PLAN.chases)E(s4S(sg,t),()=>s4Chase(n,msg),true);
  for(const [sg,t,n] of S4PLAN.flyers)E(s4S(sg,t),()=>s4FlyIn(n),true);
  E(s4S(10,4),()=>s4Music('grokzone'));
  E(s4S(9,165),()=>{s4Say('Tralalero','See the big crossing up ahead? Go STRAIGHT! Straight through!',3.8);});
  E(s4S(9,244),()=>s4CollapseStart());
  E(s4S(11,48),()=>s4BossStart());
  E(s4S(13,360),()=>{if(S4.boss&&S4.boss.mode!=='dead'&&S4.boss.mode!=='dying')s4Say('Tralalero','That cracked pillar holding up the overpass! Ram it, RAM IT!',3.4);});
  E(s4S(16,30),()=>s4EndStart());
  c.ev.sort((a,b)=>a.s-b.s);}
function s4Zone(name){const c=S4;if(c.zoneName===name)return;c.zoneName=name;const el=$('s4Zone');if(!el)return;el.textContent=name;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
function s4Music(k){if(S4.song===k)return;S4.song=k;stopMusic();startMusic(k);}
/* ---------- per-frame scripted things: the pipe, the fire, the collapse, arrows, targets ---------- */
function s4Events(dt){const c=S4,k=player;
  /* Pipe Street */
  const P=c.pipe;if(P&&!P.done){const d=Math.hypot(k.x-P.x,k.z-P.z);P.g.children.forEach(o=>{if(o.geometry&&o.geometry.type==='TorusGeometry'){o.scale.setScalar(1+.15*Math.sin(S.t*6));}});
    if(Math.random()<dt*10)FX.emit(P.x-1.3,P.y+(Math.random()-.5),P.z+(Math.random()-.5)*2,-2-Math.random()*2,1+Math.random()*2,(Math.random()-.5),.5,.85,1,.45,.8,{g:12,drag:.4});
    if(!P.hint&&Math.abs(c.ps-s4S(5,150))<10){P.hint=true;showMsg('Fire ahead! Ram the glowing cracked pipe!',3.5,'warn');}
    if(d<3.7&&Math.abs(k.speed)>6)s4PipeBurst();}
  const F=c.firewall;if(F){if(c.water&&c.water.on&&F.heat>0){F.heat=Math.max(0,F.heat-dt*.45);if(F.heat<.35&&F.c.on){F.c.on=false;setBanner('FIRE\'S OUT!','big');SFX.looks();setTimeout(()=>{if(S4&&$('banner').textContent.includes('FIRE'))setBanner('');},1600);}
      if(Math.random()<dt*30)SMOKE.emit(F.x+(Math.random()-.5)*8,1+Math.random(),F.z+(Math.random()-.5)*3,(Math.random()-.5)*2,5+Math.random()*3,(Math.random()-.5)*2,.92,.92,.94,4,2.6,{grow:2.8,a:.45});}
    for(const f of F.f){f.k=F.heat;}}
  const W=c.water;if(W&&W.on){W.t+=dt;const u=Math.min(1,W.t/1.8);W.sheet.scale.z=Math.max(.01,u);W.sheet.material.opacity=.75*Math.min(1,W.t*2);W.sheet.material.map&&(W.sheet.material.map.offset.y-=dt*.8);
    const rate=W.t<4?60:8;for(let i=0;i<rate*dt*4;i++){const sp=10+Math.random()*6;FX.emit(c.pipe.x-1.4,c.pipe.y+.3,c.pipe.z+(Math.random()-.5)*1.4,-sp*(.6+Math.random()*.4),5+Math.random()*7,6+Math.random()*10,.45,.8,1,.9,1.3,{g:16,drag:.15});}
    if(W.t<6&&Math.random()<dt*20)FX.emit(-360+(Math.random()-.5)*20,.3,W.z0+Math.random()*(W.z1-W.z0)*u,(Math.random()-.5)*2,1+Math.random()*2,4,.5,.85,1,.5,.6,{g:8});}
  /* the four-way collapse */
  const CL=c.collapse;if(CL&&CL.t>=0&&!CL.done){CL.t+=dt;const t=CL.t,u=Math.min(1,t/2.25),e=u*u*u,bo=t>2.25?Math.sin((t-2.25)*9)*.035*Math.exp(-(t-2.25)*3):0;/* it tips over and lands across the straight-on street, and stays there */CL.piv.rotation.set(e*.05,0,-(e*Math.PI/2)+bo);CL.piv.position.y=0;
    if(t<3.2){for(let i=0;i<10;i++){const h=Math.random()*70*(1-e*.6);SMOKE.emit(87+(Math.random()-.5)*44+e*h*.6,Math.max(1,h*(1-e)),1232+(Math.random()-.5)*44-e*h*.4,(Math.random()-.5)*8,3+Math.random()*6,(Math.random()-.5)*8,.62,.56,.5,10+Math.random()*8,4,{grow:2.4,a:.55});}
      if(Math.random()<dt*20)FX.emit(100+Math.random()*30,10+Math.random()*30,1215+Math.random()*30,(Math.random()-.5)*20,5+Math.random()*10,(Math.random()-.5)*20,.9,.7,.4,.7,1.6,{g:20,drag:.3});
      c.shake=Math.max(c.shake,.9*Math.max(0,1-Math.hypot(k.x-110,k.z-1215)/260));if(Math.random()<dt*6)noise(.6,.25,300,80,'lowpass');}
    if(t>2.25&&!CL.rubbleOn){CL.rubbleOn=true;CL.rub.visible=true;CL.stump.visible=true;s4ColBox(144.5,1233,37.5,20.5,0,{kind:'wall',top:42});SFX.boom();SFX.boom();flash(.35);for(const r of c.run)if(!r.dead&&Math.hypot(r.g.position.x-110,r.g.position.z-1215)<45)s4RunnerBoom(r,'fall');
      for(let i=0;i<80;i++)SMOKE.emit(100+(Math.random()-.5)*60,2+Math.random()*6,1210+(Math.random()-.5)*50,(Math.random()-.5)*16,2+Math.random()*4,(Math.random()-.5)*16,.66,.6,.54,14+Math.random()*10,5,{grow:2,a:.6});
      const ar=c.arrows.find(q=>q.i===10);if(ar){ar.a.rotation.z=0;ar.a.scale.x=-1;ar.flash=2;}}
    if(CL.rubbleOn){const u=Math.min(1,(t-2.25)/.5);CL.rub.scale.set(1,lerp(.3,1,u),1);}
    if(t>3.3&&!CL.said){CL.said=true;s4Say('Tralalero','NOOO! Straight is gone! The only way is left... and that way is BAAAD! ...Go left, Tung Tung. GO!',4.8);}
    if(t>4)CL.done=true;}
  /* arrows bob and glow; the four-way arrow points straight until the tower falls */
  for(const ar of c.arrows){const d=ar.s-c.ps;ar.g.visible=d>-20&&d<260;if(!ar.g.visible)continue;ar.g.position.y=7+Math.sin(S.t*2+ar.ph)*.35;const pulse=.55+.35*Math.sin(S.t*5+ar.ph);ar.a.material.opacity=pulse;
    if(ar.i===10&&!(c.collapse&&c.collapse.rubbleOn)){ar.a.rotation.z=Math.PI/2;ar.a.scale.x=1;}
    if(ar.flash>0){ar.flash-=dt;ar.a.material.color.setHex(Math.sin(S.t*20)>0?0xff8a3a:0x3ee0ff);}else ar.a.material.color.setHex(0x3ee0ff);}
  /* falling boss props */
  for(const tg of c.targets){if(tg.fall<0)continue;s4TargetFall(tg,dt);}
  /* ram markers over the next target */
  const B=c.boss;const nt=B&&B.mode!=='dead'&&B.mode!=='dying'?c.targets.find(t=>!t.done):null;
  for(const tg of c.targets){const on=tg===nt;tg.crack.visible=!tg.done;tg.crack.scale.setScalar(1+.12*Math.sin(S.t*7));if(!tg.mark){const m=new THREE.Mesh(new THREE.ConeGeometry(1.2,2.4,4),s4Mats().add(0xffd23f,.85));m.rotation.x=Math.PI;c.G.add(m);const l=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.1),s4Mats().sign('RAM IT!','#ffd23f','#14123a',384,96,60));l.position.y=2.2;m.add(l);tg.mark=m;}
    tg.mark.visible=on;if(on){const bp=tg.c;tg.mark.position.set(bp.x,(tg.id==='pillar'?12.5:tg.id==='board'?24:21)+Math.sin(S.t*4)*.6,bp.z);tg.mark.rotation.y+=dt*2;tg.mark.children[0].lookAt(camera.position);}}}
function s4PipeBurst(){const c=S4,P=c.pipe;P.done=true;SFX.splash();SFX.boom();noise(3,.4,1800,400,'lowpass');cam.shake=Math.max(cam.shake,.8);flash(.3);setBanner('<small>WATER!</small>THE PIPE BURST!','big');
  for(let i=0;i<120;i++)FX.emit(P.x-1.4,P.y,P.z+(Math.random()-.5)*2,-(6+Math.random()*12),4+Math.random()*12,(Math.random()-.5)*10+4,.5,.85,1,1.1,1.6,{g:14,drag:.2});
  const mat=s4Mats().water.clone();mat.transparent=true;mat.opacity=0;mat.depthWrite=false;const sheet=new THREE.Mesh(new THREE.PlaneGeometry(22,1),mat);sheet.geometry.rotateX(-Math.PI/2);sheet.geometry.translate(0,0,.5);sheet.position.set(-360,.26,P.z);sheet.scale.z=.01;sheet.scale.z=.01;
  sheet.geometry.scale(1,1,56);c.G.add(sheet);c.water={on:true,t:0,sheet,x:-360,z0:P.z,z1:P.z+56};
  for(const r of c.run)if(!r.dead)s4RunnerBoom(r,'water');
  setTimeout(()=>{if(S4&&$('banner').textContent.includes('PIPE'))setBanner('');},1600);}
function s4CollapseStart(){const c=S4,CL=c.collapse;if(!CL||CL.t>=0)return;CL.t=0;noise(4,.4,200,60,'lowpass');tone(45,3,'sawtooth',.12,25);setBanner('LOOK OUT!','warn');setTimeout(()=>{if(S4&&$('banner').textContent==='LOOK OUT!')setBanner('');},1400);}
/* ---------- the GROK Crusher ---------- */
function s4BossStart(){const c=S4;if(c.boss)return;const m=s4MakeCrusher();c.G.add(m.g);c.G.add(m.legsG);
  const B=c.boss={m,s:Math.max(S4.path.ns[11]+4,c.ps-46),lat:0,y:3.6,vy:0,mode:'wake',t:0,hp:3,yaw:0,throwT:4,laserT:7.5,atkCD:0,feet:false,slowTo:null,slowT:0,stag:0,hitT:0,laser:null,carry:null,fires:[]};
  const q=s4At(B.s,0);B.yaw=q.h;m.g.position.set(q.x,0,q.z);m.g.rotation.y=B.yaw;m.body.position.y=B.y;
  /* the wake-up: the game stops, the camera cuts to the Crusher slumped in the street behind you, and it comes alive */
  stopMusic();for(const r of c.run)r.d+=40;c.bossIntro={t:0,eye:m.eyeM.color.getHex()};m.eyeM.color.setHex(0x1a0608);m.eg.material.opacity=0;B.feet=false;
  $('s4Hud').classList.add('fade');$('hud').classList.add('cine4');setBanner('');}
function s4BossIntroTick(dt){const c=S4,I=c.bossIntro,B=c.boss,m=B.m;I.t+=dt;const t=I.t;B.t+=dt;
  const rise=clamp((t-1.5)/1.3,0,1),e=rise*rise*(3-2*rise);B.y=lerp(3.6,9.4,e);s4BossPose(dt);
  m.body.rotation.x=lerp(.42,0,e)+(t>2.9&&t<3.6?Math.sin((t-2.9)*30)*.02:0);m.head.rotation.x=lerp(.5,t>2.9&&t<3.8?-.12:0,Math.min(1,e*1.3));
  /* the eye flickers on, then stays lit */
  const on=t>.7&&(t>1.35||Math.sin(t*38)>.2);m.eyeM.color.setHex(on?I.eye:0x1a0608);m.eg.material.opacity=on?(t>1.35?.9:.5):0;
  if(t>.7&&!I.b1){I.b1=1;tone(1400,.06,'square',.06);tone(1900,.06,'square',.06,null,.1);tone(2400,.12,'square',.06,null,.2);}
  if(t>1.5&&!I.b2){I.b2=1;tone(70,1.4,'sawtooth',.08,140);noise(1.3,.18,400,900,'bandpass');}
  for(const j of m.jaws)j.g.rotation.y=j.s*(t>2.9&&t<4?.8:.12);
  if(t>2.9&&!I.r){I.r=1;s4Roar();s4Roar();flash(.25);c.shake=1.2;cam.shake=Math.max(cam.shake,.9);
    for(let i=0;i<30;i++)for(const st of m.stacks){const p=m.body.localToWorld(S4BV.a.copy(st));SMOKE.emit(p.x,p.y,p.z,(Math.random()-.5)*6,6+Math.random()*6,(Math.random()-.5)*6,.15,.14,.14,4,3,{grow:3,a:.7});}
    setBanner('<small>BOSS</small>GROK CRUSHER','big');}
  /* camera: low in front of it, looking up at the head, slowly pushing in */
  const fx=Math.sin(B.yaw),fz=Math.cos(B.yaw),rx=Math.cos(B.yaw),rz=-Math.sin(B.yaw),bp=m.g.position,u=Math.min(1,t/3.8),d=lerp(30,22,u),side=lerp(12,7,u);
  const hp=m.head.getWorldPosition(S4BV.b);camera.position.set(bp.x+fx*d+rx*side,1.6+t*.5,bp.z+fz*d+rz*side);camera.lookAt(hp.x,hp.y-1,hp.z);
  if(Math.abs(camera.fov-55)>.05){camera.fov=55;camera.updateProjectionMatrix();updatePSScale();}
  updateKartVisuals(0);placeSun(bp.x,0,bp.z);
  const skip=t>1.2&&(input.item||pad.item||input.drift||pad.drift);
  if(t>4.4||skip){c.bossIntro=null;B.y=9.4;B.mode='chase';B.t=0;m.eyeM.color.setHex(I.eye);m.eg.material.opacity=.9;$('s4Hud').classList.remove('fade');$('hud').classList.remove('cine4');camSnap();
    startMusic('boss');S4.song='boss';$('sBoss').hidden=false;$('sBoss').querySelector('b').textContent='GROK CRUSHER';$('sBossBar').style.width='100%';
    setTimeout(()=>{if(S4&&$('banner').textContent.includes('CRUSHER'))setBanner('');},900);
    setTimeout(()=>{if(S4&&S4.boss)s4Say('Tralalero','THAT is the GROK Crusher! You can\'t fight it... so ram anything that glows and drop it on its head!',4.6);},700);}}
function s4BossRespawn(cp){const B=S4.boss;if(!B||B.mode==='dead')return;if(B.mode==='dying'||B.hp<=0){s4BossDead();return;}B.s=Math.max(S4.path.ns[11],cp.s-52);B.mode='chase';B.y=9.4;B.slowTo=null;B.carry=null;if(B.laser){B.laser.strip.visible=false;B.laser=null;}B.feet=false;}
function s4BossTick(dt){const c=S4,B=c.boss;if(!B)return;const k=player,D=c.D,top=cc().top,m=B.m;B.t+=dt;
  if(B.mode==='dead')return;
  const vp=Math.abs(k.speed),gap=c.ps-B.s;
  if(B.mode==='drop'){B.vy-=60*dt;B.y+=B.vy*dt;if(B.y<=9.4){B.y=9.4;B.mode='land';B.t=0;s4Stomp(m.g.position.x,m.g.position.z,2);SFX.boom();SFX.boom();flash(.4);c.shake=1.4;tone(40,1.4,'sawtooth',.2,22);
      for(let i=0;i<70;i++)SMOKE.emit(m.g.position.x+(Math.random()-.5)*30,1,m.g.position.z+(Math.random()-.5)*30,(Math.random()-.5)*24,2+Math.random()*4,(Math.random()-.5)*24,.6,.55,.5,8+Math.random()*6,3,{grow:2.4,a:.55});
      setTimeout(()=>{if(S4&&S4.boss)s4Roar();},500);}}
  else if(B.mode==='land'){if(B.t>1.4){B.mode='chase';B.t=0;}}
  else if(B.mode==='chase'){const g0=27;let vb=clamp(vp+(gap-g0)*.9,13,top*1.06)*D.boss;if(B.slowTo!=null){B.slowT-=dt;vb=Math.min(vb,B.slowTo);if(B.slowT<=0)B.slowTo=null;}B.vb=vb;B.s+=vb*dt;
    const segW=S4SEG[S4.path.seg[Math.min(S4.path.n-1,s4At(B.s,0).i)]].W,ml=Math.max(0,segW-11.5);B.lat+=(clamp(c.plat*.6,-ml,ml)-B.lat)*Math.min(1,dt*.8);
    if(gap<9.5&&c.inv<=0){if(s4Hurt(1,'CRUSHED!')){k.speed=Math.max(k.speed,26);k.vy=6;k.air=true;c.shake=1.1;s4Stomp(k.x,k.z,1.4);}}
    /* attacks */
    B.throwT-=dt;B.laserT-=dt;
    if(!B.carry&&!B.laser&&B.throwT<=0&&gap>16){B.throwT=(7.6+Math.random()*2.4)/D.fire;B.carry={t:0};}
    if(!B.carry&&!B.laser&&B.laserT<=0&&gap>12){B.laserT=(10+Math.random()*3)/D.fire;s4LaserStart();}
    /* missed the target? go back and try again */
    const nt=c.targets.find(t=>!t.done);if(nt&&c.ps>nt.s+24){s4Miss(nt);}}
  else if(B.mode==='stagger'){B.stag+=dt;B.s+=Math.max(0,4-B.stag*4)*dt;if(Math.random()<dt*14){const p=m.body.localToWorld(new V3((Math.random()-.5)*9,(Math.random()-.2)*5,(Math.random()-.5)*14));burst(p.x,p.y,p.z,22,[1,.6,.25],12,1.4,.5);if(Math.random()<.3)SFX.boom();}
    if(B.stag>2.8){B.mode='chase';B.t=0;s4Roar();}}
  else if(B.mode==='dying'){B.stag+=dt;const u=Math.min(1,B.stag/3.4);B.y=lerp(9.4,3.2,u);if(Math.random()<dt*20){const p=m.body.localToWorld(new V3((Math.random()-.5)*10,(Math.random())*5,(Math.random()-.5)*15));burst(p.x,p.y,p.z,30,[1,.55,.2],14,1.8,.6);if(Math.random()<.35)SFX.boom();}
    m.eyeM.color.setHex(Math.random()<.5?0xff1a2a:0x220406);if(B.stag>3.6){s4BossDead();}}
  s4BossCarry(dt);s4LaserTick(dt);s4BossPose(dt);}
function s4Roar(){tone(90,1.2,'sawtooth',.14,40);tone(140,1,'square',.06,60);noise(1.2,.25,700,200,'bandpass');}
function s4Stomp(x,z,big){const c=S4;for(let i=0;i<(big>1?40:14);i++){const a=Math.random()*6.28,s=4+Math.random()*6*big;SMOKE.emit(x+Math.cos(a)*2,.6,z+Math.sin(a)*2,Math.cos(a)*s,1+Math.random()*1.5,Math.sin(a)*s,.62,.56,.5,3+Math.random()*3*big,1.6,{grow:2.2,a:.5});}
  const d=Math.hypot(player.x-x,player.z-z);c.shake=Math.max(c.shake,Math.max(0,1-d/70)*.45*big);tone(52,.35,'sine',.18*Math.max(.2,1-d/90),30);}
/* the boss carries a burning car in its jaws, then throws it at where you are going */
function s4BossCarry(dt){const c=S4,B=c.boss,m=B.m,k=player;if(!B.carry)return;const C=B.carry;C.t+=dt;
  if(!C.g){const g=new THREE.Group(),T=s4Models();const body=new THREE.Mesh(new THREE.BoxGeometry(2,1.2,4.4),T.gd);body.position.y=.6;g.add(body);const cab=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,2.2),T.gm);cab.position.y=1.5;g.add(cab);const fl=glow(0xff7a20,7);fl.position.y=1.6;g.add(fl);c.G.add(g);C.g=g;C.fl=fl;}
  if(C.t<1.1){const p=m.head.localToWorld(new V3(0,-1.8,5.2));C.g.position.copy(p);C.g.rotation.y=B.yaw+Math.PI/2;for(const j of m.jaws)j.g.rotation.y=j.s*lerp(.5,.05,Math.min(1,C.t/.4));
    if(C.t>.7&&!C.m){const lead=1.6,tx=k.x+k.vx*lead+Math.sin(c.ph)*6,tz=k.z+k.vz*lead+Math.cos(c.ph)*6;C.tx=tx;C.tz=tz;C.m=s4Mark(tx,tz,4.4,0xffa040,1.6);C.p0=p.clone();C.ft=0;}}
  else{C.ft+=dt;const u=Math.min(1,C.ft/1.25);C.g.position.set(lerp(C.p0.x,C.tx,u),lerp(C.p0.y,s4Floor(C.tx,C.tz).y+.3,u)+Math.sin(u*Math.PI)*14,lerp(C.p0.z,C.tz,u));C.g.rotation.x+=dt*5;C.g.rotation.z+=dt*3;
    if(Math.random()<.8)FX.emit(C.g.position.x,C.g.position.y+1,C.g.position.z,0,1,0,1,.6,.2,1.6,.5,{g:-2});for(const j of m.jaws)j.g.rotation.y=j.s*.5;
    if(u>=1){C.m.m.visible=false;const x=C.tx,z=C.tz,y=s4Floor(x,z).y;burst(x,y+1,z,60,[1,.55,.2],16,1.8,.7);SFX.boom();flashLight.position.set(x,y+3,z);flashLight.intensity=9;c.shake=Math.max(c.shake,.6);
      if(Math.hypot(k.x-x,k.z-z)<4.4&&k.y<y+3)s4Hurt(1,'FLYING CAR!');C.g.rotation.set(0,Math.random()*6,Math.PI*.95);C.g.position.y=y+.9;
      /* it stays there, burning: one more thing to dodge */
      const col=s4ColBox(x,z,1.3,2.5,C.g.rotation.y,{kind:'fire',top:3});const f={x,y:y+1.2,z,s:1.3};const gl=glow(0xff8a30,5.5);gl.material.opacity=.55;gl.position.set(x,y+1.8,z);c.G.add(gl);f.gl=gl;f.ph=0;c.fires.push(f);
      /* it burns out after a while */const wreck=C.g;setTimeout(()=>{if(!S4||S4!==c)return;col.on=false;f.dead=true;gl.visible=false;burst(x,y+1,z,30,[.5,.5,.5],8,1.4,.6);SMOKE.emit(x,y+1,z,0,3,0,.3,.3,.3,5,3,{grow:2,a:.5});s4Rm(wreck);},14000);B.carry=null;}}}
/* the eye laser: a red strip lights up on your lane, then the beam fires down it */
function s4LaserStart(){const c=S4,B=c.boss;const lat=c.plat,s0=c.ps-8,s1=c.ps+56,q=s4At((s0+s1)/2,lat);
  let strip=B.stripM;if(!strip){strip=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));strip.rotation.x=-Math.PI/2;strip.renderOrder=3;c.G.add(strip);B.stripM=strip;}
  const wrap=new THREE.Group();strip.visible=true;strip.scale.set(5.4,s1-s0,1);strip.position.set(q.x,.12,q.z);strip.rotation.set(-Math.PI/2,0,-q.h);
  B.laser={t:0,lat,s0,s1,strip,hit:false};tone(300,1.1,'sawtooth',.05,1600);}
function s4LaserTick(dt){const c=S4,B=c.boss,L=B.laser;if(!L)return;L.t+=dt;const k=player,m=B.m;
  const tele=1.15/Math.max(.8,c.D.react);
  if(L.t<tele){L.strip.material.opacity=.18+.25*(.5+.5*Math.sin(S.t*24));m.eg.scale.setScalar(26+L.t*14);}
  else if(L.t<tele+.75){L.strip.material.opacity=.75;m.eg.scale.setScalar(44);const a=m.head.localToWorld(new V3(0,.35,3.4));for(let i=0;i<3;i++){const q=s4At(lerp(L.s0,L.s1,Math.random()),L.lat+(Math.random()-.5)*3);const b=new V3(q.x,.2,q.z);const bm=s4Beam(a,b,0xff3a4a,.35+Math.random()*.25);bm.m.material.opacity=.7;bm.ttl=.06;setTimeout(()=>{bm.m.visible=false;},60);
      if(Math.random()<.5)burst(q.x,.3,q.z,6,[1,.4,.4],6,.8,.3);}
    if(!L.hit&&Math.abs(c.plat-L.lat)<3&&c.ps>L.s0&&c.ps<L.s1+4){L.hit=s4Hurt(1,'LASER!');}if(Math.random()<dt*10)noise(.1,.08,3000,1200,'bandpass');}
  else{L.strip.visible=false;m.eg.scale.setScalar(26);B.laser=null;}}
/* ramming a glowing thing */
function s4Ram(col){const c=S4,B=c.boss,tg=c.targets.find(t=>t.c===col);if(!tg||tg.done||!B||B.mode==='dead'||B.mode==='dying'||B.mode==='drop'||B.mode==='land')return;
  tg.done=true;tg.fall=0;col.on=false;cam.shake=Math.max(cam.shake,.6);SFX.boom();burst(col.x,1.5,col.z,40,[1,.85,.3],12,1.4,.6);setBanner(tg.id==='pillar'?'THE OVERPASS IS COMING DOWN!':'TIMBER!','big');
  setTimeout(()=>{if(S4&&$('banner').textContent.match(/TIMBER|OVERPASS/))setBanner('');},1500);
  /* make sure the boss walks right into it */
  const fallT=tg.id==='pillar'?1.45:1.15,dist=tg.s-B.s;if(dist>0){B.slowTo=Math.max(4,(dist-2)/fallT);B.slowT=fallT+.4;}
  const cx=s4At(tg.s,0);tg.dirx=cx.x-col.x;tg.dirz=cx.z-col.z;const L=Math.hypot(tg.dirx,tg.dirz)||1;tg.dirx/=L;tg.dirz/=L;tg.q0=tg.g.quaternion.clone();tg.th=0;tg.w=0;}
function s4TargetFall(tg,dt){const c=S4,B=c.boss;tg.fall+=dt;
  if(tg.id==='pillar'){/* the pillar crumbles, then the middle of the overpass drops */
    if(!tg.crumble){tg.crumble=true;for(let i=0;i<30;i++)SMOKE.emit(tg.c.x,2+Math.random()*8,tg.c.z,(Math.random()-.5)*8,1+Math.random()*3,(Math.random()-.5)*8,.7,.68,.62,4+Math.random()*4,2.4,{grow:2,a:.5});}
    tg.g.scale.y=Math.max(.05,1-tg.fall*2.4);tg.g.position.y=-tg.fall*1.5;
    const d=tg.deck,t=Math.max(0,tg.fall-.3),u=Math.min(1,t/1.15);d.position.y=lerp(10.9,1.6,u*u);d.rotation.z=u*.12;d.rotation.x=u*.05;
    if(u>=1&&!tg.landed){tg.landed=true;SFX.boom();SFX.boom();SFX.boom();flash(.5);c.shake=1.6;c.slowT=1.8;tone(35,2,'sawtooth',.2,20);
      for(let i=0;i<90;i++)SMOKE.emit(tg.c.x+(Math.random()-.5)*60,1+Math.random()*4,tg.c.z+(Math.random()-.5)*20,(Math.random()-.5)*20,2+Math.random()*6,(Math.random()-.5)*20,.66,.6,.54,10+Math.random()*10,4.5,{grow:2,a:.6});
      if(B&&B.mode!=='dead'&&Math.abs(B.s-tg.s)<26)s4BossHit(tg,true);
      s4ColBox(tg.c.x,tg.c.z,30,8,0,{kind:'wreck',top:6});}
    return;}
  if(tg.th<Math.PI/2){tg.w+=dt*(2.2+tg.th*3.4);tg.th=Math.min(Math.PI/2,tg.th+tg.w*dt);if(tg.th>=Math.PI/2){SFX.boom();c.shake=Math.max(c.shake,.9);const tip=new V3(tg.c.x+tg.dirx*tg.len*.8,0,tg.c.z+tg.dirz*tg.len*.8);
      for(let i=0;i<40;i++)SMOKE.emit(lerp(tg.c.x,tip.x,Math.random()),1,lerp(tg.c.z,tip.z,Math.random()),(Math.random()-.5)*10,2+Math.random()*3,(Math.random()-.5)*10,.6,.55,.5,6,2.4,{grow:2,a:.5});
      /* it now lies across the road: solid */for(let t=3;t<tg.len;t+=3)s4Col({x:tg.c.x+tg.dirx*t,z:tg.c.z+tg.dirz*t,r:1.4,kind:'wreck',top:2});}}
  const ax=new V3(tg.dirz,0,-tg.dirx).normalize();const q=new THREE.Quaternion().setFromAxisAngle(ax,tg.th);tg.g.quaternion.copy(q).multiply(tg.q0);
  if(B&&B.mode==='chase'&&tg.th>1.1&&B.s>tg.s-5&&!tg.hitBoss){tg.hitBoss=true;s4BossHit(tg,false);}}
function s4BossHit(tg,final){const c=S4,B=c.boss;B.hp=Math.max(0,B.hp-1);$('sBossBar').style.width=(B.hp/3*100)+'%';const el=$('sBoss');el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');
  SFX.boom();s4Roar();flash(.4);c.slowT=Math.max(c.slowT,1.1);c.shake=Math.max(c.shake,1.2);B.slowTo=null;
  /* a plate breaks off and it catches fire */
  const m=B.m,p=m.body.localToWorld(new V3((Math.random()-.5)*6,3,(Math.random()-.5)*8));const pl=new THREE.Mesh(new THREE.BoxGeometry(3.4,.4,2.6),s4Models().gm);pl.position.copy(p);c.G.add(pl);c.deb.push({m:pl,v:new V3((Math.random()-.5)*14,10,(Math.random()-.5)*14),r:new V3(4,6,3),t:0,y0:0,life:4,own:true});
  for(let i=0;i<2;i++){const lo=new V3((Math.random()-.5)*7,2.5,(Math.random()-.5)*10);const gl=glow(0xff8a30,6);gl.material.opacity=.6;c.G.add(gl);c.fires.push({x:p.x,y:p.y,z:p.z,s:1.6,gl,ph:0,follow:m.body,lo});}
  if(final||B.hp<=0){B.mode='dying';B.stag=0;$('sBoss').querySelector('b').textContent='GROK CRUSHER · DOWN!';return;}
  B.mode='stagger';B.stag=0;const n=3-B.hp;setTimeout(()=>{if(S4&&S4.boss)s4CP('CRUSHER HIT '+n+'/3',tg.s+12);},900);}
function s4Miss(tg){const c=S4,B=c.boss,k=player;flash(.8);s4Hurt(1,'THE CRUSHER GOT YOU!');setBanner('<small>MISSED IT!</small>TRY AGAIN','warn');
  setTimeout(()=>{if(!S4||S4.boss!==B||B.mode==='dead'||B.mode==='dying'||S.mode!=='city')return;s4Place(tg.s-150,0);player.speed=20;B.s=tg.s-150-46;B.mode='chase';B.feet=false;B.carry=null;if(B.laser){B.laser.strip.visible=false;B.laser=null;}for(const r of c.run)s4Rm(r.g);c.run=[];camSnap();
    showMsg('Ram the glowing '+(tg.id==='lamp'?'lamp post':tg.id==='board'?'billboard tower':'pillar')+'!',3,'warn');setTimeout(()=>{if(S4&&$('banner').textContent.includes('TRY AGAIN'))setBanner('');},600);},350);}
function s4BossDead(){const c=S4,B=c.boss,m=B.m,p=m.g.position.clone();B.mode='dead';
  for(let i=0;i<6;i++)setTimeout(()=>{if(!S4)return;const q=p.clone().add(new V3((Math.random()-.5)*14,4+Math.random()*6,(Math.random()-.5)*14));burst(q.x,q.y,q.z,90,[1,.55,.2],20,2.4,.9);burst(q.x,q.y,q.z,40,[.4,.9,1],14,1.6,.7);SFX.boom();flash(.45);S4.shake=1.4;},i*160);
  for(let i=0;i<14;i++){const pc=new THREE.Mesh(new THREE.BoxGeometry(1+Math.random()*2.6,.4+Math.random(),1+Math.random()*2),i%2?s4Models().gm:s4Models().gd);pc.position.copy(p).add(new V3(0,6,0));c.G.add(pc);c.deb.push({m:pc,v:new V3((Math.random()-.5)*30,10+Math.random()*16,(Math.random()-.5)*30),r:new V3(Math.random()*6,Math.random()*6,Math.random()*6),t:0,y0:0,life:5,own:true});}
  setTimeout(()=>{if(!S4)return;m.g.visible=false;m.legsG.visible=false;for(const f of c.fires)if(f.follow===m.body){f.dead=true;f.gl.visible=false;}},900);
  setBanner('<small>BOSS DEFEATED</small>GROK CRUSHER DESTROYED!','big');$('sBoss').hidden=true;c.wrecked+=1;s4Music('dawn');
  {const pt=c.targets.find(t=>t.id==='pillar'),s=Math.max(c.ps+10,pt?pt.s+30:0);c.cp={s,name:'THE LAST STREETS',ei:c.ei};}
  setTimeout(()=>{if(S4&&S4.mode==='play')s4Say('Tralalero','YOU DID IT! Okay, okay... just a few more streets. Keep going!',4);setTimeout(()=>{if(S4&&$('banner').textContent.includes('DESTROYED'))setBanner('');},400);},2600);}
/* walking: tripod gait, each leg solved with two bones */
const S4BV={a:new V3(),b:new V3(),c:new V3(),d:new V3(),e:new V3(),up:new V3(0,1,0),Q:new THREE.Quaternion()};
function s4BossPose(dt){const c=S4,B=c.boss,m=B.m;if(!m.g.visible)return;const q=s4At(B.s,B.lat);B.yaw+=wrapA(q.h-B.yaw)*Math.min(1,dt*2.2);m.g.position.set(q.x,0,q.z);m.g.rotation.y=B.yaw;
  const moving=B.mode==='chase';const bob=moving?Math.sin(B.t*7)*.3:0;let tilt=0;if(B.mode==='stagger')tilt=Math.sin(B.stag*6)*.12*Math.max(0,1-B.stag/2.8);if(B.mode==='dying')tilt=Math.min(.35,B.stag*.15);
  m.body.position.y=B.y+bob;m.body.rotation.x=(moving?-.06:0)+tilt;m.body.rotation.z=(B.mode==='dying'?Math.min(.3,B.stag*.1):0)+Math.sin(B.t*3.5)*.03;
  m.head.rotation.y=clamp(wrapA(Math.atan2(player.x-m.g.position.x,player.z-m.g.position.z)-B.yaw),-.5,.5);
  for(const j of m.jaws)if(!B.carry)j.g.rotation.y=j.s*(.25+.2*Math.sin(B.t*4));
  for(const bl of m.blinks)bl.visible=Math.sin(S.t*7+bl.position.x)>0;m.eg.material.opacity=.7+.3*Math.sin(S.t*9);
  if(Math.random()<dt*12)for(const st of m.stacks){const p=m.body.localToWorld(S4BV.a.copy(st));SMOKE.emit(p.x,p.y,p.z,(Math.random()-.5),3+Math.random()*2,(Math.random()-.5),.18,.17,.17,2.4,2.4,{grow:2.6,a:.5});}
  m.g.updateMatrixWorld(true);const fx=Math.sin(B.yaw),fz=Math.cos(B.yaw),spd=(B.vb||0);
  for(const L of m.legs){const hip=m.body.localToWorld(S4BV.b.copy(L.hip));const rest=m.g.localToWorld(S4BV.c.set(L.s*11.2,0,L.hip.z*1.15+1.5));rest.y=s4Floor(rest.x,rest.z).y;
    if(!B.feet){L.foot.copy(rest);L.t=1;}
    if(L.t>=1&&moving){const other=m.legs.filter(o=>o.grp!==L.grp).every(o=>o.t>=1);if(other&&L.foot.distanceTo(rest)>5.2){L.from.copy(L.foot);L.to.copy(rest).addScaledVector(S4BV.d.set(fx,0,fz),clamp(spd*.16,2,6.5));L.to.y=s4Floor(L.to.x,L.to.z).y;L.t=0;L.dur=clamp(4.6/(spd+1),.16,.38);}}
    if(L.t<1){L.t=Math.min(1,L.t+dt/L.dur);const e=L.t*L.t*(3-2*L.t);L.foot.lerpVectors(L.from,L.to,e);L.foot.y+=Math.sin(Math.PI*L.t)*3.4;if(L.t>=1){s4Stomp(L.foot.x,L.foot.z,.6);}}
    /* two-bone IK: knee goes up and outwards */
    const a=L.upL,b=L.loL,dv=S4BV.d.copy(L.foot).sub(hip);let d=dv.length();d=Math.min(d,(a+b)*.985);dv.normalize();
    const out=S4BV.e.set(Math.cos(B.yaw)*L.s,1.3,-Math.sin(B.yaw)*L.s);out.addScaledVector(dv,-out.dot(dv)).normalize();
    const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),sa=Math.sqrt(1-ca*ca);const knee=hip.clone().addScaledVector(dv,a*ca).addScaledVector(out,a*sa);
    const foot=hip.clone().addScaledVector(dv,d);
    L.up.position.copy(hip);L.up.quaternion.setFromUnitVectors(S4BV.up,knee.clone().sub(hip).normalize());
    L.lo.position.copy(foot);L.lo.quaternion.setFromUnitVectors(S4BV.up,knee.clone().sub(foot).normalize());L.lo.scale.y=knee.distanceTo(foot)/L.loL;
    L.kn.position.copy(knee);L.ft.position.copy(foot).add(S4BV.a.set(0,.3,0));L.ft.rotation.set(Math.PI,0,0);
    L.talons.forEach((t,i)=>{const ang=B.yaw+(i-1)*.7+(L.s>0?0:Math.PI);t.position.set(foot.x+Math.sin(ang)*.9,foot.y+.25,foot.z+Math.cos(ang)*.9);t.rotation.set(Math.PI/2+.5,ang,0,'YXZ');});}
  B.feet=true;}
/* ---------- the end: the castle ---------- */
function s4EndStart(){const c=S4;if(c.mode!=='play')return;c.mode='end';S.mode='cityend';const k=player;k.lock=true;s4ClearBaddies();for(const t of c.turrets)if(t.beam)t.beam.m.visible=false;
  c.end={t:0,cp:camera.position.clone(),cl:cam.look.clone()};$('sHearts').hidden=true;$('sBoss').hidden=true;$('s4Hud').classList.add('fade');STORY.saved=true;STORY.missionTime=c.T;if(c.song!=='dawn')s4Music('dawn');}
function s4EndTick(dt){const c=S4,E=c.end,k=player;E.t+=dt;const t=E.t;
  const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;for(let i=0;i<steps;i++){stepKart(k,{steer:0,gas:0,brake:1,drift:false},h);s4KartCollide(k,h);}updateKartVisuals(dt);
  const say=(at,who,txt,secs)=>{if(t>=at&&!E['r'+at]){E['r'+at]=1;s4Say(who,txt,secs);}};
  say(3.4,'Tralalero','...Tung Tung. That\'s it. That\'s where GROK is.',4.2);
  if(t>7&&!E.laugh){E.laugh=1;cineSfx('laugh');if(c.castleEye)c.castleEye.flash=1.5;c.shake=.4;}
  if(t>9.6&&!E.clear){E.clear=1;setBanner('<small>STAGE 1-4</small>STAGE CLEAR!','big');SFX.finish&&SFX.finish();}
  if(t>12.6&&!E.res){E.res=1;storyResults();}
  /* camera: drop low behind the kart and tilt up at the castle as it looms */
  const fx=Math.sin(k.h),fz=Math.cos(k.h),u=smooth(1.5,8.5,t);
  const tp=new V3(k.x-fx*lerp(9,6,u)+fz*lerp(0,3.4,u),k.y+lerp(4.4,1.1,u),k.z-fz*lerp(9,6,u)-fx*lerp(0,3.4,u));
  const tl=new V3(lerp(k.x+fx*9,S4N[17][0],u),lerp(k.y+1.5,lerp(70,150,smooth(4,11,t)),u),lerp(k.z+fz*9,S4.castleZ+80,u));
  E.cp.lerp(tp,1-Math.exp(-dt*1.8));E.cl.lerp(tl,1-Math.exp(-dt*1.6));camera.position.copy(E.cp);if(c.shake>0){c.shake=Math.max(0,c.shake-dt);camera.position.x+=(Math.random()-.5)*c.shake*.4;camera.position.y+=(Math.random()-.5)*c.shake*.4;}camera.lookAt(E.cl);
  const fov=lerp(63,54,u);if(Math.abs(camera.fov-fov)>.05){camera.fov=fov;camera.updateProjectionMatrix();updatePSScale();}placeSun(k.x,k.y,k.z);}
function s4ResultsCam(dt){const c=S4,k=player;c.rt=(c.rt||0)+dt;const a=Math.PI+.5-c.rt*.04,r=16;camera.position.set(k.x+Math.sin(a)*r,k.y+3.4,k.z+Math.cos(a)*r);camera.lookAt(k.x,k.y+6+Math.min(30,c.rt*2),k.z+40);updateKartVisuals(dt);if(AU.eng)AU.eng.gn.gain.setTargetAtTime(0,AU.ctx.currentTime,.2);}
function s4Results(){const c=S4,st=STORY.stage,d=STORY.data;S.mode='results';$('hud').hidden=true;$('sRadio').hidden=true;$('sHearts').hidden=true;$('sBoss').hidden=true;document.body.classList.remove('racing');const h=$('s4Hud');if(h)h.hidden=true;
  const time=STORY.missionTime||c.T,clear=!!STORY.saved,o=[clear,c.hurts<=4,c.bottlesGot>=5];STORY.restored=c.bottlesGot*20;
  const rec=d.stages[st.id]||{clear:false,best:null,stars:[false,false,false]};const first=clear&&!rec.clear,newBest=clear&&(rec.best==null||time<rec.best);
  if(clear){rec.clear=true;rec.best=rec.best==null?time:Math.min(rec.best,time);rec.stars=rec.stars.map((s,k)=>s||o[k]);}
  rec.bots=Math.max(rec.bots||0,c.wrecked);rec.bottles=Math.max(rec.bottles||0,c.bottlesGot);rec.drops=Math.max(rec.drops||0,STORY.dropN);d.stages[st.id]=rec;d.water=(d.water||0)+STORY.dropN;sSave();
  STORY.pendingOutro=first;
  $('srTitle').textContent=clear?'CASTLE IN SIGHT!':'NOT QUITE…';$('srTitle').parentNode.className='sr-rib'+(clear?'':' fail');
  [...$('srStars').children].forEach((el,k)=>{el.className='';if(o[k]&&clear){setTimeout(()=>{el.className='on';SFX.tick&&SFX.tick();},350+k*280);}});
  {let n=0;const goal=STORY.dropN,el=$('srDrops');el.textContent='0';const iv=setInterval(()=>{n=Math.min(goal,n+1);el.textContent=n;if(n>=goal)clearInterval(iv);},40);}
  $('srSub').textContent='Stage '+st.id+' · '+st.name+' · '+(DIFFS[d.diff]||DIFFS.normal).name;
  $('srPlace').innerHTML=c.wrecked+'';$('srPlL').textContent='GROK bots wrecked';$('srPlace').className='srp p1';$('srLandL').textContent='Water bottles found';
  $('srTime').textContent=fmt(time,true)+(newBest?'  · New best!':'');
  $('srLand').hidden=false;$('srLandN').textContent=c.bottlesGot+'/5';$('srLandBar').style.width='0%';setTimeout(()=>{$('srLandBar').style.width=(c.bottlesGot*20)+'%';},300);
  const lines=[['Reach the castle',clear?(c.deaths?c.deaths+' wreck'+(c.deaths===1?'':'s'):'No wrecks!'):'Not yet'],['Take 4 or fewer hits',c.hurts+' hit'+(c.hurts===1?'':'s')],['Find all 5 hidden water bottles',c.bottlesGot+'/5 found']];
  $('srObj').innerHTML=lines.map((l,k)=>'<li class="'+(o[k]&&clear?'on':o[k]?'meh':'')+'"><i></i><span>'+l[0]+'</span><em>'+l[1]+'</em></li>').join('');
  $('srNote').textContent=clear?(o[1]&&o[2]?'Every star! Fountain City will remember this.':'Stars you earn here stay saved. Replay any time to collect the rest.'):'Reach the castle to clear the stage.';
  $('srGo').textContent=clear?'Continue':'Try again';$('srRetry').hidden=!clear;$('sRes').hidden=false;}
