
/* ---------- geometry buckets: thousands of boxes merged into one mesh per material per city chunk ---------- */
function s4Bk(){return {p:[],n:[],u:[],c:[],i:[]};}
const S4C=[1,1,1];
function s4Tint(r,g,b){S4C[0]=r;S4C[1]=g;S4C[2]=b;return S4C;}
/* one quad (a,b,c,d counter-clockwise seen from the front), uv per corner */
function s4Quad(B,a,b,c,d,ua,ub,uc,ud,col){const ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2],fx=d[0]-a[0],fy=d[1]-a[1],fz=d[2]-a[2];
  let nx=ey*fz-ez*fy,ny=ez*fx-ex*fz,nz=ex*fy-ey*fx;const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;const C=col||S4C;
  const o=B.p.length/3;B.i.push(o,o+1,o+2,o,o+2,o+3);/* 4 shared corners + 6 indices instead of 6 loose corners */
  for(const [v,uv] of[[a,ua],[b,ub],[c,uc],[d,ud]]){B.p.push(v[0],v[1],v[2]);B.n.push(nx,ny,nz);B.u.push(uv[0],uv[1]);B.c.push(C[0],C[1],C[2]);}}
/* a box: centre (x,y,z), size (w,h,d), turned by yaw. tu/tv = metres per texture repeat (sides use width and height).
   faces: bit mask 1:+x 2:-x 4:+y 8:-y 16:+z 32:-z. uo/vo = uv offset, vs = v scale (for atlas rows) */
function s4Box(B,x,y,z,w,h,d,yaw,tu,tv,col,faces,o){const cs=Math.cos(yaw||0),sn=Math.sin(yaw||0),hw=w/2,hh=h/2,hd=d/2,F=faces==null?63:faces;tu=tu||4;tv=tv||tu;
  const uo=o&&o.uo||0,vo=o&&o.vo||0,vs=o&&o.vs!=null?o.vs:1,vtop=o&&o.vtop;
  const P=(lx,ly,lz)=>[x+lx*cs+lz*sn,y+ly,z-lx*sn+lz*cs];
  const V=(v)=>vo+v*vs;
  /* +z face */if(F&16){const a=P(-hw,-hh,hd),b=P(hw,-hh,hd),c=P(hw,hh,hd),dd=P(-hw,hh,hd),U=w/tu,Vv=vtop?1:h/tv;s4Quad(B,a,b,c,dd,[uo,V(0)],[uo+U,V(0)],[uo+U,V(Vv)],[uo,V(Vv)],col);}
  /* -z */if(F&32){const a=P(hw,-hh,-hd),b=P(-hw,-hh,-hd),c=P(-hw,hh,-hd),dd=P(hw,hh,-hd),U=w/tu,Vv=vtop?1:h/tv;s4Quad(B,a,b,c,dd,[uo,V(0)],[uo+U,V(0)],[uo+U,V(Vv)],[uo,V(Vv)],col);}
  /* +x */if(F&1){const a=P(hw,-hh,hd),b=P(hw,-hh,-hd),c=P(hw,hh,-hd),dd=P(hw,hh,hd),U=d/tu,Vv=vtop?1:h/tv;s4Quad(B,a,b,c,dd,[uo,V(0)],[uo+U,V(0)],[uo+U,V(Vv)],[uo,V(Vv)],col);}
  /* -x */if(F&2){const a=P(-hw,-hh,-hd),b=P(-hw,-hh,hd),c=P(-hw,hh,hd),dd=P(-hw,hh,-hd),U=d/tu,Vv=vtop?1:h/tv;s4Quad(B,a,b,c,dd,[uo,V(0)],[uo+U,V(0)],[uo+U,V(Vv)],[uo,V(Vv)],col);}
  /* +y */if(F&4){const a=P(-hw,hh,hd),b=P(hw,hh,hd),c=P(hw,hh,-hd),dd=P(-hw,hh,-hd);s4Quad(B,a,b,c,dd,[0,0],[w/tu,0],[w/tu,d/tu],[0,d/tu],col);}
  /* -y */if(F&8){const a=P(-hw,-hh,-hd),b=P(hw,-hh,-hd),c=P(hw,-hh,hd),dd=P(-hw,-hh,hd);s4Quad(B,a,b,c,dd,[0,0],[w/tu,0],[w/tu,d/tu],[0,d/tu],col);}}
/* any THREE geometry, moved by a matrix */
const S4M4=new THREE.Matrix4(),S4E=new THREE.Euler(),S4V=new V3(),S4NM=new THREE.Matrix3();
function s4Geo(B,geo,x,y,z,rx,ry,rz,sx,sy,sz,col,uvS){const g=geo,P=g.attributes.position,Nn=g.attributes.normal,U=g.attributes.uv,C=col||S4C;
  S4E.set(rx||0,ry||0,rz||0,'YXZ');S4M4.makeRotationFromEuler(S4E);S4M4.scale(S4V.set(sx||1,sy==null?(sx||1):sy,sz==null?(sx||1):sz));S4M4.setPosition(x,y,z);S4NM.getNormalMatrix(S4M4);const e=S4M4.elements,ne=S4NM.elements,us=uvS||1;
  const o=B.p.length/3,ix=g.index;if(ix)for(let i=0;i<ix.count;i++)B.i.push(o+ix.getX(i));else for(let i=0;i<P.count;i++)B.i.push(o+i);
  for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i),pz=P.getZ(i);B.p.push(e[0]*px+e[4]*py+e[8]*pz+e[12],e[1]*px+e[5]*py+e[9]*pz+e[13],e[2]*px+e[6]*py+e[10]*pz+e[14]);
    const nx=Nn.getX(i),ny=Nn.getY(i),nz=Nn.getZ(i);let ax=ne[0]*nx+ne[3]*ny+ne[6]*nz,ay=ne[1]*nx+ne[4]*ny+ne[7]*nz,az=ne[2]*nx+ne[5]*ny+ne[8]*nz;const L=Math.hypot(ax,ay,az)||1;B.n.push(ax/L,ay/L,az/L);
    if(U)B.u.push(U.getX(i)*us,U.getY(i)*us);else B.u.push(0,0);B.c.push(C[0],C[1],C[2]);}
}
function s4BkMesh(B,mat,free){if(!B.p.length)return null;const g=new THREE.BufferGeometry(),nv=B.p.length/3;
  /* compact: normals as bytes, colours as bytes (when they fit), 16-bit indices when they fit */
  const N=new Int8Array(B.n.length);for(let i=0;i<N.length;i++)N[i]=Math.round(Math.max(-1,Math.min(1,B.n[i]))*127);
  let cmax=0;for(let i=0;i<B.c.length;i++)if(B.c[i]>cmax)cmax=B.c[i];
  g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3,true));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));
  if(cmax<=1){const Cc=new Uint8Array(B.c.length);for(let i=0;i<Cc.length;i++)Cc[i]=Math.round(Math.max(0,B.c[i])*255);g.setAttribute('color',new THREE.BufferAttribute(Cc,3,true));}
  else g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));
  g.setIndex(new THREE.BufferAttribute(nv<65536?new Uint16Array(B.i):new Uint32Array(B.i),1));g.computeBoundingSphere();
  /* chunk meshes are never read back on the CPU: once the GPU has them, let the browser drop its copy */
  if(free){const drop=function(){this.array=null;};for(const k in g.attributes)g.attributes[k].onUpload(drop);g.index.onUpload(drop);}
  const m=new THREE.Mesh(g,mat);return m;}
/* the city is cut into 240 m chunks; each chunk has one bucket per material */
function s4Bucket(x,z,mat){const k=Math.floor(x/240)+','+Math.floor(z/240);let ch=S4.chunks.get(k);if(!ch){ch={k,cx:(Math.floor(x/240)+.5)*240,cz:(Math.floor(z/240)+.5)*240,bk:{},g:null,vis:true};S4.chunks.set(k,ch);}
  let b=ch.bk[mat];if(!b)b=ch.bk[mat]=s4Bk();return b;}

/* ---------- textures ---------- */
let S4MAT=null;
function s4Noise(g,w,h,a,seed,sz){const r=rng(seed||1);for(let i=0;i<w*h/(sz||6);i++){g.fillStyle='rgba('+(r()<.5?'0,0,0':'255,255,255')+','+(r()*a)+')';const s=1+r()*(sz||2);g.fillRect(r()*w,r()*h,s,s);}}
function s4Streak(g,x,y,w,h,a){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(20,16,12,'+a+')');gr.addColorStop(1,'rgba(20,16,12,0)');g.fillStyle=gr;g.fillRect(x,y,w,h);}
/* one facade = 4 bays x 4 floors (12 m x 14 m). returns colour + glow maps */
function s4Facade(style,seed){const W=512,H=512,r=rng(seed),lit=[],emi=document.createElement('canvas');emi.width=W;emi.height=H;const e=emi.getContext('2d');e.fillStyle='#000';e.fillRect(0,0,W,H);
  const col=mkCanvas(W,H,(g)=>{
    const base={brick:'#8b4a36',conc:'#a39d92',glass:'#3d4a58',cream:'#d6c3a0',apt:'#7d93a2',grok:'#1d2129',burnt:'#2e2a28',red:'#9a4636'}[style]||'#999';
    g.fillStyle=base;g.fillRect(0,0,W,H);
    if(style==='brick'||style==='red'){for(let y=0;y<H;y+=10){const off=(y/10)%2?12:0;for(let x=-24;x<W;x+=24){const t=r();g.fillStyle='rgba('+(t<.5?'40,18,10':'190,110,80')+','+(r()*.22)+')';g.fillRect(x+off,y,23,9);}g.fillStyle='rgba(210,190,170,.35)';g.fillRect(0,y+9,W,1);}}
    else if(style==='cream'||style==='conc'||style==='apt'){s4Noise(g,W,H,.08,seed+3,3);g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=2;for(let y=0;y<H;y+=128){g.beginPath();g.moveTo(0,y+124);g.lineTo(W,y+124);g.stroke();}if(style==='conc')for(let x=0;x<W;x+=128){g.beginPath();g.moveTo(x+1,0);g.lineTo(x+1,H);g.stroke();}}
    else if(style==='grok'){for(let y=0;y<H;y+=64)for(let x=0;x<W;x+=64){g.fillStyle='rgba(255,255,255,'+(.02+r()*.04)+')';g.fillRect(x+2,y+2,60,60);g.fillStyle='rgba(0,0,0,.4)';for(const [px,py] of[[6,6],[58,6],[6,58],[58,58]])g.fillRect(x+px-1,y+py-1,3,3);}}
    else if(style==='burnt'){s4Noise(g,W,H,.2,seed+5,4);}
    for(let fl=0;fl<4;fl++)for(let b=0;b<4;b++){const x=b*128,y=fl*128,v=r();
      if(style==='glass'){for(let px=0;px<2;px++)for(let py=0;py<2;py++){const qx=x+px*64,qy=y+py*64+(py?6:0),gw=60,gh=py?52:58;const gr=g.createLinearGradient(qx,qy,qx+gw,qy+gh);const tone=.5+r()*.4;
          gr.addColorStop(0,'rgba('+Math.round(110*tone)+','+Math.round(150*tone)+','+Math.round(180*tone)+',1)');gr.addColorStop(.55,'rgba('+Math.round(60*tone)+','+Math.round(84*tone)+','+Math.round(104*tone)+',1)');gr.addColorStop(1,'rgba('+Math.round(150*tone)+','+Math.round(170*tone)+','+Math.round(190*tone)+',1)');
          g.fillStyle=gr;g.fillRect(qx+2,qy+2,gw,gh);const L=r();if(L<.07){e.fillStyle=L<.02?'#5ff0ff':'#ffc985';e.globalAlpha=.55;e.fillRect(qx+2,qy+2,gw,gh);e.globalAlpha=1;}if(r()<.05){g.fillStyle='#0b0d12';g.beginPath();g.moveTo(qx+10,qy+4);g.lineTo(qx+gw,qy+20);g.lineTo(qx+30,qy+gh);g.lineTo(qx+4,qy+30);g.fill();}}
        g.fillStyle='#22262e';g.fillRect(x,y+120,128,8);continue;}
      const wx=x+(style==='apt'?16:24),wy=y+(style==='apt'?20:22),ww=style==='apt'?96:80,wh=style==='apt'?76:78;
      /* frame + sill */
      const frame={brick:'#e8e2d4',red:'#e8e2d4',conc:'#8c9098',cream:'#fbf4e4',apt:'#dfe6ea',grok:'#0c0e14',burnt:'#141110'}[style];
      g.fillStyle=frame;g.fillRect(wx-6,wy-6,ww+12,wh+12);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(wx-8,wy+wh+6,ww+16,6);
      if(style==='brick'||style==='red'){g.fillStyle='#c8b8a0';g.fillRect(wx-10,wy-14,ww+20,8);}
      let kind=v<.08?'board':v<.16?'broken':v<.2?'dark':'glass';if(style==='burnt')kind=v<.5?'burnt':v<.75?'broken':'board';if(style==='grok')kind='slit';
      if(kind==='glass'){const gr=g.createLinearGradient(wx,wy,wx+ww,wy+wh);gr.addColorStop(0,'#3a4656');gr.addColorStop(.5,'#232b36');gr.addColorStop(1,'#56657a');g.fillStyle=gr;g.fillRect(wx,wy,ww,wh);
        g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(wx+8,wy+wh);g.lineTo(wx+30,wy);g.lineTo(wx+44,wy);g.lineTo(wx+22,wy+wh);g.fill();g.fillStyle=frame;g.fillRect(wx+ww/2-2,wy,4,wh);g.fillRect(wx,wy+wh*.45,ww,4);
        if(r()<.35){g.fillStyle=['#c9a46a','#9ab0c0','#d8d0c0','#a86a5a'][(r()*4)|0];g.fillRect(wx+2,wy+2,ww*.32,wh-4);g.fillRect(wx+ww*.68-2,wy+2,ww*.32,wh-4);}
        const L=r();if(L<(style==='conc'?.1:.13)){const c=L<.02?'#5ff0ff':L<.05?'#ff9a4a':'#ffd08a';e.fillStyle=c;e.globalAlpha=.85;e.fillRect(wx,wy,ww,wh);e.globalAlpha=1;g.fillStyle='rgba(255,220,160,.5)';g.fillRect(wx,wy,ww,wh);}}
      else if(kind==='dark'){g.fillStyle='#14161c';g.fillRect(wx,wy,ww,wh);}
      else if(kind==='board'){g.fillStyle='#8a6a44';g.fillRect(wx,wy,ww,wh);g.strokeStyle='rgba(40,25,10,.6)';g.lineWidth=2;for(let k=0;k<5;k++){g.beginPath();g.moveTo(wx,wy+k*wh/5);g.lineTo(wx+ww,wy+k*wh/5);g.stroke();}g.fillStyle='#6a4a2a';g.save();g.translate(wx+ww/2,wy+wh/2);g.rotate(.5);g.fillRect(-ww*.7,-5,ww*1.4,10);g.restore();}
      else if(kind==='broken'){g.fillStyle='#0c0d10';g.fillRect(wx,wy,ww,wh);g.fillStyle='rgba(120,140,160,.5)';for(let k=0;k<3;k++){g.beginPath();g.moveTo(wx+r()*ww,wy);g.lineTo(wx+r()*ww,wy+r()*wh*.6);g.lineTo(wx+r()*ww,wy);g.fill();}}
      else if(kind==='burnt'){g.fillStyle='#090807';g.fillRect(wx,wy,ww,wh);s4Streak(g,wx-10,wy-60,ww+20,60,.0);g.fillStyle='rgba(10,8,6,.85)';g.beginPath();g.moveTo(wx-8,wy);g.quadraticCurveTo(wx+ww/2,wy-90,wx+ww+8,wy);g.fill();
        if(r()<.32){const gr=e.createRadialGradient(wx+ww/2,wy+wh*.7,4,wx+ww/2,wy+wh*.6,ww*.7);gr.addColorStop(0,'#ffd27a');gr.addColorStop(.5,'#ff6a1a');gr.addColorStop(1,'#000');e.fillStyle=gr;e.fillRect(wx,wy,ww,wh);}}
      else if(kind==='slit'){g.fillStyle='#07080c';g.fillRect(wx+10,wy+20,ww-20,16);const c=r()<.7?'#3ee0ff':'#ff2a3a';e.fillStyle=c;e.fillRect(wx+12,wy+22,ww-24,12);g.fillStyle=c;g.globalAlpha=.6;g.fillRect(wx+12,wy+22,ww-24,12);g.globalAlpha=1;
        if(b===0){e.fillStyle='#ff2a3a';e.fillRect(x+2,y,4,128);g.fillStyle='#a01822';g.fillRect(x+2,y,4,128);}}
      if(style!=='glass'&&style!=='grok')s4Streak(g,wx,wy+wh+12,ww,40,style==='burnt'?.5:.18);
      if(style==='apt'&&r()<.4){g.fillStyle='#c8ccd0';g.fillRect(wx+ww-30,wy+wh-26,26,20);g.fillStyle='#8a9094';for(let k=0;k<4;k++)g.fillRect(wx+ww-27,wy+wh-23+k*4,20,1);}
      if(style==='cream'){g.fillStyle=['#3a6a5a','#4a5a8a','#8a3a3a'][(seed>>1)%3];g.fillRect(wx-22,wy-4,14,wh+8);g.fillRect(wx+ww+8,wy-4,14,wh+8);}}
    if(style!=='glass'&&style!=='grok'){for(let i=0;i<6;i++){const x=r()*W;s4Streak(g,x,r()*H*.6,8+r()*20,120+r()*200,.12);}}
    if(style==='burnt'){for(let i=0;i<10;i++){const x=r()*W,y=r()*H;const gr=g.createRadialGradient(x,y,4,x,y,80+r()*80);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-160,y-160,320,320);}}});
  return {map:tex(col,true),emi:tex(emi,true)};}
/* storefronts: 8 rows (one per kind), 12 m wide each, 4.6 m tall */
const S4SHOPS=8;
function s4ShopTex(){const W=512,RH=128,H=RH*S4SHOPS,emi=document.createElement('canvas');emi.width=W;emi.height=H;const e=emi.getContext('2d');e.fillStyle='#000';e.fillRect(0,0,W,H);
  const col=mkCanvas(W,H,(g)=>{const r=rng(77);
    for(let row=0;row<S4SHOPS;row++){const y=row*RH,base=['#3a3f48','#6a4a3a','#2f4a3e','#5a3a44','#3c3c42','#7a6a4a','#2a2e36','#4a3426'][row];g.fillStyle=base;g.fillRect(0,y,W,RH);
      for(let b=0;b<2;b++){const x=b*256;
        if(row===1||row===5){/* roll-down shutter with graffiti */g.fillStyle='#8c9096';g.fillRect(x+16,y+18,224,104);g.fillStyle='rgba(0,0,0,.18)';for(let k=0;k<26;k++)g.fillRect(x+16,y+20+k*4,224,1.5);
          g.font='bold 30px Impact, sans-serif';g.textAlign='center';g.textBaseline='middle';const tags=['NO GROK','TUNG!','H2O?','RESIST','WATER=LIFE','TRALALERO WAS HERE'];g.save();g.translate(x+128,y+70);g.rotate(-.06);g.lineWidth=5;g.strokeStyle='#141414';g.fillStyle=['#ff4a5a','#ffd23f','#3ee0ff','#7dff4a'][(r()*4)|0];const t=tags[(r()*tags.length)|0];g.strokeText(t,0,0,200);g.fillText(t,0,0,200);g.restore();continue;}
        if(row===3){/* boarded */g.fillStyle='#a07a4c';g.fillRect(x+16,y+18,224,104);g.strokeStyle='rgba(50,30,10,.6)';g.lineWidth=2;for(let k=0;k<8;k++){g.beginPath();g.moveTo(x+16+k*28,y+18);g.lineTo(x+16+k*28,y+122);g.stroke();}g.fillStyle='#ff4a3a';g.font='bold 22px Impact, sans-serif';g.textAlign='center';g.fillText(b?'CLOSED':'NO WATER',x+128,y+76);continue;}
        /* display window + door */
        g.fillStyle='#1a1d22';g.fillRect(x+12,y+14,232,110);
        const gr=g.createLinearGradient(x,y+18,x+180,y+122);gr.addColorStop(0,row===7?'#0c0a08':'#425060');gr.addColorStop(.6,row===7?'#1a1410':'#1e2630');gr.addColorStop(1,row===7?'#2a1a10':'#5a6c80');g.fillStyle=gr;g.fillRect(x+18,y+20,150,96);g.fillRect(x+180,y+20,58,100);
        g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(x+30,y+116);g.lineTo(x+70,y+20);g.lineTo(x+86,y+20);g.lineTo(x+46,y+116);g.fill();
        g.fillStyle='#9aa0a8';g.fillRect(x+206,y+64,6,14);g.fillStyle='#22262c';g.fillRect(x+18,y+108,150,12);
        if(row===7){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x+18,y+20,220,100);const gr2=e.createRadialGradient(x+90,y+100,6,x+90,y+80,90);gr2.addColorStop(0,'#ffb04a');gr2.addColorStop(1,'#000');e.fillStyle=gr2;e.fillRect(x+18,y+20,150,96);}
        else if(r()<.45){g.fillStyle=['#e8c060','#c06a6a','#7ab0c0','#d8d8d0'][(r()*4)|0];for(let k=0;k<5;k++)g.fillRect(x+26+k*28,y+78-r()*30,20,40);}
        if(row===0||row===4){/* broken glass */g.fillStyle='rgba(8,8,10,.9)';g.beginPath();g.moveTo(x+40+r()*40,y+20);g.lineTo(x+150,y+30+r()*40);g.lineTo(x+120,y+116);g.lineTo(x+30,y+90);g.fill();}
        if(row===2||row===6){if(r()<.8){const c=row===2?'#ff3a5a':'#3ee0ff';e.fillStyle=c;e.font='bold 22px Impact, sans-serif';e.textAlign='center';e.fillText(row===2?'OPEN':'GROK',x+92,y+48);g.fillStyle=c;g.font='bold 22px Impact, sans-serif';g.textAlign='center';g.fillText(row===2?'OPEN':'GROK',x+92,y+48);}}}
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,y+RH-6,W,6);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,y,W,4);}});
  return {map:tex(col,true),emi:tex(emi,true)};}
/* shop signs: a 2 x 32 atlas of 512x64 boards */
const S4SIGNS=['BOMBARDIRO PIZZA','FOUNTAIN CAFE','LAUNDROMAT','HARDWARE','BAKERY','PHARMACY','BOOKS & MORE','ARCADE','NOODLE BAR','FLOWERS','BARBER','DONUTS','DINER 24/7','GROCERY','TOYS','RECORDS',
  'ICE CREAM','SUSHI','TACOS','FOUNTAIN BANK','HOTEL','CINEMA','GYM','PET SHOP','CANDY','BANANINI JUICE','DELI','CAPPUCCINA CAFE','LIRILI ZOO SHOP','TUNG TUNG DRUMS','SHOE REPAIR','TAILOR',
  'GROK WATER™ $99/L','GROK STORE','OBEY GROK','WATER: SOLD OUT','GROK ZONE','NO WATER TODAY','GROK-MART','GROK BANK','SODA FOUNTAIN','BOWLING','PIANO SHOP','HAT SHOP','MUSEUM','POST OFFICE','ART SUPPLY','THRIFT',
  'GARAGE','HOT DOGS','POPCORN','SPORTS','PHOTO','KEYS CUT','SPICES','TEA HOUSE','BIKES','PAWN','DENTIST','KARAOKE','PRINT SHOP','GAMES','BAGELS','FOUNTAIN NEWS'];
function s4SignTex(){const W=1024,H=2048,emi=document.createElement('canvas');emi.width=W;emi.height=H;const e=emi.getContext('2d');e.fillStyle='#000';e.fillRect(0,0,W,H);
  const col=mkCanvas(W,H,(g)=>{const r=rng(21);for(let i=0;i<64;i++){const cx=(i%2)*512,cy=Math.floor(i/2)*64,t=S4SIGNS[i],grok=/GROK|OBEY|SOLD OUT|NO WATER/.test(t);
    const bg=grok?'#0c0f1e':['#c03a2a','#1e5a8a','#2a7a4a','#e8b030','#6a3a8a','#fffaf0','#14123a','#c86a2a'][i%8],fg=grok?(t.includes('GROK')?'#3ee0ff':'#ff3a4a'):(bg==='#fffaf0'||bg==='#e8b030'?'#14123a':'#fffaf0');
    g.fillStyle=bg;g.fillRect(cx,cy,512,64);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=4;g.strokeRect(cx+2,cy+2,508,60);g.fillStyle=fg;g.font='40px Bungee, Impact, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,cx+256,cy+34,480);
    if(grok||r()<.25){e.fillStyle=fg;e.font='40px Bungee, Impact, sans-serif';e.textAlign='center';e.textBaseline='middle';e.globalAlpha=grok?.9:.5;e.fillText(t,cx+256,cy+34,480);e.globalAlpha=1;}
    g.fillStyle='rgba(0,0,0,'+(r()*.25)+')';g.fillRect(cx,cy,512,64);}});
  return {map:tex(col,false),emi:tex(emi,false)};}
function s4Mats(){if(S4MAT)return S4MAT;const M3=s3Mats(),std=M3.std,C=c=>linC(c),M=S4MAT={std,bas:M3.bas,add:M3.add,sign:M3.sign};
  const fac=(style,seed,o)=>{const t=s4Facade(style,seed);const m=std(Object.assign({map:t.map,emissiveMap:t.emi,emissive:new THREE.Color(1,1,1),emissiveIntensity:style==='burnt'?1.4:1,roughness:.86,vertexColors:true},o||{}));return m;};
  M.fac={brick:fac('brick',11),red:fac('red',29),conc:fac('conc',13),glass:fac('glass',17,{roughness:.2,metalness:.55,envMapIntensity:1.3}),cream:fac('cream',19),apt:fac('apt',23),grok:fac('grok',31,{roughness:.4,metalness:.6}),burnt:fac('burnt',37)};
  {const t=s4ShopTex();M.shop=std({map:t.map,emissiveMap:t.emi,emissive:new THREE.Color(1,1,1),emissiveIntensity:1,roughness:.6,vertexColors:true});}
  {const t=s4SignTex();t.map.encoding=THREE.sRGBEncoding;M.signs=std({map:t.map,emissiveMap:t.emi,emissive:new THREE.Color(1,1,1),emissiveIntensity:.9,roughness:.55,side:THREE.DoubleSide});}
  M.awn=std({map:tex(mkCanvas(256,256,(g,w,h)=>{const P=[['#c8302a','#fffaf0'],['#2a6a3a','#f2e6c8'],['#1e4a8a','#fffaf0'],['#e8a020','#7a3010'],['#6a2a6a','#f0d8f0'],['#2a2a2e','#c8c8c8'],['#c86a2a','#fff0d8'],['#0c0f1e','#3ee0ff']];for(let k=0;k<8;k++){for(let x=0;x<w;x+=32){g.fillStyle=P[k][(x/32)%2];g.fillRect(x,k*32,32,32);}g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,k*32+26,w,6);}}),true),roughness:.85,side:THREE.DoubleSide,vertexColors:true});
  M.roof=std({map:tex(mkCanvas(256,256,(g,w,h)=>{g.fillStyle='#5e5a56';g.fillRect(0,0,w,h);s4Noise(g,w,h,.25,4,2);g.strokeStyle='rgba(20,20,20,.35)';g.lineWidth=3;for(let i=0;i<6;i++){g.beginPath();g.moveTo(Math.random()*w,0);g.lineTo(Math.random()*w,h);g.stroke();}}),true),roughness:.95,vertexColors:true});
  const concT=tex(mkCanvas(256,256,(g,w,h)=>{g.fillStyle='#b4aea4';g.fillRect(0,0,w,h);s4Noise(g,w,h,.16,9,3);g.strokeStyle='rgba(60,50,40,.25)';g.lineWidth=1.5;const r=rng(5);for(let i=0;i<10;i++){let x=r()*w,y=r()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x+=(r()-.5)*40;y+=(r()-.5)*40;g.lineTo(x,y);}g.stroke();}}),true);
  M.conc=std({map:concT,roughness:.92,vertexColors:true});
  M.metal=std({color:C(0x7c838e),metalness:.75,roughness:.38,vertexColors:true});M.dark=std({color:C(0x24262c),metalness:.4,roughness:.55,vertexColors:true});
  M.rust=std({color:C(0x7a4228),metalness:.35,roughness:.82,vertexColors:true});M.wood=std({color:C(0x7a5634),roughness:.88,vertexColors:true});
  M.rubble=std({map:concT,roughness:.96,vertexColors:true,flatShading:true});
  M.char=std({color:C(0x1c1a19),roughness:.95,metalness:.15,vertexColors:true});
  M.glassD=std({color:C(0x1d2630),metalness:.55,roughness:.15,vertexColors:true});
  M.rubber=std({color:C(0x161618),roughness:.9});
  M.paint=std({color:C(0xeeeae0),roughness:.8,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,vertexColors:true});
  M.yellow=std({color:C(0xf2c230),roughness:.7,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,vertexColors:true});
  /* car paint (vertex colour = paint colour) */
  M.car=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,metalness:.55,roughness:.32,clearcoat:.8,clearcoatRoughness:.2});M.car.userData.lin=true;
  M.grokM=M3.grok;M.grokD=M3.grokD;M.cyan=M3.cyan;M.red=M3.red;M.orange=M3.orange;M.white=M3.whiteB;
  M.glow=(c,op)=>M3.add(c,op);
  /* road surfaces */
  const asph=(w,h,lines)=>tex(mkCanvas(w,h,(g)=>{g.fillStyle='#45464b';g.fillRect(0,0,w,h);const r=rng(w+h+(lines?lines.length:0));for(let i=0;i<w*h/10;i++){const v=r();g.fillStyle=v<.5?'rgba(20,20,24,'+r()*.35+')':'rgba(160,160,165,'+r()*.12+')';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
    for(let i=0;i<5;i++){const x=r()*w,y=r()*h,rr=20+r()*50;const gr=g.createRadialGradient(x,y,2,x,y,rr);gr.addColorStop(0,'rgba(10,10,12,.35)');gr.addColorStop(1,'rgba(10,10,12,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
    if(lines)for(const L of lines){g.fillStyle=L.c;if(L.dash){for(let y=0;y<h;y+=L.dash*2)g.fillRect(L.x-L.w/2,y,L.w,L.dash);}else g.fillRect(L.x-L.w/2,0,L.w,h);}
    g.strokeStyle='rgba(15,14,14,.65)';g.lineWidth=2;for(let i=0;i<7;i++){let x=r()*w,y=r()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-.5)*50;y+=r()*40;g.lineTo(x,y);}g.stroke();}
    g.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<3;i++){g.fillRect(r()*w,r()*h,30+r()*60,20+r()*50);}}),true);
  /* 16 m street: 32 px per metre */
  const s=32,Wy='#e8b830',Ww='#e6e2d6';
  M.road=std({map:asph(512,512,[{x:256-6,w:5,c:Wy},{x:256+6,w:5,c:Wy},{x:128,w:5,c:Ww,dash:64},{x:384,w:5,c:Ww,dash:64},{x:10,w:6,c:Ww},{x:502,w:6,c:Ww}]),roughness:.93});
  M.blvd=std({map:asph(384,384,[{x:12,w:5,c:Wy},{x:128,w:5,c:Ww,dash:48},{x:256,w:5,c:Ww,dash:48},{x:374,w:6,c:Ww}]),roughness:.93});
  M.asph=std({map:asph(256,256,null),roughness:.94});
  M.deck=std({map:tex(mkCanvas(640,512,(g,w,h)=>{g.fillStyle='#8c8780';g.fillRect(0,0,w,h);s4Noise(g,w,h,.2,3,3);g.fillStyle='#e6e2d6';g.fillRect(20,0,6,h);g.fillRect(w-26,0,6,h);g.fillStyle=Wy;g.fillRect(w/2-7,0,5,h);g.fillRect(w/2+2,0,5,h);for(let y=0;y<h;y+=96){g.fillStyle=Ww;g.fillRect(w*.25,y,5,48);g.fillRect(w*.75,y,5,48);}
    g.fillStyle='rgba(40,36,32,.4)';for(let y=0;y<h;y+=128)g.fillRect(0,y,w,3);const r=rng(8);g.strokeStyle='rgba(30,26,22,.6)';g.lineWidth=2;for(let i=0;i<9;i++){let x=r()*w,y=r()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x+=(r()-.5)*60;y+=r()*50;g.lineTo(x,y);}g.stroke();}}),true),roughness:.92});
  M.walk=std({map:tex(mkCanvas(128,128,(g,w,h)=>{g.fillStyle='#b5ad9f';g.fillRect(0,0,w,h);g.strokeStyle='rgba(60,50,40,.35)';g.lineWidth=2;for(let i=0;i<=w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}s4Noise(g,w,h,.15,12,2);}),true),roughness:.9,vertexColors:true});
  M.curb=std({color:C(0x8e897f),roughness:.9,vertexColors:true});
  M.tile=std({map:tex(mkCanvas(256,256,(g,w,h)=>{for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){g.fillStyle=((x+y)/32)%2?'#cfcac0':'#a8a39a';g.fillRect(x,y,32,32);}s4Noise(g,w,h,.2,6,3);for(let i=0;i<8;i++){const x=Math.random()*w,y=Math.random()*h;const gr=g.createRadialGradient(x,y,2,x,y,40);gr.addColorStop(0,'rgba(40,30,20,.35)');gr.addColorStop(1,'rgba(40,30,20,0)');g.fillStyle=gr;g.fillRect(x-40,y-40,80,80);}}),true),roughness:.4,metalness:.05});
  M.paver=std({map:tex(mkCanvas(256,256,(g,w,h)=>{g.fillStyle='#a89a86';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){const off=(y/32)%2?32:0;for(let x=-64;x<w;x+=64){g.fillStyle='rgba('+(Math.random()<.5?'60,50,40':'220,210,190')+','+(.08+Math.random()*.12)+')';g.fillRect(x+off+1,y+1,62,30);}}g.strokeStyle='rgba(50,40,30,.4)';g.lineWidth=2;for(let y=0;y<=h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}s4Noise(g,w,h,.15,8,2);}),true),roughness:.88});
  M.dirt=std({map:tex(mkCanvas(256,256,(g,w,h)=>{g.fillStyle='#8a7258';g.fillRect(0,0,w,h);s4Noise(g,w,h,.3,14,3);}),true),roughness:.97});
  M.manhole=std({map:tex(mkCanvas(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#3a3836';g.beginPath();g.arc(64,64,60,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=4;for(let k=0;k<6;k++){g.beginPath();g.arc(64,64,12+k*9,0,7);g.stroke();}g.fillStyle='#55524e';g.font='bold 16px Impact';g.textAlign='center';g.fillText('FOUNTAIN',64,68);}),false),transparent:true,roughness:.6,metalness:.5,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  M.puddle=new THREE.MeshPhysicalMaterial({color:C(0x2a3440),roughness:.05,metalness:.2,clearcoat:1,transparent:true,opacity:.8,alphaMap:tex(mkCanvas(128,128,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);const r=rng(5);for(let i=0;i<5;i++){const x=40+r()*48,y=40+r()*48,rr=22+r()*22,gr=g.createRadialGradient(x,y,2,x,y,rr);gr.addColorStop(0,'#fff');gr.addColorStop(.7,'#ddd');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}}),false,false),depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5});M.puddle.userData.lin=true;
  M.scorch=new THREE.MeshBasicMaterial({map:tex(mkCanvas(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(0,0,0,.85)');gr.addColorStop(.6,'rgba(10,8,6,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}),false),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});M.scorch.userData.lin=true;
  M.water=std({color:C(0x2aa6ff),emissive:C(0x0a5a90),emissiveIntensity:.9,roughness:.08,metalness:.1,transparent:true,opacity:.82});
  M.lampOn=M3.bas(0xffe2a8);M.lampF1=M3.bas(0xffe2a8);M.lampF2=M3.bas(0xffd090);M.lampOff=std({color:C(0x3a3a36),roughness:.4});M.lampOn.vertexColors=M.lampF1.vertexColors=M.lampF2.vertexColors=true;
  M.sigR=M3.bas(0xff3a2a);M.sigY=M3.bas(0xffb020);M.sigOff=std({color:C(0x1e1e22),roughness:.3});M.sigR.vertexColors=M.sigY.vertexColors=true;
  M.cyanV=M3.bas(0x3ee0ff);M.cyanV.vertexColors=true;M.redV=M3.bas(0xff2a3a);M.redV.vertexColors=true;
  M.fence=std({map:tex(mkCanvas(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#9aa0a8';g.lineWidth=2;for(let i=-64;i<128;i+=12){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke();g.beginPath();g.moveTo(i+64,0);g.lineTo(i,64);g.stroke();}}),true),transparent:true,alphaTest:.4,side:THREE.DoubleSide,metalness:.6,roughness:.4,vertexColors:true});
  M.tarp=std({color:C(0x2f6fb0),roughness:.85,side:THREE.DoubleSide,vertexColors:true});
  M.cloth=std({color:C(0xffffff),roughness:.9,side:THREE.DoubleSide,vertexColors:true});
  M.stone=std({map:tex(mkCanvas(256,256,(g,w,h)=>{g.fillStyle='#3a3640';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){const off=(y/32)%2?24:0;for(let x=-48;x<w;x+=48){g.fillStyle='rgba('+(Math.random()<.5?'10,8,16':'120,110,130')+','+(.1+Math.random()*.2)+')';g.fillRect(x+off+2,y+2,44,28);}}s4Noise(g,w,h,.2,17,3);}),true),roughness:.9,vertexColors:true});
  return M;}
