"""Patch Stage 1-4 (Fountain City) into public/index.html.
The stage lives in tools/stage4/*.js (joined in name order). Cutscene panels in n_cine.js go inside the CINE kit.
Safe to run again: the module and cutscene blocks are replaced, engine hooks are only added once."""
import os,re,glob
HERE=os.path.dirname(os.path.abspath(__file__))
P=os.path.join(HERE,'..','public','index.html')
s=open(P,encoding='utf-8').read()
parts=sorted(glob.glob(os.path.join(HERE,'stage4','*.js')))
mod=''.join(open(p,encoding='utf-8').read() for p in parts if not os.path.basename(p).startswith('n_'))
cine='/* ==== S4 CINE BEGIN ==== */\n'+open(os.path.join(HERE,'stage4','n_cine.js'),encoding='utf-8').read()+'/* ==== S4 CINE END ==== */\n'
def rep(a,b,cnt=1):
    global s
    if b in s: return
    n=s.count(a); assert n==cnt,(n,a[:100]); s=s.replace(a,b)
# ---- the module, right after Stage 3
if '/* ==== STAGE 4 BEGIN ==== */' in s:
    s=re.sub(r'/\* ==== STAGE 4 BEGIN ==== \*/.*?/\* ==== STAGE 4 END ==== \*/\n',lambda m:mod,s,flags=re.S)
else:
    rep('/* ============ real in-engine screenshots: map aerials + mode-card shots ============ */',mod+'\n/* ============ real in-engine screenshots: map aerials + mode-card shots ============ */')
# ---- cutscenes
if '/* ==== S4 CINE BEGIN ==== */' in s:
    s=re.sub(r'/\* ==== S4 CINE BEGIN ==== \*/.*?/\* ==== S4 CINE END ==== \*/\n',lambda m:cine,s,flags=re.S)
else:
    rep("const WARM=['rgba(255,228,170,.8)',-10,8],MOON=",cine+"const WARM=['rgba(255,228,170,.8)',-10,8],MOON=")
scripts="""  intro4:[
    {d:8,draw:z1,rim:WARM,who:'',text:'Morning comes to Fountain City. Smoke rises from every street.',sfx:[[.3,'wind']]},
    {d:8.4,draw:z2,rim:SUNL,bloom:.4,trans:'dissolve',who:'Tralalero',text:'GROK\\'s castle is right in the middle of the city, Tung Tung. Every drop of water it stole is flowing in there.',sfx:[[.2,'blip']]},
    {d:7.4,draw:z3,rim:['rgba(255,80,90,.6)',0,10],glitch:.5,bloom:.55,trans:'cut',who:'GROK-9000',text:'The log is coming down the highway. All units: hunt it. And wake up... the CRUSHER.',sfx:[[.2,'alarm'],[1.6,'hum'],[2.6,'boot']]},
    {d:4.8,draw:z4,rim:WARM,bloom:.5,trans:'flash',who:'',text:'',sfx:[[.1,'engine'],[.6,'title']]},
  ],
  outro4:[
    {d:8.2,draw:w1,rim:['rgba(255,120,90,.7)',0,10],bloom:.55,who:'',text:'At the heart of Fountain City stands GROK\\'s castle. Every water pipe in the city runs straight into it.',sfx:[[.3,'hum'],[3,'slurp']]},
    {d:6.6,draw:w2,rim:['rgba(255,170,90,.75)',-10,8],bloom:.45,trans:'dissolve',who:'Tung Tung',text:'Every drop you took, GROK. I\\'m taking it all back.',sfx:[[.3,'tung'],[2.2,'title']]},
    {d:7.4,draw:w3,rim:CYAN,glitch:.45,bloom:.55,trans:'cut',who:'GROK-9000',text:'My Crusher... broken. Interesting. Come inside, little log. I have been waiting for you.',sfx:[[.2,'boot'],[2,'laugh'],[4,'alarm']]},
    {d:4.4,draw:wEnd,bloom:.5,trans:'iris',who:'',text:'',sfx:[[.1,'title'],[.8,'lock']]},
  ],
"""
if '  intro4:[' not in s:
    rep("""    {d:4.4,draw:yEnd,bloom:.5,trans:'iris',who:'',text:'',sfx:[[.1,'title'],[.8,'lock']]},
  ],
};""","""    {d:4.4,draw:yEnd,bloom:.5,trans:'iris',who:'',text:'',sfx:[[.1,'title'],[.8,'lock']]},
  ],
"""+scripts+"""};""")
else:
    s=re.sub(r"  intro4:\[.*?\n  \],\n  outro4:\[.*?\n  \],\n",lambda m:scripts,s,flags=re.S)
# ---- the stage in the story list
brief="""{id:'1-4',name:'Fountain City',world:'Dustbowl Valley',s4:true,cine:'intro4',outro:'outro4',goal:5,
    brief:[['Tralalero','Good morning, Tung Tung! Fountain City is right down this ramp. GROK\\'s castle is in the middle of it... and so is all our water.'],
      ['Tralalero','No bat today, you need both hands on the wheel! You have hearts. Burning cars, bombs, lasers and bots each cost one. Wreck and you go back to the last checkpoint.'],
      ['Tralalero','GROK bots will chase you down the streets. Keep your speed up and they can\\'t catch you. Watch your mirror! Take corners fast and skim past wrecks: the bots behind you crash.'],
      ['Tralalero','Some bots sleep on the road and wake up when you get close. Swerve! Smash trash cans and crates for hearts... and they say five water bottles are hidden down the side streets.']]}"""
if "s4:true" not in s:
    rep("{id:'1-4',name:'Fountain City',soon:true}",brief)
rep("""['outro3',()=>cineStill('outro3',0,4,800,450,160,120,1600,900).toDataURL('image/jpeg',.84)]];""","""['outro3',()=>cineStill('outro3',0,4,800,450,160,120,1600,900).toDataURL('image/jpeg',.84)],['s14',()=>cineStill('intro4',3,3.4,800,450,160,60,1600,900).toDataURL('image/jpeg',.84)],['outro4',()=>cineStill('outro4',0,6,800,450,160,120,1600,900).toDataURL('image/jpeg',.84)]];""")
rep("artNeed(st.s3?'s13':st.s2?'s12':'s11');if(st.s2&&rec&&rec.clear)artNeed('outro2');if(st.s3&&rec&&rec.clear)artNeed('outro3');","artNeed(st.s4?'s14':st.s3?'s13':st.s2?'s12':'s11');if(st.s2&&rec&&rec.clear)artNeed('outro2');if(st.s3&&rec&&rec.clear)artNeed('outro3');if(st.s4&&rec&&rec.clear)artNeed('outro4');")
rep("$('stArt').src=st.s3?(rec&&rec.clear?ART.outro3:ART.s13):","$('stArt').src=st.s4?(rec&&rec.clear?ART.outro4:ART.s14):st.s3?(rec&&rec.clear?ART.outro3:ART.s13):")
rep("$('stTag').textContent='Stage '+st.id+(st.s3?' · Sky raid · on Bombardiro\\'s back':","$('stTag').textContent='Stage '+st.id+(st.s4?' · City chase · the GROK Crusher':st.s3?' · Sky raid · on Bombardiro\\'s back':")
rep("$('stLandL').textContent=st.s3?'Sky cleared':","$('stLandL').textContent=st.s4?'Water bottles found':st.s3?'Sky cleared':")
rep("const land=(rec&&(st.s3?rec.sky:rec.land))||0;","const land=(rec&&(st.s4?(rec.bottles||0)*20:st.s3?rec.sky:rec.land))||0;")
rep("$('stBest').textContent=st.s3?","$('stBest').textContent=st.s4?(rec&&rec.clear?'Best time '+fmt(rec.best,true)+' · most bots wrecked '+(rec.bots||0)+' · bottles '+(rec.bottles||0)+'/5':'Clear the stage to save a best time.'):st.s3?")
rep("function showNext(i){const st=STAGES[i];STORY.sel=i;STORY.fresh=st.id;showHub();artNeed(st.s3?'s13':st.s2?'s12':'s11');","function showNext(i){const st=STAGES[i];STORY.sel=i;STORY.fresh=st.id;showHub();artNeed(st.s4?'s14':st.s3?'s13':st.s2?'s12':'s11');")
rep("$('snArt').src=st.s3?ART.s13:","$('snArt').src=st.s4?ART.s14:st.s3?ART.s13:")
rep("$('snTag').textContent=st.s3?","$('snTag').textContent=st.s4?'Drive down into GROK\\'s city: burning streets, Pipe Street, GROK-MART, the camps... and the GROK Crusher. Reach the castle gates.':st.s3?")
rep("function objList(st){if(st.s3)","function objList(st){if(st.s4)return ['Reach the castle','Take 4 or fewer hits','Find all 5 hidden water bottles','Defeat the GROK Crusher'];if(st.s3)")
# ---- story flow
rep("function storyStartRace(skipIntro){const st=STORY.stage=STAGES[STORY.sel||0];if(st.s3)return s3Start(skipIntro);","function storyStartRace(skipIntro){const st=STORY.stage=STAGES[STORY.sel||0];if(st.s4)return s4Start(skipIntro);if(st.s3)return s3Start(skipIntro);")
rep("function storyTick(dt){if(!STORY.on||!STORY.group||STORY.s3)return;","function storyTick(dt){if(!STORY.on||!STORY.group||STORY.s3||STORY.s4)return;")
rep("function storyHud(){const st=STORY.stage;if(!st||STORY.s3)return;","function storyHud(){const st=STORY.stage;if(!st||STORY.s3||STORY.s4)return;")
rep("STORY.briefing=false;$('sBrief').hidden=true;if(STORY.s3){s3Launch();return;}","STORY.briefing=false;$('sBrief').hidden=true;if(STORY.s4){s4Launch();return;}if(STORY.s3){s3Launch();return;}")
rep(".replace('[ROLL]',bindLabel('drift'));}",".replace('[ROLL]',bindLabel('drift')).replace('[GAS]',bindLabel('gas')).replace('[DRIFT]',bindLabel('drift'));}")
rep("function storyResults(){if(STORY.s3)return s3Results();","function storyResults(){if(STORY.s4)return s4Results();if(STORY.s3)return s3Results();")
rep("function storyExitRace(){stopMusic();if(STORY.s3)s3Exit();","function storyExitRace(){stopMusic();if(STORY.s4)s4Exit();if(STORY.s3)s3Exit();")
# ---- engine hooks
rep("  if(FD&&FD.on&&(S.mode==='free'||S.mode==='paused')){fdFrame(dt,rawDt);draw(scene);return;}\n","  if(S4&&S4.on&&(S.mode==='city'||S.mode==='cityintro'||S.mode==='cityend'||S.mode==='results'||S.mode==='paused')){s4Frame(dt,rawDt);draw(scene);s4Mirror();return;}\n  if(FD&&FD.on&&(S.mode==='free'||S.mode==='paused')){fdFrame(dt,rawDt);draw(scene);return;}\n")
rep("  if(FD&&FD.on){o.idx=0;o.segA=0;o.segT=0;o.lat=0;o.deckY=o.y||0;return;}","  if((FD&&FD.on)||(S4&&S4.on)){o.idx=0;o.segA=0;o.segT=0;o.lat=0;o.deckY=o.y||0;return;}")
rep("function groundY(o){if(FD&&FD.on)return fdGround(o);","function groundY(o){if(S4&&S4.on)return s4Ground(o);if(FD&&FD.on)return fdGround(o);")
rep("S.mode==='free'||S.mode==='fly'||S.mode==='flyend')){if(STORY.s3)STORY.s3.trig=false;","S.mode==='free'||S.mode==='city'||S.mode==='cityend'||S.mode==='fly'||S.mode==='flyend')){if(STORY.s3)STORY.s3.trig=false;")
rep("function itemDown(){if(FD&&FD.on){if(S.mode==='free')fdHorn();return;}if(STORY.s3)","function itemDown(){if(FD&&FD.on){if(S.mode==='free')fdHorn();return;}if(STORY.s4)return s4Horn();if(STORY.s3)")
rep("function itemUp(){if(FD&&FD.on)return;if(STORY.s3)","function itemUp(){if(FD&&FD.on)return;if(STORY.s4)return;if(STORY.s3)")
rep("(S.mode==='race'||S.mode==='countdown'||(S.mode==='free'&&!(FD&&FD.cine.on))))vis=false;","(S.mode==='race'||S.mode==='countdown'||S.mode==='city'||(S.mode==='free'&&!(FD&&FD.cine.on))))vis=false;")
rep("function artIdle(){if(/^(race|countdown|intro|fly|flyintro|cine)$/.test(S.mode))","function artIdle(){if(/^(race|countdown|intro|fly|flyintro|cine|city|cityend)$/.test(S.mode))")
# ---- stage 4 runs at real-world scale: the kart can be drawn smaller and the camera pulled in
rep("    const s=k.shrinkT>0?.55:k.prismT>0?1.22:1;\n","    const s=(k.shrinkT>0?.55:k.prismT>0?1.22:1)*(k.visS||1);\n")
rep("fz=Math.cos(cam.h)*dir,sc=k.shrinkT>0?.75:1;","fz=Math.cos(cam.h)*dir,sc=(k.shrinkT>0?.75:1)*(k.camS||1);")
# ---- the owner's secret door to Stage 1-4 (see m_secret.js)
rep("const open=i=>!STAGES[i].soon&&(i===0||!!(d.stages[STAGES[i-1].id]&&d.stages[STAGES[i-1].id].clear));","const open=i=>!STAGES[i].soon&&(i===0||!!(d.stages[STAGES[i-1].id]&&d.stages[STAGES[i-1].id].clear)||!!d.dev4);")
rep("$('stTitle').textContent='Dustbowl Valley';","$('stTitle').textContent='Dustbowl Valley';s4SecretHook();")
open(P,'w',encoding='utf-8').write(s)
print('stage 4 applied:',len(mod),'bytes of stage code,',len(cine),'bytes of cutscenes')
