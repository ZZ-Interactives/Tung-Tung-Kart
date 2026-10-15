
/* ---------- streets: pieces between junctions, junction squares, corner pads, crosswalks ---------- */
/* a "piece" is a straight street (route segment or side street). a "junction" is where pieces meet.
   Every junction covers [-A,A] x [-B,B] around its centre: a road square [-a,a] x [-b,b], the road bands of its arms,
   sidewalk strips where an arm is missing, and four corner pads. Pieces stop their sidewalks at the junction edge. */
function s4StreetNet(){const pcs=[],J=new Map(),jk=(x,z)=>Math.round(x)+','+Math.round(z);
  const junc=(x,z)=>{const k=jk(x,z);let j=J.get(k);if(!j){j={x,z,arms:{},k};J.set(k,j);}return j;};
  const arm=(j,dir,hw,W,kind)=>{const a=j.arms[dir];if(!a||a.W<W)j.arms[dir]={hw,W,kind};};
  const dirName=(vx,vz)=>vx>.5?'+x':vx<-.5?'-x':vz>.5?'+z':'-z';
  for(let i=0;i<S4SEG.length;i++){const sg=S4SEG[i];if(sg.k!=='street'&&sg.k!=='blvd')continue;const a=S4N[i],b=S4N[i+1],[dx,dz]=s4Dir(i);
    const p={x0:a[0],z0:a[1],x1:b[0],z1:b[1],dx,dz,hw:sg.hw,wk:sg.wk,W:sg.W,blvd:sg.k==='blvd',seg:i,zone:sg.zone};pcs.push(p);
    if(i>=3){arm(junc(a[0],a[1]),dirName(dx,dz),sg.hw,sg.W,sg.k);}
    if(S4SEG[i+1]&&S4SEG[i+1].k!=='plaza')arm(junc(b[0],b[1]),dirName(-dx,-dz),sg.hw,sg.W,sg.k);}
  /* the mall hall opens one arm at each end */
  arm(junc(S4N[7][0],S4N[7][1]),'+z',7,7,'hall');arm(junc(S4N[8][0],S4N[8][1]),'-z',7,7,'hall');
  for(const st of S4.stubs){arm(junc(st.x,st.z),dirName(st.vx,st.vz),S4K.RD,S4K.RD+S4K.WK,'stub');
    pcs.push({x0:st.x,z0:st.z,x1:st.ex,z1:st.ez,dx:st.vx,dz:st.vz,hw:S4K.RD,wk:S4K.WK,W:S4K.RD+S4K.WK,stub:st,zone:S4SEG[Math.min(st.seg,S4SEG.length-1)].zone,deadEnd:true});}
  /* segments also pass straight through crossings: register both arms there */
  for(const p of pcs){if(p.stub)continue;for(const j of J.values()){const along=Math.abs(p.dx)>.5?(Math.abs(j.z-p.z0)<.5&&j.x>Math.min(p.x0,p.x1)+.5&&j.x<Math.max(p.x0,p.x1)-.5):(Math.abs(j.x-p.x0)<.5&&j.z>Math.min(p.z0,p.z1)+.5&&j.z<Math.max(p.z0,p.z1)-.5);
      if(along){const k=p.blvd?'blvd':'street';arm(j,dirName(p.dx,p.dz),p.hw,p.W,k);arm(j,dirName(-p.dx,-p.dz),p.hw,p.W,k);}}}
  S4.pieces=pcs;S4.junctions=[...J.values()];
  for(const j of S4.junctions){const zA=[j.arms['+z'],j.arms['-z']].filter(Boolean),xA=[j.arms['+x'],j.arms['-x']].filter(Boolean);
    j.a=zA.length?Math.max(...zA.map(v=>v.hw)):8;j.A=zA.length?Math.max(...zA.map(v=>v.W)):S4K.RD+S4K.WK;
    j.b=xA.length?Math.max(...xA.map(v=>v.hw)):8;j.B=xA.length?Math.max(...xA.map(v=>v.W)):S4K.RD+S4K.WK;
    if(j.A<j.a)j.A=j.a;if(j.B<j.b)j.B=j.b;}
  return pcs;}
/* junctions sitting on a piece, as distances along it */
function s4PieceStops(p){const L=Math.hypot(p.x1-p.x0,p.z1-p.z0),out=[];for(const j of S4.junctions){const t=(j.x-p.x0)*p.dx+(j.z-p.z0)*p.dz,q=Math.abs((j.x-p.x0)*(-p.dz)+(j.z-p.z0)*p.dx);if(q<.5&&t>-.5&&t<L+.5)out.push({t,j});}out.sort((a,b)=>a.t-b.t);return {L,stops:out};}
/* a flat rectangle w (across) x l (along the yaw direction) */
function s4Flat(mat,x,z,y,w,l,yaw,tu,tv,col){const B=s4Bucket(x,z,mat),cs=Math.cos(yaw),sn=Math.sin(yaw),hw=w/2,hl=l/2;
  const P=(lx,lz)=>[x+lx*cs+lz*sn,y,z-lx*sn+lz*cs];s4Quad(B,P(-hw,hl),P(hw,hl),P(hw,-hl),P(-hw,-hl),[0,l/tv],[w/tu,l/tv],[w/tu,0],[0,0],col);}
function s4BuildStreets(){const M=s4Mats(),pcs=s4StreetNet(),WC=s4Tint(.95,.94,.9);
  const ext=(j,along)=>along==='x'?j.a:j.b,extW=(j,along)=>along==='x'?j.A:j.B;
  for(const p of pcs){const {L,stops}=s4PieceStops(p),along=Math.abs(p.dx)>.5?'x':'z',yaw=Math.atan2(p.dx,p.dz),mid=t=>[p.x0+p.dx*t,p.z0+p.dz*t],rx=-p.dz,rz=p.dx;p.L=L;p.stops=stops;p.yaw=yaw;
    const gapsOf=cuts=>{const g=[];let cur=0;for(const c of cuts){if(c[0]>cur)g.push([cur,c[0]]);cur=Math.max(cur,c[1]);}if(L>cur)g.push([cur,L]);return g.filter(q=>q[1]-q[0]>.3);};
    const gaps=gapsOf(stops.map(s=>[s.t-ext(s.j,along),s.t+ext(s.j,along)]));p.gaps=gaps;
    for(const [ga,gb] of gaps){const [cx,cz]=mid((ga+gb)/2),len=gb-ga;
      if(p.blvd){const cw=p.hw-.8;for(const sd of[-1,1]){const o=sd*(p.hw+.8)/2;s4Flat('blvd',cx+rx*o,cz+rz*o,.02,cw,len,yaw+(sd<0?Math.PI:0),cw,12);}}
      else s4Flat('road',cx,cz,.02,p.hw*2,len,yaw,16,16);}
    /* sidewalks + curbs, both sides, stopping at every junction */
    const wg=gapsOf(stops.map(s=>[s.t-extW(s.j,along),s.t+extW(s.j,along)]));
    for(const sd of[-1,1]){const off=p.hw+p.wk/2,ci=p.hw+.12;
      for(const [a,b] of wg){const [cx,cz]=mid((a+b)/2),len=b-a,x=cx+rx*sd*off,z=cz+rz*sd*off;s4Box(s4Bucket(x,z,'walk'),x,S4K.CURB/2,z,p.wk,S4K.CURB,len,yaw,4,4,null,4|16|32);
        const xc=cx+rx*sd*ci,zc=cz+rz*sd*ci;s4Box(s4Bucket(xc,zc,'curb'),xc,S4K.CURB/2+.01,zc,.26,S4K.CURB+.02,len,yaw,2,2,null,1|2|4);}
      /* the curb also runs past a junction on a side with no arm */}
    /* boulevard median (cut at junctions), with planters */
    if(p.blvd){for(const [ga,gb] of gaps){const a=ga+3,b=gb-3;if(b-a<4)continue;const [cx,cz]=mid((a+b)/2);s4Box(s4Bucket(cx,cz,'curb'),cx,.14,cz,1.6,.28,b-a,yaw,2,2);
        for(let t=a+10;t<b-8;t+=30){const [px,pz]=mid(t);s4Box(s4Bucket(px,pz,'conc'),px,.5,pz,1.5,1,3.2,yaw,2,2,s4Tint(.9,.88,.84));s4Box(s4Bucket(px,pz,'dirt'),px,1.01,pz,1.2,.02,2.9,yaw,3,3,null,4);
          s4DeadTree(px,pz,1.05,3.5+Math.random()*2);s4ColBox(px,pz,.8,1.7,yaw,{kind:'planter',top:1.1});}}}
    /* crosswalks + stop lines just outside each junction square */
    for(const s of stops){const j=s.j;for(const dir of[-1,1]){const tt=s.t+dir*(ext(j,along)+1.7);if(tt<0||tt>L)continue;
        const [cx,cz]=mid(tt),n=Math.floor(p.hw*2/1.4);for(let k=0;k<n;k++){const o=-p.hw+.7+k*1.4;s4Flat('paint',cx+rx*o,cz+rz*o,.035,.75,2.6,yaw,1,1,WC);}
        const ts=s.t+dir*(ext(j,along)+3.7);if(ts>0&&ts<L){const [sx,sz]=mid(ts),so=-dir*p.hw/2;s4Flat('paint',sx+rx*so,sz+rz*so,.036,p.hw-.4,.45,yaw,1,1,WC);}}}
    /* manholes, scorch marks, puddles */
    for(let t=10;t<L-6;t+=18+Math.random()*30){if(stops.some(s=>Math.abs(s.t-t)<ext(s.j,along)+4))continue;const [cx,cz]=mid(t),o=(Math.random()-.5)*p.hw*1.4,x=cx+rx*o,z=cz+rz*o;
      const v=Math.random();if(v<.35)s4Flat('manhole',x,z,.04,1.3,1.3,yaw,1.3,1.3);else if(v<.7)S4.decals.push([x,z,Math.random()*6,1.5+Math.random()*2.5,'scorch']);else S4.decals.push([x,z,Math.random()*6,1+Math.random()*2,'puddle']);}}
  /* junctions */
  for(const j of S4.junctions){const hasHall=Object.values(j.arms).some(a=>a.kind==='hall');
    s4Box(s4Bucket(j.x,j.z,'asph'),j.x,.01,j.z,j.a*2,.02,j.b*2,0,8,8,null,4);
    for(const [dir,vx,vz] of[['+x',1,0],['-x',-1,0],['+z',0,1],['-z',0,-1]]){const am=j.arms[dir];
      const w=vx?(j.A-j.a):(j.B-j.b),len=vx?j.b*2:j.a*2,cx=j.x+vx*(j.a+w/2),cz=j.z+vz*(j.b+w/2);if(w<.2)continue;
      if(am&&am.kind==='hall'){s4Box(s4Bucket(cx,cz,'asph'),cx,.01,cz,vx?w:len,.02,vx?len:w,0,8,8,null,4);continue;}
      if(am)continue;/* the arm's own piece draws its road there */
      s4Box(s4Bucket(cx,cz,'walk'),cx,S4K.CURB/2,cz,vx?w:len,S4K.CURB,vx?len:w,0,4,4,null,63);
      const ex=j.x+vx*(j.a+.12),ez=j.z+vz*(j.b+.12);s4Box(s4Bucket(ex,ez,'curb'),ex,S4K.CURB/2+.01,ez,vx?.26:len,S4K.CURB+.02,vx?len:.26,0,2,2,null,63);}
    for(const [qx,qz] of[[1,1],[1,-1],[-1,1],[-1,-1]]){const w=j.A-j.a,d=j.B-j.b;if(w<.2||d<.2)continue;const ax=j.arms[qx>0?'+x':'-x'],az=j.arms[qz>0?'+z':'-z'];
      if((ax&&ax.kind==='hall')||(az&&az.kind==='hall'))continue;
      const cx=j.x+qx*(j.a+w/2),cz=j.z+qz*(j.b+d/2);s4Box(s4Bucket(cx,cz,'walk'),cx,S4K.CURB/2,cz,w,S4K.CURB,d,0,4,4,null,63);
      if(az)s4Box(s4Bucket(cx,cz,'curb'),j.x+qx*(j.a+.12),S4K.CURB/2+.01,cz,.26,S4K.CURB+.02,d,0,2,2,null,63);
      if(ax)s4Box(s4Bucket(cx,cz,'curb'),cx,S4K.CURB/2+.01,j.z+qz*(j.b+.12),w,S4K.CURB+.02,.26,0,2,2,null,63);}}}
/* a dead tree in a grate (merged) */
function s4DeadTree(x,z,y,h){const B=s4Bucket(x,z,'wood'),col=s4Tint(.55,.45,.36);s4Geo(B,new THREE.CylinderGeometry(.12,.2,h,6),x,y+h/2,z,0,0,(Math.random()-.5)*.12,1,1,1,col);
  const r=rng(((x*31+z*17)|0)>>>0);for(let k=0;k<5;k++){const a=r()*6.28,l=1+r()*1.6,yy=y+h*(.5+r()*.45);s4Geo(B,new THREE.CylinderGeometry(.04,.08,l,4),x+Math.cos(a)*l*.35,yy+l*.3,z+Math.sin(a)*l*.35,Math.sin(a)*.9,0,-Math.cos(a)*.9,1,1,1,col);}}
