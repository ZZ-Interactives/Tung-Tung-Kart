
/* ---------- effects ---------- */
let S4SMOKE=null;
function s4SmokeMat(){if(S4SMOKE)return S4SMOKE;const t=tex(mkCanvas(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);const r=rng(3);for(let i=0;i<26;i++){const x=24+r()*80,y=24+r()*80,rr=14+r()*30,gr=g.createRadialGradient(x,y,1,x,y,rr);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}}),false);
  S4SMOKE=t;return t;}
function s4FxInit(){const c=S4;c.lights=[];for(let i=0;i<5;i++){const l=new THREE.PointLight(0xff8a3a,0,26,2);scene.add(l);c.lights.push(l);}
  /* smoke columns: a stack of sprites that rise, grow and loop */
  const tx=s4SmokeMat();c.plumeS=[];const keep=c.plumes.filter(p=>p.steam||p.tower),rest=c.plumes.filter(p=>!p.steam&&!p.tower),step=Math.max(1,rest.length/(QUAL==='low'?18:34));for(let i=0;i<rest.length;i+=step)keep.push(rest[Math.floor(i)]);
  for(const p of keep){const n=p.steam?6:QUAL==='low'?4:5,list=[];for(let i=0;i<n;i++){const m=new THREE.SpriteMaterial({map:tx,color:p.steam?0xe8e8ec:0x2a2624,transparent:true,depthWrite:false,opacity:0,fog:true});m.userData.lin=true;const sp=new THREE.Sprite(m);sp.position.set(p.x,p.y,p.z);c.G.add(sp);list.push({sp,u:i/n});}c.plumeS.push({p,list});}}
function s4Fx(dt){const c=S4,k=player,cp=camera.position;if(!c.lights)s4FxInit();
  /* lamps that flicker, signals that blink, GROK lights, burnt windows glowing */
  const M=s4Mats(),t=S.t;M.lampF1.color.setRGB(Math.random()<.92?1:.08,Math.random()<.92?.86:.06,.6);M.lampF2.color.setRGB(Math.sin(t*23)>.2?.95:.1,Math.sin(t*23)>.2?.78:.08,.5);
  M.sigR.color.setRGB(Math.sin(t*3)>0?1:.15,.08,.05);M.sigY.color.setRGB(Math.sin(t*5)>.3?1:.1,Math.sin(t*5)>.3?.55:.05,.02);M.fac.burnt.emissiveIntensity=1.25+Math.sin(t*7)*.15+Math.random()*.15;
  M.redV.color.setRGB(.9+.1*Math.sin(t*4),.05,.08);M.cyanV.color.setRGB(.15,.8+.1*Math.sin(t*3),1);
  for(const b of c.blinkS){if(!b.parent||!b.parent.visible)continue;const dx=b.position.x-cp.x,dz=b.position.z-cp.z;if(dx*dx+dz*dz>340*340&&b.position.y<60){b.visible=false;continue;}b.visible=b.userData.blink===2?Math.sin(t*2.4+b.position.x)>.4:Math.sin(t*5+b.position.z*.1)>0;}
  /* fires near you: flames and smoke */
  let budget=QUAL==='low'?60:140;const near=[];
  for(const f of c.fires){if(f.dead)continue;if(f.follow){f.follow.localToWorld(S4BV.a.copy(f.lo));f.x=S4BV.a.x;f.y=S4BV.a.y;f.z=S4BV.a.z;f.gl.position.set(f.x,f.y+.6,f.z);}
    const dx=f.x-k.x,dz=f.z-k.z,d2=dx*dx+dz*dz,kk=f.k==null?1:f.k;if(f.tower&&c.collapse&&c.collapse.rubbleOn){f.dead=true;f.gl.visible=false;continue;}
    if(f.gl){const vis=kk>.02&&(d2<150*150||f.wall);f.gl.visible=vis;if(vis){f.ph+=dt*(8+Math.random()*4);const sc=(f.s||1)*(3.6+Math.sin(f.ph)*.6+Math.random()*.4)*kk;f.gl.scale.set(sc,sc,1);}}
    if(d2>110*110||kk<.02)continue;if(f.wall||d2<70*70)near.push([d2,f]);
    if(budget<=0)continue;const n=f.wall?3:d2<40*40?2:1;budget-=n;const s=f.s||1;
    for(let i=0;i<n;i++)FX.emit(f.x+(Math.random()-.5)*s*1.4,f.y+Math.random()*.4,f.z+(Math.random()-.5)*s*1.4,(Math.random()-.5)*1.2,2.6+Math.random()*3.4*s,(Math.random()-.5)*1.2,1,.42+Math.random()*.4,.1,(.9+Math.random()*.7)*s*kk,.45+Math.random()*.4,{g:-3,drag:.9,grow:.3});
    if(Math.random()<dt*(f.wall?14:4))SMOKE.emit(f.x,f.y+1.6*s,f.z,(Math.random()-.5)*1.5,2.5+Math.random()*2,(Math.random()-.5)*1.5,.16,.15,.15,2.2*s,2.6,{grow:2.8,a:.45*kk});}
  /* five lights follow the nearest fires */
  if((c.lightT=(c.lightT||0)-dt)<=0){c.lightT=.25;near.sort((a,b)=>a[0]-b[0]);c.lightF=near.slice(0,c.lights.length).map(q=>q[1]);
    if(S4.indoor&&k.x>S4.indoor.x0&&k.x<S4.indoor.x1&&k.z>S4.indoor.z0&&k.z<S4.indoor.z1){const L=S4.lamps.slice().sort((a,b)=>Math.hypot(a.x-k.x,a.z-k.z)-Math.hypot(b.x-k.x,b.z-k.z)).slice(0,3);c.lightF=L.concat(c.lightF).slice(0,c.lights.length);}}
  c.lights.forEach((l,i)=>{const f=c.lightF&&c.lightF[i];if(!f){l.intensity=0;return;}l.position.set(f.x,f.y+(f.c?0:1.6),f.z);if(f.c){l.color.setHex(f.c);l.intensity=f.i*(Math.random()<.04?.2:1);l.distance=24;}else{l.color.setHex(0xff7a2a);l.intensity=(f.wall?5:2.6)*(f.k==null?1:f.k)*(.8+Math.random()*.35);l.distance=f.wall?36:22;}});
  /* sparks from broken lights and wrecks */
  for(const sp of c.sparks){const dx=sp.x-k.x,dz=sp.z-k.z;if(dx*dx+dz*dz>80*80)continue;if(Math.random()<dt*.9){for(let i=0;i<10;i++)FX.emit(sp.x,sp.y,sp.z,(Math.random()-.5)*5,Math.random()*3,(Math.random()-.5)*5,1,.9,.6,.25,.7,{g:18,drag:.4});if(Math.hypot(dx,dz)<30)tone(3000+Math.random()*2000,.04,'square',.01);}}
  /* smoke columns */
  for(const P of c.plumeS){const p=P.p,dx=p.x-cp.x,dz=p.z-cp.z,far=dx*dx+dz*dz>(p.steam?1500:560)**2;for(const q of P.list){q.sp.visible=!far&&!(p.tower&&c.collapse&&c.collapse.rubbleOn);if(!q.sp.visible)continue;q.u=(q.u+dt*(p.steam?.06:.045))%1;const u=q.u,s=(p.s||1)*(4+u*26);q.sp.position.set(p.x+u*u*18,p.y+u*(p.steam?60:85),p.z+u*7);q.sp.scale.set(s,s,1);q.sp.material.opacity=Math.min(1,u*6)*(1-u)*(p.steam?.4:.55);q.sp.material.rotation=u*1.4;}}
  /* debris flying about */
  for(let i=c.deb.length-1;i>=0;i--){const d=c.deb[i];d.t+=dt;d.v.y-=24*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.r.x*dt;d.m.rotation.y+=d.r.y*dt;d.m.rotation.z+=d.r.z*dt;
    const gy=(d.y0||0)+.2;if(d.m.position.y<gy){d.m.position.y=gy;d.v.y=Math.abs(d.v.y)>2?-d.v.y*.35:0;d.v.x*=.7;d.v.z*=.7;d.r.multiplyScalar(.6);}
    if(d.t>d.life){const sc=Math.max(0,1-(d.t-d.life)*3);d.m.scale.setScalar(sc*(d.s0||1));if(sc<=0){if(d.m.parent)d.m.parent.remove(d.m);if(d.own&&d.m.geometry)d.m.geometry.dispose();c.deb.splice(i,1);}}}
  /* broken hydrants */
  for(let i=c.geys.length-1;i>=0;i--){const g=c.geys[i];g.t+=dt;for(let j=0;j<5;j++)FX.emit(g.x+(Math.random()-.5)*.3,g.y,g.z+(Math.random()-.5)*.3,(Math.random()-.5)*2,10+Math.random()*5,(Math.random()-.5)*2,.55,.85,1,.6,1.2,{g:16,drag:.2});if(g.t>6)c.geys.splice(i,1);}
  /* the castle */
  const E=c.castleEye;if(E){E.halo.rotation.z+=dt*.4;E.halo2.rotation.y+=dt*.25;E.g.lookAt(k.x,k.y+4,k.z);if(E.flash>0){E.flash-=dt;E.iris.scale.setScalar(1+Math.sin(S.t*30)*.25);}else E.iris.scale.setScalar(1+Math.sin(S.t*2)*.05);}
  for(const s of c.search||[])s.g.rotation.set(Math.sin(S.t*.35+s.ph)*.5,0,.6*s.ph+Math.sin(S.t*.27+s.ph*2)*.4);
  if(c.farCastle){const d=S4.castleZ-cp.z,op=clamp((d-900)/900,0,1);c.farCastle.visible=op>.01;if(c.farCastle.visible){const ang=Math.atan2(1080-cp.x,S4.castleZ-cp.z);c.farCastle.position.set(cp.x+Math.sin(ang)*2400,cp.y+170,cp.z+Math.cos(ang)*2400);c.farCastle.lookAt(cp.x,cp.y+170,cp.z);c.farCastle.material.opacity=op;}}}
/* ---------- light and fog by zone ---------- */
const S4ZL={deck:{fog:0xc08a72,near:120,far:1100,sun:0xffb07a,si:2.6,hemi:.62,exp:.68,sky:0},edge:{fog:0xa87a62,near:70,far:560,sun:0xffa870,si:2.5,hemi:.6,exp:.66,sky:.1},burn:{fog:0x8a6050,near:46,far:430,sun:0xff9a60,si:2.3,hemi:.56,exp:.66,sky:.3},
  pipe:{fog:0x8a6858,near:46,far:430,sun:0xffa468,si:2.3,hemi:.58,exp:.66,sky:.3},mall:{fog:0x806050,near:40,far:380,sun:0xff9a60,si:2.2,hemi:.55,exp:.68,sky:.3},camp:{fog:0x86604c,near:46,far:420,sun:0xff9258,si:2.2,hemi:.56,exp:.66,sky:.4},
  dark:{fog:0x5a2228,near:30,far:340,sun:0xff5a48,si:1.7,hemi:.46,exp:.66,sky:.9},boss:{fog:0x6a2a26,near:36,far:400,sun:0xff6a48,si:1.9,hemi:.5,exp:.68,sky:.8},calm:{fog:0xc08a62,near:90,far:820,sun:0xffc890,si:2.8,hemi:.64,exp:.72,sky:.15},castle:{fog:0x8a4440,near:160,far:1900,sun:0xff9a6a,si:2.6,hemi:.58,exp:.7,sky:.6}};
const S4CA=new THREE.Color(),S4CB=new THREE.Color();
function s4Light(dt,snap){const c=S4;if(!c||!scene.fog)return;const seg=S4.path.seg[Math.max(0,Math.min(S4.path.n-1,(player&&player.s4i)||0))]||0;let z=S4ZL[S4SEG[seg].zone]||S4ZL.burn;
  if(c.boss&&c.boss.mode==='dead'&&S4SEG[seg].zone==='boss')z=S4ZL.calm;if(c.mode==='end'||S.mode==='results')z=S4ZL.castle;
  const a=snap?1:1-Math.exp(-dt*1.2),L=c.lt;if(L.near==null){Object.assign(L,{near:z.near,far:z.far,si:z.si,hemi:z.hemi,exp:z.exp,sky:z.sky});L.fog=new THREE.Color(z.fog);L.sun=new THREE.Color(z.sun);}
  for(const key of['near','far','si','hemi','exp','sky'])L[key]+=(z[key]-L[key])*a;L.fog.lerp(S4CA.set(z.fog),a);L.sun.lerp(S4CB.set(z.sun),a);
  /* dimmer under bridges, arches and inside GROK-MART */
  let dim=0;if(player)for(const z of S4.dark){if(player.x>z.x0-4&&player.x<z.x1+4&&player.z>z.z0-4&&player.z<z.z1+4)dim=Math.max(dim,z.a);}c.dim=lerp(c.dim||0,dim,snap?1:1-Math.exp(-dt*3));
  scene.fog.color.copy(L.fog).convertSRGBToLinear();scene.fog.near=L.near;scene.fog.far=QUAL==='low'?Math.min(L.far,420):L.far;sun.color.copy(L.sun).convertSRGBToLinear();sun.intensity=L.si*(1-c.dim*.7);hemi.intensity=L.hemi*(1-c.dim*.45);renderer.toneMappingExposure=L.exp*(1-c.dim*.25);
  if(sky){const u=sky.material.uniforms;u.rayleigh.value=lerp(3,1.6,L.sky);u.turbidity.value=lerp(10,16,L.sky);u.mieCoefficient.value=lerp(.014,.03,L.sky);u.mieDirectionalG.value=.9;}
  if(c.back)c.back.material.color.setRGB(1,lerp(.9,.6,L.sky),lerp(.85,.6,L.sky));}
/* only draw city chunks near the camera */
function s4Vis(force,dt){const c=S4;if(!force&&(c.visT=(c.visT||0)-(dt||1/60))>0)return;c.visT=.2;const cp=camera.position,R=Math.min(scene.fog?scene.fog.far:500,900)+170;/* 170 = half a chunk's diagonal */
  const cut=c.cp?c.cp.s-300:-1e9;
  for(const ch of c.chunks.values()){if(!ch.g)continue;const d=Math.hypot(ch.cx-cp.x,ch.cz-cp.z);
    /* well behind the last checkpoint and out of sight: free its graphics memory for good (keeps iPads from running out) */
    if(ch.sMax<cut&&d>R+60){s4Retire(ch);continue;}ch.g.visible=d<R;}}
function s4Retire(ch){const g=ch.g;ch.g=null;ch.dead=true;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.userData&&o.userData.bk&&o.geometry)o.geometry.dispose();});}
