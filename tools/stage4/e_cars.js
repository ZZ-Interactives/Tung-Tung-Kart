
/* ---------- cars, vans, buses, trucks (merged into the city chunks) ---------- */
const S4PAINT=[[.72,.16,.12],[.18,.34,.62],[.86,.74,.2],[.88,.88,.86],[.16,.5,.32],[.38,.26,.5],[.12,.12,.14],[.62,.64,.66],[.8,.42,.14],[.2,.56,.66]];
const S4CARS={sedan:{L:4.5,W:1.9,H:.82,cab:[2.3,.68,-.15],wr:.36,wb:1.4},hatch:{L:3.9,W:1.8,H:.84,cab:[2.1,.7,-.45],wr:.34,wb:1.25},suv:{L:4.8,W:2,H:1.05,cab:[2.7,.78,-.35],wr:.42,wb:1.5},
  van:{L:5.2,W:2.05,H:1.9,cab:[1,.0,1.8],wr:.4,wb:1.7,box:true},bus:{L:12,W:2.6,H:2.7,cab:null,wr:.55,wb:4.6,bus:true},truck:{L:7.2,W:2.4,H:1.4,cab:[2,1.1,2.4],wr:.5,wb:2.6,boxT:true},trailer:{L:12.5,W:2.6,H:3.6,cab:null,wr:.5,wb:5,trailer:true}};
/* adds a vehicle. o: {burnt, crushed, tilt, roll, y, col, collide, fire} returns the collider (if any) */
function s4Car(type,x,z,yaw,o){o=o||{};const T=S4CARS[type],r=rng(((x*13.1+z*7.7)*1000)>>>0),y0=o.y||0,cs=Math.cos(yaw),sn=Math.sin(yaw);
  const paint=o.col!=null?S4PAINT[o.col%S4PAINT.length]:S4PAINT[(r()*S4PAINT.length)|0],burnt=!!o.burnt,crushed=!!o.crushed;
  const bodyC=burnt?s4Tint(.13+r()*.05,.11,.1):s4Tint(paint[0],paint[1],paint[2]),glassK=burnt?'char':'glassD',bodyK=burnt?'char':'car';
  const roll=o.roll||0,pitch=o.tilt||0;
  /* local -> world with roll (about the length axis) and pitch */
  const W2=(lx,ly,lz)=>{let y=ly,xx=lx,zz=lz;if(roll){const c=Math.cos(roll),s=Math.sin(roll);const ny=xx*s+y*c;xx=xx*c-y*s;y=ny;}if(pitch){const c=Math.cos(pitch),s=Math.sin(pitch);const ny=y*c+zz*s;zz=zz*c-y*s;y=ny;}return [x+xx*cs+zz*sn,y0+y,z-xx*sn+zz*cs];};
  const part=(k,lx,ly,lz,w,h,l,col,tu)=>{const p=W2(lx,ly,lz);s4Geo(s4Bucket(x,z,k),new THREE.BoxGeometry(w,h,l),p[0],p[1],p[2],pitch?-pitch:0,yaw,roll,1,1,1,col,1/(tu||4));};
  const wheel=(lx,lz)=>{const p=W2(lx,T.wr,lz);s4Geo(s4Bucket(x,z,burnt?'rust':'rubber'),new THREE.CylinderGeometry(T.wr,T.wr,.32,12),p[0],p[1],p[2],0,yaw,Math.PI/2+roll,1,1,1,burnt?s4Tint(.5,.3,.2):null);};
  const L=T.L,Wd=T.W,H=crushed?T.H*.8:T.H,lift=T.wr*.9;
  if(T.bus||T.trailer){part(bodyK,0,lift+H/2,0,Wd,H,L,bodyC);
    if(T.bus){part(glassK,0,lift+H*.7,0,Wd+.04,H*.36,L-1.2,null);part(glassK,0,lift+H*.62,L/2-.05,Wd-.3,H*.6,.1,null);part('dark',0,lift+.15,0,Wd+.02,.3,L-.4,null);
      if(!burnt){part('cyanV',0,lift+H+.05,L/2-1,1.6,.25,.2,s4Tint(1,.8,.3));}}
    else{part('metal',0,lift+H*.5,0,Wd+.03,.1,L,null);part('dark',0,lift-.1,L/2-1,Wd,.5,1.4,null);}
    for(const s of[-1,1])for(const zz of(T.bus?[-L/2+2.2,L/2-2.6]:[-L/2+1.4,-L/2+2.6]))wheel(s*(Wd/2-.15),zz);}
  else if(T.box||T.boxT){/* van / box truck: cab + box */
    if(T.boxT){part(bodyK,0,lift+H/2,L/2-1.1,Wd,H,2.2,bodyC);part(glassK,0,lift+H*.8,L/2-.02,Wd-.3,H*.4,.06,null);part('conc',0,lift+T.cab[2]/2+.2,-1.1,Wd+.1,T.cab[2],L-2.4,burnt?s4Tint(.18,.16,.15):s4Tint(.92,.92,.9));}
    else{part(bodyK,0,lift+H/2,0,Wd,H,L,bodyC);part(glassK,0,lift+H*.72,L/2-.3,Wd-.2,H*.32,.65,null);part(glassK,0,lift+H*.7,.4,Wd+.02,H*.28,1.6,null);}
    for(const s of[-1,1])for(const zz of[-T.wb,T.wb*.9])wheel(s*(Wd/2-.1),zz);}
  else{/* car: lower body, cabin with glass, bumpers, lights */
    part(bodyK,0,lift+H/2,0,Wd,H,L,bodyC);const [cl,ch,co]=T.cab,chh=crushed?ch*.45:ch;
    part(bodyK,0,lift+H+chh/2,co,Wd-.18,chh,cl,bodyC);part(glassK,0,lift+H+chh*.5,co,Wd-.12,chh*.78,cl-.2,null);
    part('dark',0,lift+.18,L/2+.04,Wd-.1,.26,.12,null);part('dark',0,lift+.18,-L/2-.04,Wd-.1,.26,.12,null);
    if(!burnt){for(const s of[-1,1]){part('lampOn',s*(Wd/2-.32),lift+H*.62,L/2+.02,.4,.16,.04,s4Tint(1,.95,.85));part('redV',s*(Wd/2-.3),lift+H*.62,-L/2-.02,.42,.16,.04,s4Tint(.8,.1,.1));}}
    for(const s of[-1,1])for(const zz of[-T.wb,T.wb])wheel(s*(Wd/2-.08),zz);}
  let c=null;if(o.collide!==false){const hx=Wd/2+.2,hz=L/2+.2;c=s4ColBox(x,z,hx*Math.abs(Math.cos(roll))+(Math.abs(roll)>.8?H*.6:0),hz,yaw,{kind:burnt&&o.fire!==false?'fire':'car',top:y0+lift+H+1.2,car:true});}
  if(burnt&&o.fire!==false){const n=type==='bus'||type==='trailer'?3:1;for(let k=0;k<n;k++){const lz=(k-(n-1)/2)*L*.32,p=W2(0,lift+H+.3,lz);S4.fires.push({x:p[0],y:p[1],z:p[2],s:(type==='bus'?1.6:1.15)+r()*.5,car:c});}
    S4.decals.push([x,z,r()*6,Math.max(L,Wd)*.75,'scorch']);}
  return c;}
