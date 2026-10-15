
/* ---------- GROK-MART: you drive in through the smashed front and out the back ---------- */
function s4Mall(){const M=s4Mats(),G=S4.G,B=(k,x,z)=>s4Bucket(x,z,k),x0=-227.5,x1=-132.5,z0=732.5,z1=827.5,H=13,cx=(x0+x1)/2,cz=(z0+z1)/2,ox0=-187.5,ox1=-172.5,oh=6.6;
  const wc=s4Tint(.86,.84,.8);
  /* outer shell */
  for(const [z,face] of[[z0,32],[z1,16]]){for(const [a,b] of[[x0,ox0],[ox1,x1]]){const w=b-a,mx=(a+b)/2;s4Box(B('fac.conc',mx,z),mx,H/2,z+(face===32?.3:-.3),w,H,.6,0,12,14,wc,63&~(face===32?16:32));}
    s4Box(B('fac.conc',-180,z),-180,oh+(H-oh)/2,z+(face===32?.3:-.3),ox1-ox0,H-oh,.6,0,12,14,wc,63);
    /* shop glass band outside, either side of the hole */
    for(const [a,b] of[[x0,ox0-.5],[ox1+.5,x1]]){const w=b-a,mx=(a+b)/2;s4Box(B('shop',mx,z),mx,2.2,z+(face===32?-.03:.03),w,4.4,.02,face===32?Math.PI:0,12,4.6,null,16,{vo:1-(face===32?1:5)/S4SHOPS,vs:1/S4SHOPS,vtop:true});}}
  for(const x of[x0,x1])s4Box(B('fac.conc',x,cz),x+(x===x0?.3:-.3),H/2,cz,.6,H,z1-z0,0,12,14,wc,63);
  {const ic=s4Tint(.42,.42,.44),I=B('conc',cx,cz);s4Box(I,x0+.7,3.5,cz,.1,7,z1-z0-1.4,0,4,4,ic,1);s4Box(I,x1-.7,3.5,cz,.1,7,z1-z0-1.4,0,4,4,ic,2);
    for(const [z,f] of[[z0+.7,16],[z1-.7,32]]){s4Box(I,(x0+ox0)/2,3.5,z,ox0-x0-1.4,7,.1,0,4,4,ic,f);s4Box(I,(ox1+x1)/2,3.5,z,x1-ox1-1.4,7,.1,0,4,4,ic,f);}}
  s4Box(B('roof',cx,cz),cx,H+.05,cz,x1-x0,.1,z1-z0,0,6,6,null,4);s4Box(B('conc',cx,cz),cx,H+.4,cz,x1-x0+.6,.8,z1-z0+.6,0,4,4,s4Tint(.7,.7,.68),1|2|16|32);
  /* the big sign */
  {const sg=new THREE.Mesh(new THREE.PlaneGeometry(30,5),M.sign('GROK-MART','#0c0f1e','#3ee0ff',1024,170,128));sg.position.set(-180,H-2.6,z0-.05);sg.rotation.y=Math.PI;G.add(sg);
    const s2=new THREE.Mesh(new THREE.PlaneGeometry(16,1.4),M.sign('EVERYTHING EXCEPT WATER','#c03a2a','#fffaf0',768,80,48));s2.position.set(-180,H-5.6,z0-.06);s2.rotation.y=Math.PI;G.add(s2);
    const g1=glow(0x3ee0ff,22);g1.material.opacity=.35;g1.position.set(-180,H-2.6,z0-1);G.add(g1);}
  /* smashed glass at both doors */
  for(const z of[z0,z1])for(let k=0;k<30;k++){const x=-187+Math.random()*14,zz=z+(Math.random()-.5)*6;s4Geo(B('glassD',x,zz),new THREE.TetrahedronGeometry(.25+Math.random()*.3),x,.08,zz,Math.random()*3,Math.random()*3,0,1,.2,1);}
  /* inside: floor, ceiling, lights */
  s4Box(B('tile',cx,cz),cx,.03,cz,x1-x0-1.2,.02,z1-z0-1.2,0,6,6,null,4);
  {const c=B('conc',cx,cz);s4Box(c,cx,7.05,cz,x1-x0-1.2,.1,z1-z0-1.2,0,4,4,s4Tint(.35,.35,.36),8);}
  for(let z=z0+8;z<z1-4;z+=8)for(const x of[-196,-180,-164,-212,-148]){const st=Math.random();s4Box(B(st<.3?'lampOff':st<.6?'lampF1':st<.8?'lampF2':'lampOn',x,z),x,6.92,z,.5,.08,3.4,0,1,1,s4Tint(.85,.95,1));
    if(Math.abs(x+180)<1&&((z-z0)%16<1))S4.lamps.push({x,y:5.6,z,c:0xcfe8ff,i:1.6});}
  for(let z=z0+12;z<z1-6;z+=24)S4.blinkers.push([-180,6.6,z,1.8,1]);
  /* shelves: two walls beside the driving lane, then rows of aisles */
  const shelf=(x,za,zb,rot)=>{const len=zb-za,mz=(za+zb)/2;s4Box(B('metal',x,mz),x,1.25,mz,1.1,2.5,len,0,1,1,s4Tint(.75,.78,.8));
    const P=B('car',x,mz);for(let z=za+.4;z<zb-.3;z+=.7)for(let lv=0;lv<3;lv++){if(Math.random()<.35)continue;const c=S4PAINT[(Math.random()*S4PAINT.length)|0];s4Box(P,x+(Math.random()-.5)*.2,.45+lv*.8,z,.8,.5+Math.random()*.2,.55,0,1,1,s4Tint(c[0],c[1],c[2]));}};
  shelf(-188.2,z0+6,768,0);shelf(-188.2,792,z1-6,0);shelf(-171.8,z0+6,z1-6,0);
  for(const x of[-196,-204,-212,-220,-164,-156,-148,-140])shelf(x,z0+10,z1-10,0);
  /* aisle signs hanging over the lane */
  const ais=[['AISLE 7 · WATER · SOLD OUT','#c03a2a'],['SNACKS','#2a7a4a'],['GROK ELECTRONICS','#0c0f1e'],['HOT DRINKS (NO WATER)','#1e5a8a']];
  ais.forEach(([t,c],k)=>{const sg=new THREE.Mesh(new THREE.PlaneGeometry(7,.85),M.sign(t,c,'#fffaf0',768,94,44));sg.position.set(-180,6.45,z0+18+k*20);sg.rotation.y=Math.PI;G.add(sg);const b=sg.clone();b.rotation.y=0;b.position.z+=.02;G.add(b);});
  /* checkout counters near the doors, pillars down the middle */
  for(const lat of[-4.2,4.2]){const x=-180+lat;s4Box(B('dark',x,z0+11),x,.55,z0+11,1,1.1,3.6,0,1,1);s4Box(B('metal',x,z0+11),x,1.3,z0+12.4,.6,.5,.6,0,1,1);s4ColBox(x,z0+11,.6,1.9,0,{kind:'counter',top:1.4});}
  for(const [x,z] of[[-182.6,770],[-177.4,806]]){s4Box(B('conc',x,z),x,3.5,z,1.2,7,1.2,0,2,2,s4Tint(.8,.8,.78));s4ColBox(x,z,.7,.7,0,{kind:'pillar',top:7});}
  /* the cooler in the alcove, where a water bottle is hidden */
  s4Box(B('metal',-200,780),-200.6,1.4,780,1,2.8,8,0,1,1,s4Tint(.9,.9,.92));s4Box(B('glassD',-200,780),-200.05,1.4,780,.06,2.4,7.4,0,1,1);
  S4.bottleSpots.push([-197,780]);
  for(let z=z0+16;z<z1-8;z+=7+Math.random()*7){const lat=(Math.random()-.5)*10;S4.carts.push([-180+lat,z]);}
  for(let z=z0+20;z<z1-8;z+=5+Math.random()*5){const lat=(Math.random()<.5?-1:1)*(3+Math.random()*3);S4.boxes.push([-180+lat,z]);}
  S4.dark.push({x0,x1,z0,z1,a:.5});S4.indoor={x0:x0,x1:x1,z0:z0,z1:z1,y:6.5};}

/* ---------- GROK camps in the empty lots ---------- */
function s4Camp(id){const M=s4Mats(),G=S4.G,lot=S4.lots[id],B=(k,x,z)=>s4Bucket(x,z,k),bx=lot.bx,bz=lot.bz,x0=bx+12.5,x1=bx+S4K.G-12.5,z0=bz+12.5,z1=bz+S4K.G-12.5,cx=(x0+x1)/2,cz=(z0+z1)/2;
  const r=rng(id.length*97+bx*3+bz);
  s4Box(B('dirt',cx,cz),cx,.02,cz,x1-x0+12,.02,z1-z0+12,0,8,8,null,4);
  /* which side faces the route */const side=S4LOTS[Object.keys(S4LOTS).find(k=>S4LOTS[k][0]===id)][1];
  /* fences on the other three sides */
  const fence=(ax,ay,bx2,by2)=>{const fb=B('fence',(ax+bx2)/2,(ay+by2)/2),L=Math.hypot(bx2-ax,by2-ay);s4Quad(fb,[ax,0,ay],[bx2,0,by2],[bx2,2.6,by2],[ax,2.6,ay],[0,0],[L/1.6,0],[L/1.6,2.6/1.6],[0,2.6/1.6]);for(let t=0;t<=L;t+=3.2){const x=ax+(bx2-ax)*t/L,z=ay+(by2-ay)*t/L;s4Box(B('metal',x,z),x,1.3,z,.08,2.6,.08,0,1,1);}};
  if(side!=='z0')fence(x0,z0,x1,z0);if(side!=='z1')fence(x0,z1,x1,z1);if(side!=='x0')fence(x0,z0,x0,z1);if(side!=='x1')fence(x1,z0,x1,z1);
  /* the far half of the lot: tents, scrap, the stolen water tank, flags */
  const inward=side==='z0'?[0,1]:side==='z1'?[0,-1]:side==='x0'?[1,0]:[-1,0],front=side==='z0'?[cx,z0]:side==='z1'?[cx,z1]:side==='x0'?[x0,cz]:[x1,cz],along=[Math.abs(inward[1]),Math.abs(inward[0])];
  const at=(u,v)=>[front[0]+along[0]*u+inward[0]*v,front[1]+along[1]*u+inward[1]*v];/* u: along the street, v: into the lot */
  const tents=[];for(let k=0;k<5;k++){const u=-36+k*18+(r()-.5)*5,v=58+r()*16,[x,z]=at(u,v),yaw=Math.atan2(inward[0],inward[1])+(r()-.5)*.6;
    s4Geo(B('tarp',x,z),new THREE.ConeGeometry(2.8,2.8,4,1,true),x,1.4,z,0,yaw+Math.PI/4,0,1.4,1,1,s4Tint([.9,.4,.5,.7][k%4],[.5,.6,.5,.7][k%4],[.3,.9,.4,.8][k%4]));s4ColBox(x,z,2.2,2.2,yaw,{kind:'tent',top:2.6});tents.push([x,z]);}
  for(let k=0;k<3;k++){const [x,z]=at(-28+k*28+(r()-.5)*6,30+r()*14);s4Geo(B('rust',x,z),new THREE.CylinderGeometry(.55,.5,1.1,12),x,.55,z,0,0,0,1,1,1);S4.fires.push({x,y:1.2,z,s:.8,camp:1});s4Col({x,z,r:.65,kind:'barrel',top:1.2});}
  {const [x,z]=at(32,48);const tg=new THREE.Group();tg.position.set(x,0,z);const glassT=new THREE.Mesh(new THREE.CylinderGeometry(3,3,6,22,1,true),s3Mats().glass);glassT.position.y=3.6;tg.add(glassT);const w=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,4.6,22),M.water);w.position.y=3;tg.add(w);
    for(const y of[.6,6.6]){const ring=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,.5,22),s3Mats().steel);ring.position.y=y;tg.add(ring);}const lab=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.1),M.sign('STOLEN H2O','#14123a','#3ee0ff',512,120,64));lab.position.set(0,2.2,3.1);lab.rotation.y=Math.atan2(-inward[0],-inward[1]);tg.add(lab);G.add(tg);linearize(tg);s4Col({x,z,r:3.3,kind:'tank',top:7});}
  for(let k=0;k<2;k++){const [x,z]=at(-40+k*80,40);s4Geo(B('dark',x,z),new THREE.CylinderGeometry(.1,.12,9,6),x,4.5,z,0,0,0,1,1,1);const bb=B('banner',x,z),yaw=Math.atan2(inward[0],inward[1]);const rx=Math.cos(yaw),rz=-Math.sin(yaw);s4Quad(bb,[x,5,z],[x+rx*2.6,5,z+rz*2.6],[x+rx*2.6,8.8,z+rz*2.6],[x,8.8,z],[0,0],[1,0],[1,1],[0,1]);s4Col({x,z,r:.3,kind:'pole',top:9});}
  for(let k=0;k<4;k++){const [x,z]=at(-44+r()*88,62+r()*20),s=1.4+r()*1.4;for(let q=0;q<4;q++)s4Geo(B(q%2?'rust':'rubble',x,z),s4Rock(),x+(r()-.5)*2,s*.4,z+(r()-.5)*2,r()*3,r()*3,0,s,s*.6,s,s4Tint(.5,.42,.36));s4Col({x,z,r:s*1.1,kind:'scrap',top:2});}
  /* a generator with GROK lights */
  {const [x,z]=at(-10,48);s4Box(B('grokD',x,z),x,.9,z,3,1.8,2,0,1,1);s4Box(B('cyanV',x,z),x,1.85,z,3.02,.15,.15,0,1,1);s4ColBox(x,z,1.6,1.1,0,{kind:'box',top:2});S4.blinkers.push([x,2.4,z,2,1]);}
  /* crates you can smash (some hide hearts) and the bots that throw scrap at you */
  for(let k=0;k<9;k++){const [x,z]=at(-40+r()*80,10+r()*28);S4.crates.push([x,z]);}
  for(let k=0;k<3;k++){const [x,z]=at(-30+k*30+(r()-.5)*6,44+r()*8);S4.throwers.push({x,z,camp:id});}
  {const sg=new THREE.Mesh(new THREE.PlaneGeometry(8,2.2),M.sign('GROK CAMP '+(id==='campA'?'7':id==='campB'?'9':'12'),'#0c0f1e','#ff3a4a',640,170,70));const [x,z]=at(-34,2);sg.position.set(x,3.2,z);sg.rotation.y=Math.atan2(-inward[0],-inward[1]);G.add(sg);
    for(const du of[-3.6,3.6]){const [px,pz]=at(-34+du,2);s4Box(B('grokD',px,pz),px,1.6,pz,.25,3.2,.25,0,1,1);}}
  if(id==='campC'){const t=tents[3];S4.bottleSpots.push([t[0]+inward[0]*3.6,t[1]+inward[1]*3.6]);}
  /* the bombed-out buildings GROK cleared the lot from: shells along the back of the camp */
  {const face=Math.atan2(-inward[0],-inward[1]);for(let k=0;k<3;k++){const u=-31+k*31,[fx,fz]=at(u,84);
    s4Bldg({x:fx,z:fz,w:29,d:11,h:14+r()*20,yaw:face,style:['burnt','brick','conc'][k],damage:'chunk',shop:false,seed:(r()*4294967295)>>>0,zone:'camp',detail:true,billboard:false,turretSpot:false});
    const [qx,qz]=at(u,89.5);s4ColBox(qx,qz,14.6,5.6,face,{kind:'wall',top:40});}}}

/* ---------- the four-way: a tower that falls across two of the three ways out ---------- */
function s4Collapse(){const M=s4Mats(),G=S4.G,bx=0,bz=1200;
  /* the rest of the block, built normally on its other edges */
  s4Bldg({x:40,z:1307.5,w:56,d:22,h:34,yaw:0,style:'burnt',damage:'',shop:true,seed:41,zone:'camp',detail:true});
  s4Bldg({x:12.5,z:1270,w:40,d:24,h:28,yaw:-Math.PI/2,style:'brick',damage:'chunk',shop:true,seed:43,zone:'camp',detail:true});
  s4Bldg({x:30,z:1212.5,w:34,d:22,h:22,yaw:Math.PI,style:'conc',damage:'',shop:true,seed:47,zone:'camp',detail:true});
  /* the tower: a pivoting group so it can tip over */
  const piv=new THREE.Group();piv.position.set(107.5,0,1212.5);G.add(piv);const T=s4Bk(),w=40,d=40,h=74,cx=-w/2,cz=d/2;
  const B=s4Bk(),Bs=s4Bk(),Bc=s4Bk();
  s4Box(B,cx,h/2,cz,w,h,d,0,12,14,[.72,.66,.62],63&~4);s4Box(Bc,cx,h+.3,cz,w+.6,.6,d+.6,0,4,4,[.6,.58,.55]);s4Box(Bs,cx,2.2,cz-d/2-.03,w,4.4,.02,Math.PI,12,4.6,null,16,{vo:1-8/S4SHOPS,vs:1/S4SHOPS,vtop:true});s4Box(Bs,cx+w/2+.03,2.2,cz,.02,4.4,d,Math.PI/2,12,4.6,null,1,{vo:1-8/S4SHOPS,vs:1/S4SHOPS,vtop:true});
  for(const [bk,mat] of[[B,M.fac.burnt],[Bs,M.shop],[Bc,M.conc]]){const m=s4BkMesh(bk,mat);m.castShadow=m.receiveShadow=true;piv.add(m);}
  for(let k=0;k<6;k++){const f={x:107.5+cx+(Math.random()-.5)*w,y:8+Math.random()*50,z:1212.5-2,s:1.4,b:1,tower:1};S4.fires.push(f);}
  S4.plumes.push({x:87,y:h+3,z:1232,s:2.2,tower:1});
  /* the rubble it leaves (hidden until it falls) */
  /* rubble only where the straight and right-hand streets are (never on the crossing or the way out to the left) */
  const R=s4Bk();const rr=rng(9),zones=[[105,134,1211,1246,26],[78,108,1185,1215,22],[58,110,1210,1262,30]];
  for(const [xa,xb,za,zb,n] of zones)for(let k=0;k<n;k++){const x=xa+rr()*(xb-xa),z=za+rr()*(zb-za),s=1.6+rr()*3.6,hh=(x>104&&z>1210&&x<112)?1.4:(.5+rr()*.6);
    s4Geo(R,s4Rock(),x,s*.35,z,rr()*3,rr()*3,rr()*3,s,s*hh,s,[.4+rr()*.2,.38+rr()*.2,.36+rr()*.2]);}
  for(let k=0;k<12;k++){const zn=zones[k%3],x=zn[0]+rr()*(zn[1]-zn[0]),z=zn[2]+rr()*(zn[3]-zn[2]);s4Geo(R,new THREE.BoxGeometry(8+rr()*6,.5,3+rr()*3),x,1+rr()*4,z,(rr()-.5)*1.2,rr()*3,(rr()-.5)*1.2,1,1,1,[.55,.52,.5]);}
  const rub=s4BkMesh(R,M.rubble);rub.castShadow=rub.receiveShadow=true;rub.visible=false;G.add(rub);
  const stump=s4Bk();s4Box(stump,107.5-20,6,1232,40,12,40,0,12,14,[.5,.46,.44],63);const sm=s4BkMesh(stump,M.fac.burnt);sm.visible=false;G.add(sm);
  S4.collapse={piv,rub,stump:sm,t:-1,done:false};}

/* ---------- the GROK aqueduct over the bad part of town (x=180) ---------- */
function s4Aqueduct(){const M=s4Mats(),B=(k,x,z)=>s4Bucket(x,z,k),x=180,y0=10;
  for(let z=1140;z<=1260;z+=24){s4Box(B('grokD',x,z),x,y0+1,z,16,2,24.05,0,4,4,null,63);s4Box(B('cyanV',x,z),x,y0+.2,z,16.05,.2,24.05,0,1,1,null,1|2);}
  {const pts=[new V3(x,y0+4.6,1130),new V3(x,y0+4.6,1270)];s4Geo(B('grokM',x,1200),new THREE.CylinderGeometry(3.4,3.4,140,22,1,true),x,y0+5.4,1200,Math.PI/2,0,0,1,1,1);
    for(let z=1140;z<=1260;z+=12)s4Geo(B('cyanV',x,z),new THREE.TorusGeometry(3.5,.18,6,24),x,y0+5.4,z,0,0,0,1,1,1);}
  for(const sz of[-1,1]){const z=1200+sz*11.4;s4Box(B('grokD',x,z),x,y0/2,z,5,y0,1.6,0,4,4,null,63);s4ColBox(x,z,2.6,.85,0,{kind:'pillar',top:y0});S4.blinkers.push([x,y0-.4,z,2.4,2]);}
  S4.dark.push({x0:172,x1:188,z0:1187.5,z1:1212.5,a:.5});
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(10,1.6),M.sign('GROK AQUEDUCT · TO THE CASTLE','#0c0f1e','#3ee0ff',768,120,52));sg.position.set(x-8.05,y0+1,1200);sg.rotation.y=-Math.PI/2;S4.G.add(sg);}

/* ---------- boss props: the big lamp post, the billboard tower, the overpass ---------- */
function s4BossProps(){const M=s4Mats(),G=S4.G,M3=s3Mats();
  /* 1: a huge old double lamp post on the right sidewalk */
  {const g=new THREE.Group(),dark=M3.grokD,metal=M3.steel;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.42,.7,18,14),new THREE.MeshStandardMaterial({color:linC(0x2a3a34),metalness:.7,roughness:.35}));pole.position.y=9;g.add(pole);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,2.4,14),pole.material);base.position.y=1.2;g.add(base);const arm=new THREE.Mesh(new THREE.BoxGeometry(7,.3,.3),pole.material);arm.position.y=17.4;g.add(arm);
    for(const s of[-1,1]){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.9,16,12),M3.bas(0xffe2a8));lamp.position.set(s*3.4,16.6,0);g.add(lamp);const gl=glow(0xffd090,7);gl.position.copy(lamp.position);g.add(gl);}
    const crack=new THREE.Mesh(new THREE.TorusGeometry(3.8,.26,8,40),M.add(0xffd23f,.9));crack.rotation.x=Math.PI/2;crack.position.y=.3;g.add(crack);
    const q=s4At(s4S(11,430),-14.2);g.position.set(q.x,0,q.z);g.rotation.y=q.h+Math.PI/2;G.add(g);linearize(g);
    const c=s4Col({x:q.x,z:q.z,r:2.8,kind:'target',top:20});S4.targets.push({id:'lamp',g,c,s:s4S(11,430),fall:-1,dir:-1,len:18,crack,done:false,mark:null});}
  /* 2: billboard tower on the left sidewalk */
  {const g=new THREE.Group(),steel=M3.steel;for(const [a,b] of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.3,16,.3),steel);leg.position.set(a,8,b);g.add(leg);}
    for(let y=2;y<16;y+=3){const ring=new THREE.Mesh(new THREE.BoxGeometry(3.5,.15,3.5),steel);ring.position.y=y;g.add(ring);}
    const bd=new THREE.Mesh(new THREE.PlaneGeometry(14,6),M.sign('OBEY GROK','#0c0f1e','#ff3a4a',768,330,140));bd.position.set(0,19,-.3);bd.rotation.y=Math.PI;g.add(bd);const back=new THREE.Mesh(new THREE.BoxGeometry(14.4,6.4,.3),M3.grokD);back.position.set(0,19,0);g.add(back);
    const crack=new THREE.Mesh(new THREE.TorusGeometry(4,.26,8,40),M.add(0xffd23f,.9));crack.rotation.x=Math.PI/2;crack.position.set(-1.6,.3,-1.6);g.add(crack);
    const q=s4At(s4S(11,790),14.4);g.position.set(q.x,0,q.z);g.rotation.y=q.h-Math.PI/2;G.add(g);linearize(g);
    const c=s4Col({x:q.x,z:q.z,r:3.4,kind:'target',top:22});S4.targets.push({id:'board',g,c,s:s4S(11,790),fall:-1,dir:1,len:22,crack,done:false});}
  /* 3: the overpass over Grand Avenue's second half (z=2640), held up by a cracked pillar in the middle */
  {const z=2640,y0=10,x=840,parts=[];const mk=(xa,xb)=>{const g=new THREE.Group(),w=xb-xa,B=s4Bk();s4Box(B,0,0,0,w,1.8,18,0,4,4,[.7,.68,.64]);s4Box(B,0,1.5,8.6,w,1.2,.6,0,4,4,[.78,.76,.72]);s4Box(B,0,1.5,-8.6,w,1.2,.6,0,4,4,[.78,.76,.72]);
      const top=s4Bk();s4Box(top,0,.92,0,w,.02,17,0,16,16,null,4);const m=s4BkMesh(B,M.conc),t=s4BkMesh(top,M.deck);m.castShadow=m.receiveShadow=true;g.add(m,t);g.position.set((xa+xb)/2,y0+.9,z);G.add(g);parts.push(g);return g;};
    const left=mk(700,808),mid=mk(808,872),right=mk(872,980);
    for(const px of[740,790,890,940]){const B=s4Bucket(px,z,'conc');s4Box(B,px,y0/2,z,2.2,y0,2.2,0,4,4,s4Tint(.66,.64,.6),63);s4ColBox(px,z,1.2,1.2,0,{kind:'pillar',top:y0});}
    const pil=new THREE.Group();const pm=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,y0,16),M.std({color:linC(0x9a948a),roughness:.9}));pm.position.y=y0/2;pil.add(pm);
    const cm=M.std({color:linC(0xffd23f),emissive:linC(0xff9a20),emissiveIntensity:1.6,roughness:.3});for(let k=0;k<8;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(.1,1+Math.random()*2.4,.12),cm);const a=Math.random()*6.28;s.position.set(Math.cos(a)*1.52,1+Math.random()*6,Math.sin(a)*1.52);s.rotation.set(0,-a,(Math.random()-.5)*1.4);pil.add(s);}
    const crack=new THREE.Mesh(new THREE.TorusGeometry(4.2,.28,8,40),M.add(0xffd23f,.9));crack.rotation.x=Math.PI/2;crack.position.y=.3;pil.add(crack);pil.position.set(x,0,z);G.add(pil);linearize(pil);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(12,2),M.sign('GROK EXPRESSWAY','#1e6a3a','#fffaf0',768,128,64));sg.position.set(x,y0+3.6,z-9.2);sg.rotation.y=Math.PI;mid.add(sg);sg.position.set(0,2.7,-9.2);
    const c=s4Col({x,z,r:3,kind:'target',top:y0});S4.targets.push({id:'pillar',g:pil,c,s:s4S(13,480),fall:-1,crack,done:false,deck:mid,left,right});
    S4.dark.push({x0:823,x1:857,z0:2631,z1:2649,a:.35});}}

/* ---------- the plaza and GROK's castle ---------- */
function s4Castle(){const M=s4Mats(),G=S4.G,B=(k,x,z)=>s4Bucket(x,z,k),cx=1080,wz=3300;
  const stone=c=>s4Tint(c*.62,c*.58,c*.66);
  /* plaza */
  s4Box(B('paver',cx,3150),cx,.015,3150,170,.02,330,0,6,6,null,4);
  for(const sx of[-1,1]){/* low walls with columns along the plaza sides */const x=cx+sx*47.5;for(let z=3010;z<3290;z+=10){s4Box(B('stone',x,z),x,.7,z+5,1.4,1.4,10,0,4,4,stone(.85));if(((z-3010)/10)%3===0){s4Box(B('stone',x,z),x,4,z,2,8,2,0,4,4,stone(.95));S4.blinkers.push([x,8.6,z,2.6,1]);}}}
  /* the dry fountain */
  {const fz=3170,B1=B('stone',cx,fz);s4Geo(B1,new THREE.TorusGeometry(13,1,8,40),cx,.8,fz,Math.PI/2,0,0,1,1,1,stone(.9));s4Geo(B('dirt',cx,fz),new THREE.CircleGeometry(12.6,40),cx,.25,fz,-Math.PI/2,0,0,1,1,1);
    for(let k=0;k<3;k++)s4Geo(B1,new THREE.CylinderGeometry(4.6-k*1.4,5-k*1.4,2,20),cx,1.5+k*2.4,fz,0,0,0,1,1,1,stone(.85));s4Geo(B1,new THREE.SphereGeometry(1.2,12,8),cx,9,fz,0,0,0,1,1,1,stone(.9));s4Col({x:cx,z:fz,r:14,kind:'fountain',top:3});}
  /* front wall with battlements, gatehouse towers, corner towers */
  const wall=(xa,xb,h)=>{for(let x=xa;x<xb;x+=20){const w=Math.min(20,xb-x),mx=x+w/2;s4Box(B('stone',mx,wz),mx,h/2,wz+6,w,h,12,0,8,8,stone(.9),63);for(let k=0;k<w;k+=5)s4Box(B('stone',x+k+1.5,wz),x+k+1.5,h+1.8,wz+.8,3,3.6,1.6,0,4,4,stone(.85));
      if(((x-xa)/20)%2===0){const bb=B('banner',mx,wz);s4Quad(bb,[mx+3,h-24,wz-.05],[mx-3,h-24,wz-.05],[mx-3,h-2,wz-.05],[mx+3,h-2,wz-.05],[0,0],[1,0],[1,1],[0,1]);}}};
  wall(880,1046,48);wall(1114,1280,48);
  const tower=(x,z,r,h,roof)=>{const Bt=B('stone',x,z);s4Geo(Bt,new THREE.CylinderGeometry(r,r*1.08,h,24),x,h/2,z,0,0,0,1,1,1,stone(.8),8);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;s4Box(Bt,x+Math.cos(a)*r,h+1.6,z+Math.sin(a)*r,3.4,3.2,3.4,-a,4,4,stone(.78));}
    s4Geo(B('grokD',x,z),new THREE.ConeGeometry(r*1.15,roof,24),x,h+roof/2+3,z,0,0,0,1,1,1);for(const y of[h*.35,h*.7])s4Geo(B('cyanV',x,z),new THREE.TorusGeometry(r+.25,.35,6,30),x,y,z,Math.PI/2,0,0,1,1,1);
    S4.blinkers.push([x,h+roof+4,z,7,1]);for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.35;s4Box(B('redV',x,z),x+Math.cos(a)*(r+.1),h*.55+k*1.5*0,z+Math.sin(a)*(r+.1),1,3.4,.3,-a+Math.PI/2,1,1);}};
  tower(cx-34,wz+4,15,96,44);tower(cx+34,wz+4,15,96,44);tower(880,wz+6,18,80,40);tower(1280,wz+6,18,80,40);
  /* gate: arch top and two great doors with the eye */
  s4Box(B('stone',cx,wz),cx,42,wz+6,40,12,12,0,8,8,stone(.86));
  {const doorM=M.std({color:linC(0x24262e),metalness:.7,roughness:.4});const eyeT=tex(mkCanvas(512,512,(g,w,h)=>{g.fillStyle='#14161e';g.fillRect(0,0,w,h);g.strokeStyle='#3ee0ff';g.lineWidth=18;g.beginPath();g.arc(w/2,h/2,190,0,7);g.stroke();g.fillStyle='#ff2a3a';g.beginPath();g.arc(w/2,h/2,92,0,7);g.fill();g.fillStyle='#ffd0d4';g.beginPath();g.arc(w/2-20,h/2-20,24,0,7);g.fill();
      g.fillStyle='#3a3e48';for(let y=30;y<h;y+=60)for(let x=30;x<w;x+=60){g.beginPath();g.arc(x,y,7,0,7);g.fill();}g.strokeStyle='#0a0b10';g.lineWidth=8;g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.stroke();}),false);
    const dm=M.std({map:eyeT,metalness:.6,roughness:.45,emissiveMap:eyeT,emissive:new THREE.Color(.5,.5,.5),emissiveIntensity:.8});const door=new THREE.Mesh(new THREE.PlaneGeometry(26,34),dm);door.position.set(cx,17,wz-.1);door.rotation.y=Math.PI;G.add(door);S4.castleDoor=door;
    const frame=new THREE.Mesh(new THREE.BoxGeometry(30,2,3),doorM);frame.position.set(cx,35,wz-.5);G.add(frame);}
  /* the keep and its spire with the GROK eye */
  {const kz=3390;for(let t=0;t<3;t++){const w=120-t*28,d=70-t*14,h=60+t*40;s4Box(B('stone',cx,kz),cx,(t===0?h/2:(60+(t-1)*40)+((h-(60+(t-1)*40))/2)),kz,w,t===0?h:h-(60+(t-1)*40),d,0,10,10,stone(.7+t*.06),63);}
    for(let k=0;k<6;k++)s4Box(B('redV',cx-50+k*20,kz),cx-50+k*20,45,kz-35.2,1.4,30,.4,0,1,1);
    s4Geo(B('grokD',cx,kz),new THREE.ConeGeometry(16,96,8),cx,140+48,kz,0,0,0,1,1,1);
    const eye=new THREE.Group();eye.position.set(cx,246,kz);G.add(eye);const ball=new THREE.Mesh(new THREE.SphereGeometry(9,28,20),M.std({color:linC(0x14161e),metalness:.8,roughness:.25}));eye.add(ball);
    const iris=new THREE.Mesh(new THREE.SphereGeometry(4.6,24,16),s3Mats().red);iris.position.z=-6.2;eye.add(iris);const gl=glow(0xff2a3a,60);gl.position.z=-7;eye.add(gl);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(15,.7,8,48),s3Mats().cyan);eye.add(halo);const halo2=new THREE.Mesh(new THREE.TorusGeometry(19,.4,8,48),s3Mats().cyan);halo2.rotation.x=Math.PI/2;eye.add(halo2);linearize(eye);S4.castleEye={g:eye,halo,halo2,iris};
    /* cooling towers with steam */for(const sx of[-1,1]){const x=cx+sx*120,z=3420;s4Geo(B('conc',x,z),new THREE.CylinderGeometry(16,22,60,28,1,true),x,30,z,0,0,0,1,1,1,s4Tint(.62,.6,.6));S4.plumes.push({x,y:62,z,s:5,steam:1});}}
  /* searchlights on the gate towers */
  S4.search=[];for(const sx of[-1,1]){const g=new THREE.Group();g.position.set(cx+sx*34,100,wz+4);const cone=new THREE.Mesh(new THREE.CylinderGeometry(22,.8,420,24,1,true),new THREE.MeshBasicMaterial({color:linC(0xffeec8),transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,fog:false}));cone.position.y=210;g.add(cone);G.add(g);S4.search.push({g,ph:sx});}
  /* big pipes carrying the city's water into the castle */
  for(const sx of[-1,1]){const x=cx+sx*58;s4Geo(B('grokM',x,3150),new THREE.CylinderGeometry(3.4,3.4,320,20,1,true),x,3.4,3140,Math.PI/2,0,0,1,1,1);for(let z=2990;z<3300;z+=14)s4Geo(B('cyanV',x,z),new THREE.TorusGeometry(3.5,.22,6,24),x,3.4,z,0,0,0,1,1,1);}
  S4.castleZ=wz;}

/* ---------- Tralalero's arrows: a cyan hologram at every corner ---------- */
function s4Arrows(){const M=s4Mats(),G=S4.G;S4.arrows=[];
  const shape=new THREE.Shape();shape.moveTo(-3,-.8);shape.lineTo(.8,-.8);shape.lineTo(.8,-2.1);shape.lineTo(3.4,0);shape.lineTo(.8,2.1);shape.lineTo(.8,.8);shape.lineTo(-3,.8);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:false});geo.translate(0,0,-.15);const mat=M.add(0x3ee0ff,.75),edge=M.add(0xbff8ff,.9);
  for(let i=3;i<S4N.length-2;i++){const tn=s4Turn(i);if(!tn)continue;const [dx,dz]=s4Dir(i-1),[ex,ez]=s4Dir(i),rgt=(ex*(-dz)+ez*dx)>0,n=S4N[i],W=Math.max(S4SEG[i-1].W,S4SEG[i].W);
    const g=new THREE.Group();const a=new THREE.Mesh(geo,mat);g.add(a);const gl=glow(0x3ee0ff,9);gl.material.opacity=.45;g.add(gl);
    g.position.set(n[0]+dx*(W+3),7,n[1]+dz*(W+3));g.rotation.y=Math.atan2(-dx,-dz);a.scale.x=rgt?1:-1;G.add(g);
    S4.arrows.push({g,a,i,s:S4.path.ns[i],rgt,ph:Math.random()*6});}}
/* ---------- the far skyline (rides with the camera) and the castle seen from far away ---------- */
function s4Backdrop(){const G=S4.G;
  const sk=tex(mkCanvas(4096,512,(g,w,h)=>{g.clearRect(0,0,w,h);const r=rng(44);for(let L=0;L<3;L++){for(let x=0;x<w;){const bw=24+r()*80,bh=(60+L*50)+r()*(150+L*60);g.fillStyle=['rgba(120,84,72,.55)','rgba(84,58,58,.8)','rgba(52,36,40,.96)'][L];g.fillRect(x,h-bh,bw,bh);
      if(L===2){for(let wy=h-bh+8;wy<h-6;wy+=12)for(let wx=x+4;wx<x+bw-4;wx+=10){if(r()<.1){g.fillStyle=r()<.3?'#ff5a2a':'#ffc070';g.fillRect(wx,wy,4,5);}}}x+=bw+(L===2?2:6);}}
    for(let k=0;k<26;k++){const x=r()*w,top=h-180-r()*200;const gr=g.createLinearGradient(x,top,x,h);gr.addColorStop(0,'rgba(40,30,30,0)');gr.addColorStop(1,'rgba(40,30,30,.55)');g.fillStyle=gr;g.beginPath();g.moveTo(x-6,h);g.quadraticCurveTo(x-30,top+80,x-60+r()*40,top);g.lineTo(x+60,top);g.quadraticCurveTo(x+30,top+80,x+6,h);g.fill();}}),false);
  sk.wrapS=THREE.RepeatWrapping;const m=new THREE.MeshBasicMaterial({map:sk,transparent:true,fog:false,depthWrite:false,side:THREE.BackSide});m.userData.lin=true;
  const cyl=new THREE.Mesh(new THREE.CylinderGeometry(2600,2600,620,64,1,true),m);cyl.position.y=180;cyl.renderOrder=-1;scene.add(cyl);S4.back=cyl;
  /* the castle on the horizon, until the real one is close enough */
  const ct=tex(mkCanvas(1024,640,(g,w,h)=>{g.clearRect(0,0,w,h);const c='rgba(24,16,26,.97)';g.fillStyle=c;g.fillRect(140,420,744,220);for(let x=140;x<884;x+=24)g.fillRect(x,404,14,20);
    const tw=(x,tw2,th)=>{g.fillRect(x-tw2/2,h-th,tw2,th);g.beginPath();g.moveTo(x-tw2*.62,h-th);g.lineTo(x,h-th-tw2*1.6);g.lineTo(x+tw2*.62,h-th);g.fill();};tw(170,70,300);tw(854,70,300);tw(452,64,380);tw(572,64,380);
    g.fillRect(392,250,240,390);g.beginPath();g.moveTo(470,250);g.lineTo(512,20);g.lineTo(554,250);g.fill();
    g.fillStyle='#ff2a3a';g.beginPath();g.arc(512,44,16,0,7);g.fill();const gr=g.createRadialGradient(512,44,4,512,44,90);gr.addColorStop(0,'rgba(255,40,60,.8)');gr.addColorStop(1,'rgba(255,40,60,0)');g.fillStyle=gr;g.fillRect(400,0,224,140);
    g.fillStyle='#3ee0ff';for(const x of[452,572])g.fillRect(x-30,h-230,60,5);for(let k=0;k<30;k++){g.fillStyle=Math.random()<.5?'#ff3a4a':'#3ee0ff';g.fillRect(400+Math.random()*220,280+Math.random()*300,4,6);}}),false);
  const cm=new THREE.MeshBasicMaterial({map:ct,transparent:true,fog:false,depthWrite:false,opacity:1});cm.userData.lin=true;const pl=new THREE.Mesh(new THREE.PlaneGeometry(900,560),cm);pl.renderOrder=-1;scene.add(pl);S4.farCastle=pl;}
