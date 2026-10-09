/* ==== FREE DRIVE BEGIN ==== */
/* ============ FREE DRIVE · an endless road that builds itself as you drive ============
   The road is generated a little at a time ahead of you (gentle curves, smooth hills, never crosses itself because it always
   keeps heading "north"). The land around it is streamed in square chunks: detailed ones near you, low-detail ones far away.
   Scenery changes with the biome under you: meadows, pine forest, maple hills, red-rock desert and frozen peaks. */
var FD=null;
const FDK={CH:128,HW:4.3,SH:1.7,DS:2,WL:-6,BACK:1200,PIECE:64};
const FDW=FDK.HW+FDK.SH;
const FD_BIO=[
  {id:'meadow',name:'Green Meadows',g1:0x5d9a3a,g2:0x8fbf52,amp:20,mtn:150,clim:[.55,.48],rock:0x8d8a80},
  {id:'forest',name:'Pine Forest',g1:0x2e5a28,g2:0x4f7d34,amp:30,mtn:230,clim:[.4,.84],rock:0x7a7870},
  {id:'autumn',name:'Maple Hills',g1:0x8d8436,g2:0xb98c3c,amp:26,mtn:170,clim:[.26,.5],rock:0x8a8070},
  {id:'desert',name:'Red Rock Desert',g1:0xd9a56a,g2:0xc2804c,amp:10,mtn:190,clim:[.86,.15],rock:0xb0603a},
  {id:'snow',name:'Frozen Peaks',g1:0xe9eef4,g2:0xcdd8e4,amp:36,mtn:330,clim:[.06,.62],rock:0x6f7480}];
const FD_BIO_IDS=['mixed','meadow','forest','autumn','desert','snow'];
const FD_TIME={
  morning:{sky:'day',skyP:{el:12,az:95,turb:6,ray:2.2,mie:.006,g:.84,fog:[0xd9d4dc,240,1050],sun:[0xffdcb4,2.3],hemi:[0xdde6ff,0x62704a,.5],exp:.72},cloud:[1,.9,.84],ring:0x9aa2b8},
  noon:{sky:'day',skyP:{el:52,az:160,fog:[0xbcd6ee,260,1050]},cloud:[1,1,1],ring:0x8fa6c2},
  sunset:{sky:'dusk',skyP:{el:6,az:250,fog:[0xeab58a,220,1050]},cloud:[1,.72,.58],ring:0x9a7a8a},
  night:{sky:'night',skyP:{fog:[0x0e1338,110,720]},cloud:[.1,.11,.2],ring:0x141a3c}};
let FDOPT;try{FDOPT=Object.assign({bio:'mixed',time:'noon'},JSON.parse(store.get('tungtung-free')||'{}'));}catch(e){FDOPT={bio:'mixed',time:'noon'};}
if(!FD_TIME[FDOPT.time])FDOPT.time='noon';if(FD_BIO_IDS.indexOf(FDOPT.bio)<0)FDOPT.bio='mixed';
function fdSaveOpt(){store.set('tungtung-free',JSON.stringify(FDOPT));}
SONGS.cruise={tempo:84,wave:'triangle',soft:true,bass:[43,0,50,0,47,0,50,0, 40,0,47,0,43,0,47,0, 36,0,43,0,40,0,43,0, 38,0,45,0,42,0,45,0],
  lead:[71,0,0,74,0,0,79,0, 78,0,76,0,74,0,0,0, 72,0,0,76,0,0,79,0, 76,0,0,0,0,0,0,0, 74,0,0,78,0,0,81,0, 79,0,78,0,76,0,74,0, 71,0,72,0,74,0,0,0, 67,0,0,0,0,0,0,0]};

/* ---------- climate, height ---------- */
const FD_W=new Float32Array(5),FD_W2=new Float32Array(5);
function fdW(x,z,out){out=out||FD_W;
  if(FD.fix>=0){out.fill(0);out[FD.fix]=1;return out;}
  const X=x+FD.sx,Z=z+FD.sz;
  const t=clamp((fbm(X*.00042,Z*.00042,3)-.5)*2.9+.5,0,1),m=clamp((fbm(Z*.00052+40,X*.00052-30,3)-.5)*2.9+.5,0,1);
  let s=0;for(let i=0;i<5;i++){const c=FD_BIO[i].clim,dx=t-c[0],dy=m-c[1],v=Math.exp(-(dx*dx+dy*dy)/.016);out[i]=v;s+=v;}
  s=s||1;for(let i=0;i<5;i++)out[i]/=s;return out;}
function fdBase(x,z,w){const X=x+FD.sx,Z=z+FD.sz;let amp=0;for(let i=0;i<5;i++)amp+=w[i]*FD_BIO[i].amp;
  let h=(fbm(X*.0042,Z*.0042,4)-.47)*2*amp+(vnoise(X*.035,Z*.035)-.5)*1.3;
  if(w[3]>.02){const m=fbm(X*.0031+9,Z*.0031-3,3);h+=w[3]*(smooth(.56,.585,m)*20+smooth(.65,.67,m)*15);}
  return h;}
function fdMtn(x,z,w){let a=0;for(let i=0;i<5;i++)a+=w[i]*FD_BIO[i].mtn;const X=x+FD.sx,Z=z+FD.sz;
  const r=1-Math.abs(fbm(X*.0019+3.1,Z*.0019-8.3,5)*2-1);return a*r*r*(.35+.65*fbm(X*.0007,Z*.0007,2));}
/* road lookups: the road always moves +z, so it is a function x(z) and we can binary-search it */
function fdIdxZ(z){const R=FD.rz,n=FD.n;if(z<=R[0])return 0;if(z>=R[n-1])return n-1;let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R[m]<=z)lo=m;else hi=m;}return lo;}
function fdLat(x,z){const i=fdIdxZ(z);let xr=FD.rx[i];if(i<FD.n-1){const t=clamp((z-FD.rz[i])/(FD.rz[i+1]-FD.rz[i]),0,1);xr=lerp(xr,FD.rx[i+1],t);}return Math.abs(x-xr)*Math.cos(FD.rh[i]);}
const FDQ={d:0,y:0,i:0,t:0,lat:0};
function fdNear(x,z){const R=FD,a=fdIdxZ(z-40),b=Math.min(R.n-1,fdIdxZ(z+40)+1);let bd=1e18,bi=a;
  for(let i=a;i<=b;i++){const dx=x-R.rx[i],dz=z-R.rz[i],d=dx*dx+dz*dz;if(d<bd){bd=d;bi=i;}}
  let best=1e9,y=R.ry[bi],ii=bi,tt=0,lat=0;
  for(let j=bi-1;j<=bi;j++){if(j<0||j>=R.n-1)continue;const ax=R.rx[j],az=R.rz[j],ex=R.rx[j+1]-ax,ez=R.rz[j+1]-az,L=Math.sqrt(ex*ex+ez*ez)||1;
    const t=clamp(((x-ax)*ex+(z-az)*ez)/(L*L),0,1),px=ax+ex*t,pz=az+ez*t,d=Math.hypot(x-px,z-pz);
    if(d<best){best=d;y=lerp(R.ry[j],R.ry[j+1],t);ii=j;tt=t;lat=(x-px)*(-ez/L)+(z-pz)*(ex/L);}}
  if(best>1e8){best=Math.sqrt(bd);}
  FDQ.d=best;FDQ.y=y;FDQ.i=ii;FDQ.t=tt;FDQ.lat=lat;return FDQ;}
function fdH(x,z){const w=fdW(x,z),lat=fdLat(x,z);let h=fdBase(x,z,w);FD.lastD=1e9;
  const m=smooth(150,560,lat);if(m>0)h+=fdMtn(x,z,w)*m;
  if(lat<75){const q=fdNear(x,z);FD.lastD=q.d;if(q.d<FDK.HW+34)h=lerp(q.y,h,smooth(FDW+.5,FDK.HW+34,q.d));}
  return h;}

/* ---------- road generation ---------- */
function fdRoadInit(){const r=FD.rand;FD.rx=[];FD.rz=[];FD.ry=[];FD.rh=[];FD.rk=[];FD.n=0;
  const z0=-FDK.BACK,w=fdW(0,z0,FD_W2);
  FD.g={x:0,z:z0,h:0,k:0,kt:0,left:FDK.BACK-140,gr:0,y:Math.max(fdBase(0,z0,w),FDK.WL+1.6)};
  fdPush();}
function fdPush(){const g=FD.g;FD.rx.push(g.x);FD.rz.push(g.z);FD.ry.push(g.y);FD.rh.push(g.h);FD.rk.push(g.k);FD.n++;}
const FD_DK=1/(75*45);
function fdStep(){const g=FD.g,r=FD.rand,DS=FDK.DS;
  if(g.left<=0){const st=r()<.28;g.kt=st?0:(r()<.5?-1:1)*lerp(1/520,1/78,Math.pow(r(),1.25));g.left=st?lerp(80,300,r()):lerp(50,230,r());}
  g.left-=DS;
  const pred=g.h+Math.sign(g.k)*g.k*g.k/(2*FD_DK);
  if(pred>.92&&g.kt>-1/420){g.kt=-lerp(1/420,1/130,r());g.left=lerp(70,170,r());}
  else if(pred<-.92&&g.kt<1/420){g.kt=lerp(1/420,1/130,r());g.left=lerp(70,170,r());}
  g.k+=clamp(g.kt-g.k,-FD_DK*DS,FD_DK*DS);
  g.h+=g.k*DS;g.x+=Math.sin(g.h)*DS;g.z+=Math.cos(g.h)*DS;
  const ax=g.x+Math.sin(g.h)*40,az=g.z+Math.cos(g.h)*40;
  let tg=(fdBase(g.x,g.z,fdW(g.x,g.z,FD_W2))+fdBase(ax,az,fdW(ax,az,FD_W2)))*.5;tg=Math.max(tg,FDK.WL+1.6);
  const want=clamp((tg-g.y)/45,-.072,.072);g.gr+=clamp(want-g.gr,-.0011*DS,.0011*DS);g.y+=g.gr*DS;
  if(g.y<FDK.WL+1.3){g.y=FDK.WL+1.3;g.gr=Math.max(g.gr,0);}
  fdPush();}
function fdGrowTo(z){let guard=0;while(FD.g.z<z&&guard++<20000)fdStep();}
function fdGrowN(n){while(FD.n<n)fdStep();}

/* ---------- shared assets ---------- */
let FDA=null;
function fdColGeo(g,fn){g=g.index?g.toNonIndexed():g;const p=g.attributes.position,c=new Float32Array(p.count*3),col=new THREE.Color();
  for(let i=0;i<p.count;i++){fn(col,p.getX(i),p.getY(i),p.getZ(i),i);col.convertSRGBToLinear();c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;}
  g.setAttribute('color',new THREE.BufferAttribute(c,3));if(g.attributes.uv)g.deleteAttribute('uv');return g;}
function fdMerge(list){let n=0;for(const g of list)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const g of list){pos.set(g.attributes.position.array,o*3);if(!g.attributes.normal)g.computeVertexNormals();nor.set(g.attributes.normal.array,o*3);if(g.attributes.color)col.set(g.attributes.color.array,o*3);else col.fill(1,o*3,(o+g.attributes.position.count)*3);o+=g.attributes.position.count;}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('normal',new THREE.BufferAttribute(nor,3));out.setAttribute('color',new THREE.BufferAttribute(col,3));out.userData.keep=true;out.computeBoundingSphere();return out;}
function fdJitter(g,amt,seed){const r=rng(seed),p=g.attributes.position,map=new Map();
  for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*100)+','+Math.round(p.getY(i)*100)+','+Math.round(p.getZ(i)*100);let o=map.get(k);if(!o){o=[(r()-.5)*amt,(r()-.5)*amt,(r()-.5)*amt];map.set(k,o);}p.setXYZ(i,p.getX(i)+o[0],p.getY(i)+o[1],p.getZ(i)+o[2]);}
  g.computeVertexNormals();return g;}
function fdSway(m,amt){m.onBeforeCompile=sh=>{sh.uniforms.uT=FDA.time;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*.11+instanceMatrix[3].z*.13;\nfloat sw=max(0.,position.y)*'+amt.toFixed(4)+';\ntransformed.x+=sin(uT*1.6+ph)*sw;transformed.z+=cos(uT*1.3+ph*1.7)*sw*.7;\n#endif');};m.customProgramCacheKey=()=>'fdsway'+amt;return m;}
function fdAssets(){if(FDA)return FDA;const A={time:{value:0}};FDA=A;const C3=c=>new THREE.Color(c);
  const tierCone=(r,h,y,seg,seed)=>{const g=new THREE.ConeGeometry(r,h,seg,2,false);g.translate(0,y+h/2,0);return fdJitter(g.toNonIndexed(),r*.18,seed);};
  /* pine */
  const pine=(snow,seed)=>{const parts=[];const tr=new THREE.CylinderGeometry(.16,.3,3.2,7);tr.translate(0,1.6,0);parts.push(fdColGeo(tr,c=>c.set(0x5a3e28)));
    const tiers=[[2.5,3.6,1.6],[2.05,3.2,3.2],[1.6,2.8,4.7],[1.1,2.4,6.1],[.6,1.8,7.3]];
    tiers.forEach(([r,h,y],i)=>{const g=tierCone(r,h,y,9,seed+i);parts.push(fdColGeo(g,(c,x,yy,z)=>{const t=(yy-y)/h;c.set(0x24502a).lerp(C3(0x3f7a3a),t*.8+i*.05);if(snow){c.lerp(C3(0xf4f8ff),smooth(.08,.5,t)*.85);}if(!snow&&t<.12)c.multiplyScalar(.75);}));});
    return fdMerge(parts);};
  A.pine=pine(false,11);A.pineS=pine(true,21);
  /* broadleaf */
  const broad=(seed)=>{const r=rng(seed),parts=[];const tr=new THREE.CylinderGeometry(.18,.34,3.4,7);tr.translate(0,1.7,0);parts.push(fdColGeo(tr,c=>c.set(0x5e4630)));
    for(let i=0;i<3;i++){const b=new THREE.CylinderGeometry(.06,.1,1.8,5);b.rotateZ((i-1)*.7);b.translate((i-1)*.5,3.6,0);parts.push(fdColGeo(b,c=>c.set(0x5e4630)));}
    const blobs=[[0,5.2,0,2.4],[1.4,4.6,.5,1.7],[-1.3,4.7,-.4,1.8],[.3,6.3,-.3,1.7],[-.4,4.4,1.2,1.5],[.5,4.5,-1.3,1.5]];
    for(const [x,y,z,s] of blobs){const g=new THREE.IcosahedronGeometry(s,1);g.scale(1,.86,1);g.translate(x,y,z);fdJitter(g,s*.35,seed+x*7);parts.push(fdColGeo(g,(c,xx,yy,zz)=>{c.set(0x3e7a2e).lerp(C3(0x86b84a),clamp((yy-3.6)/3.6,0,1)*.9);c.multiplyScalar(.9+r()*.18);}));}
    return fdMerge(parts);};
  A.broad=broad(5);
  /* birch-ish slim tree for variety */
  {const parts=[];const tr=new THREE.CylinderGeometry(.12,.2,5,6);tr.translate(0,2.5,0);parts.push(fdColGeo(tr,(c,x,y)=>c.set(Math.sin(y*6)>.6?0x2a2a2a:0xe8e4da)));
    for(const [x,y,z,s] of[[0,5.6,0,1.5],[.6,4.6,.3,1.1],[-.6,4.9,-.2,1.1],[0,6.6,0,1]]){const g=new THREE.IcosahedronGeometry(s,1);g.scale(.9,1.2,.9);g.translate(x,y,z);fdJitter(g,s*.3,y*13);parts.push(fdColGeo(g,(c,xx,yy)=>c.set(0x5c9a3c).lerp(C3(0xa8d060),clamp((yy-4)/3,0,1))));}
    A.birch=fdMerge(parts);}
  /* cactus */
  {const parts=[];const t=new THREE.CylinderGeometry(.42,.48,5,9);t.translate(0,2.5,0);parts.push(t);const cap=new THREE.SphereGeometry(.42,9,5,0,Math.PI*2,0,Math.PI/2);cap.translate(0,5,0);parts.push(cap);
    for(const s of[-1,1]){const a=new THREE.CylinderGeometry(.3,.3,1.3,8);a.rotateZ(Math.PI/2);a.translate(s*.95,2.2+(s>0?.5:0),0);parts.push(a);const u=new THREE.CylinderGeometry(.3,.3,1.8,8);u.translate(s*1.55,3.05+(s>0?.5:0),0);parts.push(u);const uc=new THREE.SphereGeometry(.3,8,4,0,Math.PI*2,0,Math.PI/2);uc.translate(s*1.55,3.95+(s>0?.5:0),0);parts.push(uc);}
    A.cactus=fdMerge(parts.map(g=>fdColGeo(g,(c,x,y,z)=>{const a=Math.atan2(z,x);c.set(0x4f7a3a).multiplyScalar(.85+.25*Math.abs(Math.sin(a*5)));})));}
  /* rock, bush, grass, flower */
  {const g=new THREE.IcosahedronGeometry(1,1);g.scale(1.3,.75,1.05);fdJitter(g,.55,77);g.translate(0,.25,0);A.rock=fdMerge([fdColGeo(g,(c,x,y)=>c.set(0x9a968c).multiplyScalar(.82+y*.18))]);}
  {const g=new THREE.IcosahedronGeometry(1,1);g.scale(1.2,.8,1.2);fdJitter(g,.45,31);g.translate(0,.55,0);A.bush=fdMerge([fdColGeo(g,(c,x,y)=>c.set(0x3e6e2c).lerp(C3(0x7aa848),clamp(y,0,1)))]);}
  {const pos=[],col=[],r=rng(9),c=new THREE.Color();for(let i=0;i<7;i++){const a=i/7*6.283+r()*.6,d=.12+r()*.18,h=.45+r()*.4,lx=Math.cos(a)*d,lz=Math.sin(a)*d,px=-Math.sin(a)*.06,pz=Math.cos(a)*.06,tx=Math.cos(a)*(d+.22),tz=Math.sin(a)*(d+.22);
      pos.push(lx-px,0,lz-pz,lx+px,0,lz+pz,tx,h,tz);for(let k=0;k<3;k++){c.set(k<2?0x4a7a2c:0xa8d064).convertSRGBToLinear();col.push(c.r,c.g,c.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));const nn=[];for(let i=0;i<pos.length/3;i++)nn.push(0,1,0);g.setAttribute('normal',new THREE.Float32BufferAttribute(nn,3));g.userData.keep=true;A.grass=g;}
  {const st=new THREE.CylinderGeometry(.02,.02,.5,3);st.translate(0,.25,0);const hd=new THREE.IcosahedronGeometry(.11,0);hd.translate(0,.52,0);A.flower=fdMerge([fdColGeo(st,c=>c.set(0x3f6a26)),fdColGeo(hd,c=>c.set(0xffffff))]);}
  /* buildings */
  const box=(w,h,d,x,y,z,col)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y+h/2,z);return fdColGeo(g,c=>c.set(col));};
  const roof=(w,h,d,y,col)=>{const s=new THREE.Shape();s.moveTo(-w/2-.4,0);s.lineTo(0,h);s.lineTo(w/2+.4,0);s.lineTo(-w/2-.4,0);const g=new THREE.ExtrudeGeometry(s,{depth:d+.8,bevelEnabled:false});g.translate(0,y,-(d+.8)/2);return fdColGeo(g,c=>c.set(col));};
  A.house=fdMerge([box(8,4.2,6,0,0,0,0xf2ead8),roof(8,3,6,4.2,0x8a3a2c),box(.9,2.2,.9,2.2,5.6,1,0x7a5040),box(1.4,2.4,.15,0,0,3.05,0x5a3a24),box(1.4,1.2,.15,-2.4,1.6,3.05,0x9ac4e0),box(1.4,1.2,.15,2.4,1.6,3.05,0x9ac4e0)]);
  A.barn=fdMerge([box(10,6,8,0,0,0,0xb2352a),roof(10,3.6,8,6,0x4a4a4e),box(3.4,4.2,.2,0,0,4.05,0xf4efe4),box(2.8,3.6,.22,0,.2,4.1,0x8a2a22),box(2.4,2.4,2.4,6.6,0,1,0xc4c0b4),box(1.6,8.5,1.6,-6.6,0,1.5,0xd8d4c8)]);
  A.cabin=fdMerge([box(6,3.2,5,0,0,0,0x7a5236),roof(6,2.6,5,3.2,0x3c3a38),box(.8,2,.8,1.6,4.2,.6,0x6a6a6a),box(1.2,2.1,.15,0,0,2.55,0x4a3020),box(1.1,1,.15,-1.8,1.3,2.55,0xffd890)]);
  /* roadside */
  A.post=fdMerge([box(.14,1.05,.14,0,0,0,0xf4f4f0),box(.15,.18,.15,0,.62,0,0x1a1a1a)]);
  A.refl=new THREE.BoxGeometry(.06,.16,.16);A.refl.translate(0,.86,0);A.refl.userData.keep=true;
  A.pole=fdMerge([box(.3,9,.3,0,0,0,0x6a5038),box(2.6,.18,.18,0,8.2,0,0x5a4430),box(.12,.3,.12,-1.1,8.3,0,0xdedad0),box(.12,.3,.12,1.1,8.3,0,0xdedad0)]);
  A.signPost=fdMerge([box(.1,1.6,.1,0,0,0,0x9aa0a8)]);
  {const g=new THREE.PlaneGeometry(1.1,1.1);g.translate(0,2.05,0);g.userData.keep=true;A.chev=g;}
  {const g=new THREE.BoxGeometry(.14,2.2,.14);g.translate(0,1.1,0);A.legGeo=fdMerge([fdColGeo(g,c=>c.set(0x6a6a70))]);}
  /* textures */
  const r=rng(41);
  A.chevTex=tex(mkCanvas(128,128,(g,w,h)=>{g.fillStyle='#ffc928';g.fillRect(0,0,w,h);g.strokeStyle='#17142e';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);g.fillStyle='#17142e';g.beginPath();g.moveTo(40,22);g.lineTo(84,64);g.lineTo(40,106);g.lineTo(58,106);g.lineTo(100,64);g.lineTo(58,22);g.closePath();g.fill();}));
  A.roadTex=tex(mkCanvas(256,512,(g,w,h)=>{const sh=FDK.SH/(2*FDW)*w,ln=w/(2*FDW);g.fillStyle='#4b4d52';g.fillRect(0,0,w,h);
    for(let i=0;i<16000;i++){const v=55+r()*60|0;g.fillStyle='rgba('+v+','+v+','+(v+4)+','+(.25+r()*.3)+')';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
    for(const cx of[.32,.68]){const gr=g.createLinearGradient(w*cx-18,0,w*cx+18,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(20,20,24,.16)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(w*cx-18,0,36,h);}
    for(let i=0;i<5;i++){g.fillStyle='rgba(30,30,34,.35)';g.fillRect(sh+r()*(w-2*sh-40),r()*h,20+r()*40,14+r()*30);}
    g.strokeStyle='rgba(28,28,30,.5)';g.lineWidth=1.2;for(let i=0;i<10;i++){let x=sh+r()*(w-2*sh),y=r()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-.5)*24;y+=r()*20;g.lineTo(x,y);}g.stroke();}
    for(const [x0,x1] of[[0,sh],[w-sh,w]]){g.fillStyle='#7a766c';g.fillRect(x0,0,x1-x0,h);for(let i=0;i<2600;i++){const v=90+r()*90|0;g.fillStyle='rgb('+v+','+(v-4)+','+(v-12)+')';g.fillRect(x0+r()*(x1-x0),r()*h,1.5+r()*2,1.5+r()*2);}}
    g.fillStyle='#ecebe4';g.fillRect(sh+.25*ln,0,.16*ln,h);g.fillRect(w-sh-.41*ln,0,.16*ln,h);
    for(let y=0;y<h;y+=h/2)g.fillRect(w/2-.075*ln,y,.15*ln,h/4);
    g.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<300;i++)g.fillRect(sh+r()*(w-2*sh),r()*h,1,1);}),true);
  A.roadTex.repeat.set(1,1);
  A.det=tex(mkCanvas(256,256,(x,w,h)=>{x.fillStyle='#e6e6e6';x.fillRect(0,0,w,h);for(let i=0;i<7000;i++){const v=190+r()*65|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(r()*w,r()*h,1+r()*2,1+r()*3);}}),true);
  /* materials (colors are already linear) */
  const lin=m=>{m.userData.lin=true;return m;};
  A.mTerrain=lin(new THREE.MeshStandardMaterial({vertexColors:true,map:A.det,roughness:.95,envMapIntensity:.55}));
  A.mVeg=lin(fdSway(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,envMapIntensity:.5}),.018));
  A.mVegStill=lin(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,envMapIntensity:.5}));
  A.mGrass=lin(fdSway(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide,envMapIntensity:.4}),.14));
  A.mRock=lin(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,flatShading:true,envMapIntensity:.5}));
  A.mBuild=lin(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,envMapIntensity:.6}));
  A.mRoad=lin(new THREE.MeshStandardMaterial({side:THREE.DoubleSide,map:A.roadTex,roughness:.82,envMapIntensity:.5,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  A.mRail=lin(new THREE.MeshStandardMaterial({color:linC(0xc9ced6),metalness:.65,roughness:.32}));
  A.mRefl=lin(new THREE.MeshStandardMaterial({color:linC(0xff3a2a),emissive:linC(0xff2a10),emissiveIntensity:.25,roughness:.3}));
  A.mChev=lin(new THREE.MeshStandardMaterial({map:A.chevTex,roughness:.6,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:A.chevTex,emissiveIntensity:0}));
  A.mWire=lin(new THREE.LineBasicMaterial({color:linC(0x222226),transparent:true,opacity:.75}));
  A.mBill=[];
  for(const [t1,t2,bg,fg,ac] of[['SAHUR','SNACKS','#ff7a1a','#ffffff','#14123a'],['TRALALERO','SURF CO.','#1f8fe0','#ffffff','#ffd23f'],['CAPPUCCINA','COFFEE','#5a3418','#ffe2c4','#ff7aa8'],['BOMBARDIRO','AIRLINES','#14123a','#ffd23f','#3ee0ff'],['TUNG TUNG','KART','#ffc928','#17142e','#ff4a5a']]){
    const t=tex(mkCanvas(512,256,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=ac;g.fillRect(0,h-34,w,34);g.strokeStyle='#17142e';g.lineWidth=12;g.strokeRect(6,6,w-12,h-12);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='900 86px Rubik, Arial Black, Arial';g.fillText(t1,w/2,h*.38,w-50);g.font='800 46px Rubik, Arial';g.fillText(t2,w/2,h*.7,w-60);}));
    A.mBill.push(lin(new THREE.MeshStandardMaterial({map:t,roughness:.6})));}
  A.billGeo=new THREE.PlaneGeometry(9,4.5);A.billGeo.translate(0,6.4,0);A.billGeo.userData.keep=true;
  A.billLegs=fdMerge([box(.3,4.4,.3,-3,0,-.2,0x55555c),box(.3,4.4,.3,3,0,-.2,0x55555c),box(9.4,.3,.4,0,4.05,-.2,0x55555c)]);
  A.barrier=fdMerge([box(10,.9,.3,0,.6,0,0xf2f2f2),box(.25,1.4,.25,-4.5,0,0,0x444448),box(.25,1.4,.25,4.5,0,0,0x444448)]);
  A.barrierStripes=tex(mkCanvas(256,32,(g,w,h)=>{for(let i=0;i<16;i++){g.fillStyle=i%2?'#ffffff':'#e8241a';g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16+16,0);g.lineTo(i*16+8,h);g.lineTo(i*16-8,h);g.fill();}}));
  /* tileable clouds */
  {const P=16,S=256;const hp=(x,y,p)=>hash(((x%p)+p)%p,((y%p)+p)%p);
    const vn=(x,y,p)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hp(xi,yi,p),b=hp(xi+1,yi,p),c=hp(xi,yi+1,p),d=hp(xi+1,yi+1,p);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
    A.cloudTex=tex(mkCanvas(S,S,(g)=>{const id=g.createImageData(S,S);for(let y=0;y<S;y++)for(let x=0;x<S;x++){let s=0,a=.5,f=1,p=P/4;for(let o=0;o<5;o++){s+=a*vn(x/S*p*f,y/S*p*f,p*f);a*=.5;f*=2;}const v=clamp(s*255,0,255);const k=(y*S+x)*4;id.data[k]=id.data[k+1]=id.data[k+2]=v;id.data[k+3]=255;}g.putImageData(id,0,0);}),true,false);}
  /* far mountain ring */
  A.ringTex=tex(mkCanvas(2048,256,(g,w,h)=>{g.clearRect(0,0,w,h);const rr=rng(77);for(let L=0;L<3;L++){g.fillStyle=['rgba(255,255,255,.35)','rgba(255,255,255,.62)','rgba(255,255,255,.9)'][L];g.beginPath();g.moveTo(0,h);let y=h*(.5+L*.1),vy=0;
    for(let x=0;x<=w;x+=4){vy+=(rr()-.5)*1.6-(y-h*(.42+L*.12))*.004;vy*=.94;y=clamp(y+vy,h*.08,h*.92);g.lineTo(x,y);}g.lineTo(w,h);g.closePath();g.fill();}}),false);
  A.ringTex.wrapS=THREE.RepeatWrapping;A.ringTex.repeat.set(3,1);
  /* water */
  {const NS=128,hm=new Float32Array(NS*NS);for(let y=0;y<NS;y++)for(let x=0;x<NS;x++){let s=0;for(let o=0;o<3;o++){const f=2<<o;s+=Math.sin((x/NS)*Math.PI*2*f+o*1.7+Math.sin((y/NS)*Math.PI*2*(f>>1))*1.3)*Math.cos((y/NS)*Math.PI*2*f*.75+o)/(o+1);}hm[y*NS+x]=s;}
    const nc=mkCanvas(NS,NS,(x)=>{const id=x.createImageData(NS,NS);for(let y=0;y<NS;y++)for(let xx=0;xx<NS;xx++){const l=hm[y*NS+((xx-1+NS)%NS)],rr=hm[y*NS+((xx+1)%NS)],u=hm[((y-1+NS)%NS)*NS+xx],d=hm[((y+1)%NS)*NS+xx];const nx=(l-rr)*.6,ny=(u-d)*.6,L=Math.hypot(nx,ny,1);const k=(y*NS+xx)*4;id.data[k]=(nx/L*.5+.5)*255;id.data[k+1]=(ny/L*.5+.5)*255;id.data[k+2]=(1/L*.5+.5)*255;id.data[k+3]=255;}x.putImageData(id,0,0);});
    A.waterN=tex(nc,true,false);A.waterN.repeat.set(300,300);}
  return A;}

/* ---------- terrain chunks ---------- */
const FD_TMP=new THREE.Color(),FD_TMP2=new THREE.Color(),FD_BC=FD_BIO.map(b=>[new THREE.Color(b.g1),new THREE.Color(b.g2),new THREE.Color(b.rock)]);
const FD_SAND=new THREE.Color(0xcbb68a),FD_DIRT=new THREE.Color(0x8a7a5a),FD_SNOW=new THREE.Color(0xf2f5fa),FD_MUD=new THREE.Color(0x6a6048);
function fdBuildChunk(cx,cz,lvl){const A=fdAssets(),CH=FDK.CH,x0=cx*CH,z0=cz*CH;fdGrowTo(z0+CH+420);
  const n=lvl===2?FD.segN:FD.segF,st=CH/n,NN=n+3,H=new Float32Array(NN*NN),D=new Float32Array(NN*NN),WB=new Float32Array((n+1)*(n+1)*5);
  for(let j=0;j<NN;j++)for(let i=0;i<NN;i++){const x=x0+(i-1)*st,z=z0+(j-1)*st,k=j*NN+i;H[k]=fdH(x,z);D[k]=FD.lastD;
    if(i>=1&&j>=1&&i<=n+1&&j<=n+1){const w=FD_W,o=((j-1)*(n+1)+(i-1))*5;for(let b=0;b<5;b++)WB[o+b]=w[b];}}
  const NV=(n+3)*(n+3),pos=new Float32Array(NV*3),nor=new Float32Array(NV*3),col=new Float32Array(NV*3),uv=new Float32Array(NV*2);
  let y0=1e9,y1=-1e9;const c=FD_TMP;
  for(let j=0;j<n+3;j++)for(let i=0;i<n+3;i++){const ii=clamp(i,1,n+1),jj=clamp(j,1,n+1),k=jj*NN+ii,v=j*(n+3)+i,skirt=(i!==ii||j!==jj);
    const lx=(ii-1)*st,lz=(jj-1)*st,h=H[k],d=D[k];
    let nx=H[k-1]-H[k+1],ny=2*st,nz=H[k-NN]-H[k+NN];const L=Math.hypot(nx,ny,nz);nx/=L;ny/=L;nz/=L;
    const y=h-(skirt?8:0)-.4*(1-smooth(FDW-.2,FDW+.8,d));pos[v*3]=lx;pos[v*3+1]=y;pos[v*3+2]=lz;nor[v*3]=nx;nor[v*3+1]=ny;nor[v*3+2]=nz;
    uv[v*2]=(x0+lx)/7;uv[v*2+1]=(z0+lz)/7;if(y<y0)y0=y;if(y>y1)y1=y;
    /* colour */
    const o=((jj-1)*(n+1)+(ii-1))*5,wx=x0+lx,wz=z0+lz,nz2=fbm(wx*.018+FD.sx,wz*.018,2),pa=vnoise(wx*.06,wz*.06);
    c.setRGB(0,0,0);let rockW=0,snowLine=0;
    for(let b=0;b<5;b++){const w=WB[o+b];if(w<.003)continue;FD_TMP2.copy(FD_BC[b][0]).lerp(FD_BC[b][1],clamp(nz2*1.5-.25+pa*.2,0,1));c.r+=FD_TMP2.r*w;c.g+=FD_TMP2.g*w;c.b+=FD_TMP2.b*w;}
    const forestW=WB[o+1]+WB[o+4]*.6+WB[o+2]*.3;if(lvl===1&&forestW>.2)c.multiplyScalar(1-.28*forestW*smooth(.45,.6,fbm(wx*.01+FD.sz,wz*.01,2)));
    let rk=FD_TMP2.setRGB(0,0,0);for(let b=0;b<5;b++){const w=WB[o+b];rk.r+=FD_BC[b][2].r*w;rk.g+=FD_BC[b][2].g*w;rk.b+=FD_BC[b][2].b*w;}
    const rockC={r:rk.r,g:rk.g,b:rk.b};
    rockW=smooth(.86,.7,ny);if(WB[o+3]>.4&&h>FDK.WL+6)rockW=Math.max(rockW,smooth(.92,.8,ny));
    c.r=lerp(c.r,rockC.r,rockW*.9);c.g=lerp(c.g,rockC.g,rockW*.9);c.b=lerp(c.b,rockC.b,rockW*.9);
    snowLine=135-WB[o+4]*110+fbm(wx*.01,wz*.01,2)*30;if(h>snowLine-20){const s=smooth(snowLine-20,snowLine+15,h)*(ny>.55?1:.4);c.lerp(FD_SNOW,s);}
    if(h<FDK.WL+1.6){const s=smooth(FDK.WL+1.6,FDK.WL+.3,h);c.lerp(WB[o+4]>.5?FD_SNOW:FD_SAND,s*.85);if(h<FDK.WL-.2)c.lerp(FD_MUD,.6);}
    if(d<FDW+5){c.lerp(WB[o+4]>.5?FD_TMP2.set(0x9aa0aa):FD_DIRT,(1-smooth(FDW+.5,FDW+5,d))*.75);}
    c.multiplyScalar(.94+pa*.12);
    col[v*3]=c.r;col[v*3+1]=c.g;col[v*3+2]=c.b;}
  for(let v=0;v<NV;v++){FD_TMP.setRGB(col[v*3],col[v*3+1],col[v*3+2]).convertSRGBToLinear();col[v*3]=FD_TMP.r;col[v*3+1]=FD_TMP.g;col[v*3+2]=FD_TMP.b;}
  const idx=new (NV>65535?Uint32Array:Uint16Array)((n+2)*(n+2)*6);let q=0;const M=n+3;
  for(let j=0;j<n+2;j++)for(let i=0;i<n+2;i++){const a=j*M+i,b=a+1,cc=a+M,d=cc+1;idx[q++]=a;idx[q++]=cc;idx[q++]=b;idx[q++]=b;idx[q++]=cc;idx[q++]=d;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setIndex(new THREE.BufferAttribute(idx,1));geo.computeBoundingSphere();
  const G=new THREE.Group();G.position.set(x0,0,z0);const terr=new THREE.Mesh(geo,A.mTerrain);terr.receiveShadow=lvl===2&&QUAL!=='low';G.add(terr);
  const ch={cx,cz,lvl,g:G,inst:[],fx:[],H,D,WB,n,st,NN,y0,y1:y1+12,box:new THREE.Box3(new V3(x0,y0,z0),new V3(x0+CH,y1+14,z0+CH)),grass:null};
  if(lvl===2)fdScatter(ch);else if(FD.farTrees)fdScatterFar(ch);
  ch.box.max.y=Math.max(ch.box.max.y,ch.y1);
  return ch;}
/* bilinear sample of the chunk grid in chunk-local metres */
function fdGridH(ch,lx,lz){const g=ch.st,fx=lx/g+1,fz=lz/g+1,i=clamp(Math.floor(fx),0,ch.NN-2),j=clamp(Math.floor(fz),0,ch.NN-2),tx=fx-i,tz=fz-j,N=ch.NN,H=ch.H;
  return lerp(lerp(H[j*N+i],H[j*N+i+1],tx),lerp(H[(j+1)*N+i],H[(j+1)*N+i+1],tx),tz);}
function fdGridD(ch,lx,lz){const i=clamp(Math.round(lx/ch.st)+1,0,ch.NN-1),j=clamp(Math.round(lz/ch.st)+1,0,ch.NN-1);return ch.D[j*ch.NN+i];}
function fdGridW(ch,lx,lz){const n=ch.n,i=clamp(Math.round(lx/ch.st),0,n),j=clamp(Math.round(lz/ch.st),0,n),o=(j*(n+1)+i)*5,w=FD_W2;for(let b=0;b<5;b++)w[b]=ch.WB[o+b];return w;}
function fdGridNY(ch,lx,lz){const i=clamp(Math.round(lx/ch.st)+1,1,ch.NN-2),j=clamp(Math.round(lz/ch.st)+1,1,ch.NN-2),N=ch.NN,H=ch.H,k=j*N+i;const nx=H[k-1]-H[k+1],nz=H[k-N]-H[k+N],ny=2*ch.st;return ny/Math.hypot(nx,ny,nz);}
function fdPickB(w,u){let a=0;for(let b=0;b<5;b++){a+=w[b];if(u<=a)return b;}return 4;}
const FD_M4=new THREE.Matrix4(),FD_Q=new THREE.Quaternion(),FD_S=new V3(),FD_P=new V3(),FD_UP=new V3(0,1,0);
function fdInst(ch,geo,mat,list,shadow){if(!list.length)return null;const m=new THREE.InstancedMesh(geo,mat,list.length/8);const c=new THREE.Color();
  for(let i=0;i<m.count;i++){const o=i*8;FD_Q.setFromAxisAngle(FD_UP,list[o+3]);FD_S.set(list[o+4],list[o+4]*list[o+5],list[o+4]);FD_P.set(list[o],list[o+1],list[o+2]);FD_M4.compose(FD_P,FD_Q,FD_S);m.setMatrixAt(i,FD_M4);
    c.setHex(list[o+6]).convertSRGBToLinear().multiplyScalar(list[o+7]);m.setColorAt(i,c);}
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=QUAL!=='low';m.userData.cast=!!shadow;ch.g.add(m);ch.inst.push(m);return m;}
function fdScatter(ch){const A=fdAssets(),CH=FDK.CH,x0=ch.cx*CH,z0=ch.cz*CH,r=rng((ch.cx*73856093^ch.cz*19349663^FD.seed)>>>0);
  const L={pine:[],pineS:[],broad:[],birch:[],cactus:[],rock:[],bush:[],house:[],barn:[],cabin:[]};
  const put=(arr,lx,lz,rot,s,sy,col,br)=>{const h=fdGridH(ch,lx,lz);arr.push(lx,h-.15,lz,rot,s,sy,col,br);if(h+s*9>ch.y1)ch.y1=h+s*9;};
  const ok=(lx,lz,minD)=>{const d=fdGridD(ch,lx,lz),h=fdGridH(ch,lx,lz);return d>minD&&h>FDK.WL+.6;};
  const NT=QUAL==='low'?150:QUAL==='ultra'?340:260;
  for(let k=0;k<NT;k++){const lx=r()*CH,lz=r()*CH;if(!ok(lx,lz,FDW+5.5))continue;const ny=fdGridNY(ch,lx,lz);if(ny<.78)continue;const w=fdGridW(ch,lx,lz),b=fdPickB(w,r());
    const wx=x0+lx,wz=z0+lz,cl=fbm(wx*.012+FD.sx,wz*.012-FD.sz,3),rot=r()*6.283,s=.75+r()*.6,br=.85+r()*.3;
    if(b===1){if(r()<.92)put(L.pine,lx,lz,rot,s*1.05,1+r()*.25,0xffffff,br);}
    else if(b===4){if(r()<.55)put(L.pineS,lx,lz,rot,s,1+r()*.2,0xffffff,br);}
    else if(b===2){if(r()<.62){const pick=r();if(pick<.22)put(L.pine,lx,lz,rot,s,1.05,0xffffff,br*.95);else if(pick<.36)put(L.birch,lx,lz,rot,s*.95,1,[0xffd040,0xffe890][r()*2|0],1);else put(L.broad,lx,lz,rot,s,1,[0xff8a30,0xe8461e,0xffc040,0xd06a20,0xa83a20][r()*5|0],br);}}
    else if(b===0){if(cl>.53&&r()<.85){const pick=r();if(pick<.6)put(L.broad,lx,lz,rot,s,1,0xffffff,br);else if(pick<.8)put(L.birch,lx,lz,rot,s,1,0xffffff,br);else put(L.pine,lx,lz,rot,s*.9,1,0xffffff,br);}}
    else if(b===3){if(r()<.06)put(L.cactus,lx,lz,rot,.7+r()*.5,1,0xffffff,br);}}
  for(let k=0;k<55;k++){const lx=r()*CH,lz=r()*CH;if(!ok(lx,lz,FDW+2.5))continue;const w=fdGridW(ch,lx,lz),b=fdPickB(w,r()),ny=fdGridNY(ch,lx,lz);
    const p=[.12,.22,.18,.6,.32][b]+(ny<.85?.35:0);if(r()>p)continue;const big=r()<.15?2.4:1;put(L.rock,lx,lz,r()*6.283,(.5+r()*1.1)*big,.7+r()*.6,[0xffffff,0xf0f0f0,0xfff4e8,0xffb890,0xe8eef8][b],.8+r()*.35);}
  for(let k=0;k<90;k++){const lx=r()*CH,lz=r()*CH;if(!ok(lx,lz,FDW+3))continue;const w=fdGridW(ch,lx,lz),b=fdPickB(w,r());const p=[.45,.35,.45,.12,.06][b];if(r()>p)continue;
    put(L.bush,lx,lz,r()*6.283,.5+r()*.7,.8+r()*.4,[0xffffff,0xd8e8d0,0xffb060,0xc8b070,0xe0f0ff][b],.85+r()*.3);}
  /* a building now and then, facing the road */
  {const wc=fdGridW(ch,CH/2,CH/2),b=fdPickB(wc,r()),p=[.32,.14,.3,.06,.18][b];
    if(r()<p)for(let t=0;t<10;t++){const lx=10+r()*(CH-20),lz=10+r()*(CH-20),d=fdGridD(ch,lx,lz);if(d<18||d>75)continue;if(fdGridNY(ch,lx,lz)<.93)continue;if(fdGridH(ch,lx,lz)<FDK.WL+2)continue;
      const q=fdNear(x0+lx,z0+lz),rot=Math.atan2(FD.rx[q.i]-(x0+lx),FD.rz[q.i]-(z0+lz));
      const arr=b===1||b===4?L.cabin:b===0&&r()<.5?L.barn:L.house;put(arr,lx,lz,rot,1,1,b===3?0xffe0b0:0xffffff,1);
      if(arr!==L.cabin){/* fence-ish hedge row next to farms */for(let f=0;f<6;f++){const a=rot+Math.PI/2,ox=Math.sin(a)*(-12+f*4.5)+Math.sin(rot)*-9,oz=Math.cos(a)*(-12+f*4.5)+Math.cos(rot)*-9;if(lx+ox>0&&lx+ox<CH&&lz+oz>0&&lz+oz<CH)put(L.bush,lx+ox,lz+oz,r()*6,.7,.9,0xffffff,.9);}}
      break;}}
  const sh=QUAL!=='low';
  fdInst(ch,A.pine,A.mVeg,L.pine,sh);fdInst(ch,A.pineS,A.mVeg,L.pineS,sh);fdInst(ch,A.broad,A.mVeg,L.broad,sh);fdInst(ch,A.birch,A.mVeg,L.birch,sh);
  fdInst(ch,A.cactus,A.mVegStill,L.cactus,sh);fdInst(ch,A.rock,A.mRock,L.rock,sh);fdInst(ch,A.bush,A.mVeg,L.bush,false);
  fdInst(ch,A.house,A.mBuild,L.house,sh);fdInst(ch,A.barn,A.mBuild,L.barn,sh);fdInst(ch,A.cabin,A.mBuild,L.cabin,sh);
  /* wind turbines on open meadow hills */
  {const wc=fdGridW(ch,CH/2,CH/2);if(wc[0]>.6&&r()<.22){const lx=20+r()*(CH-40),lz=20+r()*(CH-40);if(fdGridD(ch,lx,lz)>90){const t=fdTurbine();t.position.set(lx,fdGridH(ch,lx,lz)-.3,lz);t.rotation.y=r()*6.283;ch.g.add(t);ch.fx.push(t.userData.rotor);ch.y1=Math.max(ch.y1,t.position.y+60);}}}
}
function fdTurbine(){const A=fdAssets();if(!A.turb){const parts=[];const tw=new THREE.CylinderGeometry(.9,1.6,40,12);tw.translate(0,20,0);parts.push(fdColGeo(tw,c=>c.set(0xf2f4f6)));const nac=new THREE.BoxGeometry(2.4,2.4,5.5);nac.translate(0,40.5,.8);parts.push(fdColGeo(nac,c=>c.set(0xe6e8ec)));A.turb=fdMerge(parts);
    const bl=[];for(let i=0;i<3;i++){const b=new THREE.BoxGeometry(1.1,19,.35);b.translate(0,10,0);b.rotateZ(i*2.094);bl.push(fdColGeo(b,(c,x,y)=>c.set(0xf6f6f8)));}const hub=new THREE.SphereGeometry(1.1,10,8);bl.push(fdColGeo(hub,c=>c.set(0xdadde2)));A.rotor=fdMerge(bl);}
  const g=new THREE.Group(),t=new THREE.Mesh(A.turb,A.mBuild),ro=new THREE.Mesh(A.rotor,A.mBuild);t.castShadow=QUAL!=='low';ro.position.set(0,40.5,3.7);g.add(t,ro);g.userData.rotor=ro;ro.rotation.z=Math.random()*6;return g;}
function fdScatterFar(ch){const A=fdAssets(),CH=FDK.CH,r=rng((ch.cx*83492791^ch.cz*2654435761^FD.seed)>>>0),P=[],B=[];
  if(!A.farPine){const g=new THREE.ConeGeometry(2.6,9,6);g.translate(0,5.5,0);const t=new THREE.CylinderGeometry(.3,.3,1.5,4);t.translate(0,.75,0);A.farPine=fdMerge([fdColGeo(g,(c,x,y)=>c.set(0x2c5a2c).lerp(new THREE.Color(0x3f7a3a),y/10)),fdColGeo(t,c=>c.set(0x5a3e28))]);
    const b=new THREE.IcosahedronGeometry(3,0);b.scale(1,.9,1);b.translate(0,5.2,0);const bt=new THREE.CylinderGeometry(.3,.35,3,4);bt.translate(0,1.5,0);A.farBroad=fdMerge([fdColGeo(b,(c,x,y)=>c.set(0x3e7a2e).lerp(new THREE.Color(0x7aac44),clamp((y-3)/5,0,1))),fdColGeo(bt,c=>c.set(0x5e4630))]);}
  for(let k=0;k<110;k++){const lx=r()*CH,lz=r()*CH;if(fdGridD(ch,lx,lz)<FDW+5)continue;const h=fdGridH(ch,lx,lz);if(h<FDK.WL+.6)continue;const w=fdGridW(ch,lx,lz),b=fdPickB(w,r());const wx=ch.cx*CH+lx,wz=ch.cz*CH+lz;
    const s=.8+r()*.5;if(b===1||b===4){if(r()<(b===1?.9:.5))P.push(lx,h-.2,lz,0,s,1,b===4?0xe8f0f8:0xffffff,.9+r()*.2);}
    else if(b===2){if(r()<.6)B.push(lx,h-.2,lz,r()*6,s,1,[0xff8a30,0xe8461e,0xffc040][r()*3|0],1);}
    else if(b===0){if(fbm(wx*.012+FD.sx,wz*.012-FD.sz,3)>.53&&r()<.8)B.push(lx,h-.2,lz,r()*6,s,1,0xffffff,.95);}}
  fdInst(ch,A.farPine,A.mVegStill,P,false);fdInst(ch,A.farBroad,A.mVegStill,B,false);}
function fdGrass(ch){const A=fdAssets(),CH=FDK.CH,r=rng((ch.cx*19349663^ch.cz*83492791^FD.seed^0x5bd1e995)>>>0),G=[],F=[];const NG=QUAL==='ultra'?4200:2600;
  for(let k=0;k<NG;k++){const lx=r()*CH,lz=r()*CH,d=fdGridD(ch,lx,lz);if(d<FDW+.9)continue;const h=fdGridH(ch,lx,lz);if(h<FDK.WL+.4)continue;const w=fdGridW(ch,lx,lz),b=fdPickB(w,r());
    const p=[1,.55,.8,.035,.04][b];if(r()>p)continue;if(fdGridNY(ch,lx,lz)<.8)continue;
    if(b===0&&r()<.09){F.push(lx,h-.05,lz,r()*6,.8+r()*.6,1,[0xffffff,0xffe040,0xff7ab8,0xb68cff,0xff5a4a][r()*5|0],1);continue;}
    const tint=[0xffffff,0xb8d0a0,0xffd890,0xffe0a0,0xffffff][b];G.push(lx,h-.08,lz,r()*6.283,.6+r()*.6,.6+r()*.5,tint,.85+r()*.35);}
  const g=new THREE.Group();const tmp={g,inst:[]};const a=fdInst(tmp,A.grass,A.mGrass,G,false),f=fdInst(tmp,A.flower,A.mVeg,F,false);if(a)a.receiveShadow=false;if(f)f.receiveShadow=false;ch.g.add(g);ch.grass=g;}

/* ---------- road pieces ---------- */
function fdBuildPiece(p){const A=fdAssets(),P=FDK.PIECE,a=p*P,b=a+P;fdGrowN(b+2);
  const ox=FD.rx[a],oz=FD.rz[a],G=new THREE.Group();G.position.set(ox,0,oz);
  const offs=[-FDW,-FDW,FDW,FDW],dn=[2.4,0,0,2.4],us=[0,0,1,1];
  const pos=[],uv=[],nor=[],idx=[];let s=0;
  for(let i=a;i<=b;i++){if(i>a)s+=Math.hypot(FD.rx[i]-FD.rx[i-1],FD.rz[i]-FD.rz[i-1]);const h=FD.rh[i],Rx=-Math.cos(h),Rz=Math.sin(h),y=FD.ry[i];
    for(let k=0;k<4;k++){pos.push(FD.rx[i]+Rx*offs[k]-ox,y-dn[k]+.04,FD.rz[i]+Rz*offs[k]-oz);uv.push(us[k]+(k===0?-.02:k===3?.02:0),s/16);const side=k===0?-1:k===3?1:0;nor.push(side?Rx*side*.7:0,side?.7:1,side?Rz*side*.7:0);}}
  for(let j=0;j<P;j++){const o=j*4;for(let k=0;k<3;k++){const A0=o+k,B0=o+k+1,C0=o+4+k,D0=o+4+k+1;idx.push(A0,B0,C0,B0,D0,C0);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);g.computeBoundingSphere();
  const road=new THREE.Mesh(g,A.mRoad);road.receiveShadow=QUAL!=='low';G.add(road);
  /* roadside: reflector posts, guardrails on embankments and curves, chevrons, poles + wires, billboards */
  const posts=[],refl=[],chev=[],poles=[],bills=[],rails=[];const wires=[];let lastPole=null;
  const rr=rng((p*2654435761^FD.seed)>>>0);
  for(let i=a;i<b;i++){const h=FD.rh[i],Rx=-Math.cos(h),Rz=Math.sin(h),x=FD.rx[i],z=FD.rz[i],y=FD.ry[i],k=FD.rk[i];
    if(i%13===0)for(const sd of[-1,1]){const px=x+Rx*sd*(FDW+.8),pz=z+Rz*sd*(FDW+.8),py=fdH(px,pz);posts.push(px-ox,py-.1,pz-oz,h,1,1,0xffffff,1);refl.push(px-ox,py-.1,pz-oz,h,1,1,sd<0?0xffffff:0xff8a20,1);}
    /* guardrail where the land drops away, or on the outside of sharp bends */
    for(const sd of[-1,1]){const tx=x+Rx*sd*(FDW+9),tz=z+Rz*sd*(FDW+9),drop=y-fdBase(tx,tz,fdW(tx,tz,FD_W2));const bend=Math.abs(k)>1/150&&Math.sign(k)===sd;rails.push(drop>3.2||bend);}
    if(Math.abs(k)>1/135&&i%9===0){const sd=k>0?1:-1;/* outside of the bend */const px=x+Rx*sd*(FDW+1.6),pz=z+Rz*sd*(FDW+1.6),py=fdH(px,pz);chev.push(px-ox,py-.1,pz-oz,h+Math.PI,k>0?-1:1,1,0xffffff,1);}
    if(i%22===0){const w=fdW(x,z,FD_W2);if(w[3]+w[0]+w[2]>.5){const px=x+Rx*(FDW+4.2),pz=z+Rz*(FDW+4.2),py=fdH(px,pz);poles.push(px-ox,py-.3,pz-oz,h,1,1,0xffffff,1);
      const top=[px-ox,py+7.95,pz-oz];if(lastPole){const prev=lastPole;for(const off of[-1.1,1.1]){const c1=Math.cos(prev[3]),s1=Math.sin(prev[3]),c2=Math.cos(h),s2=Math.sin(h);const A0=[prev[0]+c1*off,prev[1],prev[2]-s1*off],B0=[top[0]+c2*off,top[1],top[2]-s2*off];
          for(let t=0;t<8;t++){const t0=t/8,t1=(t+1)/8;const sag=q=>-Math.sin(q*Math.PI)*.9;wires.push(lerp(A0[0],B0[0],t0),lerp(A0[1],B0[1],t0)+sag(t0),lerp(A0[2],B0[2],t0),lerp(A0[0],B0[0],t1),lerp(A0[1],B0[1],t1)+sag(t1),lerp(A0[2],B0[2],t1));}}}
      lastPole=[top[0],top[1],top[2],h];}else lastPole=null;}
    if(i%700===350&&Math.abs(k)<1/400){const sd=rr()<.5?-1:1,px=x+Rx*sd*(FDW+7),pz=z+Rz*sd*(FDW+7),py=fdH(px,pz);bills.push([px-ox,py-.2,pz-oz,h+(sd>0?.35:-.35),(i/700|0)%A.mBill.length]);}
  }
  const ch={g:G,inst:[]};fdInst(ch,A.post,A.mBuild,posts,false);fdInst(ch,A.refl,A.mRefl,refl,false);fdInst(ch,A.pole,A.mBuild,poles,QUAL!=='low');
  if(chev.length){const m=fdInst(ch,A.chev,A.mChev,chev.map((v,i)=>i%8===5?1:v),false);const m2=fdInst(ch,A.signPost,A.mBuild,chev.map((v,i)=>i%8===4?1:v),false);
    if(m){for(let i=0;i<m.count;i++){const o=i*8;FD_Q.setFromAxisAngle(FD_UP,chev[o+3]);FD_S.set(chev[o+4],1,1);FD_P.set(chev[o],chev[o+1],chev[o+2]);FD_M4.compose(FD_P,FD_Q,FD_S);m.setMatrixAt(i,FD_M4);}m.instanceMatrix.needsUpdate=true;}}
  if(wires.length){const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wires,3));const l=new THREE.LineSegments(wg,A.mWire);l.frustumCulled=false;G.add(l);}
  for(const [x,y,z,r,bi] of bills){const bm=new THREE.Mesh(A.billGeo,A.mBill[bi]);bm.position.set(x,y,z);bm.rotation.y=r+Math.PI;bm.castShadow=QUAL!=='low';const lg=new THREE.Mesh(A.billLegs,A.mBuild);lg.position.set(x,y,z);lg.rotation.y=r+Math.PI;G.add(bm,lg);}
  /* guardrail strips */
  {const rp=[],rn=[];for(const sd of[-1,1]){const si=sd<0?0:1;for(let i=a;i<b;i++){const j=(i-a)*2+si;if(!rails[j])continue;const i2=i+1;
      const q=(ii)=>{const h=FD.rh[ii],Rx=-Math.cos(h),Rz=Math.sin(h),px=FD.rx[ii]+Rx*sd*(FDW+.45),pz=FD.rz[ii]+Rz*sd*(FDW+.45);return [px-ox,FD.ry[ii],pz-oz,-Rx*sd,-Rz*sd];};
      const A0=q(i),B0=q(i2);for(const [ya,yb] of[[.5,.82]]){const v=[[A0[0],A0[1]+ya,A0[2]],[B0[0],B0[1]+ya,B0[2]],[A0[0],A0[1]+yb,A0[2]],[B0[0],B0[1]+yb,B0[2]]];if(sd>0)rp.push(...v[0],...v[2],...v[1],...v[1],...v[2],...v[3]);else rp.push(...v[0],...v[1],...v[2],...v[1],...v[3],...v[2]);for(let t=0;t<6;t++)rn.push(A0[3],0,A0[4]);}
      if(i%2===0){const pp=[A0[0]-A0[3]*.1,A0[1],A0[2]-A0[4]*.1];const bx=new THREE.BoxGeometry(.12,.85,.12).toNonIndexed();bx.translate(pp[0],pp[1]+.42,pp[2]);rp.push(...bx.attributes.position.array);rn.push(...bx.attributes.normal.array);}}}
    if(rp.length){const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('normal',new THREE.Float32BufferAttribute(rn,3));rg.computeBoundingSphere();const rm=new THREE.Mesh(rg,A.mRail);rm.castShadow=QUAL!=='low';G.add(rm);}}
  if(a===0){/* the road starts here */const bm=new THREE.Mesh(A.barrier,new THREE.MeshStandardMaterial({map:A.barrierStripes,roughness:.6}));bm.position.set(0,FD.ry[0],0);bm.rotation.y=FD.rh[0];G.add(bm);}
  let y0=1e9,y1=-1e9;for(let i=a;i<=b;i++){y0=Math.min(y0,FD.ry[i]);y1=Math.max(y1,FD.ry[i]);}
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=a;i<=b;i++){x0=Math.min(x0,FD.rx[i]);x1=Math.max(x1,FD.rx[i]);z0=Math.min(z0,FD.rz[i]);z1=Math.max(z1,FD.rz[i]);}
  return {g:G,inst:ch.inst,box:new THREE.Box3(new V3(x0-25,y0-6,z0-25),new V3(x1+25,y1+14,z1+25))};}

/* ---------- streaming ---------- */
function fdFree(g){g.traverse(o=>{if(o.isInstancedMesh)o.dispose();});disposeObj(g);}
const FD_FR=new THREE.Frustum(),FD_PM=new THREE.Matrix4();
function fdStream(force){const t0=performance.now(),budget=force?1e9:(QUAL==='low'?3.5:5),CH=FDK.CH,px=player.x,pz=player.z,pcx=Math.floor(px/CH),pcz=Math.floor(pz/CH);
  const key=pcx+','+pcz;
  if(FD.pk!==key||force){FD.pk=key;FD.want=new Map();const NR=FD.NR,FR=FD.FR;
    for(let dz=-FR;dz<=FR;dz++)for(let dx=-FR;dx<=FR;dx++){const r2=dx*dx+dz*dz;if(r2>(FR+.5)*(FR+.5))continue;const lvl=(Math.abs(dx)<=NR&&Math.abs(dz)<=NR)?2:1;
      FD.want.set((pcx+dx)+','+(pcz+dz),{cx:pcx+dx,cz:pcz+dz,lvl,pri:r2*(lvl===2?1:4)});}
    for(const [k,ch] of FD.chunks)if(!FD.want.has(k)){fdFree(ch.g);FD.chunks.delete(k);}
    FD.jobs=[...FD.want.entries()].filter(([k,w])=>{const c=FD.chunks.get(k);return !c||c.lvl!==w.lvl;}).sort((a,b)=>a[1].pri-b[1].pri);
    for(const [k,ch] of FD.chunks){const ring=Math.max(Math.abs(ch.cx-pcx),Math.abs(ch.cz-pcz));const cast=ring<=1&&QUAL!=='low';for(const m of ch.inst)m.castShadow=cast&&m.userData.cast;
      if(ch.grass&&ring>1){fdFree(ch.grass);ch.grass=null;}}}
  /* road pieces: everything within ~1.1 km along z */
  if(force||(FD.pieceT=(FD.pieceT||0)-1)<=0){FD.pieceT=20;fdGrowTo(pz+1300);const i0=fdIdxZ(pz-1150),i1=fdIdxZ(pz+1150),p0=Math.floor(i0/FDK.PIECE),p1=Math.floor(i1/FDK.PIECE);
    for(const [p,pc] of FD.pieces)if(p<p0||p>p1){fdFree(pc.g);FD.pieces.delete(p);}
    for(let p=p0;p<=p1;p++)if(!FD.pieces.has(p)){FD.pieceJobs.add(p);}}
  /* nearest pieces first */
  if(FD.pieceJobs.size){const ip=fdIdxZ(pz)/FDK.PIECE;const list=[...FD.pieceJobs].sort((a,b)=>Math.abs(a-ip)-Math.abs(b-ip));
    for(const p of list){if(performance.now()-t0>budget&&!force)break;FD.pieceJobs.delete(p);if(FD.pieces.has(p))continue;const pc=fdBuildPiece(p);FD.G.add(pc.g);FD.pieces.set(p,pc);}}
  while(FD.jobs.length&&(force||performance.now()-t0<budget)){const [k,w]=FD.jobs.shift();if(!FD.want.has(k))continue;const old=FD.chunks.get(k);if(old&&old.lvl===w.lvl)continue;
    const ch=fdBuildChunk(w.cx,w.cz,w.lvl);FD.G.add(ch.g);if(old)fdFree(old.g);FD.chunks.set(k,ch);
    const ring=Math.max(Math.abs(w.cx-pcx),Math.abs(w.cz-pcz));for(const m of ch.inst)m.castShadow=ring<=1&&QUAL!=='low'&&m.userData.cast;}
  /* grass for the 3x3 around you */
  if(QUAL!=='low')for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!force&&performance.now()-t0>budget)break;const ch=FD.chunks.get((pcx+dx)+','+(pcz+dz));if(ch&&ch.lvl===2&&!ch.grass)fdGrass(ch);}
}
function fdCull(){camera.updateMatrixWorld();FD_PM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);FD_FR.setFromProjectionMatrix(FD_PM);
  for(const ch of FD.chunks.values()){ch.box.max.y=Math.max(ch.box.max.y,ch.y1);ch.g.visible=FD_FR.intersectsBox(ch.box);}
  for(const pc of FD.pieces.values())pc.g.visible=FD_FR.intersectsBox(pc.box);}

/* ---------- sky dressing that follows the camera ---------- */
function fdDressing(){const A=fdAssets(),T=FD_TIME[FDOPT.time];
  const water=new THREE.Mesh(new THREE.PlaneGeometry(5200,5200),new THREE.MeshStandardMaterial({color:linC(FDOPT.time==='night'?0x0c2238:0x2a6a88),roughness:.07,metalness:.15,normalMap:A.waterN,normalScale:new THREE.Vector2(.5,.5),transparent:true,opacity:.86,envMapIntensity:1.25}));
  water.rotation.x=-Math.PI/2;water.position.y=FDK.WL;water.receiveShadow=QUAL!=='low';water.material.userData.lin=true;scene.add(water);
  const cm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,uniforms:{map:{value:A.cloudTex},col:{value:new THREE.Color().setRGB(...T.cloud)},t:{value:0},cov:{value:FDOPT.time==='night'?.45:.5}},
    vertexShader:'varying vec2 vW;varying float vR;void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xz;vR=length(position.xy)/4200.;gl_Position=projectionMatrix*viewMatrix*wp;}',
    fragmentShader:'uniform sampler2D map;uniform vec3 col;uniform float t,cov;varying vec2 vW;varying float vR;void main(){float a=texture2D(map,vW/3200.+vec2(t*.0035,t*.0016)).r;float b=texture2D(map,vW/1300.-vec2(t*.002,t*.004)).r;a=a*.7+b*.3;a=smoothstep(cov,cov+.28,a)*(1.-smoothstep(.45,1.,vR));vec3 c=col*mix(1.,.78,smoothstep(cov+.1,cov+.4,a));gl_FragColor=vec4(c,a*.88);\n#include <encodings_fragment>\n}'});
  const clouds=new THREE.Mesh(new THREE.CircleGeometry(4200,48),cm);clouds.rotation.x=Math.PI/2;clouds.renderOrder=-2;clouds.frustumCulled=false;scene.add(clouds);
  const rm=new THREE.MeshBasicMaterial({map:A.ringTex,transparent:true,fog:false,depthWrite:false,side:THREE.BackSide,color:linC(T.ring)});rm.userData.lin=true;
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(2000,2000,420,64,1,true),rm);ring.renderOrder=-3;ring.frustumCulled=false;scene.add(ring);
  FD.dress={water,clouds,ring};}
function fdDressTick(dt){const d=FD.dress,cp=camera.position;if(!d)return;
  d.water.position.x=Math.round(cp.x/10)*10;d.water.position.z=Math.round(cp.z/10)*10;if(d.water.material.normalMap){const n=d.water.material.normalMap;n.offset.x=(S.t*.006)%1;n.offset.y=(S.t*.004)%1;}
  d.clouds.position.set(cp.x,cp.y+540,cp.z);d.clouds.material.uniforms.t.value=S.t;d.ring.position.set(cp.x,cp.y+60,cp.z);
  if(sky)sky.position.copy(cp);nightSky.position.copy(cp);}

/* ---------- start / stop ---------- */
function fdOpts(){const q=QUAL;return q==='low'?{NR:2,FR:5,segN:28,segF:10,far:false}:q==='ultra'?{NR:3,FR:8,segN:56,segF:14,far:true}:{NR:3,FR:7,segN:44,segF:12,far:true};}
function fdStart(){stopMusic();initAudio();
  $('loading').hidden=false;$('loading').classList.add('race');$('lshot').src=fdArtURL(FDOPT.bio,FDOPT.time,960,600);$('lmsg').textContent='Free Drive · Paving a brand new road';$('lfill').style.width='100%';
  setTimeout(()=>{try{
    camera.clearViewOffset();titleRes(false);clearRace();if(FD)fdDispose(true);clearWorld();
    const TM=FD_TIME[FDOPT.time];MAP={id:'free',name:'Free Drive',sky:TM.sky,skyP:TM.skyP,grass:[0x5f9a3c,0x8cb850],scen:'village',music:'cruise',host:-1,brands:[],kerb:[0xffffff,0xffffff],road:'#4b4d52'};
    applyTheme(MAP);applyQuality();if(scene.fog)scene.fog.far=Math.min(scene.fog.far,(fdOpts().FR+.5)*FDK.CH+60);
    const G=new THREE.Group();world.add(G);const seed=(Math.random()*4294967295)>>>0,o=fdOpts();
    FD={on:true,G,seed,rand:rng(seed),sx:(rng(seed^7)()-.5)*90000,sz:(rng(seed^13)()-.5)*90000,fix:FDOPT.bio==='mixed'?-1:FD_BIO_IDS.indexOf(FDOPT.bio)-1,
      chunks:new Map(),pieces:new Map(),pieceJobs:new Set(),jobs:[],want:null,pk:'',NR:o.NR,FR:o.FR,segN:o.segN,segF:o.segF,farTrees:o.far,
      dist:0,auto:false,cine:{on:false,t:0,pos:new V3(),look:new V3()},bio:-1,bioT:0,toastT:0,lastD:1e9,hud:true};
    fdAssets();fdRoadInit();fdGrowTo(1400);
    /* a fake one-point track so the shared kart code has something to point at */
    const i0=Math.round(FDK.BACK/FDK.DS),h0=FD.rh[i0];C=[new V3(FD.rx[i0],FD.ry[i0],FD.rz[i0])];T=[new V3(Math.sin(h0),0,Math.cos(h0))];R=[new V3(-T[0].z,0,T[0].x)];N=1;SEG=[2];ELEV=[false];GAP=[false];EDGE=[99];CURV=[0];TURN=[0];RL=[0];GAP_A=GAP_B=-1;MCX=C[0].x;MCZ=C[0].z;GS=[];ES=[];
    const k=newKart(0,SET.racer,true);k.free=k.roam=true;k.ai.cap=1;
    k.x=FD.rx[i0]+R[0].x*1.9;k.z=FD.rz[i0]+R[0].z*1.9;k.h=h0;k.vx=k.vz=0;k.speed=0;k.y=fdGround(k);k.visY=null;player=k;karts.push(k);
    for(const id of['menu','finish','esc','story','modes','title','sRes'])$(id).hidden=true;S.sub=null;
    fdDressing();fdStream(true);
    document.body.classList.add('free','racing');$('hud').hidden=false;$('fdHud').hidden=false;$('eRestart').textContent='New road';$('eRestart').hidden=false;
    spShown=-1;$('msg').textContent='';updateKartVisuals(0);
    S.mode='free';S.raceTime=0;camera.fov=63;camera.updateProjectionMatrix();updatePSScale();camSnap();fdDressTick(0);fdCull();warmUp();
    $('loading').hidden=true;setBanner('');startMusic('cruise');fdToast((FD.fix>=0?FD_BIO[FD.fix].name:'Free Drive')+(IS_TOUCH?'':' · T for auto-drive'),3.5);
  }catch(err){console.error(err);$('loading').hidden=true;}},40);}
function fdDispose(keepWorld){if(!FD)return;const d=FD.dress;if(d){for(const o of[d.water,d.clouds,d.ring]){scene.remove(o);o.geometry.dispose();o.material.dispose();}}
  if(FD.G&&FD.G.parent)fdFree(FD.G);if(sky)sky.position.set(0,0,0);nightSky.position.set(0,0,0);for(const ps of psList)ps.clear();FD.on=false;FD=null;
  document.body.classList.remove('free');$('fdHud').hidden=true;}
function fdExit(){stopMusic();$('loading').hidden=false;$('lmsg').textContent='Back to the garage';
  setTimeout(()=>{try{fdDispose();clearRace();clearWorld();MAP=null;buildMap(SET.map);}catch(e){console.error(e);}
    $('eRestart').textContent='Restart race';S.mode='menu';$('hud').hidden=true;document.body.classList.remove('racing');for(const id of['finish','esc'])$(id).hidden=true;
    $('menu').hidden=false;setBanner('');syncMenu();if(AU.eng)AU.eng.gn.gain.value=0;$('loading').hidden=true;startMusic('menu');},30);}

/* ---------- the kart in the open world ---------- */
function fdGround(o){let h=fdH(o.x,o.z);o.off=FD.lastD>FDW+.4;o.wet=false;if(h<FDK.WL-.55){h=FDK.WL-.55;o.wet=true;}return h;}
function fdReset(){const k=player;const q=fdNear(k.x,k.z),i=Math.min(FD.n-2,q.i),h=FD.rh[i];k.x=FD.rx[i]-Math.cos(h)*1.9;k.z=FD.rz[i]+Math.sin(h)*1.9;k.h=h;k.vx=k.vz=0;k.speed=0;k.y=fdGround(k)+1.2;k.vy=0;k.air=true;k.visY=null;k.drift.on=false;k.invT=1.2;camSnap();fdToast('Back on the road',1.4);}
function fdAuto(k){const q=fdNear(k.x,k.z),look=clamp(Math.abs(k.speed)*.85,9,32),j=Math.min(FD.n-2,q.i+Math.round(look/FDK.DS)),h=FD.rh[j];
  const tx=FD.rx[j]-Math.cos(h)*1.9,tz=FD.rz[j]+Math.sin(h)*1.9,want=Math.atan2(tx-k.x,tz-k.z),diff=wrapA(want-k.h);
  let kmax=0;for(let d=0;d<45;d++)kmax=Math.max(kmax,Math.abs(FD.rk[Math.min(FD.n-1,q.i+d)]));
  const v=Math.min(cc().top*.86,Math.sqrt(7.5/Math.max(kmax,1e-4)));
  return {steer:clamp(-diff*3.2,-1,1),gas:k.speed<v-1?1:0,brake:k.speed>v+5?1:0,drift:false};}
function fdHorn(){if(!AU.ctx)return;const k=player;if(k&&k.model.toilet)SFX.bass();else if(k&&k.model.drum){SFX.tung();setTimeout(()=>SFX.tung(),140);}else{tone(392,.32,'square',.06);tone(494,.32,'square',.05);}}
function fdToast(t,s){const e=$('fdToast');e.textContent=t;e.classList.add('on');FD.toastT=s||2.5;}
function fdKey(e){if(!FD||!FD.on||S.mode!=='free'||e.repeat||KEY[e.code]||ITEMK.has(e.code))return;
  if(e.code==='KeyR'){fdReset();}
  else if(e.code==='KeyT'){FD.auto=!FD.auto;fdToast(FD.auto?'Auto-drive on · steer or brake to take over':'Auto-drive off',2);}
  else if(e.code==='KeyV'){FD.cine.on=!FD.cine.on;FD.cine.t=0;fdToast(FD.cine.on?'Cinematic camera':'Chase camera',1.6);document.body.classList.toggle('fdclean',FD.cine.on||!FD.hud);if(!FD.cine.on)camSnap();}
  else if(e.code==='KeyH'){FD.hud=!FD.hud;document.body.classList.toggle('fdclean',!FD.hud);}
  else return;e.preventDefault();}
addEventListener('keydown',fdKey);

function fdFrame(dt,rawDt){if(S.mode==='paused'){fdDressTick(dt);return;}
  const steps=Math.min(8,Math.max(1,Math.ceil(dt*120-1e-6))),h=dt/steps,k=player;
  const manual=input.left||input.right||input.brake||pad.brake||Math.abs(pad.steer)>.3;if(FD.auto&&manual){FD.auto=false;fdToast('Auto-drive off',1.4);}
  for(let s=0;s<steps;s++){const c=FD.auto?fdAuto(k):playerControl(k);const px=k.x,pz=k.z;stepKart(k,c,h);
    if(!k.air){const fx=Math.sin(k.h),fz=Math.cos(k.h),a=fdH(k.x+fx*1.3,k.z+fz*1.3),b=fdH(k.x-fx*1.3,k.z-fz*1.3),sl=(a-b)/2.6;k.fdSl=sl;k.speed-=GRAV*.5*clamp(sl,-.6,.9)*h;}
    if(k.wet){k.speed*=1-h*1.8;if(Math.abs(k.speed)>3&&Math.random()<.5)FX.emit(k.x+(Math.random()-.5)*2,FDK.WL+.1,k.z+(Math.random()-.5)*2,(Math.random()-.5)*4,3+Math.random()*3,(Math.random()-.5)*4,.8,.9,1,.8,.6,{g:14,drag:.4});}
    FD.dist+=Math.hypot(k.x-px,k.z-pz);}
  for(const ps of psList)ps.update(dt);
  FDA.time.value=S.t;
  for(const ch of FD.chunks.values())for(const r of ch.fx)r.rotation.z+=dt*1.1;
  updateKartVisuals(dt);
  if(FD.cine.on)fdCine(dt);else{camFollow(dt,false);const gh=fdH(camera.position.x,camera.position.z)+1.1;if(camera.position.y<gh){camera.position.y=gh;cam.pos.y=Math.max(cam.pos.y,gh);camera.lookAt(cam.look);}}
  placeSun(k.x,k.y,k.z);fdDressTick(dt);fdStream(false);fdCull();
  if(AU.eng){const e=AU.eng,t=AU.ctx.currentTime,sp=Math.abs(k.speed),f=55+sp*3.4+(k.boostT>0?30:0)+(k.drift.on?12:0);e.o1.frequency.setTargetAtTime(f,t,.05);e.o2.frequency.setTargetAtTime(f,t,.05);e.f.frequency.setTargetAtTime(400+sp*40,t,.08);e.gn.gain.setTargetAtTime(.04+Math.min(.035,sp*.001),t,.1);}
  fdHud(dt);if(SET.gfx==='auto')dynRes(rawDt);}
function fdCine(dt){const c=FD.cine,k=player;c.t-=dt;const far=Math.hypot(c.pos.x-k.x,c.pos.z-k.z);
  if(c.t<=0||far>150){const q=fdNear(k.x,k.z),style=(Math.random()*3)|0;c.style=style;c.t=6+Math.random()*4;
    if(style<2){const j=Math.min(FD.n-2,q.i+Math.round((60+Math.random()*50)/FDK.DS)),h=FD.rh[j],sd=Math.random()<.5?-1:1,off=FDW+5+Math.random()*14;c.pos.set(FD.rx[j]-Math.cos(h)*off*sd,0,FD.rz[j]+Math.sin(h)*off*sd);c.pos.y=fdH(c.pos.x,c.pos.z)+(style?14+Math.random()*16:1.6+Math.random()*2.5);}
    else{c.pos.set(k.x,k.y+30,k.z);}}
  if(c.style===2){const a=S.t*.25;c.pos.lerp(new V3(k.x+Math.sin(a)*26,k.y+16,k.z+Math.cos(a)*26),1-Math.exp(-dt*2));}
  camera.position.copy(c.pos);c.look.lerp(new V3(k.x,k.y+1.2,k.z),c.look.lengthSq()?1-Math.exp(-dt*8):1);camera.lookAt(c.look);
  const tf=c.style===0?Math.max(18,48-Math.hypot(c.pos.x-k.x,c.pos.z-k.z)*.25):55;if(Math.abs(camera.fov-tf)>.1){camera.fov=lerp(camera.fov,tf,Math.min(1,dt*3));camera.updateProjectionMatrix();updatePSScale();}}
function fdHud(dt){const k=player;drawSpeedo(k);
  if((FD.bioT-=dt)<=0){FD.bioT=.5;const w=fdW(k.x,k.z);let b=0;for(let i=1;i<5;i++)if(w[i]>w[b])b=i;if(w[b]>.62&&b!==FD.bio){const first=FD.bio<0;FD.bio=b;$('fdBio').textContent=FD_BIO[b].name;if(!first&&FD.fix<0)fdToast('Now entering · '+FD_BIO[b].name,3);}
    $('fdOdo').textContent=(FD.dist/1000).toFixed(1)+' km';$('fdAuto').classList.toggle('on',FD.auto);$('bAuto').classList.toggle('on',FD.auto);}
  if(FD.toastT>0){FD.toastT-=dt;if(FD.toastT<=0)$('fdToast').classList.remove('on');}
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').textContent='';}
  fdMinimap();}
function fdMinimap(){const g=mmCtx,W=400,c=W/2,s=.62,k=player;g.clearRect(0,0,W,W);g.save();g.beginPath();g.arc(c,c,c-6,0,7);g.fillStyle='rgba(12,10,40,.55)';g.fill();g.clip();
  const ch=Math.cos(k.h),sh=Math.sin(k.h),P=(x,z)=>{const dx=x-k.x,dz=z-k.z;return [c-(dx*ch-dz*sh)*s,c-(dx*sh+dz*ch)*s];};
  const i0=fdIdxZ(k.z-380),i1=Math.min(FD.n-1,fdIdxZ(k.z+380));g.lineJoin=g.lineCap='round';
  for(const [lw,col] of[[22,'rgba(12,10,40,.8)'],[12,'#f6f8ff']]){g.beginPath();for(let i=i0;i<=i1;i+=2){const [x,y]=P(FD.rx[i],FD.rz[i]);i===i0?g.moveTo(x,y):g.lineTo(x,y);}g.strokeStyle=col;g.lineWidth=lw;g.stroke();}
  g.restore();g.save();g.translate(c,c);g.fillStyle=hex(k.rc.color);g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.moveTo(0,-18);g.lineTo(13,14);g.lineTo(0,7);g.lineTo(-13,14);g.closePath();g.fill();g.stroke();g.restore();
  g.fillStyle='#fff';g.font='800 26px Rubik, Arial';g.textAlign='center';g.fillText('N',c+Math.sin(k.h)*(c-28)*-1,c-Math.cos(k.h)*(c-28)*-1+9);}

/* ---------- art for the menu card and loading screen ---------- */
function fdArt(g,W,H,bio,time){const r=rng(bio.length*31+time.length*7+3),Tm={morning:['#8fb8ea','#ffd2a8','#ffe6c4'],noon:['#3d8de0','#8ccaf4','#d6ecfb'],sunset:['#3a2c6e','#ff8a6a','#ffd08a'],night:['#060922','#17204e','#2c3268']}[time]||['#3d8de0','#8ccaf4','#d6ecfb'];
  const B={mixed:[0x5d9a3a,0x2e5a28,'tree'],meadow:[0x6aa840,0x4a8a30,'tree'],forest:[0x2e5a28,0x1f4420,'pine'],autumn:[0xc08a3a,0x8a6a2a,'tree'],desert:[0xd9a56a,0xb06a3e,'cactus'],snow:[0xe8eef4,0xb8c8d8,'pine']}[bio];
  const hy=H*(H>W?.36:.5),gr=g.createLinearGradient(0,0,0,hy);gr.addColorStop(0,Tm[0]);gr.addColorStop(.75,Tm[1]);gr.addColorStop(1,Tm[2]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(time==='night'){for(let i=0;i<120;i++){g.fillStyle='rgba(255,255,255,'+(.3+r()*.7)+')';g.fillRect(r()*W,r()*hy*.9,1.6,1.6);}g.fillStyle='#f4f0d8';g.beginPath();g.arc(W*.78,H*.16,H*.06,0,7);g.fill();}
  else{const sy=time==='noon'?H*.14:H*.4,sx=time==='sunset'?W*.7:W*.24,sg=g.createRadialGradient(sx,sy,2,sx,sy,H*.3);sg.addColorStop(0,'rgba(255,250,224,1)');sg.addColorStop(.18,'rgba(255,236,170,.9)');sg.addColorStop(1,'rgba(255,230,150,0)');g.fillStyle=sg;g.fillRect(0,0,W,H);
    g.fillStyle='rgba(255,255,255,'+(time==='sunset'?.35:.75)+')';for(let i=0;i<6;i++){const x=r()*W,y=r()*hy*.6;for(let k=0;k<5;k++){g.beginPath();g.ellipse(x+k*W*.03,y+Math.sin(k)*6,W*.05,H*.025,0,0,7);g.fill();}}}
  const mtn=(base,amp,col,seed)=>{const rr=rng(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,H);let y=base;for(let x=0;x<=W;x+=W/80){y=clamp(y+(rr()-.5)*amp-(y-base)*.12,base-amp*3,base+amp);g.lineTo(x,y);}g.lineTo(W,H);g.fill();};
  const night=time==='night',tint=(c,k)=>{const cc=new THREE.Color(c);if(night)cc.lerp(new THREE.Color(0x0c1030),.65);else if(time==='sunset')cc.lerp(new THREE.Color(0xff9a7a),.22);return 'rgba('+(cc.r*255|0)+','+(cc.g*255|0)+','+(cc.b*255|0)+','+k+')';};
  mtn(hy-H*.06,H*.03,tint(0x8a9ab8,.75),5);mtn(hy-H*.01,H*.025,tint(bio==='snow'?0xd0dcea:0x6a8a9a,.9),9);
  const c1=tint(B[0],1),c2=tint(B[1],1);g.fillStyle=c1;g.fillRect(0,hy,W,H-hy);mtn(hy+H*.04,H*.02,c2,13);g.fillStyle=c1;g.fillRect(0,hy+H*.1,W,H);
  /* winding road in perspective */
  const P=t=>{const y=lerp(H*1.02,hy+H*.035,Math.pow(t,.55)),w=lerp(W*.46,W*.006,Math.pow(t,.55)),x=W*.5+Math.sin(t*5.2+.4)*W*.16*(1-t*.6)+(t>.5?Math.sin(t*9)*W*.03:0);return [x,y,w];};
  const L=[],Rr=[];for(let i=0;i<=60;i++){const [x,y,w]=P(i/60);L.push([x-w/2,y]);Rr.push([x+w/2,y]);}
  g.fillStyle=tint(0x8a7a5a,1);g.beginPath();L.forEach(([x,y],i)=>i?g.lineTo(x-(1-i/60)*W*.05,y):g.moveTo(x-W*.05,y));for(let i=60;i>=0;i--)g.lineTo(Rr[i][0]+(1-i/60)*W*.05,Rr[i][1]);g.fill();
  g.fillStyle=tint(0x4a4c52,1);g.beginPath();L.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));for(let i=60;i>=0;i--)g.lineTo(Rr[i][0],Rr[i][1]);g.fill();
  g.strokeStyle='rgba(240,240,232,.9)';for(let i=0;i<58;i+=2){const [x0,y0,w0]=P(i/60),[x1,y1]=P((i+1)/60);g.lineWidth=Math.max(1,w0*.025);g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();}
  for(const E of[L,Rr]){g.beginPath();E.forEach(([x,y],i)=>{const t=i/60,dx=(E===L?1:-1)*P(t)[2]*.06;i?g.lineTo(x+dx,y):g.moveTo(x+dx,y);});g.lineWidth=2;g.stroke();}
  /* trees */
  const tree=(x,y,s)=>{const dark=tint(B[1],1);if(B[2]==='pine'){g.fillStyle=dark;g.beginPath();g.moveTo(x,y-s*2.4);g.lineTo(x+s*.6,y);g.lineTo(x-s*.6,y);g.fill();if(bio==='snow'){g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.moveTo(x,y-s*2.4);g.lineTo(x+s*.25,y-s*1.4);g.lineTo(x-s*.25,y-s*1.4);g.fill();}}
    else if(B[2]==='cactus'){g.fillStyle=tint(0x4f7a3a,1);g.fillRect(x-s*.1,y-s*1.6,s*.2,s*1.6);g.fillRect(x-s*.45,y-s*1.1,s*.12,s*.6);g.fillRect(x-s*.45,y-s*.6,s*.4,s*.12);}
    else{g.fillStyle=tint(0x5e4630,1);g.fillRect(x-s*.08,y-s*.9,s*.16,s*.9);g.fillStyle=bio==='autumn'?tint([0xe8601e,0xffa040,0xc84020][r()*3|0],1):dark;g.beginPath();g.arc(x,y-s*1.3,s*.6,0,7);g.fill();}};
  const trees=[];for(let i=0;i<70;i++){const t=r(),[rx,ry,rw]=P(t),side=r()<.5?-1:1,x=rx+side*(rw*.6+r()*W*.35*(1-t)),s=lerp(H*.13,H*.012,Math.pow(t,.5))*(.7+r()*.6);if(B[2]==='cactus'&&r()<.7)continue;trees.push([x,ry,s]);}
  trees.sort((a,b)=>a[1]-b[1]).forEach(t=>tree(...t));
  const vg=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.32)');g.fillStyle=vg;g.fillRect(0,0,W,H);}
const FD_ART={};
function fdArtURL(bio,time,W,H){const k=bio+time+W;if(!FD_ART[k]){const c=document.createElement('canvas');c.width=W;c.height=H;fdArt(c.getContext('2d'),W,H,bio,time);FD_ART[k]=c.toDataURL('image/jpeg',.88);}return FD_ART[k];}

/* ---------- menu ---------- */
function fdMenuInit(){$('artFree').src=fdArtURL('mixed','sunset',640,820);
  const mk=(id,vals,labels,key)=>{const el=$(id);el.innerHTML='';vals.forEach((v,i)=>{const b=document.createElement('button');b.setAttribute('role','radio');b.dataset.v=v;b.textContent=labels[i];el.appendChild(b);});
    el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;FDOPT[key]=b.dataset.v;fdSaveOpt();fdSyncMenu();});};
  mk('fdBioSeg',FD_BIO_IDS,['Mixed','Meadow','Forest','Autumn','Desert','Snow'],'bio');mk('fdTimeSeg',['morning','noon','sunset','night'],['Morning','Noon','Sunset','Night'],'time');}
function fdSyncMenu(){const on=MODE==='free';$('menu').classList.toggle('free',on);if(!on)return;
  $('crumbT').textContent='Free Drive';$('go').textContent='Start driving';
  for(const [id,key] of[['fdBioSeg','bio'],['fdTimeSeg','time']])[...$(id).children].forEach(b=>b.setAttribute('aria-checked',b.dataset.v===FDOPT[key]));
  $('fdImg').src=fdArtURL(FDOPT.bio,FDOPT.time,640,400);
  const nm={mixed:'Every biome, one road',meadow:'Green Meadows',forest:'Pine Forest',autumn:'Maple Hills',desert:'Red Rock Desert',snow:'Frozen Peaks'}[FDOPT.bio];$('fdName').textContent=nm;
  $('fdSub').textContent={morning:'Early light, long shadows',noon:'Blue skies, clear views',sunset:'Golden hour, warm skies',night:'Stars out, headlights on'}[FDOPT.time];}
/* ==== FREE DRIVE END ==== */
