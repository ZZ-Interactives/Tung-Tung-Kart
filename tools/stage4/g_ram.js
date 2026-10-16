
/* ---------- Tung's battering ram: a steel cow-catcher with a capped iron log, bolted to the kart's nose ---------- */
function s4RamTex(){return tex(mkCanvas(256,64,(g,w,h)=>{g.fillStyle='#f2c230';g.fillRect(0,0,w,h);g.fillStyle='#17142e';for(let x=-h;x<w+h;x+=40){g.beginPath();g.moveTo(x,h);g.lineTo(x+20,h);g.lineTo(x+20+h,0);g.lineTo(x+h,0);g.fill();}
  g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<60;i++)g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,1+Math.random()*2);}),true);}
function s4MakeRam(){const M3=s3Mats(),std=M3.std,C=c=>linC(c),g=new THREE.Group();
  const steel=std({color:C(0x8a9098),metalness:.85,roughness:.32}),dark=std({color:C(0x2a2c32),metalness:.7,roughness:.45}),iron=std({color:C(0x3a3634),metalness:.6,roughness:.55});
  const wood=std({color:C(0x8a5a32),roughness:.82}),haz=std({map:s4RamTex(),metalness:.3,roughness:.6}),red=std({color:C(0xd8302a),roughness:.5,metalness:.2});
  const add=(geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;g.add(m);return m;};
  /* bumper bar across the nose */
  add(new THREE.BoxGeometry(2.3,.32,.26),dark,0,.55,.05);
  for(const s of[-1,1])add(new THREE.CylinderGeometry(.09,.09,.5,10),steel,s*.95,.55,-.2,Math.PI/2);
  /* the V plough with hazard stripes */
  for(const s of[-1,1]){const p=add(new THREE.BoxGeometry(1.35,.62,.08),haz,s*.56,.46,.42,0,s*.62,0);
    add(new THREE.BoxGeometry(1.38,.07,.12),steel,s*.56,.78,.42,0,s*.62,0);add(new THREE.BoxGeometry(1.38,.07,.12),steel,s*.56,.15,.42,0,s*.62,0);}
  /* the ram: an iron-banded log with a steel head, on two struts */
  const log=add(new THREE.CylinderGeometry(.27,.3,1.5,18),wood,0,.62,.95,Math.PI/2);
  for(const z of[.4,.85,1.3])add(new THREE.TorusGeometry(.3,.05,8,20),iron,0,.62,z);
  const head=add(new THREE.CylinderGeometry(.38,.3,.42,18),steel,0,.62,1.82,Math.PI/2);
  add(new THREE.SphereGeometry(.38,18,10,0,Math.PI*2,0,Math.PI/2),steel,0,.62,2.03,Math.PI/2);
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;add(new THREE.ConeGeometry(.08,.3,8),dark,Math.cos(a)*.28,.62+Math.sin(a)*.28,2.05,Math.PI/2);}
  for(const s of[-1,1])add(new THREE.CylinderGeometry(.06,.06,1.05,8),dark,s*.28,.5,.55,Math.PI/2-.08,0,s*.2);
  /* a little red flag so you can always see the tip */
  add(new THREE.CylinderGeometry(.02,.02,.9,6),steel,.3,1.05,1.55);const fl=add(new THREE.PlaneGeometry(.36,.22),red,.48,1.38,1.55,0,Math.PI/2,0);fl.material.side=THREE.DoubleSide;
  linearize(g);g.userData.flag=fl;return g;}
/* bolt it on: sits on the front of the kart's inner body, whatever kart Tung is driving */
function s4FitRam(k){const m=k.model;if(m.ram4){return m.ram4;}const g=m.group,inn=m.inner;
  const ps=g.position.clone(),rs=g.rotation.y,ss=g.scale.clone();g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);g.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(inn);g.position.copy(ps);g.rotation.y=rs;g.scale.copy(ss);g.updateMatrixWorld(true);
  const ram=s4MakeRam(),w=b.max.x-b.min.x;ram.scale.setScalar(clamp(w/2.4,.75,1.25));ram.position.set(0,b.min.y,b.max.z-.35);inn.add(ram);m.ram4=ram;ram.userData.home=ram.position.clone();return ram;}
/* the opening moment: Tung bolts the ram on before setting off */
function s4RamFitStart(){const c=S4,k=player,ram=s4FitRam(k);c.ram=false;c.ramFit={t:0,bolts:0};k.lock=true;ram.visible=false;
}
function s4RamFitTick(dt){const c=S4,F=c.ramFit,k=player,ram=k.model.ram4,H=ram.userData.home;F.t+=dt;const t=F.t;
  /* drop in from above, land with a clank, three bolts, done */
  if(t>.35){ram.visible=true;const u=clamp((t-.35)/.5,0,1),e=u<1?u*u:1;ram.position.set(H.x,H.y+(1-e)*3.2+(u>=1?Math.max(0,Math.sin((t-.85)*16)*.12*Math.exp(-(t-.85)*7)):0),H.z+(1-e)*.6);ram.rotation.x=(1-e)*.5;}
  const clank=(n,x)=>{if(F.bolts>=n)return;F.bolts=n;const fx=Math.sin(k.h),fz=Math.cos(k.h),rx=Math.cos(k.h),rz=-Math.sin(k.h),s=S4K.KS;
    burst(k.x+fx*1.6*s+rx*x*s,k.y+.6*s,k.z+fz*1.6*s+rz*x*s,n===1?30:14,[1,.8,.4],n===1?10:6,.7,.35);tone(n===1?120:420+n*90,.12,'square',.08,n===1?50:200);noise(.15,.3,3000,800,'bandpass');cam.shake=Math.max(cam.shake,n===1?.5:.18);};
  if(t>.85)clank(1,0);if(t>1.25)clank(2,-.95);if(t>1.55)clank(3,.95);if(t>1.85)clank(4,0);
  if(t>1.9&&!F.said){F.said=1;setBanner('<small>NEW</small>BATTERING RAM','big');showMsg('Smash GROK bots head-on!',2.6,'good');SFX.looks&&SFX.looks();}
  /* camera: low and in front, looking back at the nose */
  const s=S4K.KS,fx=Math.sin(k.h),fz=Math.cos(k.h),a=.55-t*.12,rx=Math.cos(k.h),rz=-Math.sin(k.h),d=6.2*s+t*.4;
  camera.position.set(k.x+fx*d*Math.cos(a)+rx*d*Math.sin(a),k.y+1.6*s+t*.25,k.z+fz*d*Math.cos(a)+rz*d*Math.sin(a));camera.lookAt(k.x+fx*1.2*s,k.y+.7*s,k.z+fz*1.2*s);
  if(Math.abs(camera.fov-50)>.05){camera.fov=50;camera.updateProjectionMatrix();updatePSScale();}
  const skip=t>1.95&&(input.gas||pad.gas||input.item||pad.item);
  if(t>3||skip){c.ramFit=null;c.ram=true;k.lock=false;ram.position.copy(H);ram.rotation.x=0;camSnap();if(S4.mode==='play')setTimeout(()=>{if(S4&&$('banner').textContent.includes('RAM'))setBanner('');},700);
    if(!c.hints.hello){c.hints.hello=1;setTimeout(()=>{if(S4&&S4.mode==='play')s4Say('Tralalero','Good morning, Tung Tung! I welded a battering ram on your kart. Any bot that steps in front of you, SMASH it. Down the ramp, follow my cyan arrows!',5.5);},500);}}}
