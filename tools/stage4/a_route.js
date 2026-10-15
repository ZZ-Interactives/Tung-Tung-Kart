/* ==== STAGE 4 BEGIN ==== */
/* ============ STAGE 1-4 · Fountain City ============
   Off the broken highway and down into GROK's city on wheels: burning streets, the sidewalk run, Pipe Street,
   GROK-MART, the camps, the four-way that goes wrong, the bad part of town, the GROK Crusher... and the castle gates.
   The city is a real street grid. The route is a list of corners; everything else (streets, buildings, side streets
   that dead-end in rubble) is built around it. The kart uses the normal kart physics with its own ground + walls. */
var S4=null;
const S4K={G:120,RD:8,WK:4.5,BRD:12,BWK:5,DS:2,STUB:34,KR:.8,KS:.62,CS:.72,BOT:.45,RUN:.65,CURB:.22,VIEW:520};
const S4DIFF={chill:{hp:7,cc:100,chase:.8,inv:1.9,fire:.7,boss:.86,react:1.25},normal:{hp:5,cc:150,chase:.87,inv:1.45,fire:1,boss:1,react:1},spicy:{hp:4,cc:150,chase:.93,inv:1.15,fire:1.3,boss:1.12,react:.82}};
/* the corners of the route (x, z, deck height) */
const S4N=[[0,-900,24],[0,-560,24],[0,-250,0],[0,0],[0,360],[-360,360],[-360,720],[-180,720],[-180,840],[120,840],[120,1200],[480,1200],[480,2160],[840,2160],[840,2760],[1080,2760],[1080,3000],[1080,3190]];
/* the segment that runs from each corner to the next */
const S4SEG=[
  {k:'deck',hw:10,wk:0,zone:'deck',name:'THE RUNWAY'},
  {k:'ramp',hw:10,wk:0,zone:'deck'},
  {k:'street',zone:'edge',name:'FOUNTAIN CITY'},
  {k:'street',zone:'burn',name:'BURNING STREETS'},
  {k:'street',zone:'burn',name:'THE SIDEWALK RUN'},
  {k:'street',zone:'pipe',name:'PIPE STREET'},
  {k:'street',zone:'burn'},
  {k:'hall',hw:7,wk:0,zone:'mall',name:'GROK-MART'},
  {k:'street',zone:'camp',name:'GROK CAMPS'},
  {k:'street',zone:'camp'},
  {k:'street',zone:'dark',name:'THE BAD PART'},
  {k:'blvd',zone:'dark',name:'GRAND AVENUE'},
  {k:'street',zone:'boss'},
  {k:'blvd',zone:'boss'},
  {k:'street',zone:'calm'},
  {k:'street',zone:'calm'},
  {k:'plaza',hw:46,wk:0,zone:'castle',name:'THE CASTLE GATES'}];
for(const sg of S4SEG){if(sg.hw==null){sg.hw=sg.k==='blvd'?S4K.BRD:S4K.RD;sg.wk=sg.k==='blvd'?S4K.BWK:S4K.WK;}sg.W=sg.hw+sg.wk;}
/* special blocks (grid cells, by their low corner) */
const S4LOTS={'-120,840':['campA','z0'],'0,720':['campB','z1'],'120,960':['campC','x0']};
const S4SPECIAL={'-240,720':'mall','0,1200':'collapse'};
const s4GridX=x=>Math.abs(x/S4K.G-Math.round(x/S4K.G))<1e-6;

/* ---------- the smoothed centre line (one sample every 2 m) ---------- */
function s4Dir(i){const a=S4N[i],b=S4N[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);return [dx/L,dz/L,L];}
function s4Turn(i){if(i<=0||i>=S4N.length-1)return 0;const a=s4Dir(i-1),b=s4Dir(i);return Math.abs(a[0]*b[1]-a[1]*b[0])>.5?(a[0]*b[1]-a[1]*b[0]>0?-1:1):0;}
function s4SegY(i,f){const a=S4N[i],b=S4N[i+1],ya=a[2]||0,yb=b[2]||0;if(ya===yb)return ya;const u=clamp(f,0,1);return lerp(ya,yb,u*u*(3-2*u));}
function s4BuildPath(){const DS=S4K.DS,RC=15,P={x:[],z:[],y:[],h:[],s:[],seg:[],n:0},n=S4N.length;let s=0,px=null,pz=null;
  const push=(x,z,y,sg)=>{if(px!=null)s+=Math.hypot(x-px,z-pz);P.x.push(x);P.z.push(z);P.y.push(y);P.seg.push(sg);P.s.push(s);px=x;pz=z;};
  for(let i=0;i<n-1;i++){const [dx,dz,L]=s4Dir(i),a=S4N[i],b=S4N[i+1];
    const r0=s4Turn(i)?RC:0,r1=s4Turn(i+1)?RC:0;
    for(let t=r0;t<L-r1-1e-6;t+=DS)push(a[0]+dx*t,a[1]+dz*t,s4SegY(i,t/L),i);
    if(r1){const [ex,ez]=s4Dir(i+1),cx=b[0]-dx*r1+ex*r1,cz=b[1]-dz*r1+ez*r1,steps=Math.ceil(Math.PI/2*r1/DS);
      for(let k=0;k<steps;k++){const th=k/steps*Math.PI/2;push(cx-ex*r1*Math.cos(th)+dx*r1*Math.sin(th),cz-ez*r1*Math.cos(th)+dz*r1*Math.sin(th),0,k<steps/2?i:i+1);}}
    else if(i===n-2)push(b[0],b[1],b[2]||0,i);}
  P.n=P.x.length;
  for(let i=0;i<P.n;i++){const a=Math.max(0,i-1),b=Math.min(P.n-1,i+1);P.h.push(Math.atan2(P.x[b]-P.x[a],P.z[b]-P.z[a]));}
  P.L=s;
  /* s at each corner */
  P.ns=S4N.map(nd=>{let bd=1e18,bi=0;for(let i=0;i<P.n;i++){const d=(P.x[i]-nd[0])**2+(P.z[i]-nd[1])**2;if(d<bd){bd=d;bi=i;}}return P.s[bi];});
  /* coarse grid for searches without a hint */
  P.grid=new Map();for(let i=0;i<P.n;i+=2){const k=Math.floor(P.x[i]/40)+','+Math.floor(P.z[i]/40);if(!P.grid.has(k))P.grid.set(k,[]);P.grid.get(k).push(i);}
  return P;}
const S4Q={i:0,s:0,lat:0,d:0,h:0,y:0,x:0,z:0};
/* nearest point on the centre line. hint = a path index near the answer (fast), or -1 to search */
function s4Near(x,z,hint,out){const P=S4.path,o=out||S4Q;let a,b;
  if(hint==null||hint<0){let bi=-1,bd=1e18;const cx=Math.floor(x/40),cz=Math.floor(z/40);
    for(let r=0;r<4&&bi<0;r++){for(let ix=cx-r;ix<=cx+r;ix++)for(let iz=cz-r;iz<=cz+r;iz++){const L=P.grid.get(ix+','+iz);if(!L)continue;for(const i of L){const d=(P.x[i]-x)**2+(P.z[i]-z)**2;if(d<bd){bd=d;bi=i;}}}}
    if(bi<0){for(let i=0;i<P.n;i+=4){const d=(P.x[i]-x)**2+(P.z[i]-z)**2;if(d<bd){bd=d;bi=i;}}}a=Math.max(0,bi-6);b=Math.min(P.n-1,bi+6);}
  else{a=Math.max(0,hint-24);b=Math.min(P.n-1,hint+24);}
  let bi=a,bd=1e18;for(let i=a;i<=b;i++){const d=(P.x[i]-x)**2+(P.z[i]-z)**2;if(d<bd){bd=d;bi=i;}}
  let best=1e9;o.i=bi;o.s=P.s[bi];o.lat=0;o.h=P.h[bi];o.y=P.y[bi];o.x=P.x[bi];o.z=P.z[bi];
  for(let j=bi-1;j<=bi;j++){if(j<0||j>=P.n-1)continue;const ax=P.x[j],az=P.z[j],ex=P.x[j+1]-ax,ez=P.z[j+1]-az,L=Math.hypot(ex,ez)||1,t=clamp(((x-ax)*ex+(z-az)*ez)/(L*L),0,1),qx=ax+ex*t,qz=az+ez*t,d=Math.hypot(x-qx,z-qz);
    if(d<best){best=d;o.i=j;o.s=P.s[j]+L*t;o.x=qx;o.z=qz;o.y=lerp(P.y[j],P.y[j+1],t);o.h=Math.atan2(ex,ez);o.lat=((x-qx)*(-ez)+(z-qz)*ex)/L;}}
  o.d=best;return o;}
/* point on the centre line at distance s, pushed sideways by lat (+ = right) */
function s4At(s,lat,out){const P=S4.path,o=out||{x:0,z:0,h:0,y:0,i:0};s=clamp(s,0,P.L);let lo=0,hi=P.n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P.s[m]<=s)lo=m;else hi=m;}
  const t=hi>lo?(s-P.s[lo])/Math.max(1e-6,P.s[hi]-P.s[lo]):0,x=lerp(P.x[lo],P.x[hi],t),z=lerp(P.z[lo],P.z[hi],t),ex=P.x[hi]-P.x[lo],ez=P.z[hi]-P.z[lo],L=Math.hypot(ex,ez)||1;
  o.h=L>1e-6?Math.atan2(ex,ez):P.h[lo];const fx=Math.sin(o.h),fz=Math.cos(o.h);o.x=x-fz*(lat||0);o.z=z+fx*(lat||0);o.y=lerp(P.y[lo],P.y[hi],t);o.i=lo;return o;}
/* s at a segment + metres along it */
function s4S(seg,t){return S4.path.ns[seg]+t;}

/* ---------- where you can drive: a union of rectangles (streets, crossings, side streets, lots, the mall hall) ---------- */
function s4Rect(x0,x1,z0,z1,o){const r=Object.assign({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),ax:'z',rh:0,cx:0,elev:null,kind:'street',on:true},o||{});S4.rects.push(r);return r;}
function s4Rects(){S4.rects=[];S4.stubs=[];S4.closed=[];S4.lots={};const G=S4K.G,bottle=new Set(S4PLAN.bottles),kept=new Set();
  for(let i=0;i<S4SEG.length;i++){const sg=S4SEG[i],a=S4N[i],b=S4N[i+1],[dx,dz,L]=s4Dir(i),W=sg.W;
    const e0=i===0?24:(sg.k==='ramp'?5:W),e1=(sg.k==='deck')?5:(sg.k==='ramp'?0:W);
    const ax=Math.abs(dx)>.5?'x':'z';
    let x0,x1,z0,z1;if(ax==='z'){x0=a[0]-W;x1=a[0]+W;const lo=Math.min(a[1],b[1]),hi=Math.max(a[1],b[1]),back=dz>0?e0:e1,fwd=dz>0?e1:e0;z0=lo-back;z1=hi+fwd;}
    else{z0=a[1]-W;z1=a[1]+W;const lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]),back=dx>0?e0:e1,fwd=dx>0?e1:e0;x0=lo-back;x1=hi+fwd;}
    const r=s4Rect(x0,x1,z0,z1,{ax,rh:sg.hw,cx:ax==='z'?a[0]:a[1],seg:i,kind:sg.k});
    if(sg.k==='deck'||sg.k==='ramp'){r.elev=i;r.rh=99;}
    if(sg.k==='hall'||sg.k==='plaza')r.rh=99;
    /* crossings in the middle of the segment */
    if(sg.k==='street'||sg.k==='blvd'){const lo=ax==='z'?Math.min(a[1],b[1]):Math.min(a[0],b[0]),hi=ax==='z'?Math.max(a[1],b[1]):Math.max(a[0],b[0]),line=ax==='z'?a[0]:a[1];
      if(s4GridX(line))for(let g=Math.ceil((lo+1)/G)*G;g<hi-1;g+=G){if(g<lo+20||g>hi-20)continue;for(const side of[-1,1]){const x=ax==='z'?line:g,z=ax==='z'?g:line,vx=ax==='z'?side:0,vz=ax==='z'?0:side;
        /* no turn here: close the side street with a building, unless a hidden bottle lives down it */
        const sd=(-dz*vx+dx*vz)>0?'+':'-',tag='s'+i+sd;if(bottle.has(tag)&&!kept.has(tag)){kept.add(tag);s4Stub(x,z,vx,vz,W,i,'cross');}else S4.closed.push({x,z,vx,vz,W,seg:i});}}}}
  /* corners: the two streets you do not take */
  for(let i=1;i<S4N.length-1;i++){const sgA=S4SEG[i-1],sgB=S4SEG[i];if(sgA.k==='deck'||sgA.k==='ramp'||sgB.k==='plaza')continue;const [dx,dz]=s4Dir(i-1),[ex,ez]=s4Dir(i),n=S4N[i];
    const W=Math.max(sgA.W,sgB.W);
    for(const [vx,vz] of[[1,0],[-1,0],[0,1],[0,-1]]){if(Math.abs(vx+dx)<.1&&Math.abs(vz+dz)<.1)continue;if(Math.abs(vx-ex)<.1&&Math.abs(vz-ez)<.1)continue;
      const street=Math.abs(vx)>.5?s4GridX(n[1]):s4GridX(n[0]);if(!street)continue;
      if(sgB.k==='hall'||sgA.k==='hall'){s4Stub(n[0],n[1],vx,vz,W,i,'dead');continue;}
      if(i!==10&&!s4Turn(i)){S4.closed.push({x:n[0],z:n[1],vx,vz,W,seg:i});continue;}/* straight through: close it */
      s4Stub(n[0],n[1],vx,vz,W,i,i===10?'collapse':'corner');}}
  /* lots you can drive through (the GROK camps), the mall alcove, the plaza */
  for(const k in S4LOTS){const [lx,lz]=k.split(',').map(Number),[id,side]=S4LOTS[k],e={x0:0,x1:0,z0:0,z1:0};e[side]=side[1]==='0'?-6:6;
    S4.lots[id]=s4Rect(lx+12.5+e.x0,lx+G-12.5+e.x1,lz+12.5+e.z0,lz+G-12.5+e.z1,{kind:'lot',rh:99,lot:id,bx:lx,bz:lz});}
  s4Rect(-201,-185,768,792,{kind:'alcove',rh:99});
  /* grid hash */
  S4.rgrid=new Map();for(const r of S4.rects){for(let gx=Math.floor(r.x0/60);gx<=Math.floor(r.x1/60);gx++)for(let gz=Math.floor(r.z0/60);gz<=Math.floor(r.z1/60);gz++){const k=gx+','+gz;if(!S4.rgrid.has(k))S4.rgrid.set(k,[]);S4.rgrid.get(k).push(r);}}}
/* a side street: starts on the centre line (so it overlaps the street) and runs W+STUB metres out */
function s4Stub(x,z,vx,vz,W,seg,kind){const hw=S4K.RD,wk=S4K.WK,SW=hw+wk,len=W+(kind==='collapse'?16:S4K.STUB);
  let r;if(Math.abs(vx)>.5)r=s4Rect(x,x+vx*len,z-SW,z+SW,{ax:'x',rh:hw,cx:z,kind:'stub'});else r=s4Rect(x-SW,x+SW,z,z+vz*len,{ax:'z',rh:hw,cx:x,kind:'stub'});
  const st={x,z,vx,vz,W,len,seg,kind,r,ex:x+vx*len,ez:z+vz*len};S4.stubs.push(st);return st;}
function s4RectsAt(x,z){return S4.rgrid.get(Math.floor(x/60)+','+Math.floor(z/60))||[];}
/* deck and ramp height (the deck is up in the air; everything else is the city floor at y=0) */
function s4ElevY(r,x,z){const i=r.elev,a=S4N[i],b=S4N[i+1];return s4SegY(i,clamp((z-a[1])/(b[1]-a[1]),0,1));}
/* ground: road at 0, sidewalks a curb higher. on=false outside everything */
const S4G={y:0,on:false,walk:false,r:null};
function s4Floor(x,z){const L=s4RectsAt(x,z);let inRoad=false,inAny=false,el=null;
  for(const r of L){if(!r.on||x<r.x0||x>r.x1||z<r.z0||z>r.z1)continue;inAny=true;if(r.elev!=null){el=r;break;}
    const lat=r.ax==='z'?Math.abs(x-r.cx):Math.abs(z-r.cx);if(lat<=r.rh)inRoad=true;}
  S4G.on=inAny;S4G.r=el;
  if(el){S4G.y=s4ElevY(el,x,z);S4G.walk=false;return S4G;}
  S4G.walk=inAny&&!inRoad;S4G.y=S4G.walk?S4K.CURB:0;
  if(S4.raise)for(const q of S4.raise){if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1){S4G.y=Math.max(S4G.y,q.y);}}
  return S4G;}
function s4Ground(o){const f=s4Floor(o.x,o.z);o.off=false;o.wet=false;if(!f.on){const q=s4Near(o.x,o.z,o.s4i!=null?o.s4i:-1);return q.y;}return f.y;}
/* push a circle back inside the drivable area. returns the push normal (or null) */
const S4W={nx:0,nz:0,d:0};
function s4Inside(x,z,R){for(const r of s4RectsAt(x,z)){if(!r.on)continue;if(x>=r.x0+R&&x<=r.x1-R&&z>=r.z0+R&&z<=r.z1-R)return true;}return false;}
function s4Wall(o,R){if(s4Inside(o.x,o.z,R))return null;let bx=o.x,bz=o.z,bd=1e18;
  const cand=new Set();for(let gx=Math.floor((o.x-60)/60);gx<=Math.floor((o.x+60)/60);gx++)for(let gz=Math.floor((o.z-60)/60);gz<=Math.floor((o.z+60)/60);gz++){const L=S4.rgrid.get(gx+','+gz);if(L)for(const r of L)cand.add(r);}
  for(const r of cand){if(!r.on)continue;const px=clamp(o.x,r.x0+R,r.x1-R),pz=clamp(o.z,r.z0+R,r.z1-R),d=(px-o.x)**2+(pz-o.z)**2;if(d<bd){bd=d;bx=px;bz=pz;}}
  if(bd>=1e17)return null;const d=Math.sqrt(bd);if(d<1e-6)return null;S4W.nx=(o.x-bx)/d;S4W.nz=(o.z-bz)/d;S4W.d=d;o.x=bx;o.z=bz;return S4W;}

/* ---------- solid things on the road: circles and boxes, in a grid ---------- */
function s4Col(c){c.on=c.on!==false;c.top=c.top==null?6:c.top;const R=c.r!=null?c.r:Math.hypot(c.hx||0,c.hz||0);c.R=R;
  for(let gx=Math.floor((c.x-R)/30);gx<=Math.floor((c.x+R)/30);gx++)for(let gz=Math.floor((c.z-R)/30);gz<=Math.floor((c.z+R)/30);gz++){const k=gx+','+gz;if(!S4.cgrid.has(k))S4.cgrid.set(k,[]);S4.cgrid.get(k).push(c);}
  S4.cols.push(c);return c;}
function s4ColBox(x,z,hx,hz,yaw,o){return s4Col(Object.assign({x,z,hx,hz,yaw:yaw||0,box:true},o||{}));}
function s4ColsNear(x,z,out){out.length=0;const seen=S4.cseen;S4.cstamp=(S4.cstamp||0)+1;for(let gx=Math.floor((x-6)/30);gx<=Math.floor((x+6)/30);gx++)for(let gz=Math.floor((z-6)/30);gz<=Math.floor((z+6)/30);gz++){const L=S4.cgrid.get(gx+','+gz);if(!L)continue;for(const c of L){if(c.stamp===S4.cstamp)continue;c.stamp=S4.cstamp;out.push(c);}}return out;}
/* resolve one circle against one collider: moves o, returns overlap normal */
const S4H={nx:0,nz:0,pen:0};
function s4Hit(o,R,c){if(!c.on)return null;if(c.box){const cs=Math.cos(c.yaw),sn=Math.sin(c.yaw),dx=o.x-c.x,dz=o.z-c.z,lx=dx*cs-dz*sn,lz=dx*sn+dz*cs,qx=clamp(lx,-c.hx,c.hx),qz=clamp(lz,-c.hz,c.hz);
    let ex=lx-qx,ez=lz-qz,d=Math.hypot(ex,ez);if(d>=R)return null;
    if(d<1e-6){const px=c.hx-Math.abs(lx),pz=c.hz-Math.abs(lz);if(px<pz){ex=Math.sign(lx)||1;ez=0;d=-px;}else{ex=0;ez=Math.sign(lz)||1;d=-pz;}const pen=R-d;const wx=ex*cs+ez*sn,wz=-ex*sn+ez*cs;o.x+=wx*pen;o.z+=wz*pen;S4H.nx=wx;S4H.nz=wz;S4H.pen=pen;return S4H;}
    const nx=ex/d,nz=ez/d,pen=R-d,wx=nx*cs+nz*sn,wz=-nx*sn+nz*cs;o.x+=wx*pen;o.z+=wz*pen;S4H.nx=wx;S4H.nz=wz;S4H.pen=pen;return S4H;}
  const dx=o.x-c.x,dz=o.z-c.z,d=Math.hypot(dx,dz),RR=R+c.r;if(d>=RR)return null;const nx=d>1e-6?dx/d:1,nz=d>1e-6?dz/d:0,pen=RR-d;o.x+=nx*pen;o.z+=nz*pen;S4H.nx=nx;S4H.nz=nz;S4H.pen=pen;return S4H;}
