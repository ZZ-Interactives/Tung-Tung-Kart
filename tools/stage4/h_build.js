
/* ---------- the level script: where everything goes, by distance along the route ---------- */
/* segment lengths (metres between corners) for reference: 3:360 4:360 5:360 6:180 7:120 8:300 9:360 10:360 11:960 12:360 13:600 14:240 15:240 16:190 */
const S4PLAN={
  burning:[[3,40,-3.5],[3,78,4],[3,104,-1.5],[3,150,5],[3,168,-4.6],[3,205,1.5],[3,290,-3],[3,322,4.4],[4,40,3.5],[4,100,-4],[4,272,4.5],[5,90,3.5],[5,150,-3.8],[6,120,-3],[8,30,4],[8,140,-4.2],[8,250,3],[9,30,-4],[9,170,3.8],[9,320,-2.2],
    [10,25,3.5],[10,100,-4],[10,170,2.5],[10,225,-1.5],[10,300,4],[11,140,-6],[11,250,7],[11,560,-4],[11,660,6],[11,880,-7],[12,80,4],[12,250,-4],[13,120,5],[13,300,-6],[13,560,4]],
  sleepers:[[4,60,-2],[4,290,2.5],[4,325,-3.5],[5,60,1.5],[6,40,2],[8,110,-2],[8,200,3],[9,270,2.5],[9,300,-3],[10,120,-2.5],[10,200,2.5],[10,285,-1],[10,330,3]],
  turrets:[[4,95,-1],[4,300,1],[9,140,1],[10,150,1],[10,250,-1],[6,95,1],[8,215,-1]],
  duds:[[3,60,-1],[3,150,1],[3,260,-1]],
  chases:[[3,190,2,'GROK BOTS BEHIND YOU!'],[5,20,2,''],[6,10,3,'MORE BOTS!'],[8,40,2,''],[9,120,2,''],[10,40,4,'THEY\'RE EVERYWHERE!'],[10,240,2,''],[11,330,2,''],[13,140,2,'']],
  flyers:[[8,60,2],[9,100,2],[10,140,2]],
  hearts:[[4,8,0],[5,250,-2],[8,8,0],[9,240,2],[10,8,-2],[11,20,-4],[11,24,4],[11,470,0],[11,830,0],[13,20,0]],
  cps:[[0,4,'THE RUNWAY'],[5,12,'PIPE STREET'],[9,250,'THE FOUR-WAY'],[11,15,'GRAND AVENUE']],
  bottles:['s3+','s4-','mall','camp','s10+'],
  names:[[2,10],[3,10],[4,12],[5,30],[7,4],[8,12],[10,12],[11,30],[16,4]]};
function s4Plan(){const P=S4.path;S4.turretPlan=[];
  for(const [sg,t,side] of S4PLAN.turrets){const q=s4At(s4S(sg,t),side*(S4SEG[sg].W+3));S4.turretPlan.push({x:q.x,z:q.z,used:false});}
  S4.wantTurret=(x,z)=>{for(const p of S4.turretPlan){if(!p.used&&Math.hypot(p.x-x,p.z-z)<14){p.used=true;return true;}}return false;};
  /* the sidewalk run on segment 4: road blocked by a pileup, ride the right sidewalk through the trash cans */
  S4.clearWalk.push({seg:4,side:1,t0:120,t1:250},{seg:4,side:-1,t0:120,t1:250});S4.noParked.push({seg:4,t0:120,t1:250},{seg:5,t0:440,t1:9999},{seg:3,t0:170,t1:195});}
/* the pileup across the road, cans along the sidewalk */
function s4SidewalkRun(){const s0=s4S(4,150),s1=s4S(4,232);
  const kinds=['sedan','van','suv','hatch','sedan','van'];let k=0;for(let s=s0;s<s1;s+=7){const t=kinds[k%kinds.length],half=S4CARS[t].L/2,lat=(k%2?-1:1)*Math.max(0,Math.min(7.4-half,1+Math.random()*2.5)),q=s4At(s,lat);k++;
    s4Car(t,q.x,q.z,q.h+Math.PI/2+(Math.random()-.5)*.35,{burnt:Math.random()<.5,fire:Math.random()<.3,crushed:Math.random()<.4,roll:(Math.random()-.5)*.3,collide:false});}
  {const q=s4At((s0+s1)/2,-2);s4Car('bus',q.x,q.z,q.h+.08,{burnt:true,fire:true,collide:false});}
  /* concrete barriers fill the gaps so the road is fully shut */
  for(let s=s0-4;s<s1+4;s+=3){const q=s4At(s,0);s4ColBox(q.x,q.z,7.9,1.6,q.h,{kind:'wreck',top:3});}
  for(const s of[s0-6,s1+6]){const q=s4At(s,0);s4Jersey(q.x,0,q.z,16.5,q.h+Math.PI/2,s4Tint(.85,.82,.78),{sy:1.25});}
  /* left sidewalk: rubble and a fallen pole */
  for(let s=s0-6;s<s1+6;s+=4){const q=s4At(s,-10.4);s4Geo(s4Bucket(q.x,q.z,'rubble'),s4Rock(),q.x,.8,q.z,Math.random()*3,Math.random()*3,0,1.5,1,1.6,s4Tint(.45,.42,.4));s4Col({x:q.x,z:q.z,r:1.6,kind:'rubble',top:2});}
  /* trash cans on the right sidewalk */
  for(let s=s0-10;s<s1+10;s+=5.5){const q=s4At(s,10.2+(Math.random()-.5)*1.2);S4.cans.push([q.x,q.z]);if(Math.random()<.3){const q2=s4At(s+2.5,9.4);S4.cones.push([q2.x,0.22,q2.z]);}}
  const warn=s4At(s0-24,0);const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.6),s4Mats().sign('ROAD CLOSED →','#e8b030','#14123a',512,140,56));sg.position.set(warn.x,3,warn.z);sg.rotation.y=warn.h+Math.PI;S4.G.add(sg);}
/* ---------- put the whole stage together ---------- */
function s4Build(){const M=s4Mats(),G=S4.G;
  S4.path=s4BuildPath();s4Rects();
  for(const st of S4.stubs)if(st.kind==='collapse')st.r.on=false;
  s4Plan();s4BuildStreets();s4Deck();s4Outskirts();s4Suburbs();s4RailBridge();s4PipeStreet();s4SidewalkRun();
  s4Arch(s4S(6,70),'bus');s4Arch(s4S(9,60),'truck');
  s4Mall();s4Camp('campA');s4Camp('campB');s4Camp('campC');s4Collapse();s4Aqueduct();s4BossProps();s4Castle();
  s4Blocks();s4Infill();s4Barricades();s4StreetProps();
  for(const [sg,t,lat] of S4PLAN.burning){const q=s4At(s4S(sg,t),lat);s4Car(['sedan','hatch','suv','van','sedan','truck'][(Math.random()*6)|0],q.x,q.z,q.h+(Math.random()-.5)*1.6,{burnt:true,fire:true,crushed:Math.random()<.3});}
  /* medians are a curb higher */
  for(const p of S4.pieces){if(!p.blvd)continue;for(const [ga,gb] of p.gaps){const a=ga+3,b=gb-3;if(b-a<4)continue;const xa=p.x0+p.dx*a,xb=p.x0+p.dx*b,za=p.z0+p.dz*a,zb=p.z0+p.dz*b;S4.raise.push({x0:Math.min(xa,xb)-.8,x1:Math.max(xa,xb)+.8,z0:Math.min(za,zb)-.8,z1:Math.max(za,zb)+.8,y:.28});}}
  /* decals */
  for(const [x,z,rot,sz,kind,y] of S4.decals){const B=s4Bucket(x,z,kind),cs=Math.cos(rot),sn=Math.sin(rot),h=sz/2,yy=(y||0)+(kind==='puddle'?.045:.05),f=s4Floor(x,z);const y2=y!=null?yy:f.y+(kind==='puddle'?.025:.03);
    const P=(a,b)=>[x+a*cs+b*sn,y2,z-a*sn+b*cs];s4Quad(B,P(-h,h),P(h,h),P(h,-h),P(-h,-h),[0,1],[1,1],[1,0],[0,0]);}
  s4Arrows();s4Backdrop();
  /* bake the chunks */
  for(const ch of S4.chunks.values()){const g=new THREE.Group();for(const k in ch.bk){const mat=s4MatOf(k);if(!mat){console.warn('s4 missing material',k);continue;}const m=s4BkMesh(ch.bk[k],mat,true);if(!m)continue;
      const flat=/^(road|blvd|asph|walk|curb|paint|yellow|manhole|scorch|puddle|tile|paver|dirt|deck)$/.test(k);m.castShadow=!flat&&!/^(signs|lamp|sig|cyanV|redV|fence|banner)/.test(k);m.receiveShadow=true;if(k==='scorch'||k==='puddle'){m.renderOrder=1;}m.userData.bk=1;g.add(m);}
    ch.bk=null;ch.g=g;G.add(g);const q=s4Near(ch.cx,ch.cz,-1,{});ch.sMax=q.s+200;}
  /* blinking lights and fires get sprites, grouped by chunk so far ones hide */
  for(const [x,y,z,s,b] of S4.blinkers){const gl=glow(0xff3040,s);gl.position.set(x,y,z);gl.userData.blink=b;s4ChunkAdd(gl,x,z);S4.blinkS.push(gl);}
  for(const f of S4.fires){const gl=glow(f.wall?0xff7a20:0xff8a30,(f.s||1)*4.2);gl.material.opacity=.55;gl.position.set(f.x,f.y+.6,f.z);if(f.tower)S4.collapse.piv.attach(gl);else s4ChunkAdd(gl,f.x,f.z);f.gl=gl;f.ph=Math.random()*6;}
  s4Breakables();s4Entities();
  /* everything else that stands still goes into the chunk it is in, so far-away chunks hide it too */
  const chunkGs=new Set([...S4.chunks.values()].map(ch=>ch.g));
  for(const o of [...G.children]){if(chunkGs.has(o)||o.isInstancedMesh||o.userData.free4)continue;o.updateMatrixWorld(true);const p=new V3().setFromMatrixPosition(o.matrixWorld);const ch=S4.chunks.get(Math.floor(p.x/240)+','+Math.floor(p.z/240));if(ch&&ch.g)ch.g.attach(o);}}
function s4ChunkAdd(o,x,z){const ch=S4.chunks.get(Math.floor(x/240)+','+Math.floor(z/240));if(ch&&ch.g)ch.g.add(o);else S4.G.add(o);}
/* ---------- breakables: instanced, so hundreds of them cost a few draw calls ---------- */
function s4Breakables(){const T=s4Models();S4.brk=[];S4.bgrid=new Map();const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),Sc=new V3(1,1,1),P=new V3(),Y=new V3(0,1,0);
  const lists={can:S4.cans,cone:S4.cones,crate:S4.crates,hydrant:S4.hydrants,cart:S4.carts,box:S4.boxes};
  /* one set of instanced meshes per city chunk, so each set is shown/hidden with its chunk. (An instanced mesh is culled by
     its base shape at the world origin, so a single city-wide set would vanish whenever the origin left the screen.) */
  for(const type in lists){const L=lists[type];if(!L.length)continue;const def=T.brk[type],by=new Map();
    for(const p of L){const x=p[0],z=p.length>2?p[2]:p[1],k=Math.floor(x/240)+','+Math.floor(z/240);if(!by.has(k))by.set(k,[]);by.get(k).push(p);}
    for(const [ck,PL] of by){const ch=S4.chunks.get(ck);const ims=def.parts.map(([geo,mat])=>{const im=new THREE.InstancedMesh(geo,mat,PL.length);im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;(ch&&ch.g||S4.G).add(im);return im;});
      PL.forEach((p,i)=>{const x=p[0],z=p.length>2?p[2]:p[1],y=p.length>2?p[1]:s4Floor(x,z).y,yaw=Math.random()*6.28;Q.setFromAxisAngle(Y,yaw);P.set(x,y,z);M4.compose(P,Q,Sc);for(const im of ims)im.setMatrixAt(i,M4);
        const b={type,def,ims,i,x,y,z,yaw,alive:true};S4.brk.push(b);const k=Math.floor(x/30)+','+Math.floor(z/30);if(!S4.bgrid.has(k))S4.bgrid.set(k,[]);S4.bgrid.get(k).push(b);});
      for(const im of ims)im.instanceMatrix.needsUpdate=true;}}}
/* ---------- the things that move: placed now, woken up by the script ---------- */
function s4Entities(){const T=s4Models();S4.sleep=[];S4.turrets=[];S4.duds=[];S4.thr=[];S4.bottles=[];S4.hearts=[];
  for(const [sg,t,lat] of S4PLAN.sleepers)S4.sleep.push(s4MakeSleeper(s4S(sg,t),lat));
  for(const b of S4.balcony){const g=T.turret.clone(true);g.position.set(b.x,b.y,b.z);g.rotation.y=b.yaw;S4.G.add(g);
    S4.turrets.push({g,head:g.children[g.children.length-1],x:b.x,y:b.y,z:b.z,yaw:b.yaw,cd:1+Math.random()*1.5,aim:0,st:'idle',tx:0,tz:0});}
  /* three turrets on brackets high up that only ever shoot behind you */
  for(const [sg,t,side] of S4PLAN.duds){const W=S4SEG[sg].W,q=s4At(s4S(sg,t),side*(W-1.2)),qw=s4At(s4S(sg,t),side*(W-.1)),g=T.turret.clone(true);g.scale.setScalar(1.3);const y=13+Math.random()*5;g.position.set(q.x,y,q.z);g.rotation.y=q.h+(side>0?Math.PI/2:-Math.PI/2);S4.G.add(g);
    const B=s4Bk();s4Box(B,(q.x+qw.x)/2,y-.2,(q.z+qw.z)/2,2.4,.4,2.6,q.h,2,2,[.5,.5,.52]);s4Box(B,qw.x,y-1.4,qw.z,.6,2.4,.6,q.h,2,2,[.45,.45,.47]);const pm=s4BkMesh(B,s4Mats().metal);pm.castShadow=true;S4.G.add(pm);
    S4.duds.push({g,head:g.children[g.children.length-1],x:q.x,y:y+1.3,z:q.z,s:s4S(sg,t),cd:0,burst:0,shots:0});}
  for(const th of S4.throwers){const m=makeDripbot();m.g.scale.setScalar(S4K.BOT);m.g.position.set(th.x,0,th.z);S4.G.add(m.g);m.straw.scale.y=.01;S4.thr.push(Object.assign(m,{x:th.x,z:th.z,h:Math.random()*6,cd:1.5+Math.random()*2,dead:false,walk:0,throwT:0}));}
  /* hidden water bottles */
  const spots=[];for(const tag of S4PLAN.bottles){if(tag==='mall'){spots.push(S4.bottleSpots[0]);continue;}if(tag==='camp'){spots.push(S4.bottleSpots[1]||S4.bottleSpots[0]);continue;}
    const sg=+tag.slice(1,-1),side=tag.slice(-1)==='+'?1:-1;const st=S4.stubs.find(s=>s.seg===sg&&s.kind==='cross'&&((-s4Dir(sg)[1]*s.vx+s4Dir(sg)[0]*s.vz)*side>0))||S4.stubs.find(s=>s.seg===sg);if(st)spots.push([st.ex-st.vx*6+(-st.vz)*(Math.random()-.5)*8,st.ez-st.vz*6+st.vx*(Math.random()-.5)*8]);}
  for(const [x,z] of spots){const g=T.bottle.clone(true);const y=s4Floor(x,z).y;g.position.set(x,y+.3,z);S4.G.add(g);S4.bottles.push({g,x,y,z,got:false});}
  for(const [sg,t,lat] of S4PLAN.hearts){const q=s4At(s4S(sg,t),lat);s4Heart(q.x,q.z,false);}}
function s4MakeSleeper(s,lat){const q=s4At(s,lat),m=makeDripbot();m.g.scale.setScalar(S4K.BOT);m.g.position.set(q.x,0,q.z);m.g.rotation.y=q.h+Math.PI;S4.G.add(m.g);
  m.eyeM.color.setHex(0x2a2e3a);m.eg.material.opacity=0;m.rig.position.y=-1.1;m.rig.rotation.x=.25;m.straw.scale.y=.01;
  return Object.assign(m,{s,lat0:lat,lat,x:q.x,z:q.z,h:q.h+Math.PI,st:'sleep',t:0,walk:0,dead:false});}
function s4Heart(x,z,fromBreak){const g=s4Models().heart.clone(true);const y=s4Floor(x,z).y;g.position.set(x,y+1.4,z);S4.G.add(g);S4.hearts.push({g,x,y,z,t:0,ph:Math.random()*6,pop:fromBreak?0:1});}
