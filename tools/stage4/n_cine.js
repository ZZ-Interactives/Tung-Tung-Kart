/* ---------- Stage 1-4 cutscenes: morning over Fountain City, and the castle ---------- */
function smokeCols(g,t,y,n,seed){for(let i=0;i<n;i++){const r=rnd(i+seed),x=80+r()*1760,top=y-260-r()*320,w=40+r()*50;for(let k=0;k<7;k++){const ph=((t*.08+k/7+r())%1),cx=x+Math.sin(ph*4+i)*30+ph*60,cy=lerp(y,top,ph);K.softGlow(g,cx,cy,w*(1+ph*2.2),'rgba(48,36,40,.9)',.5*(1-ph));}}}
function dawnHw(g,t){K.sky(g,['#7a4a6a','#e8805a','#ffb47a','#ffd8a0']);K.glow(g,1380,640,520,'rgba(255,214,140,.65)');K.rays(g,1380,640,t*.6,'rgba(255,220,170,.22)',14,.8);
  cityScape(g,t,{seed:9,y:700,dry:true});smokeCols(g,t,700,7,40);K.haze(g,580,780,'rgba(150,80,60,.45)');
  K.cel(g,c=>{c.moveTo(-300,1300);c.lineTo(-300,760);c.lineTo(1500,700);c.lineTo(1640,720);c.lineTo(1600,760);c.lineTo(1700,770);c.lineTo(1660,1300);c.closePath();},{base:'#8a8078',shade:'#6a625c',dx:0,dy:-8,lw:7,rim:false});
  g.strokeStyle='#e8c440';g.lineWidth=8;g.setLineDash([60,40]);g.beginPath();g.moveTo(-300,900);g.lineTo(1560,760);g.stroke();g.setLineDash([]);}
function z1(g,t,d){const z=lerp(1,1.08,eio(t/d));g.save();cam(g,lerp(900,980,eio(t/d)),560,z);dawnHw(g,t);
  const fx=760,fy=900;K.cel(g,c=>c.rect(fx-50,fy-110,100,110),{base:'#8a4a2a',shade:'#5e3018',dx:-8,dy:0,lw:6});for(let i=0;i<4;i++){const ph=(t*.5+i/4)%1;K.softGlow(g,fx+Math.sin(ph*5)*20,fy-130-ph*160,30+ph*50,'rgba(120,110,110,.9)',.5*(1-ph));}
  K.kart(g,1180,960,.62,t,{});K.tung(g,560,1000,.62,t,{bat:false,arm:-2.6,mouth:t<2?'open':'smile',brow:'up',look:[.6,-.3],bob:Math.sin(t*1.4)*4,seated:0});g.restore();K.rim(null);K.vignette(g,.5);}
function z2(g,t,d){K.sky(g,['#e8805a','#ffb47a']);const z=lerp(1.04,1.1,eio(t/d));g.save();cam(g,960,560,z);K.glow(g,700,700,600,'rgba(255,210,150,.35)');
  K.tung(g,700,1220,1.05,t,{bat:false,arm:-1.4,mouth:t<d-1?'smile':'grit',brow:'up',look:[.5,-.15],bob:0});
  const a=K.eob(cl((t-.3)*2,0,1));g.save();g.translate(1350,430);g.rotate(.04);g.scale(a,a);K.cel(g,c=>c.rect(-220,-260,440,520),{base:'#2a2e3a',shade:'#1a1c26',dx:-8,dy:-8,lw:7});
  g.save();g.beginPath();g.rect(-190,-200,380,330);g.clip();g.fillStyle='#bfeaff';g.fillRect(-190,-200,380,330);K.shark(g,-136+30,-35+8+232*1.05,1.05,t,{talk:t<d-.6,brow:'up'});g.restore();K.ink(g,5);g.strokeRect(-190,-200,380,330);
  g.fillStyle='#ff4a5a';g.beginPath();g.arc(140,200,16,0,TAU);g.fill();g.fillStyle='#3a3e48';for(let k=0;k<4;k++)g.fillRect(-150,170+k*18,200,8);g.restore();g.restore();K.vignette(g,.5);}
function z3(g,t,d){const sh=(Math.random()-.5)*(t>1.8?10:0);g.save();g.translate(sh,0);K.sky(g,['#100408','#2a0810','#100408']);
  g.save();g.globalAlpha=.85;cityScape(g,t,{seed:9,y:1000,dry:true});g.restore();g.fillStyle='rgba(255,30,60,.2)';g.fillRect(0,0,1920,1080);
  /* the Crusher's red eye opens in the dark */const op=cl((t-2.4)/1.2,0,1);if(op>0){g.save();g.translate(1500,760);g.globalAlpha=op;K.glow(g,0,0,260,'rgba(255,40,60,.85)');g.fillStyle='#ff1a2a';g.beginPath();g.ellipse(0,0,90,90*op,0,0,TAU);g.fill();g.fillStyle='#ffe0e4';g.beginPath();g.arc(20,-14*op,24*op,0,TAU);g.fill();g.restore();}
  K.grok(g,780,360,.56,t,{boot:1,mood:'angry',talk:t<d-.5,glitch:.35});g.restore();K.vignette(g,.6);}
function z4(g,t,d){K.sky(g,['#7a4a6a','#e8805a','#ffb47a']);K.speedLines(g,960,540,t,'rgba(255,235,210,.32)');g.save();cam(g,960,560,1);cityScape(g,t,{seed:12,y:820,dry:true});smokeCols(g,t,820,5,60);
  const bx=lerp(-700,620,eob(cl(t/1.2,0,1)))+Math.sin(t*20)*2;for(let i=0;i<14;i++){const r=rnd(i*7+Math.floor(t*12));K.softGlow(g,bx-260-r()*400,960-r()*80,50+r()*60,'rgba(180,150,130,.95)',.6);}
  K.kart(g,bx,980,.9,t,{flame:1,bump:1,driver:(c)=>K.tung(c,-40,-92,.55,t,{seated:1,bat:false,arm:-1.1,mouth:'grit',brow:'angry',bob:0})});g.restore();
  const a=cl((t-.6)*2,0,1);if(a>0){g.save();g.globalAlpha=a;g.translate(960,300);g.rotate(-.03);g.fillStyle='#14123a';g.fillRect(-470,-110,940,220);g.strokeStyle='#fffaf0';g.lineWidth=6;g.strokeRect(-470,-110,940,220);
    g.fillStyle='#ffd23f';g.font='34px Bungee, Impact, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('STAGE 1-4',0,-56);g.fillStyle='#fffaf0';g.font='84px Bungee, Impact, sans-serif';g.fillText('FOUNTAIN CITY',0,22,880);g.restore();}}
function castleBig(g,t,o){o=o||{};const s=o.s||1,cx=o.x||960,by=o.y||900;g.save();g.translate(cx,by);g.scale(s,s);
  const C='#1a1420',D='#100c16';K.cel(g,c=>c.rect(-760,-300,1520,300),{base:C,shade:D,dx:-10,dy:0,lw:6,rim:false});for(let x=-760;x<760;x+=56)g.fillRect(x,-330,34,34);
  const tw=(x,w,h)=>{K.cel(g,c=>c.rect(x-w/2,-h,w,h),{base:C,shade:D,dx:-8,dy:0,lw:6,rim:false});K.cel(g,c=>{c.moveTo(x-w*.62,-h);c.lineTo(x,-h-w*1.5);c.lineTo(x+w*.62,-h);c.closePath();},{base:'#241a2c',shade:D,dx:-6,dy:0,lw:5,rim:false});
    g.fillStyle='#3ee0ff';g.fillRect(x-w/2,-h*.4,w,8);g.fillRect(x-w/2,-h*.72,w,8);K.glow(g,x,-h-w*1.5,40,'rgba(255,40,60,.9)');};
  tw(-640,130,520);tw(640,130,520);tw(-180,120,640);tw(180,120,640);
  K.cel(g,c=>c.rect(-150,-760,300,760),{base:'#20182a',shade:D,dx:-8,dy:0,lw:6,rim:false});K.cel(g,c=>{c.moveTo(-90,-760);c.lineTo(0,-1080);c.lineTo(90,-760);c.closePath();},{base:'#241a2c',shade:D,dx:-6,dy:0,lw:5,rim:false});
  const ep=1+Math.sin(t*3)*.06;K.glow(g,0,-1110,260*ep,'rgba(255,30,50,.8)');g.fillStyle='#ff1a2a';g.beginPath();g.arc(0,-1110,46,0,TAU);g.fill();g.strokeStyle='#3ee0ff';g.lineWidth=8;g.beginPath();g.ellipse(0,-1110,120,40,t*.4,0,TAU);g.stroke();
  /* the gate */g.fillStyle='#0a080e';g.beginPath();g.moveTo(-110,0);g.lineTo(-110,-200);g.quadraticCurveTo(0,-290,110,-200);g.lineTo(110,0);g.fill();g.strokeStyle='#3ee0ff';g.lineWidth=6;g.beginPath();g.arc(0,-130,50,0,TAU);g.stroke();g.fillStyle='#ff2a3a';g.beginPath();g.arc(0,-130,22,0,TAU);g.fill();
  for(let k=0;k<26;k++){const r=rnd(k+5);g.fillStyle=r()<.5?'#ff3a4a':'#3ee0ff';g.fillRect(-700+r()*1400,-280+r()*240,6,8);}
  /* the pipes that carry the city's water in */for(const sx of[-1,1]){K.cel(g,c=>{c.moveTo(sx*900,40);c.quadraticCurveTo(sx*700,-40,sx*420,-60);c.lineTo(sx*420,-10);c.quadraticCurveTo(sx*700,10,sx*900,90);c.closePath();},{base:'#2a3446',shade:'#1a2030',dx:0,dy:-6,lw:5,rim:false});
    for(let k=0;k<6;k++){const u=((t*.3+k/6)%1),x=lerp(sx*880,sx*430,u);K.glow(g,x,lerp(60,-36,u),26,'rgba(62,224,255,.9)');}}
  g.restore();}
function w1(g,t,d){const z=lerp(1,1.12,eio(t/d));g.save();cam(g,960,lerp(640,520,eio(t/d)),z);K.sky(g,['#3a1428','#8a3a3a','#e0784a','#ffb070']);K.glow(g,960,520,700,'rgba(255,160,100,.4)');
  castleBig(g,t,{s:.62,x:960,y:900});K.haze(g,760,960,'rgba(90,40,40,.5)');K.cel(g,c=>c.rect(-200,900,2400,400),{base:'#8a7666',shade:'#6a5848',dx:0,dy:-6,lw:6,rim:false});
  K.kart(g,960,1010,.32,t,{driver:(c)=>K.tung(c,-40,-92,.55,t,{seated:1,bat:false,arm:-1.2,mouth:'grit',brow:'up',bob:0})});g.restore();K.vignette(g,.55);}
function w2(g,t,d){const z=lerp(1.06,1.14,eio(t/d));g.save();cam(g,960,560,z);K.sky(g,['#3a1428','#8a3a3a','#e0784a']);g.save();g.globalAlpha=.7;castleBig(g,t,{s:.4,x:500,y:820});g.restore();K.haze(g,700,900,'rgba(60,20,30,.5)');
  K.tung(g,1300,1300,1.2,t,{bat:false,arm:-1.1,mouth:'grit',brow:'angry',look:[-.7,-.3],bob:0,glow:.4});g.restore();
  if(t>2.2){const a=K.eob(cl((t-2.2)*2,0,1));g.save();g.translate(560,240);g.scale(a,a);K.boom(g,'I\'M COMING, GROK',0,0,60,'#ffd23f',-.05);g.restore();}K.vignette(g,.55);}
function w3(g,t,d){const sh=(Math.random()-.5)*(t>2?10:0);g.save();g.translate(sh,0);serverHall(g,t);g.fillStyle='rgba(255,30,60,.16)';g.fillRect(0,0,1920,1080);
  K.grok(g,960,lerp(470,430,eio(t/d)),1.2,t,{boot:1,talk:t>.6&&t<d-.4,glitch:.3,mood:'angry'});g.restore();K.vignette(g,.6);}
function wEnd(g,t,d){oEndCard(g,t,'NEXT · STAGE 1-5',(typeof STAGES!=='undefined'&&STAGES[4]?STAGES[4].name:'THE CASTLE').toUpperCase(),false);}
