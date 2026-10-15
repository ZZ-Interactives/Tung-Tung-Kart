
/* ---------- the runway: the broken highway from Stage 3, and the off-ramp down into the city ---------- */
function s4Deck(){const M=s4Mats(),DY=24,G=S4.G;
  /* deck slab (z -924..-560) */
  const B=(k,x,z)=>s4Bucket(x,z,k);
  for(let z=-924;z<-560;z+=36){const len=Math.min(36,-560-z),cz=z+len/2;
    s4Box(B('deck',0,cz),0,DY-.01,cz,20,.02,len,0,20,16,null,4);
    s4Box(B('conc',0,cz),0,DY-.9,cz,21,1.8,len,0,4,4,s4Tint(.78,.75,.72),1|2|8|16|32);
    /* jersey barriers */for(const sx of[-1,1])s4Jersey(sx*10.45,DY,cz,len,0,s4Tint(.86,.84,.8),{sy:1.3});
    /* pier */const pz=z+18;if(pz<-565){s4Box(B('conc',0,pz),0,DY/2-1,pz,7,DY-2,3,0,4,4,s4Tint(.7,.68,.64),63);s4Box(B('conc',0,pz),0,DY-2.2,pz,20,1.6,3.4,0,4,4,s4Tint(.72,.7,.66),63);}}
  /* lamp poles on the deck, some bent */
  for(let z=-910;z<-570;z+=44){for(const sx of[-1,1]){const bent=Math.random()<.35,x=sx*10.4;s4Geo(B('metal',x,z),new THREE.CylinderGeometry(.12,.18,9,8),x,DY+5.6,z,0,0,bent?sx*.35:0,1,1,1);
    const hx=x-sx*(bent?.4:1.6);s4Box(B(bent?'lampOff':'lampF'+(1+(Math.random()*2|0)),hx,z),hx-sx*(bent?1.6:0),DY+(bent?9.4:10),z,1.4,.25,.6,0,1,1,s4Tint(1,1,1));}}
  /* the camp from last night: tent, fire barrel, sleeping bag, crates */
  {const cz=-900,cx=5;s4Geo(B('tarp',cx,cz),new THREE.ConeGeometry(2.6,2.6,4,1,true),cx,DY+1.3,cz,0,Math.PI/4,0,1,1,1,s4Tint(.9,.5,.3));
    s4Geo(B('rust',-4,cz+2),new THREE.CylinderGeometry(.55,.5,1.1,12),-4,DY+.55,cz+2,0,0,0,1,1,1);S4.fires.push({x:-4,y:DY+1.15,z:cz+2,s:.7,camp:1});
    s4Box(B('cloth',-1.5,cz-1),-1.5,DY+.12,cz-1,1,.22,2.2,.3,1,1,s4Tint(.8,.2,.2));for(let k=0;k<3;k++)s4Box(B('wood',-7,cz-3+k*1.2),-7.5,DY+.4+k*.0,cz-3+k*1.25,1,.8,1,k*.4,1,1);}
  /* a hole in the deck: cones and a barrier around it */
  {const hz=-735,hx=-5;S4.decals.push([hx,hz,1,6,'scorch',DY]);s4Box(B('dark',hx,hz),hx,DY+.012,hz,3.6,.02,4.2,.2,1,1,null,4);
    s4ColBox(hx,hz,2.4,2.6,.2,{kind:'hole',top:DY+2});for(let k=0;k<6;k++){const a=k/6*6.28;S4.cones.push([hx+Math.cos(a)*3,DY,hz+Math.sin(a)*3.2]);}}
  /* green exit sign gantry */
  {const gz=-690;for(const sx of[-1,1])s4Box(B('metal',sx*10.6,gz),sx*10.6,DY+4,gz,.4,8,.4,0,1,1);s4Box(B('metal',0,gz),0,DY+7.8,gz,21.6,.4,.4,0,1,1);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(9,3.4),M.sign('FOUNTAIN CITY\nEXIT 4 · CITY CENTRE ↓','#1e6a3a','#fffaf0',768,290,72));sg.position.set(4,DY+6,gz-.25);sg.rotation.y=Math.PI;G.add(sg);
    const sg2=new THREE.Mesh(new THREE.PlaneGeometry(7,3.4),M.sign('GROK CASTLE\n(DO NOT VISIT)','#1e6a3a','#fffaf0',640,300,64));sg2.position.set(-5,DY+6,gz-.25);sg2.rotation.y=Math.PI;G.add(sg2);}
  /* the ramp (z -560..-250) built as tilted pieces */
  for(let z=-560;z<-250;z+=10){const za=z,zb=Math.min(-250,z+10),ya=s4SegY(1,(za+560)/310),yb=s4SegY(1,(zb+560)/310),cz=(za+zb)/2,cy=(ya+yb)/2,len=Math.hypot(zb-za,yb-ya),pit=-Math.atan2(yb-ya,zb-za);
    s4Geo(B('deck',0,cz),new THREE.PlaneGeometry(20,len),0,cy+.01,cz,-Math.PI/2+pit,0,0,1,1,1,null,1);
    s4Geo(B('conc',0,cz),new THREE.BoxGeometry(21,1.2,len+.05),0,cy-.62,cz,pit,0,0,1,1,1,s4Tint(.76,.73,.7));
    for(const sx of[-1,1])s4Geo(B('conc',sx*10.4,cz),new THREE.BoxGeometry(.8,1.1,len+.05),sx*10.45,cy+.55,cz,pit,0,0,1,1,1,s4Tint(.86,.84,.8));
    if(cy>2.5&&((z+560)%30)<1){s4Box(B('conc',0,cz),0,cy/2-1,cz,5,cy-1,2.4,0,4,4,s4Tint(.7,.68,.64),63);}}
  /* below the highway: dry riverbed, broken fence, a few shacks */
  {const g=new THREE.Mesh(new THREE.PlaneGeometry(1400,1100),M.dirt);g.rotation.x=-Math.PI/2;g.position.set(0,-.06,-650);g.material.map.repeat.set(70,55);g.receiveShadow=true;g.userData.free4=true;G.add(g);
    const rb=new THREE.Mesh(new THREE.PlaneGeometry(60,900),M.std({color:linC(0x6e5a44),roughness:1}));rb.rotation.x=-Math.PI/2;rb.rotation.z=.2;rb.position.set(-60,-.04,-700);rb.userData.free4=true;G.add(rb);
    for(let k=0;k<26;k++){const x=(Math.random()<.5?-1:1)*(40+Math.random()*300),z=-1000+Math.random()*760,w=6+Math.random()*10,d=6+Math.random()*10,h=3+Math.random()*5;s4Box(B('fac.'+(Math.random()<.5?'brick':'cream'),x,z),x,h/2,z,w,h,d,Math.random(),12,14,s4Tint(.7,.65,.6));s4Box(B('rust',x,z),x,h+.15,z,w+.6,.3,d+.6,0,4,4);}}}
/* outskirts between the ramp and the first block: gas station, welcome billboard, fences */
function s4Outskirts(){const M=s4Mats(),G=S4.G,B=(k,x,z)=>s4Bucket(x,z,k);
  for(const sx of[-1,1]){const x=sx*14;for(let z=-246;z<-130;z+=3.2){s4Box(B('metal',x,z),x,1.1,z,.08,2.2,.08,0,1,1);}const fb=B('fence',x,-190);s4Quad(fb,[x,0,-246],[x,0,-132],[x,2.2,-132],[x,2.2,-246],[0,0],[114/1.6,0],[114/1.6,2.2/1.6],[0,2.2/1.6]);}
  /* gas station on the left (+x side) */
  {const cx=34,cz=-200;s4Box(B('asph',cx,cz),cx,.012,cz,34,.02,40,0,8,8,null,4);for(const [a,b] of[[-8,-8],[8,-8],[-8,8],[8,8]])s4Box(B('metal',cx+a,cz+b),cx+a,3,cz+b,.6,6,.6,0,1,1);
    s4Box(B('conc',cx,cz),cx,6.3,cz,22,.8,22,0,4,4,s4Tint(.9,.3,.25));s4Box(B('cyanV',cx,cz),cx,6.3,cz-11.05,22,.3,.1,0,1,1,s4Tint(1,.4,.3));
    for(const a of[-4,4]){s4Box(B('car',cx+a,cz),cx+a,.9,cz,1,1.8,.7,0,1,1,s4Tint(.8,.2,.2));}
    s4Box(B('fac.cream',cx+8,cz+24),cx+8,2.4,cz+24,14,4.8,8,0,12,14,s4Tint(.9,.85,.8));s4Box(B('roof',cx+8,cz+24),cx+8,4.85,cz+24,14.4,.1,8.4,0,6,6);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(7,2.2),M.sign('GAS · NO WATER','#c8302a','#fffaf0',512,160,48));sg.position.set(cx,7.6,cz-11.2);sg.rotation.y=Math.PI;G.add(sg);}
  /* welcome billboard, tagged by GROK */
  {const bz=-150,bx=-30;for(const a of[-5,5])s4Box(B('metal',bx+a,bz),bx+a,5,bz,.4,10,.4,0,1,1);const b=new THREE.Mesh(new THREE.PlaneGeometry(16,6),M.sign('WELCOME TO\nFOUNTAIN CITY\nCITY OF 1000 FOUNTAINS','#2f8fd0','#fffaf0',768,300,58));b.position.set(bx,12,bz-.2);b.rotation.y=Math.PI;G.add(b);
    const tag=new THREE.Mesh(new THREE.PlaneGeometry(9,2.6),M.sign('NOW: 0 FOUNTAINS','#0c0f1e','#ff3a4a',640,180,64));tag.position.set(bx+1,10.4,bz-.4);tag.rotation.set(0,Math.PI,-.08);G.add(tag);}
  /* a few low buildings out here */
  for(const [x,z,w,d,h] of[[-40,-215,18,16,7],[-62,-180,14,12,5],[52,-150,16,12,8],[-44,-138,10,10,6]]){s4Bldg({x,z:z+d/2,w,d,h,yaw:0,style:Math.random()<.5?'brick':'cream',damage:'',shop:false,seed:(x*7+z*13)>>>0,zone:'edge',detail:false});}}

/* ---------- the rail bridge over Burning Streets (z=180) ---------- */
function s4RailBridge(){const B=(k,x,z)=>s4Bucket(x,z,k),z=180,y0=8.6;
  for(let x=-120;x<=120;x+=24){s4Box(B('conc',x,z),x,y0+.9,z,24.05,1.8,12,0,4,4,s4Tint(.62,.6,.58),63);s4Box(B('conc',x,z),x,y0+2.4,z+5.8,24.05,1.4,.5,0,4,4,s4Tint(.7,.68,.64));s4Box(B('conc',x,z),x,y0+2.4,z-5.8,24.05,1.4,.5,0,4,4,s4Tint(.7,.68,.64));
    for(const dz of[-1.5,1.5]){s4Box(B('rust',x,z+dz),x,y0+1.9,z+dz,24.05,.2,.15,0,1,1);}}
  for(const sx of[-1,1]){const x=sx*11.4;s4Box(B('conc',x,z),x,y0/2,z,1.6,y0,6,0,4,4,s4Tint(.6,.58,.55),63);s4ColBox(x,z,.85,3.1,0,{kind:'pillar',top:y0});}
  /* a tram car hanging off the edge */
  {const tx=-14;s4Geo(B('car',tx,z-6),new THREE.BoxGeometry(14,3,2.8),tx,y0+3,z-7.4,-.35,0,.12,1,1,1,s4Tint(.9,.75,.2));s4Geo(B('glassD',tx,z-6),new THREE.BoxGeometry(13,1.1,2.9),tx,y0+3.6,z-7.6,-.35,0,.12,1,1,1);}
  /* broken lights under the bridge */
  for(const dx of[-5,0,5]){s4Box(B(Math.random()<.5?'lampF1':'lampF2',dx,z),dx,y0-.08,z,1.2,.12,.5,0,1,1,s4Tint(1,1,1));}
  S4.dark.push({x0:-12.5,x1:12.5,z0:z-6,z1:z+6,a:.55});}

/* ---------- Pipe Street: the GROK water main, the cracked pipe, and the burning wreck pile ---------- */
function s4PipeStreet(){const M=s4Mats(),G=S4.G,B=(k,x,z)=>s4Bucket(x,z,k),px=-349.6,y=1.55,R=1.05;
  const pipeTex=M.pipe||(M.pipe=M.std({color:linC(0x2f6f8a),metalness:.6,roughness:.35,vertexColors:true}));
  const run=(z0,z1)=>{for(let z=z0;z<z1;z+=12){const len=Math.min(12,z1-z),cz=z+len/2;s4Geo(B('pipe',px,cz),new THREE.CylinderGeometry(R,R,len,16,1,true),px,y,cz,Math.PI/2,0,0,1,1,1);
      s4Geo(B('pipe',px+.6,cz),new THREE.CylinderGeometry(.5,.5,len,12,1,true),px+1.2,y+2.1,cz,Math.PI/2,0,0,1,1,1,s4Tint(.8,.8,.85));}
    for(let z=z0+3;z<z1;z+=6){s4Box(B('dark',px,z),px,.45,z,1.6,.9,.6,0,1,1);s4Geo(B('metal',px,z),new THREE.TorusGeometry(R+.06,.09,6,18),px,y,z,0,0,0,1,1,1);}
    for(let z=z0+10;z<z1;z+=24){s4Geo(B('rust',px-1.2,z),new THREE.TorusGeometry(.42,.07,6,14),px-1.15,y+.2,z,0,Math.PI/2,0,1,1,1,s4Tint(.9,.2,.2));}
    for(let z=z0;z<z1;z+=6)s4ColBox(px,z+3,1.15,3.05,0,{kind:'pipe',top:y+R});};
  run(470,588.5);run(612,700);
  /* the pipe climbs over the crossing at z=600 */
  {const pts=[];for(let k=0;k<=24;k++){const t=k/24,z=588+t*24.5,h=y+Math.sin(t*Math.PI)*7.5;pts.push(new V3(px,h,z));}const c=new THREE.CatmullRomCurve3(pts);s4Geo(B('pipe',px,600),new THREE.TubeGeometry(c,24,R,14,false),0,0,0,0,0,0,1,1,1);}
  for(const z of[592,608])s4ColBox(px,z,1.2,1.2,0,{kind:'pipe',top:3});
  /* labels */for(const z of[500,540,640,680]){const l=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1),M.sign('GROK H2O MAIN','#14123a','#3ee0ff',512,120,60));l.position.set(px-R-.02,y,z);l.rotation.y=-Math.PI/2;G.add(l);}
  /* the cracked bit at z=585, glowing */
  const cz=578;const crack=new THREE.Group();crack.position.set(px,y,cz);G.add(crack);
  {const bulge=new THREE.Mesh(new THREE.SphereGeometry(R*1.32,18,12),pipeTex);bulge.scale.set(1,1,1.6);crack.add(bulge);
    const glowM=M.std({color:linC(0x6fdcff),emissive:linC(0x2aa6ff),emissiveIntensity:1.6,roughness:.2});for(let k=0;k<7;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(.08,.9+Math.random()*.8,.1),glowM);s.position.set(-R*1.25,(Math.random()-.5)*1.2,(Math.random()-.5)*2.4);s.rotation.set(0,0,(Math.random()-.5)*1.6);crack.add(s);}
    const gl=glow(0x3ab8ff,6);gl.position.x=-1.6;crack.add(gl);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.12,8,32),M.add(0x6fdcff,.8));ring.rotation.y=Math.PI/2;ring.position.x=-1.4;crack.add(ring);
    const warn=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.2),M.sign('DANGER\nHIGH PRESSURE','#e8b030','#14123a',384,140,40));warn.position.set(-R-.05,1.9,0);warn.rotation.y=-Math.PI/2;crack.add(warn);linearize(crack);}
  S4.pipe={x:px,y,z:cz,g:crack,done:false,hint:false};
  /* the wreck pile across the street at z=622 with a wall of fire in the middle */
  const fz=626;
  s4Car('bus',-366.5,fz,Math.PI/2+.12,{burnt:true,fire:true});s4Car('sedan',-352,fz+1,1.9,{burnt:true,crushed:true,roll:.35,fire:true});s4Car('van',-350,fz-2.5,.3,{burnt:true,fire:false});
  for(let k=0;k<8;k++){const x=-372+Math.random()*24,z=fz+(Math.random()-.5)*5;if(Math.abs(x+360)<4)continue;s4Geo(B('rubble',x,z),s4Rock(),x,.4,z,Math.random()*3,Math.random()*3,0,1+Math.random(),.6,1+Math.random(),s4Tint(.4,.38,.36));}
  for(const sx of[-1,1]){const x=-360+sx*9.6;s4ColBox(x,fz,3.6,2.4,0,{kind:'wreck',top:3});}
  const fw=s4ColBox(-360,fz,3.1,1.4,0,{kind:'firewall',top:5});
  S4.firewall={x:-360,z:fz,c:fw,heat:1,out:false,f:[]};
  for(let k=0;k<7;k++){const f={x:-363+k,y:.3,z:fz+(Math.random()-.5)*1.5,s:1.4+Math.random()*.8,wall:1};S4.fires.push(f);S4.firewall.f.push(f);}
  S4.decals.push([-360,fz,0,9,'scorch']);}

/* ---------- arches you drive under: a bus on wrecks, a jackknifed trailer ---------- */
function s4Arch(s,kind){const q=s4At(s,0),h=q.h,fx=Math.sin(h),fz=Math.cos(h),rx=-fz,rz=fx,B=(k,x,z)=>s4Bucket(x,z,k);
  const P=(lat,fw)=>[q.x+rx*lat+fx*(fw||0),q.z+rz*lat+fz*(fw||0)];
  /* supports */const [ax,az]=P(-7.2),[bx,bz]=P(5.4);
  s4Car('van',ax,az,h+Math.PI/2+.2,{burnt:true,crushed:true,fire:true});s4Car('suv',bx,bz,h-Math.PI/2+.3,{burnt:false,crushed:true,col:3});
  /* the big one on top, across the road */const [cx,cz]=P(-1,0);
  if(kind==='bus')s4Car('bus',cx,cz,h+Math.PI/2+.06,{y:3.1,roll:.12,collide:false,burnt:Math.random()<.5,fire:false});else s4Car('trailer',cx,cz,h+Math.PI/2-.05,{y:3.2,roll:-.08,collide:false});
  /* rubble that closes the sidewalks */
  for(const lat of[-10.4,-9,9,10.6]){const [x,z]=P(lat,(Math.random()-.5)*2);s4Geo(B('rubble',x,z),s4Rock(),x,.8,z,Math.random()*3,Math.random()*3,0,1.6,1.1,1.8,s4Tint(.45,.42,.4));s4Col({x,z,r:1.7,kind:'rubble',top:2});}
  for(let k=0;k<5;k++){const [x,z]=P(-6+Math.random()*10,(Math.random()-.5)*3);S4.decals.push([x,z,Math.random()*6,1.4,'scorch']);}
  S4.dark.push({x0:Math.min(...[P(-6,-1.6)[0],P(4,1.6)[0]]),x1:Math.max(...[P(-6,-1.6)[0],P(4,1.6)[0]]),z0:Math.min(P(-6,-1.6)[1],P(4,1.6)[1]),z1:Math.max(P(-6,-1.6)[1],P(4,1.6)[1]),a:.35});
  S4.sparks.push({x:cx,y:3,z:cz});}

/* ---------- the end of every side street: rubble, wrecks, barriers ---------- */
function s4Barricades(){const M=s4Mats(),G=S4.G,B=(k,x,z)=>s4Bucket(x,z,k);
  for(const st of S4.stubs){if(st.kind==='collapse')continue;const yaw=Math.atan2(st.vx,st.vz),ex=st.ex,ez=st.ez,rx=-st.vz,rz=st.vx,r=rng(((ex*7+ez*13)*100)>>>0),type=r();
    const at=(lat,f)=>[ex+rx*lat+st.vx*(f||0),ez+rz*lat+st.vz*(f||0)];
    if(type<.4){/* rubble mound */for(let k=0;k<22;k++){const lat=(r()-.5)*25,f=r()*6,[x,z]=at(lat,f),s=1+r()*2.6;s4Geo(B('rubble',x,z),s4Rock(),x,s*.5,z,r()*3,r()*3,r()*3,s,s*(.6+r()*.6),s,s4Tint(.45+r()*.2,.42+r()*.2,.4+r()*.2));}
      for(let k=0;k<3;k++){const [x,z]=at((r()-.5)*18,2+r()*3);s4Geo(B('conc',x,z),new THREE.BoxGeometry(6+r()*4,.5,3),x,1.5+r()*2,z,(r()-.5)*.8,yaw+r(),(r()-.5)*.8,1,1,1,s4Tint(.6,.58,.55));}}
    else if(type<.7){/* wreck pile */const kinds=['sedan','hatch','suv','van'];for(let k=0;k<4;k++){const [x,z]=at(-9+k*6+(r()-.5)*2,1+r()*2);s4Car(kinds[(r()*4)|0],x,z,yaw+Math.PI/2+(r()-.5)*.8,{burnt:r()<.5,collide:false,fire:r()<.3,crushed:r()<.5,roll:(r()-.5)*.4});}
      const [x,z]=at((r()-.5)*6,2.5);s4Car('sedan',x,z,yaw+r()*3,{y:1.9,roll:(r()-.5)*.7,collide:false,burnt:true,fire:false});}
    else{/* GROK checkpoint wall */{const [x,z]=at(0,.5);s4Jersey(x,0,z,25,yaw+Math.PI/2,s4Tint(.82,.8,.76),{grok:true,sy:1.25});}
      const [fx,fz]=at(0,2);const fb=B('fence',fx,fz);const a=at(-12.5,2),b=at(12.5,2);s4Quad(fb,[a[0],0,a[1]],[b[0],0,b[1]],[b[0],4,b[1]],[a[0],4,a[1]],[0,0],[25/1.6,0],[25/1.6,4/1.6],[0,4/1.6]);
      for(let k=-12;k<=12;k+=4){const [x,z]=at(k,2);s4Box(B('grokD',x,z),x,2.1,z,.25,4.2,.25,yaw,1,1);}
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.6),M.sign('GROK ZONE\nKEEP OUT','#0c0f1e','#ff3a4a',512,140,48));const [sx,sz]=at(0,1.6);sg.position.set(sx,3,sz);sg.rotation.y=yaw+Math.PI;G.add(sg);
      if(r()<.6){const [x,z]=at(7,4);S4.blinkers.push([x,4.6,z,2.6,2]);}}}}

/* ---------- street furniture along every street ---------- */
function s4StreetProps(){const B=(k,x,z)=>s4Bucket(x,z,k);
  for(const p of S4.pieces){const L=p.L,rx=-p.dz,rz=p.dx,yaw=p.yaw,mid=t=>[p.x0+p.dx*t,p.z0+p.dz*t],near=t=>p.stops.some(s=>Math.abs(s.t-t)<(Math.abs(p.dx)>.5?s.j.A:s.j.B)+2.5);
    const r=rng(((p.x0*3+p.z0*7+p.x1)*100)>>>0),zone=p.zone,noProps=(sd,t)=>S4.clearWalk.some(c=>c.seg===p.seg&&sd===c.side&&t>c.t0&&t<c.t1);
    for(const sd of[-1,1]){const lampLat=p.hw+.75;
      for(let t=12+r()*8;t<L-4;t+=28+r()*8){if(near(t))continue;if(noProps(sd,t))continue;const [cx,cz]=mid(t),x=cx+rx*sd*lampLat,z=cz+rz*sd*lampLat,bent=r()<.18,state=r();
        const lean=bent?(r()*.45+.15):0,top=8.5*Math.cos(lean),sh=8.5*Math.sin(lean);
        s4Geo(B('metal',x,z),new THREE.CylinderGeometry(.11,.17,8.5,8),x-rx*sd*sh/2,top/2,z-rz*sd*sh/2,-rz*sd*lean,0,rx*sd*lean,1,1,1);
        const tx=x-rx*sd*sh,tz=z-rz*sd*sh,hx=tx-rx*sd*1.4,hz=tz-rz*sd*1.4;s4Box(B('metal',hx,hz),tx-rx*sd*.7,top-.05,tz-rz*sd*.7,Math.abs(rx)>.5?1.6:.16,.14,Math.abs(rz)>.5?1.6:.16,0,1,1);
        s4Box(B(bent?'lampOff':state<.3?'lampOff':state<.55?'lampF1':state<.78?'lampF2':'lampOn',hx,hz),hx,top-.2,hz,Math.abs(rx)>.5?1.1:.5,.22,Math.abs(rz)>.5?1.1:.5,0,1,1,s4Tint(1,1,1));
        s4Col({x,z,r:.32,kind:'pole',top:8});if(!bent&&state>=.3&&state<.78&&r()<.25)S4.sparks.push({x:hx,y:top-.3,z:hz});}
      for(let t=26+r()*10;t<L-6;t+=34+r()*14){if(near(t)||noProps(sd,t))continue;const [cx,cz]=mid(t),o=p.hw+.85,x=cx+rx*sd*o,z=cz+rz*sd*o,v=r();
        if(v<.4){s4Box(B('dark',x,z),x,.24,z,1.3,.04,1.3,0,1,1,null,4);s4DeadTree(x,z,.24,3+r()*2.4);s4Col({x,z,r:.4,kind:'tree',top:4});}
        else if(v<.6){S4.hydrants.push([x,z]);}
        else if(v<.75){const bx=cx+rx*sd*(p.W-1),bz=cz+rz*sd*(p.W-1);s4Box(B('wood',bx,bz),bx,.5,bz,Math.abs(rx)>.5?.6:2,.1,Math.abs(rz)>.5?.6:2,0,1,1);s4Box(B('metal',bx,bz),bx,.25,bz,Math.abs(rx)>.5?.5:1.8,.5,Math.abs(rz)>.5?.5:1.8,0,1,1);s4Col({x:bx,z:bz,r:.9,kind:'bench',top:1});}
        else if(v<.85){const bx=cx+rx*sd*(p.W-.7),bz=cz+rz*sd*(p.W-.7);s4Box(B(r()<.5?'redV':'car',bx,bz),bx,.6,bz,.6,1.2,.6,yaw,1,1,s4Tint(.2,.4,.8));s4Col({x:bx,z:bz,r:.45,kind:'box',top:1.3});}
        else{S4.cans.push([cx+rx*sd*(p.W-.8),cz+rz*sd*(p.W-.8)]);}}
      /* parked wrecks along the curb lane (not on the route segments' centre lanes) */
      if(!p.stub)for(let t=30+r()*30;t<L-20;t+=50+r()*60){if(near(t)||r()<.35)continue;const [cx,cz]=mid(t),o=p.hw-1.5,x=cx+rx*sd*o,z=cz+rz*sd*o;const burnt=(zone==='burn'||zone==='dark'||zone==='camp')&&r()<.45;
        if(S4.noParked.some(c=>c.seg===p.seg&&t>c.t0&&t<c.t1))continue;s4Car(['sedan','hatch','suv','van'][(r()*4)|0],x,z,yaw+(sd>0?0:Math.PI)+(r()-.5)*.25,{burnt,fire:burnt&&r()<.6,crushed:r()<.2});}}
    /* traffic lights hanging over junctions */
    for(const s of p.stops){if(r()<.5)continue;const [cx,cz]=mid(s.t),j=s.j,ax=Math.abs(p.dx)>.5,sd=r()<.5?1:-1;const px=j.x+(ax?0:sd*(j.A-.6)),pz=j.z+(ax?sd*(j.B-.6):0);
      s4Geo(B('dark',px,pz),new THREE.CylinderGeometry(.16,.2,7,8),px,3.5,pz,0,0,0,1,1,1);const ox=ax?0:-sd*5,oz=ax?-sd*5:0;s4Box(B('dark',px,pz),px+ox/2,6.9,pz+oz/2,ax?.2:10,.2,ax?10:.2,0,1,1);
      const hx=px+ox,hz=pz+oz;s4Box(B('dark',hx,hz),hx,6.2,hz,.8,2.4,.8,0,1,1);const st=r();for(let k=0;k<3;k++){const on=(k===0&&st<.5)||(k===1&&st>.75);s4Geo(B(on?(k===0?'sigR':'sigY'):'sigOff',hx,hz),new THREE.SphereGeometry(.28,10,8),hx+(ax?0:.0),7-k*.75,hz,0,0,0,1,1,1);}}}}
