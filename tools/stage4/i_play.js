
/* ============ playing the stage ============ */
const S4MAP={id:'fountain',name:'Fountain City',host:-1,sky:'dusk',skyP:{el:7,az:205,turb:10,ray:3,mie:.014,g:.9,fog:[0xb98a6a,60,460],sun:[0xffb07a,2.5],hemi:[0xe8b8a8,0x4a3430,.6],exp:.66},grass:[0x7a6450,0x6a5442],music:'city',brands:[]};
SONGS.city={tempo:146,wave:'sawtooth',bass:[33,33,45,33,40,33,45,40, 31,31,43,31,38,31,43,38, 29,29,41,29,36,29,41,36, 31,31,43,31,38,31,43,40],
  lead:[69,0,72,0,76,0,74,72, 71,0,0,0,69,0,0,0, 67,0,71,0,74,0,72,71, 69,0,0,0,64,0,0,0, 69,0,72,0,77,0,76,74, 76,0,74,0,72,0,71,0, 72,0,71,0,69,0,67,0, 64,0,67,0,69,0,0,0]};
SONGS.grokzone={tempo:152,wave:'square',bass:[28,28,40,28,35,28,40,35, 28,28,40,28,34,28,40,34, 26,26,38,26,33,26,38,33, 27,27,39,27,34,27,39,34],
  lead:[64,0,67,0,71,0,70,0, 71,0,67,0,64,0,0,0, 63,0,66,0,71,0,69,0, 67,0,66,0,63,0,0,0, 60,0,64,0,67,0,72,0, 71,0,67,0,64,0,67,0, 62,0,66,0,69,0,74,0, 71,0,70,0,71,0,0,0]};
SONGS.dawn={tempo:76,wave:'triangle',soft:true,bass:[45,0,52,0,48,0,52,0, 43,0,50,0,47,0,50,0, 41,0,48,0,45,0,48,0, 40,0,47,0,44,0,47,0],
  lead:[76,0,0,0,79,0,0,0, 81,0,79,0,76,0,0,0, 74,0,0,0,76,0,0,0, 71,0,0,0,0,0,0,0, 72,0,0,0,76,0,0,0, 79,0,77,0,76,0,0,0, 74,0,72,0,71,0,0,0, 69,0,0,0,0,0,0,0]};
function s4Say(who,text,secs){radio(who,text,secs||3.6);}
function s4Start(skipIntro){const st=STORY.stage;STORY.on=true;stopMusic();initAudio();
  $('loading').hidden=false;$('loading').classList.add('race');$('lshot').src=artNeed('s14').s14;$('lmsg').textContent='Stage '+st.id+' · Building '+st.name;$('lfill').style.width='100%';
  setTimeout(()=>{try{
    camera.clearViewOffset();titleRes(false);
    if(!STORY_OVR)STORY_OVR={racer:SET.racer,laps:SET.laps,cc:SET.cc,cpu:SET.cpu};
    clearRace();for(const id of['menu','finish','esc','story','modes','title','sRes'])$(id).hidden=true;S.sub=null;
    if(S4)s4Dispose();if(S3)s3Dispose();clearWorld();STORY.s2=null;STORY.s3=null;
    const diff=STORY.data&&STORY.data.diff||'normal',D=S4DIFF[diff];SET.racer=0;SET.cc=D.cc;SET.laps=1;
    MAP=S4MAP;applyTheme(S4MAP);applyQuality();sun.castShadow=QUAL!=='low';setShadowExtent(QUAL==='ultra'?120:95);
    const G=new THREE.Group();world.add(G);STORY.group=G;
    S4={on:true,G,diff,D,mode:'intro',chunks:new Map(),cols:[],cgrid:new Map(),cseen:null,fires:[],plumes:[],decals:[],blinkers:[],blinkS:[],sparks:[],cones:[],hydrants:[],cans:[],crates:[],carts:[],boxes:[],throwers:[],balcony:[],bottleSpots:[],lamps:[],dark:[],
      clearWalk:[],noParked:[],targets:[],raise:[],arrows:[],run:[],fly:[],bombs:[],bolts:[],scrapP:[],deb:[],marks:[],beams:[],geys:[],nm:[],
      hp:D.hp,max:D.hp,inv:0,hurts:0,deaths:0,wrecked:0,bottlesGot:0,T:0,cp:null,ev:[],ei:0,trail:{x:[],y:[],z:[],L:[],n:0},cornerV:{},zoneName:'',lt:{},heal:{},hints:{},boss:null,end:null,slow:1,slowT:0,shake:0};
    STORY.s4=S4;STORY.dropN=0;STORY.saved=false;STORY.missionTime=0;STORY.restored=0;
    s4Build();
    /* a fake one-point track so the shared kart code has something to point at */
    const p0=s4At(8,0);C=[new V3(p0.x,24,p0.z)];T=[new V3(Math.sin(p0.h),0,Math.cos(p0.h))];R=[new V3(-T[0].z,0,T[0].x)];N=1;SEG=[2];ELEV=[false];GAP=[false];EDGE=[99];CURV=[0];TURN=[0];RL=[0];GAP_A=GAP_B=-1;MCX=0;MCZ=1200;GS=[];ES=[];
    const k=newKart(0,0,true);k.free=k.roam=true;k.ai.cap=1;k.visS=S4K.KS;k.camS=S4K.CS;player=k;karts.push(k);s4Place(8,0);
    s4Script();S4.cp={s:8,name:'THE RUNWAY',ei:0};
    s4HudInit();s4Hearts();s4MirrorInit();
    document.body.classList.add('mission','city');$('hud').hidden=false;$('coinsBox').hidden=true;$('sObj').hidden=true;$('sWater').hidden=true;$('sCompass').hidden=true;$('sTimer').hidden=true;$('sBoss').hidden=true;$('sHearts').hidden=false;$('sRadio').hidden=true;
    $('eQuit').textContent='Quit to story';$('eRestart').textContent='Restart stage';$('eRestart').hidden=false;
    spShown=-1;$('msg').textContent='';updateKartVisuals(0);camera.fov=63;camera.updateProjectionMatrix();updatePSScale();camSnap();s4Light(0,true);s4Vis(true);warmUp();
    $('loading').hidden=true;setBanner('');
    if(skipIntro)s4Launch();else{S.mode='cityintro';S4.mode='intro';S4.introT=0;$('hud').hidden=true;showBrief();}
  }catch(err){console.error(err);$('loading').hidden=true;}},40);}
function s4Launch(){STORY.briefing=false;$('sBrief').hidden=true;$('hud').hidden=false;S.mode='city';S4.mode='play';document.body.classList.add('racing');stopMusic();startMusic('city');camSnap();
  setBanner('<small>STAGE 1-4</small>FOUNTAIN CITY','big');setTimeout(()=>{if(S4&&S4.mode==='play'&&$('banner').textContent.includes('FOUNTAIN'))setBanner('');},2600);
  if(!S4.ram&&!S4.ramFit)s4RamFitStart();}
function s4Place(s,lat){const k=player;{const sg=S4SEG[S4.path.seg[s4At(s,0).i]];if(sg&&sg.k==='blvd'&&Math.abs(lat)<3)lat=6;}const q=s4At(s,lat);k.x=q.x;k.z=q.z;k.h=q.h;k.vx=k.vz=0;k.speed=0;k.air=false;k.vy=0;k.hitT=0;k.spinAng=0;k.tumbleY=0;k.hitType=null;k.drift.on=false;k.boostT=0;
  k.s4i=-1;const nq=s4Near(k.x,k.z,-1);k.s4i=nq.i;k.y=s4Ground(k);k.visY=null;k.lock=false;locate(k);cam.h=k.h;
  const T=S4.trail;T.x.length=T.y.length=T.z.length=T.L.length=0;T.n=0;s4TrailPush(k,true);camSnap();s4Vis(true);}
function s4Dispose(){const c=S4;if(!c)return;for(const o of[c.back,c.farCastle]){if(o){scene.remove(o);o.geometry.dispose();o.material.dispose();}}
  if(c.lights)for(const l of c.lights)scene.remove(l);if(c.G&&c.G.parent)disposeObj(c.G);if(c.mirror){c.mirror.rt.dispose();}
  for(const ps of psList)ps.clear();if(sky)sky.position.set(0,0,0);S4.on=false;S4=null;STORY.s4=null;
  document.body.classList.remove('city');const h=$('s4Hud');if(h)h.hidden=true;if(AU.eng)AU.eng.gn.gain.value=0;}
function s4Exit(){s4Dispose();STORY.group=null;MAP=null;buildMapM(STORY_MAP);}
function s4Horn(){if(!AU.ctx||!S4||S.mode!=='city')return;SFX.tung();setTimeout(()=>SFX.tung(),140);}

/* ---------- the frame ---------- */
/* one bad frame must never freeze the whole game: log it and keep driving */
function s4Frame(dt,rawDt){try{s4FrameIn(dt,rawDt);}catch(e){const c=S4;console.error('stage 4 frame',e);if(c){c.errN=(c.errN||0)+1;if(c.errN===1||c.errN%300===0)console.warn('s4 errors so far: '+c.errN);}}}
function s4FrameIn(dt,rawDt){const c=S4;if(!c)return;
  if(S.mode==='paused'){s4Hud(0);return;}
  if(c.slowT>0){c.slowT-=dt;c.slow=lerp(c.slow,c.slowT>0?.32:1,1-Math.exp(-dt*8));}else c.slow=lerp(c.slow,1,1-Math.exp(-dt*5));
  const gdt=dt*c.slow;
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').textContent='';}
  for(const ps of psList)ps.update(gdt);
  if(S.mode==='cityintro')s4IntroCam(dt);
  else if(S.mode==='city')s4Tick(gdt,dt);
  else if(S.mode==='cityend')s4EndTick(dt);
  else if(S.mode==='results')s4ResultsCam(dt);
  s4Fx(gdt);s4Light(dt);s4Vis(false,dt);s4Hud(dt);
  if(sky)sky.position.copy(camera.position);if(c.back){c.back.position.x=camera.position.x;c.back.position.z=camera.position.z;}
  if(AU.eng){const k=player,e=AU.eng,t=AU.ctx.currentTime,sp=Math.abs(k.speed),f=55+sp*3.4+(k.boostT>0?30:0)+(k.drift.on?12:0);e.o1.frequency.setTargetAtTime(f,t,.05);e.o2.frequency.setTargetAtTime(f,t,.05);e.f.frequency.setTargetAtTime(400+sp*40,t,.08);e.gn.gain.setTargetAtTime(S.mode==='city'?.04+Math.min(.035,sp*.001):0,t,.1);}
  if(S.mode==='city'&&SET.gfx==='auto')dynRes(rawDt);}
function s4Tick(dt,realDt){const c=S4,k=player,D=c.D;c.T+=dt;STORY.missionTime=c.T;if(c.inv>0)c.inv-=dt;
  const steps=Math.min(8,Math.max(1,Math.ceil(dt*120-1e-6))),h=dt/steps;
  for(let i=0;i<steps;i++){const ctl=k.lock?{steer:0,gas:0,brake:1,drift:false}:playerControl(k);stepKart(k,ctl,h);
    if(!k.air){const fx=Math.sin(k.h),fz=Math.cos(k.h),a=s4Floor(k.x+fx*1.3,k.z+fz*1.3).y,b=s4Floor(k.x-fx*1.3,k.z-fz*1.3).y,sl=(a-b)/2.6;k.fdSl=Math.abs(sl)>.3?0:sl;k.speed-=GRAV*.5*clamp(k.fdSl,-.6,.9)*h;}
    s4KartCollide(k,h);}
  const q=s4Near(k.x,k.z,k.s4i);k.s4i=q.i;c.ps=q.s;c.plat=q.lat;c.ph=q.h;c.maxS=Math.max(c.maxS||0,q.s);
  /* wedged against something while the engine roars: ease the kart back toward the middle of the road */
  {const mv=Math.hypot(k.x-(c.lx||k.x),k.z-(c.lz||k.z));c.lx=k.x;c.lz=k.z;if(Math.abs(k.speed)>4&&mv<Math.abs(k.speed)*dt*.15&&!k.lock){c.stuckT=(c.stuckT||0)+dt;if(c.stuckT>.5){k.speed*=.4;k.h+=clamp(wrapA(q.h-k.h),-.5,.5);const p=s4At(q.s,q.lat*.85);k.x=p.x;k.z=p.z;c.stuckT=0;}}else c.stuckT=0;}
  s4TrailPush(k,false);
  /* corner speed (bots behind you can lose it on a fast corner) */
  for(let i=3;i<S4N.length-1;i++){if(!s4Turn(i))continue;const ns=S4.path.ns[i];if(c.cornerV[i]==null&&q.s>ns)c.cornerV[i]=Math.abs(k.speed);}
  while(c.ei<c.ev.length&&c.ev[c.ei].s<=q.s){const e=c.ev[c.ei++];if(e.done&&!e.rep)continue;e.done=true;try{e.f();}catch(err){console.warn('s4 event',err);}}
  s4Pickups(k,dt);s4Runners(dt);s4Sleepers(dt);s4Flyers(dt);s4Turrets(dt);s4Duds(dt);s4Throwers(dt);s4Shots(dt);s4BossTick(dt);s4Events(dt);
  updateKartVisuals(dt);s4Cam(realDt);if(c.ramFit)s4RamFitTick(realDt);placeSun(k.x,k.y,k.z);
  if(c.dying!=null){c.dying-=realDt;if(c.dying<=0){c.dying=null;s4Respawn();}}}
function s4TrailPush(k,force){const T=S4.trail,n=T.n;if(!force&&n){const dx=k.x-T.x[n-1],dz=k.z-T.z[n-1];if(dx*dx+dz*dz<.36)return;}
  const L=n?T.L[n-1]+Math.hypot(k.x-T.x[n-1],k.z-T.z[n-1]):0;T.x.push(k.x);T.y.push(k.y);T.z.push(k.z);T.L.push(L);T.n++;
  if(T.n>4000){const cut=1000;for(const a of[T.x,T.y,T.z,T.L])a.splice(0,cut);T.n-=cut;}}
/* a point on your trail, d metres behind where you are now */
function s4TrailAt(d,out){const T=S4.trail,n=T.n;if(!n)return null;const L=T.L[n-1]-d;if(L<T.L[0])return null;let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(T.L[m]<=L)lo=m;else hi=m;}
  const t=hi>lo?(L-T.L[lo])/Math.max(1e-6,T.L[hi]-T.L[lo]):0;out.x=lerp(T.x[lo],T.x[hi],t);out.y=lerp(T.y[lo],T.y[hi],t);out.z=lerp(T.z[lo],T.z[hi],t);out.h=Math.atan2(T.x[hi]-T.x[lo],T.z[hi]-T.z[lo])||0;out.L=L;return out;}

/* ---------- the kart against walls, wrecks and things you can smash ---------- */
const S4NEAR=[];
function s4KartCollide(k,h){const c=S4,R=S4K.KR,top=cc().top;
  /* the edge of the drivable area (building fronts, barriers, the deck edge) */
  const w=s4Wall(k,R);if(w){const vn=k.vx*w.nx+k.vz*w.nz;if(vn>0){k.vx-=w.nx*vn*1.35;k.vz-=w.nz*vn*1.35;
      if(vn>7){k.speed*=.78;if(k.wallCool<=0){k.wallCool=.35;burst(k.x+w.nx*1.2,k.y+.6,k.z+w.nz*1.2,14,[1,.85,.5],9,1,.35);SFX.bump();cam.shake=Math.max(cam.shake,.25);}}
      const th=Math.atan2(-w.nz,w.nx),a1=th,a2=th+Math.PI,al=Math.cos(k.h-a1)>0?a1:a2;k.h+=clamp(wrapA(al-k.h),-1.4*h,1.4*h);}}
  /* solid things */
  s4ColsNear(k.x,k.z,S4NEAR);
  for(const col of S4NEAR){if(!col.on||k.y>col.top)continue;const hit=s4Hit(k,R,col);
    if(!hit){/* near misses make the bots behind you crash */if(Math.abs(k.speed)>top*.72&&(col.kind==='fire'||col.kind==='car'||col.kind==='wreck'||col.kind==='pillar'||col.kind==='rubble'||col.kind==='planter')){
        const dd=col.box?Math.max(0,Math.hypot(Math.max(0,Math.abs((k.x-col.x)*Math.cos(col.yaw)-(k.z-col.z)*Math.sin(col.yaw))-col.hx),Math.max(0,Math.abs((k.x-col.x)*Math.sin(col.yaw)+(k.z-col.z)*Math.cos(col.yaw))-col.hz))-R):Math.hypot(k.x-col.x,k.z-col.z)-col.r-R;
        if(dd<1.3&&(col.nmT||0)<S.t){col.nmT=S.t+3;c.nm.push({L:c.trail.n?c.trail.L[c.trail.n-1]:0,x:col.x,z:col.z,used:false});if(c.run.length)showMsg('NEAR MISS!',.9,'good');}}
      continue;}
    const nx=hit.nx,nz=hit.nz,vn=k.vx*nx+k.vz*nz;let imp=0;if(vn<0){imp=-vn;k.vx-=nx*vn*1.3;k.vz-=nz*vn*1.3;}
    if(col.kind==='firewall'){k.vx=nx*14;k.vz=nz*14;k.speed=-6;s4Hurt(1,'TOO HOT!');if(!c.hints.fire2){c.hints.fire2=1;showMsg('Ram the glowing cracked pipe to put the fire out!',4,'warn');}continue;}
    if(col.kind==='target'){if(imp>3||Math.abs(k.speed)>9)s4Ram(col);}
    if(col.kind==='fire'&&(imp>1.5||Math.abs(k.speed)>6))s4Hurt(1,'BURNING CAR!');
    if(col.kind==='bot'&&col.bot)s4BotBump(col.bot);
    if(imp>5){k.speed*=Math.max(.25,1-imp/42);if(k.wallCool<=0){k.wallCool=.3;burst(k.x-nx,k.y+.7,k.z-nz,18,col.kind==='fire'?[1,.55,.2]:[1,.85,.5],10,1.1,.4);SFX.bump();cam.shake=Math.max(cam.shake,Math.min(.6,imp*.03));}}
    else if(imp>.5)k.speed*=.97;
    const th=Math.atan2(-nz,nx),al=Math.cos(k.h-th)>0?th:th+Math.PI;k.h+=clamp(wrapA(al-k.h),-.9*h,.9*h);}
  /* things you smash */
  const L=[];for(let gx=Math.floor((k.x-3)/30);gx<=Math.floor((k.x+3)/30);gx++)for(let gz=Math.floor((k.z-3)/30);gz<=Math.floor((k.z+3)/30);gz++){const a=c.bgrid.get(gx+','+gz);if(a)for(const b of a)L.push(b);}
  for(const b of L){if(!b.alive)continue;if(k.y>b.y+b.def.top)continue;const dx=k.x-b.x,dz=k.z-b.z;if(dx*dx+dz*dz<(b.def.r+R)*(b.def.r+R))s4Break(b,k);}}
const S4M=new THREE.Matrix4(),S4ZERO=new THREE.Matrix4().makeScale(0,0,0);
function s4Break(b,k){const c=S4;b.alive=false;for(const im of b.ims){im.setMatrixAt(b.i,S4ZERO);im.instanceMatrix.needsUpdate=true;}
  const sp=Math.max(6,Math.abs(k.speed));k.speed*=b.def.slow;
  for(const [geo,mat] of b.def.parts){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.position.set(b.x,b.y,b.z);m.rotation.y=b.yaw;c.G.add(m);
    const v=new V3(Math.sin(k.h)*sp*.85+(Math.random()-.5)*5,4+Math.random()*4+sp*.1,Math.cos(k.h)*sp*.85+(Math.random()-.5)*5);c.deb.push({m,v,r:new V3((Math.random()-.5)*12,(Math.random()-.5)*10,(Math.random()-.5)*12),t:0,y0:b.y,life:3.2});}
  if(b.type==='can'){for(let i=0;i<14;i++)FX.emit(b.x,b.y+.8,b.z,(Math.random()-.5)*8+Math.sin(k.h)*sp*.4,3+Math.random()*5,(Math.random()-.5)*8+Math.cos(k.h)*sp*.4,.85,.82,.7,.35,1.4,{g:14,drag:.6});tone(820,.08,'square',.05,420);noise(.25,.22,3000,900,'bandpass');}
  else if(b.type==='crate'||b.type==='box'){burst(b.x,b.y+.6,b.z,16,[.75,.55,.3],8,.8,.5);noise(.3,.25,900,300,'lowpass');}
  else{burst(b.x,b.y+.5,b.z,10,[.9,.9,.9],7,.7,.4);SFX.bump();}
  if(b.def.geyser){c.geys.push({x:b.x,y:b.y+.5,z:b.z,t:0});SFX.splash();}
  if(Math.random()<b.def.heart*(c.hp<c.max?1.6:.6))s4Heart(b.x+Math.sin(k.h)*6,b.z+Math.cos(k.h)*6,true);}
function s4Pickups(k,dt){const c=S4;
  for(let i=c.hearts.length-1;i>=0;i--){const p=c.hearts[i];p.t+=dt;p.pop=Math.min(1,p.pop+dt*3);p.g.position.y=p.y+1.4+Math.sin(S.t*3+p.ph)*.25;p.g.rotation.y+=dt*2.4;p.g.scale.setScalar(1.3*K4ease(p.pop));
    if(Math.hypot(k.x-p.x,k.z-p.z)<2.4&&k.y<p.y+3){c.G.remove(p.g);c.hearts.splice(i,1);if(c.hp<c.max){c.hp++;s4Hearts();showMsg('+1 ♥',1.1,'good');}else showMsg('Hearts full!',1,'good');SFX.get();burst(p.x,p.y+1.4,p.z,20,[1,.4,.5],8,1,.5);}}
  for(const b of c.bottles){if(b.got)continue;b.g.rotation.y+=dt*1.6;b.g.position.y=b.y+.3+Math.sin(S.t*2.2)*.15;if(Math.random()<dt*6)FX.emit(b.x+(Math.random()-.5),b.y+1.2,b.z+(Math.random()-.5),0,1.5,0,.5,.85,1,.5,.9,{g:-1});
    if(Math.hypot(k.x-b.x,k.z-b.z)<2.6){b.got=true;b.g.visible=false;c.bottlesGot++;STORY.dropN+=3;SFX.looks();setBanner('<small>HIDDEN WATER</small>BOTTLE '+c.bottlesGot+'/5','big');burst(b.x,b.y+1,b.z,40,[.4,.8,1],12,1.4,.7);setTimeout(()=>{if(S4&&$('banner').textContent.includes('BOTTLE'))setBanner('');},1800);}}
  /* fresh water from the burst pipe heals one heart */
  const W=c.water;if(W&&W.on&&!c.heal.pipe&&Math.abs(k.x-W.x)<12&&k.z>W.z0&&k.z<W.z1){c.heal.pipe=1;if(c.hp<c.max){c.hp++;s4Hearts();}showMsg('FRESH WATER! +1 ♥',1.6,'good');SFX.splash();}}
const K4ease=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
/* ---------- getting hurt, wrecking, checkpoints ---------- */
function s4Hurt(n,msg){const c=S4,k=player;if(!c||c.mode!=='play'||c.dying!=null)return false;if(c.inv>0||k.invT>0)return false;
  c.hp=Math.max(0,c.hp-n);c.inv=c.D.inv;k.invT=c.D.inv;c.hurts++;k.speed*=.5;cam.shake=Math.max(cam.shake,.7);flash(.28);SFX.hit();burst(k.x,k.y+1,k.z,26,[1,.35,.3],11,1.2,.5);showMsg(msg+' -1 ♥',1.3,'warn');
  const el=$('sHearts');el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');s4Hearts();
  if(c.hp<=0){c.dying=1.8;c.deaths++;setBanner('WRECKED!','big');SFX.boom();k.lock=true;k.hitT=1.2;k.hitDur=1.2;k.hitType='tumble';burst(k.x,k.y+1,k.z,60,[1,.6,.2],14,1.8,.8);}
  return true;}
function s4Hearts(){const c=S4,el=$('sHearts');if(!c||!el)return;let h='';for(let i=0;i<c.max;i++)h+='<i class="'+(i<c.hp?'on':'')+'"></i>';if(el.innerHTML!==h)el.innerHTML=h;}
function s4CP(name,s){const c=S4;if(c.cp&&c.cp.s>=s)return;c.cp={s,name,ei:c.ei};setBanner('<small>CHECKPOINT</small>'+name,'big');tone(990,.12,'triangle',.06);tone(1320,.2,'triangle',.06,null,.12);setTimeout(()=>{if(S4&&$('banner').textContent.includes(name))setBanner('');},1800);}
function s4ClearBaddies(){const c=S4;for(const r of c.run)c.G.remove(r.g);c.run=[];for(const f of c.fly)c.G.remove(f.g);c.fly=[];for(const b of c.bombs){c.G.remove(b.g);}c.bombs=[];for(const b of c.bolts)c.G.remove(b.g);c.bolts=[];for(const p of c.scrapP)c.G.remove(p.g);c.scrapP=[];
  for(const m of c.marks)m.m.visible=false;for(const b of c.beams)b.m.visible=false;}
function s4Respawn(){const c=S4,k=player,cp=c.cp;s4ClearBaddies();flash(.9);
  c.hp=c.max;c.inv=0;s4Hearts();
  /* sleeping bots ahead of the checkpoint go back to sleep */
  for(let i=0;i<c.sleep.length;i++){const b=c.sleep[i];if(b.s<cp.s+5)continue;c.G.remove(b.g);c.sleep[i]=s4MakeSleeper(b.s,b.lat0);}
  /* re-arm the repeatable events after the checkpoint */
  for(const e of c.ev)if(e.rep&&e.s>cp.s)e.done=false;c.ei=c.ev.findIndex(e=>e.s>cp.s);if(c.ei<0)c.ei=c.ev.length;
  c.cornerV={};c.nm=[];
  if(c.boss)s4BossRespawn(cp);
  s4Place(cp.s,0);k.invT=2.4;setBanner('<small>CHECKPOINT</small>'+cp.name,'big');setTimeout(()=>{if(S4&&$('banner').textContent.includes(cp.name))setBanner('');},1600);camSnap();}
/* ---------- camera ---------- */
function s4Cam(dt){const k=player,c=S4;camFollow(dt,false);
  /* swing wider on corners when bots are chasing, so you can see them */
  const P=S4.path;let near=1e9;for(let i=3;i<S4N.length-1;i++){if(!s4Turn(i))continue;const d=c.ps-P.ns[i];if(Math.abs(d)<Math.abs(near))near=d;}
  const want=(c.run.length||c.boss)&&near>-28&&near<18?1:0;c.wide=lerp(c.wide||0,want,1-Math.exp(-dt*2.5));
  if(c.wide>.01&&SET.cam!==1){const fx=Math.sin(cam.h),fz=Math.cos(cam.h);const cs=S4K.CS;camera.position.x-=fx*3.4*cs*c.wide;camera.position.z-=fz*3.4*cs*c.wide;camera.position.y+=1.6*cs*c.wide;camera.lookAt(cam.look);}
  if(c.boss&&c.boss.mode!=='dead'&&SET.cam!==1){camera.position.y+=1.2;camera.lookAt(cam.look.x,cam.look.y+.6,cam.look.z);}
  /* never poke the camera through a ceiling */
  for(const z of S4.dark){if(z.ceil&&camera.position.x>z.x0-2&&camera.position.x<z.x1+2&&camera.position.z>z.z0-2&&camera.position.z<z.z1+2&&camera.position.y>z.ceil){camera.position.y=z.ceil;camera.lookAt(cam.look);}}
  const I=S4.indoor;if(I&&camera.position.x>I.x0&&camera.position.x<I.x1&&camera.position.z>I.z0&&camera.position.z<I.z1&&camera.position.y>I.y-.6){camera.position.y=I.y-.6;camera.lookAt(cam.look);}
  if(c.shake>0){c.shake=Math.max(0,c.shake-dt*1.6);const s=c.shake*.5;camera.position.x+=(Math.random()-.5)*s;camera.position.y+=(Math.random()-.5)*s;camera.position.z+=(Math.random()-.5)*s;}}
/* while the briefing is up: a slow look around from the highway */
function s4IntroCam(dt){const c=S4,k=player;c.introT=(c.introT||0)+dt;const a=-.4+c.introT*.07;camera.position.set(k.x+Math.sin(a+k.h+Math.PI)*16,k.y+5.5,k.z+Math.cos(a+k.h+Math.PI)*16);camera.lookAt(k.x+Math.sin(k.h)*60,k.y+6,k.z+Math.cos(k.h)*60);placeSun(k.x,k.y,k.z);updateKartVisuals(dt);}
