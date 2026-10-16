
/* ---------- buildings ---------- */
const S4BB=['GROK WATER™\n$99 / LITER','STAY HYDRATED\n(YOU CAN\'T)','DRINK GROK\nOBEY GROK','THE CASTLE\nIS WATCHING','FOUNTAIN CITY\nWATER RATIONED','GROK LOVES YOU\n(NO WATER)'];
function s4MatOf(k){const M=s4Mats();if(k.startsWith('fac.'))return M.fac[k.slice(4)];if(k.startsWith('bb.')){const i=+k.slice(3);if(!M.bb)M.bb=[];if(!M.bb[i]){const t=M.sign(S4BB[i],['#0c0f1e','#c03a2a','#14123a','#2b2650','#1e7a44','#0c0f1e'][i],i===3?'#ff3a4a':'#fffaf0',768,320,74);M.bb[i]=t;}return M.bb[i];}
  if(k==='banner'){if(!M.banner){M.banner=M.std({map:tex(mkCanvas(128,512,(g,w,h)=>{g.fillStyle='#14101a';g.fillRect(0,0,w,h);g.fillStyle='#c01a2a';g.fillRect(0,0,w,40);g.fillRect(0,h-60,w,60);g.strokeStyle='#ff3a4a';g.lineWidth=6;g.beginPath();g.arc(64,200,40,0,7);g.stroke();g.fillStyle='#3ee0ff';g.beginPath();g.arc(64,200,16,0,7);g.fill();
      g.fillStyle='#fffaf0';g.font='30px Bungee, Impact, sans-serif';g.textAlign='center';g.save();g.translate(64,330);g.fillText('G',0,0);g.fillText('R',0,34);g.fillText('O',0,68);g.fillText('K',0,102);g.restore();}),false),side:THREE.DoubleSide,roughness:.8,emissive:linC(0x200000),emissiveIntensity:.6});}return M.banner;}
  return M[k];}
const S4STY={edge:['brick','cream','red','conc'],burn:['brick','conc','apt','cream','red','glass','burnt'],pipe:['conc','brick','red','conc'],mall:['conc'],camp:['brick','apt','burnt','conc','red'],dark:['grok','grok','burnt','conc','glass'],boss:['glass','conc','apt','grok','brick'],calm:['cream','brick','apt','glass','red'],castle:['grok']};
function s4Bldg(o){const r=rng(o.seed>>>0),fx=Math.sin(o.yaw),fz=Math.cos(o.yaw),rxw=Math.cos(o.yaw),rzw=-Math.sin(o.yaw),w=o.w,d=o.d,h=o.h,cx=o.x-fx*d/2,cz=o.z-fz*d/2,yaw=o.yaw;
  let style=o.style;const dmg=o.damage||'',burnt=style==='burnt';
  const t0=.86+r()*.18,tint=[t0*(.94+r()*.1),t0*(.94+r()*.08),t0*(.92+r()*.1)];if(dmg)for(let i=0;i<3;i++)tint[i]*=.78;const col=s4Tint(tint[0],tint[1],tint[2]);const colA=[col[0],col[1],col[2]];
  const Bf=s4Bucket(cx,cz,'fac.'+style),shopH=o.shop?4.4:0;
  const L=(lx,ly,lz)=>[cx+lx*rxw+lz*fx,ly,cz+lx*rzw+lz*fz];/* local -> world */
  /* body: one box, or two if a chunk is missing */
  let cut=null;if(dmg==='chunk'&&h>14&&w>10){const sd=r()<.5?-1:1,cw=w*(.32+r()*.2),hc=Math.max(shopH+5,h*(.38+r()*.3));cut={sd,cw,hc};}
  if(!cut){s4Box(Bf,cx,h/2,cz,w,h,d,yaw,12,14,colA,1|2|32);s4Box(Bf,cx+fx*0,shopH+(h-shopH)/2,cz,w,h-shopH,d,yaw,12,14,colA,16);}
  else{const {sd,cw,hc}=cut,wB=w-cw,oB=-sd*cw/2;
    s4Box(Bf,cx,hc/2,cz,w,hc,d,yaw,12,14,colA,1|2|32);s4Box(Bf,cx,shopH+(hc-shopH)/2,cz,w,hc-shopH,d,yaw,12,14,colA,16);
    const bx=cx+rxw*oB,bz=cz+rzw*oB;s4Box(Bf,bx,hc+(h-hc)/2,bz,wB,h-hc,d,yaw,12,14,colA,63&~(sd>0?1:2)&~4);
    /* the broken side shows the inside: bare concrete, floor slabs sticking out, rebar */
    const inner=s4Bucket(cx,cz,'conc'),ic=s4Tint(.42,.4,.38),ix=cx+rxw*(oB+sd*wB/2-sd*.05),iz=cz+rzw*(oB+sd*wB/2-sd*.05);
    s4Box(inner,ix,hc+(h-hc)/2,iz,.1,h-hc,d-.2,yaw,4,4,ic,sd>0?1:2);
    const rub=s4Bucket(cx,cz,'rubble'),rb=s4Bucket(cx,cz,'rust');
    for(let y=hc+3.5;y<h;y+=3.5){const len=.6+r()*cw*.75,lx=sd*(w/2-cw)+sd*len/2;const p=L(lx,y,0);s4Box(inner,p[0],y,p[2],len,.3,d*(.5+r()*.45),yaw,4,4,s4Tint(.6,.58,.55));
      for(let k=0;k<4;k++){const q=L(sd*(w/2-cw+len)+sd*.4,y,(r()-.5)*d*.7);s4Geo(rb,new THREE.CylinderGeometry(.04,.04,1.2,4),q[0],y+.1,q[2],(r()-.5)*.8,0,Math.PI/2*sd+(r()-.5)*.6,1,1,1,s4Tint(.6,.36,.2));}}
    for(let k=0;k<9;k++){const q=L(sd*(w/2-cw*r()),hc+.4,(r()-.5)*d*.8),s=.8+r()*1.6;s4Geo(rub,s4Rock(),q[0],hc+s*.3,q[2],r()*3,r()*3,r()*3,s,s*.6,s,s4Tint(.5+r()*.2,.48+r()*.2,.45+r()*.2));}
    for(let k=0;k<2;k++){const y=hc+1.5+r()*(h-hc-2);const q=L(sd*(w/2-cw-.2),y,(r()-.5)*d*.6);S4.fires.push({x:q[0],y,z:q[2],s:1+r()*1.2,b:1});}
    if(r()<.7){const q=L(sd*(w/2-cw*.5),hc,0);S4.plumes.push({x:q[0],y:hc+2,z:q[2],s:1+r()});}}
  /* storefront band */
  if(o.shop){const row=burnt?7:(o.shopRow!=null?o.shopRow:(r()*S4SHOPS)|0),Bs=s4Bucket(cx,cz,'shop');const p=L(0,shopH/2,d/2+.03);
    s4Box(Bs,p[0],shopH/2,p[2],w,shopH,.02,yaw,12,4.6,colA,16,{vo:1-(row+1)/S4SHOPS,vs:1/S4SHOPS,vtop:true});
    const lp=L(0,shopH,d/2+.25);s4Box(s4Bucket(cx,cz,'conc'),lp[0],shopH+.12,lp[2],w+.3,.35,.5,yaw,4,4,s4Tint(tint[0]*.9,tint[1]*.88,tint[2]*.85));
    const units=Math.max(1,Math.round(w/6.2)),uw=w/units;
    for(let u=0;u<units;u++){const ux=-w/2+uw*(u+.5);
      if(r()<.55&&!burnt){const aw=s4Bucket(cx,cz,'awn'),ar=(r()*8)|0,v0=1-(ar+1)/8,v1=1-ar/8,hw=uw/2-.35;
        const a=L(ux-hw,4.15,d/2+.05),b=L(ux+hw,4.15,d/2+.05),c=L(ux+hw,3.35,d/2+1.9),e=L(ux-hw,3.35,d/2+1.9);s4Quad(aw,e,c,b,a,[0,v0],[hw*2/2.4,v0],[hw*2/2.4,v1],[0,v1]);s4Quad(aw,a,b,c,e,[0,v0],[hw*2/2.4,v0],[hw*2/2.4,v1],[0,v1]);
        const c2=L(ux+hw,2.95,d/2+1.9),e2=L(ux-hw,2.95,d/2+1.9);s4Quad(aw,e2,c2,c,e,[0,v0],[hw*2/2.4,v0],[hw*2/2.4,v0+(v1-v0)*.35],[0,v0+(v1-v0)*.35]);}
      if(r()<.72){const si=o.sign!=null&&u===0?o.sign:((r()*(style==='grok'?16:32))|0)+(style==='grok'?32:0),sc=si%2,sr=Math.floor(si/2),u0=sc*.5,u1=u0+.5,v0=1-(sr+1)/32,v1=1-sr/32,sw=Math.min(uw*.86,6.4),sh=sw/8;
        const sb=s4Bucket(cx,cz,'signs'),y0=shopH+.45,a=L(ux-sw/2,y0,d/2+.14),b=L(ux+sw/2,y0,d/2+.14),c=L(ux+sw/2,y0+sh,d/2+.14),e=L(ux-sw/2,y0+sh,d/2+.14);s4Quad(sb,a,b,c,e,[u0,v0],[u1,v0],[u1,v1],[u0,v1]);
        const bp=L(ux,y0+sh/2,d/2+.07);s4Box(s4Bucket(cx,cz,'dark'),bp[0],y0+sh/2,bp[2],sw+.12,sh+.12,.12,yaw,2,2,null,63&~16);}}}
  /* cornice, roof */
  const cc=s4Tint(tint[0]*.82,tint[1]*.8,tint[2]*.78);const top=cut?h:h;
  if(!cut){s4Box(s4Bucket(cx,cz,'conc'),cx,h+.3,cz,w+.5,.6,d+.5,yaw,4,4,cc);s4Box(s4Bucket(cx,cz,'roof'),cx,h+.62,cz,w+.1,.04,d+.1,yaw,6,6,null,4);}
  else{const {sd,cw}=cut,wB=w-cw,oB=-sd*cw/2,bx=cx+rxw*oB,bz=cz+rzw*oB;s4Box(s4Bucket(cx,cz,'conc'),bx,h+.3,bz,wB+.5,.6,d+.5,yaw,4,4,cc);s4Box(s4Bucket(cx,cz,'roof'),bx,h+.62,bz,wB+.1,.04,d+.1,yaw,6,6,null,4);
    const ax=cx+rxw*(sd*(w/2-cw/2)),az=cz+rzw*(sd*(w/2-cw/2));s4Box(s4Bucket(cx,cz,'rubble'),ax,cut.hc+.05,az,cw,.1,d,yaw,4,4,s4Tint(.5,.48,.46),4);}
  if(!o.detail)return;
  /* balconies */
  if((style==='apt'||style==='cream'||style==='conc')&&r()<.75){const Bm=s4Bucket(cx,cz,'metal'),Bc=s4Bucket(cx,cz,'conc');const bays=Math.floor(w/3);
    for(let y=shopH+3.6;y<(cut?cut.hc:h)-2;y+=3.5)for(let b=0;b<bays;b++){if(r()>.32)continue;const lx=-w/2+1.5+b*3+(w-bays*3)/2;const p=L(lx,y,d/2+.6);
      s4Box(Bc,p[0],y,p[2],2.5,.2,1.2,yaw,2,2,cc);for(const sx of[-1.2,1.2]){const q=L(lx+sx,y+.55,d/2+.6);s4Box(Bm,q[0],y+.55,q[2],.06,1,1.2,yaw,1,1,null);}const q=L(lx,y+1.05,d/2+1.18);s4Box(Bm,q[0],y+1.05,q[2],2.5,.06,.06,yaw,1,1);
      for(let k=0;k<6;k++){const q2=L(lx-1.1+k*.44,y+.55,d/2+1.18);s4Box(Bm,q2[0],y+.55,q2[2],.04,1,.04,yaw,1,1);}
      if(o.turretSpot&&!o.turretDone&&y>shopH+6&&y<shopH+12){o.turretDone=true;S4.balcony.push({x:p[0]+fx*.2,y:y+.1,z:p[2]+fz*.2,yaw});}}}
  /* fire escape */
  if((style==='brick'||style==='red')&&h>12&&r()<.6){const Bm=s4Bucket(cx,cz,'dark'),lx=(r()<.5?-1:1)*(w/2-3);for(let y=shopH+3.2;y<h-2;y+=3.5){const p=L(lx,y,d/2+.7);s4Box(Bm,p[0],y,p[2],3.2,.08,1.3,yaw,1,1);
      const q=L(lx,y+.5,d/2+1.33);s4Box(Bm,q[0],y+.5,q[2],3.2,.05,.05,yaw,1,1);for(const sx of[-1.6,1.6]){const s=L(lx+sx,y+.5,d/2+.7);s4Box(Bm,s[0],y+.5,s[2],.05,1,1.3,yaw,1,1);}
      const st=L(lx,y+1.75,d/2+.7);s4Geo(Bm,new THREE.BoxGeometry(3.6,.06,.9),st[0],y+1.75,st[2],0,yaw,Math.atan2(3.5,3.2)*((Math.round((y-shopH)/3.5))%2?1:-1),1,1,1);
      if(o.turretSpot&&!o.turretDone&&y>shopH+5){o.turretDone=true;S4.balcony.push({x:p[0],y:y+.05,z:p[2],yaw});}}}
  if(o.turretSpot&&!o.turretDone){o.turretDone=true;const p=L(0,shopH+7,d/2+.5);s4Box(s4Bucket(cx,cz,'conc'),p[0],p[1],p[2],3,.25,1.6,yaw,2,2,cc);S4.balcony.push({x:p[0],y:p[1]+.12,z:p[2],yaw});}
  /* roof clutter */
  const Bm=s4Bucket(cx,cz,'metal'),ry=h+.65;
  if(!cut){for(let k=0;k<1+((r()*3)|0);k++){const q=L((r()-.5)*(w-4),ry,(r()-.5)*(d-4));s4Box(Bm,q[0],ry+.7,q[2],1.6+r()*1.4,1.4,1.4+r(),yaw+(r()<.5?0:Math.PI/2),2,2,s4Tint(.8,.82,.85));}
    if(r()<.3&&(style==='brick'||style==='red'||style==='cream')){const q=L((r()-.5)*(w-8),ry,(r()-.5)*(d-8));const Br=s4Bucket(cx,cz,'rust');s4Geo(Br,new THREE.CylinderGeometry(2.4,2.4,4,12),q[0],ry+4.6,q[2],0,0,0,1,1,1);s4Geo(Br,new THREE.ConeGeometry(2.6,1.6,12),q[0],ry+7.4,q[2],0,0,0,1,1,1);
      for(const [a,b] of[[1.6,1.6],[-1.6,1.6],[1.6,-1.6],[-1.6,-1.6]])s4Box(s4Bucket(cx,cz,'dark'),q[0]+a,ry+1.3,q[2]+b,.2,2.6,.2,0,1,1);}
    if(r()<.35){const q=L((r()-.5)*(w-3),ry,(r()-.5)*(d-3));s4Geo(s4Bucket(cx,cz,'dark'),new THREE.CylinderGeometry(.06,.1,4+r()*6,5),q[0],ry+3,q[2],0,0,0,1,1,1);}
    if(style==='grok'||o.zone==='dark'){const q=L(0,ry,0);S4.blinkers.push([q[0],ry+1.5,q[2],3+r()*2,1+((r()*3)|0)]);}
    if(o.billboard){const bi=(r()*S4BB.length)|0,bw=Math.min(w*.9,16),bh=bw*.42,p=L(0,ry+2.5+bh/2,d/2-1.2);const b=s4Bucket(cx,cz,'bb.'+bi);
      const a=L(-bw/2,ry+2.5,d/2-1.1),b2=L(bw/2,ry+2.5,d/2-1.1),c=L(bw/2,ry+2.5+bh,d/2-1.1),e=L(-bw/2,ry+2.5+bh,d/2-1.1);s4Quad(b,a,b2,c,e,[0,0],[1,0],[1,1],[0,1]);
      for(const sx of[-bw*.35,bw*.35]){const q2=L(sx,ry+1.25,d/2-1.4);s4Box(s4Bucket(cx,cz,'dark'),q2[0],ry+1.25+bh/2,q2[2],.3,2.5+bh,.3,yaw,1,1);}
      const back=L(0,p[1],d/2-1.25);s4Box(s4Bucket(cx,cz,'dark'),back[0],p[1],back[2],bw+.3,bh+.3,.12,yaw,2,2,null,63&~16);}}
  /* GROK neon edges */
  if(style==='grok'){const Bn=s4Bucket(cx,cz,r()<.5?'redV':'cyanV');for(const sx of[-1,1]){const q=L(sx*(w/2+.05),h/2,d/2+.05);s4Box(Bn,q[0],h/2+shopH/2,q[2],.18,h-shopH,.18,yaw,1,1);}const q=L(0,h-1,d/2+.06);s4Box(Bn,q[0],h-1,q[2],w,.2,.12,yaw,1,1);
    if(r()<.55&&h>14){const bw=2.4,bh=Math.min(10,h*.45),lx=(r()-.5)*(w-4),bb=s4Bucket(cx,cz,'banner');
      const p0=L(lx-bw/2,h-2-bh,d/2+.12),p1=L(lx+bw/2,h-2-bh,d/2+.12),p2=L(lx+bw/2,h-2,d/2+.12),p3=L(lx-bw/2,h-2,d/2+.12);s4Quad(bb,p0,p1,p2,p3,[0,0],[1,0],[1,1],[0,1]);}}
  /* fires inside burnt buildings, smoke from the roof */
  if(burnt&&o.shop!==undefined&&r()<.55){for(let k=0;k<1+((r()*2)|0);k++){const y=shopH+2+r()*(h-shopH-4),q=L((r()-.5)*(w-3),y,d/2+.3);S4.fires.push({x:q[0],y,z:q[2],s:.9+r()*1.1,b:1});}if(r()<.55){const q=L(0,h,0);S4.plumes.push({x:q[0],y:h+2,z:q[2],s:1+r()*1.4});}}}
/* one city block: buildings around all four edges, a tower or two in the middle */
function s4StreetHalf(line,ax,lo,hi){/* the half width of the street on a grid line, over a stretch */let W=S4K.RD+S4K.WK;for(const p of S4.pieces){if(!p.blvd)continue;const pax=Math.abs(p.dx)>.5?'x':'z';if(pax!==ax)continue;const pl=ax==='x'?p.z0:p.x0;if(Math.abs(pl-line)>.5)continue;
  const a=ax==='x'?Math.min(p.x0,p.x1):Math.min(p.z0,p.z1),b=ax==='x'?Math.max(p.x0,p.x1):Math.max(p.z0,p.z1);if(b>lo-17&&a<hi+17)W=Math.max(W,p.W);}return W;}
function s4EdgeSeen(line,ax,lo,hi){for(const p of S4.pieces){const pax=Math.abs(p.dx)>.5?'x':'z';if(pax!==ax)continue;const pl=ax==='x'?p.z0:p.x0;if(Math.abs(pl-line)>.5)continue;const a=ax==='x'?Math.min(p.x0,p.x1):Math.min(p.z0,p.z1),b=ax==='x'?Math.max(p.x0,p.x1):Math.max(p.z0,p.z1);if(b>lo&&a<hi)return true;}return false;}
function s4Block(bx,bz,zone,far){const G=S4K.G,r=rng((Math.imul(bx|0,73856093)^Math.imul(bz|0,19349663)^0x9e37)>>>0);
  const sS=s4StreetHalf(bz,'x',bx,bx+G),sN=s4StreetHalf(bz+G,'x',bx,bx+G),sW=s4StreetHalf(bx,'z',bz,bz+G),sE=s4StreetHalf(bx+G,'z',bz,bz+G);
  const x0=bx+sW,x1=bx+G-sE,z0=bz+sS,z1=bz+G-sN,sty=S4STY[zone]||S4STY.burn;
  const seen={S:s4EdgeSeen(bz,'x',bx,bx+G),N:s4EdgeSeen(bz+G,'x',bx,bx+G),W:s4EdgeSeen(bx,'z',bz,bz+G),E:s4EdgeSeen(bx+G,'z',bz,bz+G)};
  const hRange={edge:[7,16],burn:[12,44],pipe:[10,26],camp:[10,30],dark:[18,58],boss:[26,80],calm:[14,40],mall:[10,18],castle:[20,40]}[zone]||[12,40];
  const pick=()=>sty[(r()*sty.length)|0];
  const mk=(fxp,fzp,w,d,yaw,front)=>{let h=lerp(hRange[0],hRange[1],Math.pow(r(),1.6));if(r()<(zone==='boss'?.25:.1))h*=1.6;if(far)h*=1.15;
    let style=pick(),damage='';const dr=r();if(zone==='burn'||zone==='camp'||zone==='dark'||zone==='boss'){if(dr<.16)damage='chunk';else if(dr<.32)style='burnt';}else if(zone!=='calm'&&zone!=='edge'&&dr<.08)style='burnt';
    const o={x:fxp,z:fzp,w,d,h,yaw,style,damage,shop:front&&!far&&h<90&&style!=='glass'&&zone!=='pipe',seed:(r()*4294967295)>>>0,zone,detail:!far,billboard:front&&r()<.12&&h<40,turretSpot:false};
    if(front&&!far&&S4.wantTurret(fxp,fzp))o.turretSpot=true;s4Bldg(o);};
  /* fill an edge with buildings; sometimes leave a narrow alley (fenced at the sidewalk, with a wall at the back) */
  const fill=(a,b,cb,alley)=>{let t=a;while(t<b-4){let w=far?24+r()*20:11+r()*16;if(b-t-w<9)w=b-t;cb(t,w);t+=w;if(!far&&r()<.11&&b-t>16){const g=3.6;alley(t,g);t+=g;}}};
  const alleyAt=(cxp,czp,yaw,g)=>{const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
    s4Box(s4Bucket(cxp,czp,'fac.brick'),cxp-fx*10,5,czp-fz*10,g+.4,10,.6,yaw,12,14,s4Tint(.5,.45,.42));
    const fb=s4Bucket(cxp,czp,'fence');s4Quad(fb,[cxp-rx*g/2,0,czp-rz*g/2],[cxp+rx*g/2,0,czp+rz*g/2],[cxp+rx*g/2,2.6,czp+rz*g/2],[cxp-rx*g/2,2.6,czp-rz*g/2],[0,0],[g/1.6,0],[g/1.6,2.6/1.6],[0,2.6/1.6]);
    s4Box(s4Bucket(cxp,czp,'metal'),cxp,1.3,czp,g,.08,.08,yaw,1,1);
    if(r()<.6){const q=[cxp-fx*4,czp-fz*4];s4Box(s4Bucket(cxp,czp,'rust'),q[0],.8,q[1],2.2,1.5,1.4,yaw+(r()-.5)*.3,2,2,s4Tint(.4,.55,.4));}};
  const D=22,dmax=(z1-z0)/2,emax=(x1-x0)/2;
  /* south edge: faces -z */fill(x0,x1,(t,w)=>{const d=(t<=x0+.1||t+w>=x1-.1)?D:Math.min(dmax,14+r()*8);mk(t+w/2,z0,w,d,Math.PI,seen.S);},(t,g)=>alleyAt(t+g/2,z0,Math.PI,g));
  /* north edge: faces +z */fill(x0,x1,(t,w)=>{const d=(t<=x0+.1||t+w>=x1-.1)?D:Math.min(dmax,14+r()*8);mk(t+w/2,z1,w,d,0,seen.N);},(t,g)=>alleyAt(t+g/2,z1,0,g));
  /* west edge: faces -x */fill(z0+D,z1-D,(t,w)=>{mk(x0,t+w/2,w,Math.min(emax,14+r()*8),-Math.PI/2,seen.W);},(t,g)=>alleyAt(x0,t+g/2,-Math.PI/2,g));
  /* east edge: faces +x */fill(z0+D,z1-D,(t,w)=>{mk(x1,t+w/2,w,Math.min(emax,14+r()*8),Math.PI/2,seen.E);},(t,g)=>alleyAt(x1,t+g/2,Math.PI/2,g));
  /* a tower or two in the middle for the skyline */
  if(r()<.6){const n=1+((r()*2)|0);for(let k=0;k<n;k++){const w=18+r()*16,d=18+r()*14,cx=(x0+x1)/2+(r()-.5)*20,cz=(z0+z1)/2+(r()-.5)*20,h=(zone==='edge'?20:50)+r()*(zone==='boss'||zone==='dark'?90:60);
    s4Bldg({x:cx,z:cz+d/2,w,d,h,yaw:0,style:r()<.5?'glass':pick(),damage:(zone!=='calm'&&r()<.2)?'chunk':'',shop:false,seed:(r()*4294967295)>>>0,zone,detail:false});}}}
/* which blocks get built */
function s4Blocks(){const G=S4K.G,marked=new Map(),key=(x,z)=>x+','+z;
  const markAlong=(p)=>{const ax=Math.abs(p.dx)>.5?'x':'z';const line=ax==='x'?p.z0:p.x0;if(!s4GridX(line))return;const lo=ax==='x'?Math.min(p.x0,p.x1):Math.min(p.z0,p.z1),hi=ax==='x'?Math.max(p.x0,p.x1):Math.max(p.z0,p.z1);
    for(let g=Math.floor((lo-1)/G)*G;g<hi+1;g+=G){if(g+G<lo-1)continue;if(ax==='x'){marked.set(key(g,line),1);marked.set(key(g,line-G),1);}else{marked.set(key(line,g),1);marked.set(key(line-G,g),1);}}};
  for(const p of S4.pieces)markAlong(p);
  /* the side of the outskirts by the ramp: no blocks under the highway */
  const skip=k=>{const [x,z]=k.split(',').map(Number);if(z<-120)return true;if(S4LOTS[k]||S4SPECIAL[k])return true;if(x>=960&&x<1200&&z>=3000)return true;/* the castle plaza */return false;};
  const far=new Map();for(const k of marked.keys()){const [x,z]=k.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const kk=key(x+dx*G,z+dz*G);if(!marked.has(kk))far.set(kk,1);}}
  for(const k of marked.keys()){if(skip(k))continue;const [x,z]=k.split(',').map(Number);const q=s4Near(x+G/2,z+G/2,-1);s4Block(x,z,S4SEG[S4.path.seg[q.i]].zone,false);}
  for(const k of far.keys()){if(skip(k)||marked.has(k))continue;const [x,z]=k.split(',').map(Number);const q=s4Near(x+G/2,z+G/2,-1);s4Block(x,z,S4SEG[S4.path.seg[q.i]].zone,true);}
  S4.marked=marked;}

/* a closed side street: one building fills the gap between the two blocks, facing the route */
function s4Infill(){const RW=S4K.RD+S4K.WK;
  for(const c of S4.closed){const r=rng((Math.imul(c.x|0,7919)^Math.imul(c.z|0,104729)^0x51ed)>>>0),sg=S4SEG[Math.min(c.seg,S4SEG.length-1)],zone=sg.zone,sty=S4STY[zone]||S4STY.burn;
    const k=Math.floor((c.x+c.vx*30)/S4K.G)*S4K.G+','+Math.floor((c.z+c.vz*30)/S4K.G)*S4K.G;if(S4LOTS[k]||S4SPECIAL[k])continue;
    const fx=c.x+c.vx*c.W,fz=c.z+c.vz*c.W,yaw=Math.atan2(-c.vx,-c.vz),hR={edge:[8,16],burn:[14,40],pipe:[10,24],camp:[10,28],dark:[18,50],boss:[26,70],calm:[14,36],mall:[10,18],castle:[20,40]}[zone]||[12,36];
    s4Bldg({x:fx,z:fz,w:RW*2+3,d:24,h:lerp(hR[0],hR[1],r()),yaw,style:sty[(r()*sty.length)|0],damage:'',shop:zone!=='pipe',seed:(r()*4294967295)>>>0,zone,detail:true,billboard:false,turretSpot:false});}}
