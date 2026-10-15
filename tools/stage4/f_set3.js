
/* ---------- the suburbs: streets of houses on both sides of the highway before the city ---------- */
let S4PRISM=null;
function s4Prism(){if(!S4PRISM){const sh=new THREE.Shape();sh.moveTo(-.5,0);sh.lineTo(.5,0);sh.lineTo(0,1);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);g.computeVertexNormals();S4PRISM=g;}return S4PRISM;}
function s4House(x,z,yaw,r){const B=k=>s4Bucket(x,z,k),fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
  const burnt=r()<.16,style=burnt?'burnt':['cream','brick','apt','red','cream'][(r()*5)|0],w=9+r()*4,d=8+r()*3,fl=r()<.45?2:1,h=fl*3.3,P=(a,b)=>[x+rx*a+fx*b,z+rz*a+fz*b];
  const wallC=burnt?s4Tint(.6,.55,.5):[s4Tint(1,.97,.9),s4Tint(.95,.9,.85),s4Tint(.92,.95,1),s4Tint(1,.92,.86)][(r()*4)|0];
  /* yard, driveway, path */
  s4Box(B('tarp'),x+fx*2,.015,z+fz*2,w+7,.02,d+12,yaw,6,6,burnt?s4Tint(.3,.27,.22):s4Tint(.36+r()*.1,.46+r()*.08,.2),4);
  {const [a,b]=P(w/2+1.8,4.5);s4Box(B('conc'),a,.03,b,3,.02,d+3,yaw,3,3,s4Tint(.7,.68,.64),4);}
  {const [a,b]=P(0,d/2+2.6);s4Box(B('conc'),a,.03,b,1.2,.02,5.2,yaw,2,2,s4Tint(.75,.72,.68),4);}
  /* walls, roof, door, chimney, garage */
  s4Box(B('fac.'+style),x,h/2,z,w,h,d,yaw,12,14,wallC);
  const rh=2+r()*1.4,roofC=burnt?s4Tint(.18,.16,.15):[s4Tint(.62,.26,.2),s4Tint(.32,.32,.36),s4Tint(.42,.3,.24),s4Tint(.26,.34,.3)][(r()*4)|0];
  if(!burnt||r()<.5)s4Geo(B(burnt?'char':'roof'),s4Prism(),x,h,z,0,yaw+Math.PI/2,0,d+1,rh,w+1,roofC,.25);
  else for(let k=-2;k<=2;k++){const [a,b]=P(k*w/5,0);s4Box(B('char'),a,h+.4,b,.25,.25,d+.6,yaw+(r()-.5)*.3,1,1,null);}
  s4Box(B('fac.'+style),x,h+.02,z,w+.3,.12,d+.3,yaw,12,14,wallC,4|8);
  {const [a,b]=P((r()-.5)*w*.3,d/2+.03);s4Box(B('wood'),a,1.1,b,1,2.1,.08,yaw,1,1,s4Tint(.5+r()*.3,.3,.22));s4Box(B('conc'),a,.12,b+0,1.8,.24,1.2,yaw,1,1,s4Tint(.75,.72,.68));}
  if(r()<.6){const [a,b]=P(-w*.3,-d*.15);s4Box(B('conc'),a,h+rh*.6,b,.8,rh+1,.8,yaw,1,1,s4Tint(.6,.36,.3));}
  if(r()<.55){const [a,b]=P(w/2+1.8,d/2-1.6);s4Box(B('fac.'+style),a,1.5,b,3.4,3,4.4,yaw,12,14,wallC);s4Box(B('metal'),P(w/2+1.8,d/2+.62)[0],1.15,P(w/2+1.8,d/2+.62)[1],2.8,2.2,.06,yaw,1,1,s4Tint(.85,.85,.82));
    s4Box(B('roof'),a,3.08,b,3.8,.16,4.8,yaw,2,2,roofC);}
  /* a car on the driveway sometimes */
  if(r()<.4){const [a,b]=P(w/2+1.8,d/2+5);s4Car(['sedan','hatch','suv','van'][(r()*4)|0],a,b,yaw+(r()<.5?0:Math.PI),{collide:false,burnt:burnt||r()<.15,fire:false,crushed:r()<.1});}
  /* picket fence along the front, a tree in the yard */
  if(r()<.55){const [a,b]=P(0,d/2+6.2);const fb=B('wood');for(let k=-6;k<=6;k++){if(Math.abs(k)<=1)continue;const [c2,e2]=P(k*.9,d/2+6.2);s4Box(fb,c2,.5,e2,.08,1,.06,yaw,1,1,s4Tint(.95,.94,.9));}
    s4Box(fb,a,.75,b,11.5,.06,.04,yaw,1,1,s4Tint(.95,.94,.9));}
  if(r()<.7){const [a,b]=P(-w/2-2.5+r(),d/2+3.5+r()*2),th=2.4+r()*2;s4Geo(B('wood'),new THREE.CylinderGeometry(.14,.22,th,6),a,th/2,b,0,0,(r()-.5)*.1,1,1,1,s4Tint(.5,.38,.28));
    if(r()<.65)for(let k=0;k<3;k++){const s=1.3+r()*.9;s4Geo(B('tarp'),s4Rock(),a+(r()-.5)*1.4,th+(r()-.2)*1.2,b+(r()-.5)*1.4,r()*3,r()*3,0,s,s*.85,s,s4Tint(.32+r()*.12,.42+r()*.12,.2));}
    else s4DeadTree(a+.5,b,0,th);}}
function s4Suburbs(){const r=rng(2024),B=(k,x,z)=>s4Bucket(x,z,k),cols=[-400,-290,-180,-75,75,180,290,400],rows=[-1100,-980,-860,-740,-620,-500,-380,-280];
  const clear=(x,z)=>(Math.abs(x)<44)||(x>12&&x<62&&z>-235&&z<-160)||(x<-15&&x>-48&&z>-165&&z<-130)||z>-150;
  /* the streets: a road with sidewalks along every row and column */
  const road=(x0,z0,x1,z1)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,L=Math.hypot(x1-x0,z1-z0),yaw=Math.atan2(x1-x0,z1-z0);
    s4Box(B('asph',cx,cz),cx,.01,cz,8,.02,L,yaw,8,8,s4Tint(.62,.62,.66),4);for(const s of[-1,1]){const ox=Math.cos(yaw)*s*5.3,oz=-Math.sin(yaw)*s*5.3;s4Box(B('walk',cx+ox,cz+oz),cx+ox,.1,cz+oz,2.6,.2,L,yaw,2,2,null,4|1|2);}
    for(let t=-L/2+6;t<L/2-6;t+=6){const px=cx+Math.sin(yaw)*t,pz=cz+Math.cos(yaw)*t;s4Box(B('paint',px,pz),px,.025,pz,.15,.01,2.6,yaw,1,1,s4Tint(.95,.85,.3),4);}};
  for(const z of rows){for(const sx of[-1,1])road(sx*44,z,sx*410,z);}
  for(const x of cols){road(x,-1110,x,-270);}
  /* houses on both sides of every row, between the columns */
  for(const z of rows)for(let ci=0;ci<cols.length-1;ci++){const a=cols[ci],b=cols[ci+1];if(a<0&&b>0)continue;
    for(const side of[-1,1]){const hz=z+side*17;if(rows.indexOf(z)===rows.length-1&&side>0)continue;
      for(let x=a+15;x<b-12;x+=17+r()*3){if(clear(x,hz))continue;s4House(x,hz,side>0?Math.PI:0,r);}}}
  /* streetlights (mostly dark) and a few wrecks in the streets */
  for(const z of rows)for(let x=-400;x<=400;x+=60){if(Math.abs(x)<50)continue;const lx=x,lz=z+6.4;s4Box(B('metal',lx,lz),lx,3.2,lz,.14,6.4,.14,0,1,1);s4Box(B('metal',lx,lz),lx,6.3,lz-.8,.12,.12,1.8,0,1,1);}
  for(let k=0;k<14;k++){const z=rows[(r()*rows.length)|0],x=(r()<.5?-1:1)*(70+r()*320);s4Car(['sedan','hatch','suv','van'][(r()*4)|0],x,z+(r()-.5)*3,(r()<.5?1:-1)*Math.PI/2+(r()-.5)*.6,{collide:false,burnt:r()<.5,fire:false,crushed:r()<.3});}}
