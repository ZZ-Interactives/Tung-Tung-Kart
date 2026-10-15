
/* ---------- models for things that move ---------- */
let S4T=null;
function s4Models(){if(S4T)return S4T;const M3=s3Mats(),M=s4Mats(),T=S4T={};
  const std=M3.std,mesh=(geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(keepG(geo),mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;return m;};
  const gm=std({color:linC(0x2c313d),metalness:.82,roughness:.28}),gd=std({color:linC(0x14171f),metalness:.6,roughness:.4}),edge=std({color:linC(0x8a93a3),metalness:.9,roughness:.22});
  const redE=M3.red,cyanE=M3.cyan;T.gm=gm;T.gd=gd;T.edge=edge;
  const plate=(w,h,d,bev)=>{const s=new THREE.Shape(),hw=w/2,hh=d/2,r=Math.min(hw,hh)*.35;s.moveTo(-hw+r,-hh);s.lineTo(hw-r,-hh);s.quadraticCurveTo(hw,-hh,hw,-hh+r);s.lineTo(hw,hh-r);s.quadraticCurveTo(hw,hh,hw-r,hh);s.lineTo(-hw+r,hh);s.quadraticCurveTo(-hw,hh,-hw,hh-r);s.lineTo(-hw,-hh+r);s.quadraticCurveTo(-hw,-hh,-hw+r,-hh);
    const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:bev||.06,bevelSize:bev||.06,bevelSegments:2,curveSegments:6});g.rotateX(-Math.PI/2);g.translate(0,-h/2,0);return g;};
  T.plate=plate;
  /* GROK Runner: a hover-bot that hunts you down the street */
  {const g=new THREE.Group(),body=new THREE.Group();g.add(body);body.position.y=1.15;
    const hull=mesh(new THREE.SphereGeometry(1,28,18),gm);hull.scale.set(1.05,.58,2.05);body.add(hull);
    body.add(mesh(plate(1.5,.18,2.6,.08),gd,0,.5,-.2));body.add(mesh(plate(.8,.12,1.6,.05),edge,0,.66,-.4));
    const fin=mesh(new THREE.BoxGeometry(.08,.55,1.4),gd,0,.82,-.9,-.25);body.add(fin);
    /* nose ram with three spikes */const nose=new THREE.ConeGeometry(.72,1.5,14);nose.rotateX(Math.PI/2);body.add(mesh(nose,gd,0,-.08,2.15));
    for(const [x,y] of[[0,.05],[-.38,-.22],[.38,-.22]]){const sp=new THREE.ConeGeometry(.1,.55,8);sp.rotateX(Math.PI/2);body.add(mesh(sp,edge,x,y,2.85));}
    /* the eye */const sock=mesh(new THREE.TorusGeometry(.46,.1,10,28),edge,0,.3,1.62,-.35);body.add(sock);const eye=new THREE.Mesh(new THREE.SphereGeometry(.4,20,14),new THREE.MeshBasicMaterial({color:0xff2a3a,toneMapped:false}));eye.material.userData.lin=true;eye.position.set(0,.3,1.66);body.add(eye);
    const eg=glow(0xff2a3a,4.2);eg.position.set(0,.32,1.9);body.add(eg);
    /* engines + cyan rings + exhaust */for(const s of[-1,1]){const en=new THREE.CylinderGeometry(.34,.4,1.5,16);en.rotateX(Math.PI/2);body.add(mesh(en,gm,s*1.02,-.05,-1.1));body.add(mesh(new THREE.TorusGeometry(.38,.07,8,22),cyanE,s*1.02,-.05,-.4));
      const ex=glow(0x3ee0ff,2.6);ex.position.set(s*1.02,-.05,-1.95);ex.userData.ex=1;body.add(ex);const ex2=glow(0x9ff4ff,1.3);ex2.position.set(s*1.02,-.05,-1.9);body.add(ex2);
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(.04,.12,2.2),redE);stripe.position.set(s*1.06,.12,.2);body.add(stripe);}
    /* hover pads */for(const [x,z] of[[-.7,1],[.7,1],[-.7,-1],[.7,-1]]){const pd=new THREE.Mesh(new THREE.CircleGeometry(.32,16),M3.add(0x3ee0ff,.55));pd.rotation.x=Math.PI/2;pd.position.set(x,-.52,z);body.add(pd);}
    const ant=mesh(new THREE.CylinderGeometry(.02,.03,.9,5),gd,-.45,1.0,-.9);body.add(ant);const al=glow(0xff3040,1.2);al.position.set(-.45,1.48,-.9);al.userData.blink=1;body.add(al);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.5,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.05;g.add(shadow);
    const under=glow(0x3ee0ff,4);under.material.opacity=.3;under.position.y=.3;g.add(under);
    g.scale.setScalar(S4K.RUN);linearize(g);T.runner=g;}
  /* balcony turret: a bracket on the wall, a head that tracks you, twin barrels */
  {const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(1.4,.25,1.2),gd,0,.12,0));g.add(mesh(new THREE.CylinderGeometry(.3,.4,.6,12),gm,0,.5,0));
    const head=new THREE.Group();head.position.y=1.05;g.add(head);head.add(mesh(plate(1.3,.8,1.3,.08),gm));head.add(mesh(new THREE.BoxGeometry(1,.14,.06),cyanE,0,.18,.67));
    for(const s of[-1,1]){const br=new THREE.CylinderGeometry(.09,.12,1.4,10);br.rotateX(Math.PI/2);head.add(mesh(br,edge,s*.32,-.1,1.2));head.add(mesh(new THREE.TorusGeometry(.13,.04,6,12),gd,s*.32,-.1,1.9));}
    const eye=glow(0xff3040,1.8);eye.position.set(0,.18,.75);head.add(eye);head.userData.eye=eye;g.userData.head=head;linearize(g);T.turret=g;}
  /* bomb */
  {const g=new THREE.Group();g.add(mesh(new THREE.SphereGeometry(.55,16,12),gd));for(let k=0;k<4;k++){const f=mesh(new THREE.BoxGeometry(.04,.5,.5),gm);f.position.y=.6;f.rotation.y=k*Math.PI/2;g.add(f);}const l=glow(0xff2a3a,1.8);l.userData.blink=2;g.add(l);linearize(g);T.bomb=g;}
  /* scrap that camp bots throw */
  {const g=new THREE.Group();for(let k=0;k<3;k++){g.add(mesh(new THREE.BoxGeometry(.5+Math.random()*.4,.2,.4+Math.random()*.3),k%2?M3.rust:gm,(Math.random()-.5)*.3,(Math.random()-.5)*.3,(Math.random()-.5)*.3,Math.random()*3,Math.random()*3,0));}linearize(g);T.scrap=g;}
  /* water bottle (hidden collectible) */
  {const g=new THREE.Group(),glass=new THREE.MeshPhysicalMaterial({color:linC(0x9fe6ff),roughness:.05,transparent:true,opacity:.55,clearcoat:1});glass.userData.lin=true;
    g.add(mesh(new THREE.CylinderGeometry(.34,.34,1.1,18),glass,0,.55,0));const w=mesh(new THREE.CylinderGeometry(.3,.3,.85,18),M.water,0,.47,0);g.add(w);g.add(mesh(new THREE.CylinderGeometry(.15,.3,.25,18),glass,0,1.22,0));g.add(mesh(new THREE.CylinderGeometry(.13,.13,.18,12),std({color:linC(0x2a7ae0),roughness:.4}),0,1.42,0));
    const lab=mesh(new THREE.CylinderGeometry(.345,.345,.35,18,1,true),std({color:linC(0xfffaf0),roughness:.6}),0,.6,0);g.add(lab);const gl=glow(0x3ab8ff,4);gl.material.opacity=.6;gl.position.y=.7;g.add(gl);g.scale.setScalar(1.25);linearize(g);T.bottle=g;}
  T.heart=s3Templates().heart;T.scout=s3Templates().scout;
  /* breakables (instanced): trash can, cone, crate, hydrant, shopping cart, cardboard box */
  const can=mergeGeos([new THREE.CylinderGeometry(.36,.32,.95,14).translate(0,.47,0),new THREE.TorusGeometry(.355,.03,6,16).rotateX(Math.PI/2).translate(0,.3,0),new THREE.TorusGeometry(.36,.03,6,16).rotateX(Math.PI/2).translate(0,.7,0)]);
  const lid=new THREE.CylinderGeometry(.39,.39,.08,14).translate(0,.99,0);
  const cone=mergeGeos([new THREE.ConeGeometry(.28,.8,12).translate(0,.45,0),new THREE.BoxGeometry(.6,.06,.6).translate(0,.03,0)]);
  const crateT=tex(mkCanvas(128,128,(g,w,h)=>{g.fillStyle='#9a7246';g.fillRect(0,0,w,h);g.strokeStyle='#5a3a1e';g.lineWidth=4;for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);g.beginPath();g.moveTo(8,8);g.lineTo(w-8,h-8);g.stroke();g.fillStyle='#3ee0ff';g.font='bold 18px Impact';g.textAlign='center';g.fillText('GROK',64,70);}),false);
  const hyd=mergeGeos([new THREE.CylinderGeometry(.2,.24,.7,10).translate(0,.35,0),new THREE.SphereGeometry(.21,10,8).translate(0,.72,0),new THREE.CylinderGeometry(.08,.08,.5,8).rotateZ(Math.PI/2).translate(0,.45,0)]);
  const cart=mergeGeos([new THREE.BoxGeometry(.7,.55,1).translate(0,.75,0),new THREE.BoxGeometry(.05,.6,.05).translate(.3,.3,.45),new THREE.BoxGeometry(.05,.6,.05).translate(-.3,.3,.45),new THREE.BoxGeometry(.05,.6,.05).translate(.3,.3,-.45),new THREE.BoxGeometry(.05,.6,.05).translate(-.3,.3,-.45),new THREE.BoxGeometry(.7,.05,.05).translate(0,1.1,-.55)]);
  const box=new THREE.BoxGeometry(.8,.6,.6).translate(0,.3,0);
  T.brk={can:{parts:[[can,std({color:linC(0x4a5a4e),metalness:.6,roughness:.45})],[lid,std({color:linC(0x3a4a3e),metalness:.6,roughness:.4})]],r:.55,top:1.1,slow:.94,heart:.18,snd:'can'},
    cone:{parts:[[cone,std({color:linC(0xff6a1a),roughness:.6})]],r:.45,top:.9,slow:.99,heart:0,snd:'soft'},
    crate:{parts:[[new THREE.BoxGeometry(1.1,1.1,1.1).translate(0,.55,0),std({map:crateT,roughness:.85})]],r:.8,top:1.2,slow:.9,heart:.32,snd:'wood'},
    hydrant:{parts:[[hyd,std({color:linC(0xc8302a),metalness:.4,roughness:.5})]],r:.4,top:.9,slow:.9,heart:0,snd:'can',geyser:true},
    cart:{parts:[[cart,std({color:linC(0xa8b0b8),metalness:.8,roughness:.3,wireframe:false})]],r:.7,top:1.2,slow:.95,heart:.1,snd:'can'},
    box:{parts:[[box,std({color:linC(0xb08858),roughness:.9})]],r:.55,top:.7,slow:.98,heart:.12,snd:'soft'}};
  return T;}
/* ---------- the GROK Crusher ---------- */
function s4MakeCrusher(){const T=s4Models(),M3=s3Mats(),gm=T.gm,gd=T.gd,edge=T.edge,std=M3.std,g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const mesh=(geo,mat,x,y,z,rx,ry,rz,par)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;(par||body).add(m);return m;};
  const armor=std({color:linC(0x343a48),metalness:.85,roughness:.3}),dark=std({color:linC(0x0e1016),metalness:.5,roughness:.5}),rust=std({color:linC(0x6a3a24),metalness:.4,roughness:.7});
  const logoT=tex(mkCanvas(512,256,(c,w,h)=>{c.fillStyle='#1a1d26';c.fillRect(0,0,w,h);c.strokeStyle='#3ee0ff';c.lineWidth=10;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#ff3a4a';c.font='120px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('GROK',w/2,h/2+6);}),false);
  const logo=std({map:logoT,metalness:.6,roughness:.4,emissiveMap:logoT,emissive:new THREE.Color(1,1,1),emissiveIntensity:.7});
  /* hull */
  const hull=mesh(new THREE.SphereGeometry(1,40,28),armor,0,0,0);hull.scale.set(5.2,3,7.6);
  mesh(new THREE.SphereGeometry(1,32,20),dark,0,-.8,0).scale.set(4.6,2.4,6.8);
  for(let k=0;k<4;k++){const p=mesh(T.plate(7.6-k*1.2,.5,3.2,.12),k%2?armor:gm,0,2.6+k*.32-.0*k,-3.6+k*2.3,-.12+k*.06);}
  for(const s of[-1,1]){mesh(T.plate(2.6,.4,8,.1),gm,s*4.3,1.2,0,0,0,s*.55);const lg=mesh(new THREE.PlaneGeometry(4.4,2.2),logo,s*5.25,.2,-.5,0,s*Math.PI/2,0);lg.castShadow=false;
    for(let k=0;k<5;k++)mesh(new THREE.BoxGeometry(.12,.12,1.4),M3.cyan,s*5.15,-1.1,-3.5+k*1.6,0,0,0);}
  /* head with the eye and the crusher jaws */
  const head=new THREE.Group();head.position.set(0,.4,7.2);body.add(head);
  mesh(T.plate(6.2,3.4,4.2,.18),gm,0,0,0,0,0,0,head);mesh(T.plate(6.8,.5,2.2,.1),armor,0,1.9,-.4,.18,0,0,head);
  const sock=mesh(new THREE.TorusGeometry(1.75,.3,14,40),edge,0,.35,2.1,0,0,0,head);
  const eyeM=new THREE.MeshBasicMaterial({color:0xff1a2a,toneMapped:false});eyeM.userData.lin=true;const eye=mesh(new THREE.SphereGeometry(1.55,28,20),eyeM,0,.35,2.05,0,0,0,head);eye.castShadow=false;
  const pupil=mesh(new THREE.SphereGeometry(.55,16,12),new THREE.MeshBasicMaterial({color:0xffe0e4,toneMapped:false}),.3,.65,3.3,0,0,0,head);pupil.material.userData.lin=true;
  const eg=glow(0xff2030,26);eg.position.set(0,.35,2.8);head.add(eg);const eg2=glow(0xff6070,9);eg2.position.set(0,.35,3.4);head.add(eg2);
  const brow=mesh(new THREE.BoxGeometry(4.4,.5,1),armor,0,2.1,1.9,.35,0,0,head);
  const jaws=[];for(const s of[-1,1]){const jp=new THREE.Group();jp.position.set(s*2.6,-1.6,1.6);head.add(jp);mesh(new THREE.BoxGeometry(1,1,3.6),gm,0,0,1.6,0,0,0,jp);mesh(new THREE.BoxGeometry(.8,.8,1.8),edge,-s*.4,-.2,3.4,0,-s*.5,0,jp);
    for(let k=0;k<4;k++){const tooth=new THREE.ConeGeometry(.22,.8,8);tooth.rotateZ(s*Math.PI/2);mesh(tooth,edge,-s*.55,-.1,.6+k*.8,0,0,0,jp);}
    const pis=mesh(new THREE.CylinderGeometry(.14,.14,2.6,8),edge,s*.3,.7,.2,Math.PI/2.6,0,0,jp);jaws.push({g:jp,s});}
  /* searchlights */const beams=[];for(const s of[-1,1]){const lp=mesh(new THREE.CylinderGeometry(.6,.5,.9,14),dark,s*3.6,2.2,4.6,Math.PI/2,0,0);const ln=new THREE.Mesh(new THREE.CircleGeometry(.5,14),M3.bas(0xfff2d0));ln.position.set(s*3.6,2.2,5.06);body.add(ln);
    const cone=new THREE.Mesh(new THREE.CylinderGeometry(.5,9,60,20,1,true),new THREE.MeshBasicMaterial({color:linC(0xfff0d0),transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));cone.geometry.translate(0,-30,0);cone.rotation.x=-Math.PI/2+.35;cone.position.set(s*3.6,2.2,5.1);body.add(cone);beams.push(cone);}
  /* back: a glass tank of stolen water, exhaust stacks, fins, warning lights */
  {const tg=new THREE.Group();tg.position.set(0,3.1,-3.6);body.add(tg);const glass=new THREE.MeshPhysicalMaterial({color:linC(0xbfefff),roughness:.05,transparent:true,opacity:.35,clearcoat:1,depthWrite:false});glass.userData.lin=true;
    const gt=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,6.4,24),glass);gt.rotation.z=Math.PI/2;tg.add(gt);const wt=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.45,6.2,24),s4Mats().water);wt.rotation.z=Math.PI/2;wt.scale.set(1,1,.9);tg.add(wt);
    for(const x of[-3.3,0,3.3]){const rg=new THREE.Mesh(new THREE.TorusGeometry(1.66,.14,8,26),edge);rg.rotation.y=Math.PI/2;rg.position.x=x;tg.add(rg);}}
  const stacks=[];for(const [x,z] of[[-2.6,-6.2],[0,-6.8],[2.6,-6.2]]){mesh(new THREE.CylinderGeometry(.55,.7,4.4,14),rust,x,3.4,z,-.25,0,0);stacks.push(new V3(x,5.6,z-.5));}
  mesh(new THREE.BoxGeometry(.3,2.6,5),gd,0,4,-1,-.15);
  const blinks=[];for(const [x,y,z] of[[-4.6,2,3],[4.6,2,3],[-3,3,-6],[3,3,-6],[0,4.8,1]]){const l=glow(0xff3040,2.6);l.position.set(x,y,z);l.userData.blink=1;body.add(l);blinks.push(l);}
  /* legs: 3 a side. each is hip -> knee -> foot, solved every frame */
  const legs=[];const upL=7.4,loL=10.6;
  const upG=mergeGeos([new THREE.BoxGeometry(1.3,upL,1.5).translate(0,upL/2,0),new THREE.CylinderGeometry(.18,.18,upL*.8,8).translate(.8,upL*.45,0)]);
  const loG=mergeGeos([new THREE.CylinderGeometry(.85,.5,loL,10).translate(0,loL/2,0),new THREE.ConeGeometry(.5,loL*.14,10).rotateX(Math.PI).translate(0,-loL*.07,0),new THREE.CylinderGeometry(.16,.16,loL*.7,6).translate(.7,loL*.55,0)]);
  const legsG=new THREE.Group();
  for(let i=0;i<6;i++){const s=i<3?-1:1,k=i%3,hip=new V3(s*4.2,-.6,4.6-k*4.6);const hj=new THREE.Mesh(new THREE.SphereGeometry(1.05,18,12),edge);hj.position.copy(hip);body.add(hj);
    const up=new THREE.Mesh(upG,armor),lo=new THREE.Mesh(loG,gm),kn=new THREE.Mesh(new THREE.SphereGeometry(.85,16,12),edge),ft=new THREE.Mesh(new THREE.ConeGeometry(.7,1.6,10),dark);
    for(const m of[up,lo,kn,ft]){m.castShadow=true;legsG.add(m);}const talons=[];for(let q=0;q<3;q++){const t=new THREE.Mesh(new THREE.ConeGeometry(.22,1.3,6),edge);t.castShadow=true;legsG.add(t);talons.push(t);}
    legs.push({i,s,k,hip,up,lo,kn,ft,talons,foot:new V3(),from:new V3(),to:new V3(),t:1,grp:(k+(s>0?1:0))%2,upL,loL});}
  linearize(g);linearize(legsG);
  return {g,legsG,body,head,eye,eyeM,eg,jaws,beams,stacks,blinks,legs,hull};}
