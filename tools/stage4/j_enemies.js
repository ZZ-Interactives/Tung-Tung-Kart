
/* ---------- warning rings on the ground and laser beams (pooled) ---------- */
function s4Mark(x,z,r,col,life){const c=S4;let m=c.marks.find(q=>!q.m.visible);if(!m){const g=new THREE.Mesh(new THREE.RingGeometry(.82,1,40),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));g.rotation.x=-Math.PI/2;g.renderOrder=3;
    const dot=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));g.add(dot);c.G.add(g);m={m:g,dot};c.marks.push(m);}
  m.m.visible=true;m.m.material.color.setHex(col||0xff2a3a);m.dot.material.color.setHex(col||0xff2a3a);m.x=x;m.z=z;m.r=r;m.t=0;m.life=life;const y=s4Floor(x,z).y+.06;m.m.position.set(x,y,z);m.m.scale.setScalar(r);return m;}
function s4Beam(a,b,col,w){const c=S4;let q=c.beams.find(v=>!v.m.visible);if(!q){const g=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,8,1,true),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));g.geometry.translate(0,.5,0);g.geometry.rotateX(Math.PI/2);c.G.add(g);q={m:g};c.beams.push(q);}
  q.m.visible=true;q.m.material.color.setHex(col||0xff2a3a);const d=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);q.m.position.copy(a);q.m.lookAt(b);q.m.scale.set(w||.05,w||.05,d);return q;}
/* ---------- GROK Runners: they follow your exact path ---------- */
function s4Chase(n,msg){const c=S4;if(c.boss&&c.boss.mode==='chase'&&n>2)n=2;for(let k=0;k<n;k++){const g=s4Models().runner.clone(true);c.G.add(g);
    const r={g,body:g.children[0],d:62+k*9+Math.random()*4,v:0,lat:(k%2?1:-1)*(.8+Math.random()*1.2),ph:Math.random()*6,s:0,lastS:-1,dead:false,hum:0};g.visible=false;c.run.push(r);}
  if(msg){setBanner(msg,'warn');setTimeout(()=>{if(S4&&$('banner').textContent===msg)setBanner('');},1600);}
  for(let k=0;k<3;k++){tone(760,.14,'square',.04,null,k*.3);tone(560,.14,'square',.04,null,k*.3+.15);}}
const S4TP={x:0,y:0,z:0,h:0,L:0},S4TP2={x:0,y:0,z:0,h:0,L:0};
function s4RunnerBoom(r,why){const c=S4,p=r.g.position;r.dead=true;c.G.remove(r.g);c.wrecked++;burst(p.x,p.y+1,p.z,46,[1,.55,.2],14,1.6,.7);burst(p.x,p.y+1,p.z,24,[.4,.9,1],10,1.1,.5);SMOKE.emit(p.x,p.y+1.5,p.z,0,3,0,.25,.24,.24,5,3,{grow:3,a:.5});
  SFX.boom();flashLight.position.set(p.x,p.y+2,p.z);flashLight.intensity=6;const T=s4Models();
  for(let k=0;k<5;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.4+Math.random()*.5,.2,.4+Math.random()*.4),k%2?T.gm:T.gd);m.position.set(p.x,p.y+1,p.z);c.G.add(m);c.deb.push({m,v:new V3((Math.random()-.5)*14,6+Math.random()*7,(Math.random()-.5)*14),r:new V3(Math.random()*9,Math.random()*9,Math.random()*9),t:0,y0:s4Floor(p.x,p.z).y,life:2.6,own:true});}
  if(why&&Math.random()<.7){const lines={corner:['WIPEOUT!','BOT CRASHED THE CORNER!'],nm:['BOT HIT THE WRECK!','KABOOM!'],water:['SHORT CIRCUIT!'],boss:['SQUASHED BY THE BOSS!'],fall:['CRUSHED!']}[why]||['BOT DOWN!'];showMsg(lines[(Math.random()*lines.length)|0],1.1,'good');}}
function s4Runners(dt){const c=S4,k=player,D=c.D,top=cc().top,vp=Math.abs(k.speed),T=c.trail,nowL=T.n?T.L[T.n-1]:0;let closest=1e9;
  for(const r of c.run){if(r.dead)continue;
    /* how fast it goes: a bit slower than you at full speed, faster when it is far behind */
    let vt=top*D.chase;if(r.d>48)vt+=9;if(r.d<14)vt=Math.min(vt,vp+3.5);r.v+=(vt-r.v)*Math.min(1,dt*1.8);r.d+=(vp-r.v)*dt;
    if(r.d>120){r.dead=true;c.G.remove(r.g);showMsg('Lost one!',.9,'good');continue;}
    const p=s4TrailAt(Math.max(.5,r.d),S4TP);if(!p){r.g.visible=false;continue;}r.g.visible=true;
    /* a fast corner or a near miss can wreck it */
    const q=s4Near(p.x,p.z,r.qi!=null?r.qi:-1);r.qi=q.i;r.s=q.s;
    if(r.lastS>=0){for(let i=3;i<S4N.length-1;i++){if(!s4Turn(i))continue;const ns=S4.path.ns[i];if(r.lastS<ns&&r.s>=ns){const v=c.cornerV[i]||0;if(v>top*.74&&Math.random()<(v>top*.88?.55:.32)){s4RunnerBoom(r,'corner');break;}}}}
    if(r.dead)continue;
    for(const nm of c.nm){if(nm.used)continue;if(p.L>=nm.L-1&&p.L<nm.L+6){nm.used=Math.random()<.5;if(Math.random()<.5){s4RunnerBoom(r,'nm');break;}}}
    if(r.dead)continue;r.lastS=r.s;
    /* sits a little to one side of your line and wobbles */
    r.ph+=dt;const lat=r.lat*Math.min(1,r.d/20)+Math.sin(r.ph*1.7)*.5,fx=Math.sin(p.h),fz=Math.cos(p.h);
    const x=p.x-fz*lat,z=p.z+fx*lat,y=s4Floor(x,z).y;r.g.position.set(x,y+Math.sin(r.ph*5)*.06,z);
    const pr=s4TrailAt(Math.max(.5,r.d-2),S4TP2);const hh=pr?Math.atan2(pr.x-p.x,pr.z-p.z):p.h;const dh=wrapA(hh-r.g.rotation.y);r.g.rotation.y+=dh*Math.min(1,dt*10);r.body.rotation.z=clamp(-dh*3,-.5,.5);r.body.rotation.x=-.05-Math.min(.15,r.v*.003);
    for(const ch of r.body.children){if(ch.userData.ex){const s=2+Math.random()*1.4;ch.scale.set(s,s,1);}else if(ch.userData.blink)ch.visible=Math.sin(S.t*8+r.ph)>0;}
    if(Math.random()<dt*14)FX.emit(x-fx*2.2,y+1.1,z-fz*2.2,-fx*6+(Math.random()-.5)*2,(Math.random())*1.5,-fz*6+(Math.random()-.5)*2,.4,.9,1,.6,.35,{g:0,drag:2});
    closest=Math.min(closest,r.d);
    /* it caught you */
    if(r.d<2.6){if(s4Hurt(1,'BOT RAM!'))k.speed=Math.max(k.speed*.6,0);s4RunnerBoom(r,'');}}
  c.run=c.run.filter(r=>!r.dead);c.closest=closest;
  /* bots hum louder as they get close */
  if(closest<30&&Math.random()<dt*(4-closest/10))tone(180+Math.random()*30,.07,'sawtooth',.012*(1-closest/30),120);}
/* ---------- sleeping bots on the road ---------- */
function s4Sleepers(dt){const c=S4,k=player,D=c.D;
  for(const b of c.sleep){if(b.dead)continue;const ahead=b.s-c.ps;
    if(b.st==='sleep'){b.rig.position.y=-1.1+Math.sin(S.t*.8+b.s)*.02;if(ahead<34*D.react&&ahead>2){b.st='wake';b.t=0;tone(1400,.06,'square',.05);tone(1800,.08,'square',.05,null,.08);b.tl=clamp(c.plat+(Math.random()-.5)*1.5,-6,6);}}
    else if(b.st==='wake'){b.t+=dt;const u=Math.min(1,b.t/.42);b.rig.position.y=lerp(-1.1,0,u*u*(3-2*u));b.rig.rotation.x=lerp(.25,0,u);b.eyeM.color.setHex(Math.sin(b.t*30)>0?0xff2a3a:0x3a0a0e);b.eg.material.color.setHex(0xff2a3a);b.eg.material.opacity=u;
      if(b.t>.42){b.st='step';b.t=0;b.eyeM.color.setHex(0xff2a3a);}}
    else if(b.st==='step'){b.t+=dt;const sp=7.5;const d=b.tl-b.lat;b.lat+=clamp(d,-sp*dt,sp*dt);b.walk+=dt*(Math.abs(d)>.2?9:2);if(b.t>1.6)b.st='stand';}
    else if(b.st==='stand'){b.walk+=dt*2;if(ahead<-30){b.st='off';}}
    if(b.st==='step'||b.st==='stand'||b.st==='wake'){const q=s4At(b.s,b.lat);b.x=q.x;b.z=q.z;b.g.position.set(q.x,s4Floor(q.x,q.z).y,q.z);b.g.rotation.y=q.h+Math.PI;
      b.legs.forEach((l,i)=>{l.rotation.z=Math.sin(b.walk+i*Math.PI/2)*.35;});b.lg.visible=Math.sin(S.t*10)>0;
      /* you hit it */
      if(Math.abs(ahead)<6&&Math.hypot(k.x-b.x,k.z-b.z)<2.6&&k.y<4){b.dead=true;c.wrecked++;burst(b.x,1.2,b.z,40,[.5,.9,1],12,1.3,.6);burst(b.x,1.2,b.z,20,[1,.7,.3],10,1,.5);SFX.boom();
        /* the battering ram takes it head-on: the bot goes flying and you keep going */
        const fx=Math.sin(k.h),fz=Math.cos(k.h),front=((b.x-k.x)*fx+(b.z-k.z)*fz)>-.3;
        if(c.ram&&front){s4Launch4(b.g,k);k.speed*=.86;cam.shake=Math.max(cam.shake,.45);showMsg(['RAMMED!','BONK!','SMASHED!','OUTTA HERE!'][(Math.random()*4)|0],.9,'good');}
        else{b.g.visible=false;if(s4Hurt(1,'BOT!'))k.speed*=.45;else k.speed*=.7;}}}
    if(b.st==='off'&&ahead<-60){b.dead=true;b.g.visible=false;}}}
/* ---------- flying bots that drop bombs ---------- */
function s4Flyers(dt){const c=S4,k=player,D=c.D;
  for(const f of c.fly){if(f.dead)continue;f.t+=dt;const fx=Math.sin(c.ph),fz=Math.cos(c.ph);
    let tx,ty,tz;if(f.st==='in'){const u=Math.min(1,f.t/2.2);tx=k.x+fx*lerp(-30,f.lead,u)-fz*f.side;tz=k.z+fz*lerp(-30,f.lead,u)+fx*f.side;ty=k.y+lerp(22,13,u);if(u>=1)f.st='bomb';}
    else if(f.st==='bomb'){tx=k.x+fx*f.lead-fz*f.side;tz=k.z+fz*f.lead+fx*f.side;ty=k.y+13;f.cd-=dt;if(f.cd<=0&&f.n>0){f.n--;f.cd=(1.5+Math.random()*.8)/D.fire;s4Bomb(f);}if(f.n<=0&&f.cd<-1)f.st='out';}
    else{tx=f.g.position.x+fx*60;tz=f.g.position.z+fz*60;ty=f.g.position.y+20;if(f.t>30||f.g.position.y>k.y+60){f.dead=true;c.G.remove(f.g);continue;}}
    const p=f.g.position,a=1-Math.exp(-dt*(f.st==='out'?1:2.6));p.x+=(tx-p.x)*a;p.y+=(ty-p.y)*a;p.z+=(tz-p.z)*a;f.g.rotation.y=c.ph+Math.PI*0;f.g.rotation.z=Math.sin(f.t*2)*.08;
    f.g.traverse(o=>{if(o.userData.rotor)o.rotation.z+=dt*40;else if(o.userData.blink)o.visible=Math.sin(S.t*9)>0;});}
  c.fly=c.fly.filter(f=>!f.dead);}
function s4FlyIn(n){const c=S4;if(c.boss&&c.boss.mode!=='dead')return;for(let k=0;k<n;k++){const g=s4Models().scout.clone(true);g.scale.setScalar(.7);const p=player;g.position.set(p.x-Math.sin(c.ph)*40,p.y+24,p.z-Math.cos(c.ph)*40);c.G.add(g);
    c.fly.push({g,t:-k*1.2,st:'in',lead:26+k*10,side:(k%2?1:-1)*(3+Math.random()*3),n:4+((Math.random()*3)|0),cd:.8+k*.6,dead:false});}
  setBanner('BOMB DRONES!','warn');setTimeout(()=>{if(S4&&$('banner').textContent==='BOMB DRONES!')setBanner('');},1500);noise(1.4,.12,600,2200,'bandpass');}
function s4Bomb(f){const c=S4,k=player,lead=1.15,tx=k.x+k.vx*lead+(Math.random()-.5)*2.4,tz=k.z+k.vz*lead+(Math.random()-.5)*2.4,g=s4Models().bomb.clone(true),p=f.g.position;g.position.copy(p);c.G.add(g);
  const m=s4Mark(tx,tz,3.6,0xff2a3a,lead);c.bombs.push({g,x0:p.x,y0:p.y,z0:p.z,tx,tz,ty:s4Floor(tx,tz).y,t:0,T:lead,m,r:3.6});tone(1200,.9,'sine',.03,300);}
/* ---------- turrets on balconies ---------- */
function s4Turrets(dt){const c=S4,k=player,D=c.D;
  for(const t of c.turrets){const dx=k.x-t.x,dz=k.z-t.z,d=Math.hypot(dx,dz),fwd=Math.sin(t.yaw)*dx+Math.cos(t.yaw)*dz;
    const active=d<72&&d>6&&fwd>-4&&c.mode==='play'&&!(c.boss&&c.boss.mode==='chase');
    const head=t.head;if(active||t.st==='aim'){const ax=t.st==='aim'?t.tx-t.x:dx,az=t.st==='aim'?t.tz-t.z:dz,yaw=Math.atan2(ax,az)-t.yaw;head.rotation.y+=wrapA(yaw-head.rotation.y)*Math.min(1,dt*8);head.rotation.x=lerp(head.rotation.x,Math.atan2(t.y,Math.max(4,d))*.9,Math.min(1,dt*6));}
    if(t.st==='idle'){t.cd-=dt;if(active&&t.cd<=0){t.st='aim';t.aim=0;const lead=.95;t.tx=k.x+k.vx*lead;t.tz=k.z+k.vz*lead;t.m=s4Mark(t.tx,t.tz,2.3,0xff2a3a,.95/D.fire+.3);tone(1300,.08,'square',.03);}}
    else if(t.st==='aim'){t.aim+=dt;const lead=Math.max(.15,.95-t.aim);t.tx=lerp(t.tx,k.x+k.vx*lead,Math.min(1,dt*1.5/D.react));t.tz=lerp(t.tz,k.z+k.vz*lead,Math.min(1,dt*1.5/D.react));if(t.m){t.m.x=t.tx;t.m.z=t.tz;t.m.m.position.x=t.tx;t.m.m.position.z=t.tz;}
      const a=new V3(t.x,t.y+1.05,t.z),b=new V3(t.tx,s4Floor(t.tx,t.tz).y+.1,t.tz);if(!t.beam||!t.beam.m.visible)t.beam=s4Beam(a,b,0xff2a3a,.04);else{const q=t.beam;q.m.position.copy(a);q.m.lookAt(b);q.m.scale.set(.04,.04,a.distanceTo(b));}t.beam.m.material.opacity=.35+.35*Math.sin(S.t*40);
      if(t.aim>=.95/D.fire+.25){t.st='idle';t.cd=1.5+Math.random()*1.3;if(t.beam)t.beam.m.visible=false;s4Bolt(a,b,2.4);}}}}
/* the three turrets that only ever shoot behind you */
function s4Duds(dt){const c=S4,k=player;for(const t of c.duds){const d=Math.hypot(k.x-t.x,k.z-t.z);if(d>70){continue;}
    t.cd-=dt;const back=4+Math.random()*9,bx=k.x-Math.sin(k.h)*back+(Math.random()-.5)*4,bz=k.z-Math.cos(k.h)*back+(Math.random()-.5)*4;
    const yaw=Math.atan2(bx-t.x,bz-t.z)-t.g.rotation.y;t.head.rotation.y+=wrapA(yaw-t.head.rotation.y)*Math.min(1,dt*10);t.head.rotation.x=.5;
    if(t.cd<=0){t.cd=t.burst>0?.12:1.1+Math.random()*.8;t.burst=t.burst>0?t.burst-1:3;const a=new V3(t.x,t.y,t.z),b=new V3(bx,s4Floor(bx,bz).y+.05,bz);s4Bolt(a,b,0,true);t.shots++;}}}
function s4Bolt(a,b,r,dud){const c=S4,g=s3Templates().boltE.clone(true);g.scale.setScalar(.55);g.position.copy(a);g.lookAt(b);c.G.add(g);c.bolts.push({g,a:a.clone(),b:b.clone(),t:0,T:Math.max(.12,a.distanceTo(b)/90),r,dud});tone(dud?1500:900,.12,'sawtooth',.04,dud?300:180);}
/* ---------- camp bots throwing scrap ---------- */
function s4Throwers(dt){const c=S4,k=player,D=c.D;for(const b of c.thr){if(b.dead)continue;const dx=k.x-b.x,dz=k.z-b.z,d=Math.hypot(dx,dz);b.g.rotation.y+=wrapA(Math.atan2(dx,dz)-b.g.rotation.y)*Math.min(1,dt*3);
    b.legs.forEach((l,i)=>{l.rotation.z=Math.sin(S.t*2+i)*.08;});b.lg.visible=Math.sin(S.t*6+b.x)>0;
    if(d<62&&d>8&&c.mode==='play'){b.cd-=dt;if(b.cd<=0){b.cd=(2+Math.random()*1.2)/D.fire;const lead=1.3,tx=k.x+k.vx*lead,tz=k.z+k.vz*lead,g=s4Models().scrap.clone(true);g.position.set(b.x,4,b.z);c.G.add(g);c.scrapP.push({g,x0:b.x,y0:4,z0:b.z,tx,tz,ty:s4Floor(tx,tz).y,t:0,T:lead,m:s4Mark(tx,tz,2.4,0xffa040,lead),r:2.4});tone(420,.14,'triangle',.06,900);b.rig.rotation.x=-.4;b.throwT=.3;}}
    if(b.throwT>0){b.throwT-=dt;if(b.throwT<=0)b.rig.rotation.x=0;}
    /* drive into one to knock it over */
    if(d<2.6&&k.y<4){b.dead=true;if(c.ram)s4Launch4(b.g,k);else b.g.visible=false;c.wrecked++;burst(b.x,1.8,b.z,40,[.5,.9,1],12,1.3,.6);SFX.boom();showMsg('BOT SMASHED!',1,'good');k.speed*=.75;}}}
/* ---------- everything in the air: bombs, bolts, scrap, falling debris ---------- */
function s4Shots(dt){const c=S4,k=player;
  const land=(x,y,z,r,msg,big)=>{burst(x,y+.5,z,big?60:34,[1,.6,.25],big?16:12,big?1.8:1.3,.6);SMOKE.emit(x,y+1,z,0,3,0,.3,.28,.26,big?7:4,2.5,{grow:3,a:.5});SFX.boom();flashLight.position.set(x,y+2,z);flashLight.intensity=big?9:5;S4.decals&&0;
    if(Math.hypot(k.x-x,k.z-z)<r&&k.y<y+3)s4Hurt(1,msg);c.shake=Math.max(c.shake,Math.max(0,1-Math.hypot(k.x-x,k.z-z)/40)*.8);
    for(const r2 of c.run){if(!r2.dead&&Math.hypot(r2.g.position.x-x,r2.g.position.z-z)<r+1)s4RunnerBoom(r2,'');}};
  for(const b of c.bombs){b.t+=dt;const u=Math.min(1,b.t/b.T);b.g.position.set(lerp(b.x0,b.tx,u),lerp(b.y0,b.ty,u*u),lerp(b.z0,b.tz,u));b.g.rotation.x+=dt*4;if(u>=1){b.done=true;c.G.remove(b.g);b.m.m.visible=false;land(b.tx,b.ty,b.tz,b.r,'BOMB!');}}
  c.bombs=c.bombs.filter(b=>!b.done);
  for(const s of c.scrapP){s.t+=dt;const u=Math.min(1,s.t/s.T);s.g.position.set(lerp(s.x0,s.tx,u),lerp(s.y0,s.ty,u)+Math.sin(u*Math.PI)*9,lerp(s.z0,s.tz,u));s.g.rotation.x+=dt*9;s.g.rotation.z+=dt*7;if(u>=1){s.done=true;c.G.remove(s.g);s.m.m.visible=false;burst(s.tx,s.ty+.5,s.tz,18,[.8,.6,.4],9,1,.5);SFX.bump();if(Math.hypot(k.x-s.tx,k.z-s.tz)<s.r&&k.y<s.ty+3)s4Hurt(1,'SCRAP!');}}
  c.scrapP=c.scrapP.filter(s=>!s.done);
  for(const b of c.bolts){b.t+=dt;const u=Math.min(1,b.t/b.T);b.g.position.lerpVectors(b.a,b.b,u);if(u>=1){b.done=true;c.G.remove(b.g);burst(b.b.x,b.b.y+.2,b.b.z,b.dud?16:24,[1,.4,.5],b.dud?8:10,b.dud?.7:1,.4);
      if(b.dud){S4.scorchN=(S4.scorchN||0)+1;}else{SFX.bump();if(Math.hypot(k.x-b.b.x,k.z-b.b.z)<b.r&&k.y<b.b.y+3)s4Hurt(1,'LASER!');}}}
  c.bolts=c.bolts.filter(b=>!b.done);
  for(const m of c.marks){if(!m.m.visible)continue;m.t+=dt;const u=m.t/m.life;m.m.material.opacity=.45+.4*Math.sin(S.t*18);m.dot.material.opacity=.1+.25*Math.min(1,u);m.m.scale.setScalar(m.r*(1.25-.25*Math.min(1,u)));if(m.t>m.life+.1)m.m.visible=false;}}
function s4BotBump(b){}
/* send a rammed bot flying off the front of the kart */
function s4Launch4(g,k){const c=S4,sp=Math.max(14,Math.abs(k.speed)),fx=Math.sin(k.h),fz=Math.cos(k.h),side=Math.random()<.5?-1:1;
  c.deb.push({m:g,v:new V3(fx*sp*.9-fz*side*5,9+sp*.25,fz*sp*.9+fx*side*5),r:new V3(6+Math.random()*6,(Math.random()-.5)*8,side*(5+Math.random()*5)),t:0,y0:g.position.y,life:2.4,s0:g.scale.x});
  tone(140,.18,'square',.09,60);noise(.25,.35,2400,500,'bandpass');}
