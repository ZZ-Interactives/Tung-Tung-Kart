
/* ---------- cars, vans, buses, trucks (merged into the city chunks) ---------- */
const S4PAINT=[[.72,.16,.12],[.18,.34,.62],[.86,.74,.2],[.88,.88,.86],[.16,.5,.32],[.38,.26,.5],[.12,.12,.14],[.62,.64,.66],[.8,.42,.14],[.2,.56,.66]];
const S4CARS={sedan:{L:4.5,W:1.9,H:.82,cab:[2.3,.68,-.15],wr:.36,wb:1.4},hatch:{L:3.9,W:1.8,H:.84,cab:[2.1,.7,-.45],wr:.34,wb:1.25},suv:{L:4.8,W:2,H:1.05,cab:[2.7,.78,-.35],wr:.42,wb:1.5},
  van:{L:5.2,W:2.05,H:1.9,cab:[1,.0,1.8],wr:.4,wb:1.7,box:true},bus:{L:12,W:2.6,H:2.7,cab:null,wr:.55,wb:4.6,bus:true},truck:{L:7.2,W:2.4,H:1.4,cab:[2,1.1,2.4],wr:.5,wb:2.6,boxT:true},trailer:{L:12.5,W:2.6,H:3.6,cab:null,wr:.5,wb:5,trailer:true}};
/* car body shapes: a side profile extruded across the width (cached per type). x = along the car (front +), y = up */
const S4CP={sedan:{lo:[[-2.25,.02],[2.17,.02],[2.25,.28],[2.23,.58],[2.0,.74],[1.0,.82],[-1.4,.84],[-2.15,.8],[-2.25,.6],[-2.27,.26]],cab:[-1.38,1.02,.42,-.92],ch:.6},
  hatch:{lo:[[-1.92,.02],[1.88,.02],[1.95,.3],[1.93,.6],[1.7,.76],[.95,.84],[-1.85,.86],[-1.95,.62],[-1.96,.26]],cab:[-1.86,.92,.3,-1.68],ch:.66},
  suv:{lo:[[-2.38,.04],[2.32,.04],[2.42,.34],[2.4,.78],[2.15,.98],[1.25,1.02],[-2.3,1.04],[-2.4,.8],[-2.42,.3]],cab:[-2.3,1.22,.55,-2.18],ch:.76},
  van:{lo:[[-2.58,.04],[2.5,.04],[2.6,.36],[2.58,.8],[2.3,1.0],[-2.55,1.0],[-2.6,.36]],cab:[-2.55,2.12,1.25,-2.55],ch:.98}};
const S4CG={};
function s4CarGeo(type,crushed){const key=type+(crushed?'c':'');if(S4CG[key])return S4CG[key];const P=S4CP[type],T=S4CARS[type],W=T.W;
  const ext=(pts,depth,bev)=>{const sh=new THREE.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:depth-2*bev,steps:1,bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev*.8,bevelSegments:2,curveSegments:2});g.translate(0,0,-(depth-2*bev)/2);g.rotateY(-Math.PI/2);g.computeVertexNormals();return g;};
  /* the lower body sits from the sills to the belt line */
  const lo=ext(P.lo,W,.06);
  /* the cabin (narrower), and its glass a hair outside it */
  const [cr,cf,cft,crt]=P.cab,ch=P.ch*(crushed?.5:1),belt=Math.max(...P.lo.map(p=>p[1]))-.06;
  const poly=[[cr,0],[cf,0],[cft,ch],[crt,ch]];
  const off=(pts,d)=>{const n=pts.length,o=[];for(let i=0;i<n;i++){const a=pts[(i-1+n)%n],b=pts[i],c=pts[(i+1)%n];const n1=(()=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return [dy/l,-dx/l];})(),n2=(()=>{const dx=c[0]-b[0],dy=c[1]-b[1],l=Math.hypot(dx,dy);return [dy/l,-dx/l];})();
      const m=[n1[0]+n2[0],n1[1]+n2[1]],ml=Math.hypot(m[0],m[1])||1,k=d/Math.max(.35,(m[0]*n1[0]+m[1]*n1[1])/ml);o.push([b[0]+m[0]/ml*k,b[1]+m[1]/ml*k]);}return o;};
  const cab=ext(poly,W-.2,.04);cab.translate(0,belt,0);
  const gp=off(poly,.018);/* bring the glass top down below the roof edge, sliding along the pillars */
  for(const i of[2,3]){const j=i===2?1:0,a=gp[j],b=gp[i],t=(ch-.07-a[1])/(b[1]-a[1]);gp[i]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
  gp[0][1]=gp[1][1]=.02;const glass=ext(gp,W-.2+.035,0);glass.translate(0,belt,0);
  /* pillars between the windows */const pil=[];const bx=(cr+cf)/2+(cft-cf)*.25;for(const s of[-1,1]){const b=new THREE.BoxGeometry(.08,ch*.86,.1);b.translate(0,belt+ch*.46,0);b.rotateY(Math.PI/2);b.translate(s*((W-.2)/2+.03),0,bx);pil.push(b);}
  const out=S4CG[key]={lo,cab,glass,pil:mergeGeos(pil),belt,ch};return out;}
let S4WG=null;function s4WheelGeo(){if(S4WG)return S4WG;const tire=new THREE.CylinderGeometry(1,1,1,16);tire.rotateZ(Math.PI/2);const rim=new THREE.CylinderGeometry(.62,.62,1.06,12);rim.rotateZ(Math.PI/2);const hub=new THREE.CylinderGeometry(.18,.18,1.12,8);hub.rotateZ(Math.PI/2);
  S4WG={tire,rim:mergeGeos([rim,hub])};return S4WG;}
/* adds a vehicle. o: {burnt, crushed, tilt, roll, y, col, collide, fire} returns the collider (if any) */
function s4Car(type,x,z,yaw,o){o=o||{};const T=S4CARS[type],r=rng(((x*13.1+z*7.7)*1000)>>>0),y0=o.y||0,cs=Math.cos(yaw),sn=Math.sin(yaw);
  const paint=o.col!=null?S4PAINT[o.col%S4PAINT.length]:S4PAINT[(r()*S4PAINT.length)|0],burnt=!!o.burnt,crushed=!!o.crushed;
  const bodyC=burnt?s4Tint(.13+r()*.05,.11,.1):s4Tint(paint[0],paint[1],paint[2]),glassK=burnt?'char':'glassD',bodyK=burnt?'char':'car';
  const roll=o.roll||0,pitch=o.tilt||0;
  /* local -> world with roll (about the length axis) and pitch */
  const W2=(lx,ly,lz)=>{let y=ly,xx=lx,zz=lz;if(roll){const c=Math.cos(roll),s=Math.sin(roll);const ny=xx*s+y*c;xx=xx*c-y*s;y=ny;}if(pitch){const c=Math.cos(pitch),s=Math.sin(pitch);const ny=y*c+zz*s;zz=zz*c-y*s;y=ny;}return [x+xx*cs+zz*sn,y0+y,z-xx*sn+zz*cs];};
  const part=(k,lx,ly,lz,w,h,l,col,tu)=>{const p=W2(lx,ly,lz);s4Geo(s4Bucket(x,z,k),new THREE.BoxGeometry(w,h,l),p[0],p[1],p[2],pitch?-pitch:0,yaw,roll,1,1,1,col,1/(tu||4));};
  const geo=(k,g,lx,ly,lz,col,sx,sy,sz)=>{const p=W2(lx,ly,lz);s4Geo(s4Bucket(x,z,k),g,p[0],p[1],p[2],pitch?-pitch:0,yaw,roll,sx||1,sy||1,sz||1,col,1/4);};
  const WG=s4WheelGeo(),wheel=(lx,lz)=>{const wr=T.wr,ww=.3;geo(burnt?'rust':'rubber',WG.tire,lx,wr,lz,burnt?s4Tint(.5,.3,.2):null,ww,wr,wr);if(!burnt||r()<.5)geo(burnt?'rust':'metal',WG.rim,lx+Math.sign(lx)*.005,wr,lz,burnt?s4Tint(.4,.28,.2):s4Tint(.8,.82,.86),ww,wr,wr);};
  const L=T.L,Wd=T.W,H=crushed?T.H*.8:T.H,lift=T.wr*.9;
  if(T.bus||T.trailer){part(bodyK,0,lift+H/2,0,Wd,H,L,bodyC);
    if(T.bus){part(glassK,0,lift+H*.7,0,Wd+.04,H*.36,L-1.2,null);part(glassK,0,lift+H*.62,L/2-.05,Wd-.3,H*.6,.1,null);part('dark',0,lift+.15,0,Wd+.02,.3,L-.4,null);
      for(let k=-4;k<=4;k++)part(bodyK,0,lift+H*.7,k*1.25,Wd+.06,H*.36,.12,bodyC);part('metal',0,lift+H+.05,0,Wd-.3,.1,L-.6,null);
      if(!burnt){part('cyanV',0,lift+H+.05,L/2-1,1.6,.25,.2,s4Tint(1,.8,.3));for(const s of[-1,1])part('lampOn',s*(Wd/2-.3),lift+.45,L/2+.02,.35,.18,.04,s4Tint(1,.95,.85));}}
    else{part('metal',0,lift+H*.5,0,Wd+.03,.1,L,null);part('dark',0,lift-.1,L/2-1,Wd,.5,1.4,null);for(let k=-5;k<=5;k++)part('metal',0,lift+H/2,k*1.1,Wd+.05,H-.1,.06,null);}
    for(const s of[-1,1])for(const zz of(T.bus?[-L/2+2.2,L/2-2.6]:[-L/2+1.4,-L/2+2.6]))wheel(s*(Wd/2-.15),zz);}
  else if(T.boxT){/* box truck: cab + box */
    part(bodyK,0,lift+H/2,L/2-1.1,Wd,H,2.2,bodyC);part(glassK,0,lift+H*.8,L/2-.02,Wd-.3,H*.4,.06,null);part('dark',0,lift+.25,L/2+.05,Wd-.1,.3,.12,null);
    part('conc',0,lift+T.cab[2]/2+.2,-1.1,Wd+.1,T.cab[2],L-2.4,burnt?s4Tint(.18,.16,.15):s4Tint(.92,.92,.9));part('dark',0,lift+.35,-1.1,Wd-.2,.25,L-2.6,null);
    if(!burnt)for(const s of[-1,1])part('lampOn',s*(Wd/2-.3),lift+H*.45,L/2+.02,.3,.16,.04,s4Tint(1,.95,.85));
    for(const s of[-1,1])for(const zz of[-T.wb,T.wb*.9])wheel(s*(Wd/2-.1),zz);}
  else{/* car / van: shaped body, cabin, glass, bumpers, grille, lights, mirrors, plates */
    const G=s4CarGeo(type,crushed),hb=G.belt,top=hb+G.ch;
    geo(bodyK,G.lo,0,lift,0,bodyC);geo(bodyK,G.cab,0,lift,0,bodyC);geo(glassK,G.glass,0,lift,0,null);geo(bodyK,G.pil,0,lift,0,bodyC);
    const fz=L/2,bump=burnt?'char':'dark';
    part(bump,0,lift+.2,fz+.02,Wd-.04,.24,.16,null);part(bump,0,lift+.2,-fz-.02,Wd-.04,.24,.16,null);
    part('dark',0,lift+hb*.55,fz+.01,Wd*.42,hb*.24,.06,null);
    part('paint',0,lift+.24,fz+.11,.52,.12,.02,s4Tint(.95,.95,.92));part('paint',0,lift+.24,-fz-.11,.52,.12,.02,s4Tint(.95,.95,.92));
    if(!burnt){for(const s of[-1,1]){part('lampOn',s*(Wd/2-.3),lift+hb*.62,fz-.02,.38,.14,.08,s4Tint(1,.95,.85));part('redV',s*(Wd/2-.26),lift+hb*.66,-fz+.0,.36,.16,.08,s4Tint(.85,.1,.1));}}
    for(const s of[-1,1]){part(bodyK,s*(Wd/2+.08),lift+hb+.06,T.cab[1]-.25,.14,.1,.18,bodyC);part('dark',s*(Wd/2+.005),lift+hb*.5,0,.02,.04,L*.7,null);}
    for(const s of[-1,1])for(const zz of[-T.wb,T.wb])wheel(s*(Wd/2-.1),zz*(type==='van'?1.3:1.25));}
  let c=null;if(o.collide!==false){const hx=Wd/2+.2,hz=L/2+.2;c=s4ColBox(x,z,hx*Math.abs(Math.cos(roll))+(Math.abs(roll)>.8?H*.6:0),hz,yaw,{kind:burnt&&o.fire!==false?'fire':'car',top:y0+lift+H+1.2,car:true});}
  if(burnt&&o.fire!==false){const n=type==='bus'||type==='trailer'?3:1;for(let k=0;k<n;k++){const lz=(k-(n-1)/2)*L*.32,p=W2(0,lift+H+.3,lz);S4.fires.push({x:p[0],y:p[1],z:p[2],s:(type==='bus'?1.6:1.15)+r()*.5,car:c});}
    S4.decals.push([x,z,r()*6,Math.max(L,Wd)*.75,'scorch']);}
  return c;}
