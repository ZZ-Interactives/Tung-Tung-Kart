/* ---- backup relay: Firebase Realtime Database (free Spark plan, no card). When a direct player-to-player link can't open
   (school Wi-Fi blocks those), race messages travel through Firebase over an ordinary secure web connection instead.
   Layout:  r/<room>/h = host id      r/<room>/x/<host>/<player+tag>/{o,u,d}  one link: o = open marker, u = player→host, d = host→player
   Messages are batched (15 per second) and deleted as soon as they are read, so the database stays nearly empty. ---- */
const FBR={url:window.TT_FB_URL||'https://tung-tung-kart-default-rtdb.firebaseio.com',db:null,p:null,ok:undefined};
function fbLoadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function fbWrap(d){return {
  set:(p,v)=>d.ref(p).set(v),push:(p,v)=>d.ref(p).push(v),remove:p=>d.ref(p).remove(),get:p=>d.ref(p).once('value').then(s=>s.val()),
  dropOnLeave:p=>d.ref(p).onDisconnect().remove(),
  onAdd:(p,cb)=>{const r=d.ref(p),f=s=>cb(s.key,s.val());r.on('child_added',f);return()=>r.off('child_added',f);},
  onRemove:(p,cb)=>{const r=d.ref(p),f=s=>cb(s.key);r.on('child_removed',f);return()=>r.off('child_removed',f);}};}
function fbReady(){
  if(FBR.ok!==undefined)return Promise.resolve(FBR.ok);
  if(FBR.p)return FBR.p;
  return FBR.p=(async()=>{let ok=false;
    try{
      if(window.TT_FB_MOCK){FBR.db=window.TT_FB_MOCK;ok=true;}
      else if(/^https?:$/.test(location.protocol)&&FBR.url){
        const V='https://cdn.jsdelivr.net/npm/firebase@9.23.0/',to=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j('timeout'),ms))]);
        if(!(window.firebase&&window.firebase.database)){await to(fbLoadScript(V+'firebase-app-compat.js'),9000);await to(fbLoadScript(V+'firebase-database-compat.js'),9000);}
        const fb=window.firebase,app=(fb.apps||[]).find(a=>a.name==='ttk')||fb.initializeApp({databaseURL:FBR.url},'ttk'),d=app.database();
        ok=await new Promise(res=>{const r=d.ref('.info/connected');let t=0;const f=s=>{if(s.val()===true){clearTimeout(t);r.off('value',f);res(true);}};t=setTimeout(()=>{r.off('value',f);res(false);},9000);r.on('value',f);});
        if(ok)FBR.db=fbWrap(d);}
    }catch(e){ok=false;}
    FBR.ok=ok;FBR.p=null;netLog('Backup relay (Firebase): '+(ok?'online':'not reachable'));return ok;})();}
/* one link over Firebase; outgoing messages are batched and repeated presence updates merged */
function fbConn(base,inbox,outbox,onEnd){const db=FBR.db;let offs=[],q=[],tm=0;
  const flush=()=>{tm=0;if(!q.length)return;const b=q;q=[];try{db.push(base+'/'+outbox,{j:JSON.stringify(b)});}catch(e){}};
  const send=m=>{if(m&&m.t==='p'&&m.p){const last=q[q.length-1];if(last&&last.t==='p'&&last.from===m.from){last.p=Object.assign({},last.p,m.p);}else q.push({t:'p',from:m.from,p:Object.assign({},m.p)});}
    else if(m&&m.t==='ping'){if(!q.length)q.push(m);}else q.push(m);if(!tm)tm=setTimeout(flush,66);};
  const c=netConn(m=>{if(!c.open&&m&&m.t!=='bye')return;send(JSON.parse(JSON.stringify(m)));},()=>{flush();for(const f of offs)f();offs=[];clearTimeout(tm);if(onEnd)setTimeout(onEnd,400);},'Firebase relay',null);
  offs.push(db.onAdd(base+'/'+inbox,(k,v)=>{db.remove(base+'/'+inbox+'/'+k);let b=null;try{b=JSON.parse(v&&v.j);}catch(e){}if(Array.isArray(b))for(const m of b){if(m)c._in(m);}}));
  return c;}
/* host: listen for players knocking on this host's door */
function fbHostLoop(room,me,accept){let stop=false;const db=FBR.db,root='r/'+room,mine=root+'/x/'+me,links=new Map();
  db.set(root+'/h',me);db.dropOnLeave(root+'/h');db.dropOnLeave(mine);
  const offA=db.onAdd(mine,jid=>{if(stop||!/^[a-z0-9]{6,30}$/.test(jid))return;const old=links.get(jid);if(old){links.delete(jid);old._gone();}
    const base=mine+'/'+jid;let c=null;c=fbConn(base,'u','d',()=>{if(links.get(jid)===c)links.delete(jid);db.remove(base);});links.set(jid,c);accept(c);});
  const offR=db.onRemove(mine,jid=>{const c=links.get(jid);if(c){links.delete(jid);c._gone();}});
  netLog('Backup relay: room '+room.toUpperCase()+' is listed');
  return ()=>{stop=true;offA();offR();for(const c of links.values())c.close();
    db.get(root+'/h').then(h=>{if(h===me)db.remove(root+'/h');}).catch(()=>{});setTimeout(()=>db.remove(mine),500);};}
/* player: knock on the host's door. target is 'ttkp-<host id>' when we know the host, or 'ttk-<room>' for the room's listed host */
async function fbDial(room,me,target,cancelled){
  if(!(await fbReady()))throw {code:'unavailable'};const db=FBR.db,root='r/'+room;
  let hid=String(target||'').indexOf('ttkp-')===0?String(target).slice(5):null;
  if(!hid){hid=await db.get(root+'/h');if(!hid||typeof hid!=='string')throw {code:'not_found'};}
  if(cancelled())throw {code:'cancel'};
  const key=me+nrid(4),base=root+'/x/'+hid+'/'+key; /* a fresh folder per attempt, so cleanup of an old link never hits a new one */
  db.dropOnLeave(base);await db.set(base+'/o',1);
  let offR=null;const c=fbConn(base,'d','u',()=>{if(offR)offR();db.remove(base);});
  offR=db.onRemove(root+'/x/'+hid,k=>{if(k===key)c._gone();});
  netLog('Knocking through the backup relay');
  return c;}
