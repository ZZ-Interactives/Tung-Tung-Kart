/* ---- fallback transport: our own peer-to-peer rooms (used when the claude.ai live room isn't available, e.g. on Netlify).
   Players find each other through TWO matchmaking services, whichever works: PeerJS's free public server and this site's own
   Netlify function (/.netlify/functions/sig). The race itself is direct WebRTC between players, never through a server.
   The host relays everyone's updates; if the host leaves, the longest-connected player takes over and everyone reconnects. ---- */
const NETLOG=[];
function netLog(m){const t=new Date(),s=('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2)+':'+('0'+t.getSeconds()).slice(-2);
  NETLOG.push(s+'  '+m);if(NETLOG.length>80)NETLOG.shift();try{console.log('[net] '+m);}catch(e){}
  const e=document.getElementById('olLog');if(e){e.textContent=NETLOG.join('\n');e.scrollTop=1e9;}}
const SIG={url:window.TT_SIG_URL||'/.netlify/functions/sig',ok:undefined,probe:null};
const nsleep=ms=>new Promise(r=>setTimeout(r,ms));
async function sigCall(body,ms){const ac=new AbortController(),to=setTimeout(()=>ac.abort(),ms||9000);
  try{const r=await fetch(SIG.url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:ac.signal,cache:'no-store'});
    let j=null;try{j=await r.json();}catch(e){}if(!j)throw {code:'upstream_error',message:'http '+r.status};return j;}
  catch(e){throw e&&e.code?e:{code:'upstream_error',message:String(e&&e.message||e)};}finally{clearTimeout(to);}}
function sigAvailable(){
  if(SIG.ok!==undefined)return Promise.resolve(SIG.ok);
  if(SIG.probe)return SIG.probe;
  return SIG.probe=(async()=>{let ok=false;
    if(/^https?:$/.test(location.protocol)){try{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),6000);const r=await fetch(SIG.url,{cache:'no-store',signal:ac.signal});clearTimeout(t);const j=await r.json();ok=!!(j&&j.ok&&j.v);}catch(e){ok=false;}}
    SIG.ok=ok;netLog('Site matchmaking: '+(ok?'online':'not available here'));return ok;})();}
function netIce(){const c=window.TT_PEER_CFG;if(c&&c.config&&c.config.iceServers)return c.config.iceServers;
  try{const d=window.peerjs&&window.peerjs.util&&window.peerjs.util.defaultConfig;if(d&&d.iceServers)return d.iceServers;}catch(e){}
  return [{urls:'stun:stun.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}];}
const nrid=n=>{let s='';const a='abcdefghijkmnpqrstuvwxyz23456789';for(let i=0;i<n;i++)s+=a[(Math.random()*a.length)|0];return s;};
/* one connection to another player, whatever carried it */
function netConn(send,close,via,pc){
  const c={open:true,pc:pc||null,remote:null,via,last:performance.now(),sent:0,onmsg:null,onclose:null,
    send(m){if(!c.open)return;try{send(m);c.sent=performance.now();}catch(e){}},
    close(){if(!c.open)return;c.open=false;try{close();}catch(e){}if(c.onclose)c.onclose();},
    _in(m){c.last=performance.now();if(!m||m.t==='ping')return;if(c.onmsg)c.onmsg(m);},
    _gone(){if(!c.open)return;c.open=false;try{close();}catch(e){}if(c.onclose)c.onclose();}};
  return c;}
function connPJ(dc){const c=netConn(m=>dc.send(m),()=>dc.close(),'PeerJS',dc.peerConnection);dc.on('data',m=>c._in(m));dc.on('close',()=>c._gone());dc.on('error',()=>c._gone());return c;}
function connRTC(pc,ch){const c=netConn(m=>ch.send(JSON.stringify(m)),()=>{try{ch.close();}catch(e){}try{pc.close();}catch(e){}},'site matchmaking',pc);
  ch.onmessage=e=>{let m=null;try{m=JSON.parse(e.data);}catch(x){}if(m)c._in(m);};ch.onclose=()=>c._gone();
  pc.addEventListener('connectionstatechange',()=>{if(pc.connectionState==='failed'||pc.connectionState==='closed')c._gone();});return c;}
function iceDone(pc,ms){return new Promise(r=>{if(pc.iceGatheringState==='complete')return r();const t=setTimeout(r,ms);
  pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);r();}});});}
/* joiner side of site matchmaking: post a WebRTC offer, wait for the host's answer, open a data channel */
async function sigDial(room,me,cancelled){
  const n=nrid(8),pc=new RTCPeerConnection({iceServers:netIce()}),ch=pc.createDataChannel('ttk',{ordered:true});
  try{
    await pc.setLocalDescription(await pc.createOffer());await iceDone(pc,2500);
    if(cancelled())throw {code:'cancel'};
    const r=await sigCall({op:'offer',room,id:me,n,sdp:pc.localDescription.sdp});
    if(!r.ok)throw {code:r.code==='not_found'?'not_found':'upstream_error'};
    netLog('Asked the host to connect (site matchmaking)');
    let ans=null;
    for(let i=0;i<26&&!ans;i++){await nsleep(i<2?1300:1000);if(cancelled())throw {code:'cancel'};
      let f=null;try{f=await sigCall({op:'fetch',room,id:me,n});}catch(e){continue;}
      if(f&&f.sdp)ans=f;else if(f&&f.alive===false&&i>5)throw {code:'not_found'};}
    if(!ans)throw {code:'timeout'};
    await pc.setRemoteDescription({type:'answer',sdp:ans.sdp});
    await new Promise((res,rej)=>{if(ch.readyState==='open')return res();const t=setTimeout(()=>rej({code:'blocked'}),12000);ch.onopen=()=>{clearTimeout(t);res();};
      pc.addEventListener('connectionstatechange',()=>{if(pc.connectionState==='failed'){clearTimeout(t);rej({code:'blocked'});}});});
    return connRTC(pc,ch);
  }catch(e){try{pc.close();}catch(x){}throw e;}
}
/* host side of site matchmaking: heartbeat the room and answer join requests */
function sigHostLoop(room,me,accept,isBusy,onLost){
  let stop=false,timer=null,fails=0;const t0=performance.now();
  const answer=async o=>{const pc=new RTCPeerConnection({iceServers:netIce()});let opened=false;
    pc.ondatachannel=e=>{const ch=e.channel,go=()=>{opened=true;if(!stop)accept(connRTC(pc,ch));else pc.close();};if(ch.readyState==='open')go();else ch.onopen=go;};
    setTimeout(()=>{if(!opened)try{pc.close();}catch(x){}},25000);
    try{await pc.setRemoteDescription({type:'offer',sdp:o.sdp});await pc.setLocalDescription(await pc.createAnswer());await iceDone(pc,2500);
      const r=await sigCall({op:'answer',room,id:me,to:o.from,n:o.n,sdp:pc.localDescription.sdp});if(r.ok)netLog('Answered a join request (site matchmaking)');}
    catch(e){try{pc.close();}catch(x){}}};
  const tick=async()=>{if(stop)return;let r=null;
    try{r=await sigCall({op:'poll',room,id:me});if(fails>=3)netLog('Site matchmaking is answering again');fails=0;}
    catch(e){if(++fails===3)netLog('Site matchmaking is not answering (still trying)');}
    if(stop)return;
    if(r&&r.ok===false&&r.code==='not_host'){netLog('Site matchmaking: the room code now belongs to someone else');if(onLost)onLost();return;}
    if(r&&r.offers)for(const o of r.offers)answer(o);
    timer=setTimeout(tick,isBusy()?10000:performance.now()-t0<300000?2500:5000);};
  tick();
  return ()=>{stop=true;clearTimeout(timer);};
}
function p2pApi(){
  if(typeof RTCPeerConnection==='undefined')return null;
  return {name:'p2p',join:(name,create)=>p2pRoom(String(name).replace(/^tt-/,'').toLowerCase().replace(/[^a-z0-9]/g,''),create)};
}
async function p2pRoom(room,create){
  const me=nrid(10),table=new Map([[me,{}]]),conns=new Map(),fns=[],errs=[],stats=[],rejoin=new Map(),cleanups=[];
  const st={role:null,hostId:null,hostConn:null,dead:false,peer:null,alias:null,stopSig:null,migrating:false,dial:0};
  let pend={joined:new Set(),updated:new Set(),left:new Map()},sched=false;
  const pjOk=typeof Peer!=='undefined',cfg=window.TT_PEER_CFG;
  const list=()=>[...table].map(([id,pr])=>({peer:id,presence:pr,isMe:id===me,sameTab:id===me,kind:'viewer',guest:false,by:null,updatedAt:Date.now()}));
  const flush=()=>{sched=false;if(st.dead)return;const ps=list(),by=new Map(ps.map(p=>[p.peer,p]));
    const ch={peers:ps,joined:[...pend.joined].filter(i=>by.has(i)).map(i=>by.get(i)),updated:[...pend.updated].filter(i=>by.has(i)&&!pend.joined.has(i)).map(i=>by.get(i)),left:[...pend.left.values()].filter(p=>!by.has(p.peer))};
    pend={joined:new Set(),updated:new Set(),left:new Map()};for(const f of fns)try{f(ch);}catch(e){console.error(e);}};
  const kick=()=>{if(!sched){sched=true;setTimeout(flush,16);}};
  const merge=(pr,patch)=>{for(const k in patch){if(patch[k]===null)delete pr[k];else pr[k]=patch[k];}};
  const status=(s,x)=>{for(const f of stats)try{f(s,x);}catch(e){}};
  const fail=code=>{if(st.dead)return;netLog('Room closed ('+code+')');for(const e of errs)try{e({code,message:code});}catch(x){}};
  const bcast=(m,except)=>{for(const [id,c] of conns)if(id!==except)c.send(m);};
  const addPeer=(id,pr)=>{const had=table.has(id);table.set(id,pr||{});if(had)pend.updated.add(id);else pend.joined.add(id);kick();};
  const dropLocal=id=>{if(id===me||!table.has(id))return;const o=list().find(p=>p.peer===id);table.delete(id);if(o)pend.left.set(id,o);kick();};
  const nick=id=>{const p=table.get(id);return p&&p.nm?String(p.nm).slice(0,12):'a player';};
  /* heartbeat: keep idle channels warm and notice players that vanished without saying goodbye */
  let hbLast=performance.now();
  const hb=setInterval(()=>{const now=performance.now(),all=[...conns.values()],stalled=now-hbLast>2500;hbLast=now;if(st.hostConn)all.push(st.hostConn);
    for(const c of all){if(now-c.sent>900)c.send({t:'ping'});
      if(stalled){c.last=Math.max(c.last,now-4000);continue;} /* we were frozen ourselves (loading a track, tab in background): give them a fresh chance */
      const ice=c.pc&&c.pc.iceConnectionState;
      if(now-c.last>15000||(now-c.last>4000&&(ice==='disconnected'||ice==='failed'||ice==='closed'))){netLog('No signal from '+(c.remote?nick(c.remote):'the host')+' for '+Math.round((now-c.last)/1000)+'s');c.close();}}},1000);
  cleanups.push(()=>clearInterval(hb));
  /* ---------- host: accept players ---------- */
  const dropPeer=id=>{if(st.dead||!table.has(id))return;netLog(nick(id)+' left');dropLocal(id);bcast({t:'left',peer:id});};
  const accept=c=>{
    if(st.dead){c.close();return;}
    const tmo=setTimeout(()=>{if(!c.remote)c.close();},8000);
    c.onmsg=m=>{
      if(m.t==='hello'){
        if(st.role!=='host'){c.send({t:'reject',code:'not_host'});setTimeout(()=>c.close(),300);
          if(st.hostConn&&performance.now()-st.hostConn.last>2500)st.hostConn.close(); /* someone thinks I'm the new host: check my own link */
          return;}
        const id=String(m.id||'');if(!/^[a-z0-9]{6,24}$/.test(id)||id===me){c.close();return;}
        if(!conns.has(id)&&conns.size>=11){c.send({t:'reject',code:'full'});setTimeout(()=>c.close(),300);return;}
        clearTimeout(tmo);const old=conns.get(id);if(old&&old!==c){old.remote=null;old.close();}
        c.remote=id;conns.set(id,c);if(rejoin.has(id)){clearTimeout(rejoin.get(id));rejoin.delete(id);}
        addPeer(id,m.pr&&typeof m.pr==='object'?m.pr:{});
        c.send({t:'welcome',host:me,peers:[...table].map(([pid,pr])=>({peer:pid,presence:pr}))});
        bcast({t:'join',peer:id,p:table.get(id)},id);
        netLog((nick(id)==='a player'?'A player':nick(id))+' connected ('+c.via+')');return;}
      if(!c.remote)return;
      if(m.t==='p'&&m.p){const pr=table.get(c.remote);if(!pr)return;merge(pr,m.p);bcast({t:'p',from:c.remote,p:m.p},c.remote);pend.updated.add(c.remote);kick();}
      else if(m.t==='bye'){const id=c.remote;c.remote=null;conns.delete(id);c.close();dropPeer(id);}};
    c.onclose=()=>{clearTimeout(tmo);if(st.dead)return;const id=c.remote;if(id&&conns.get(id)===c){conns.delete(id);dropPeer(id);}};
  };
  const acceptPJ=dc=>{
    const go=()=>accept(connPJ(dc));if(dc.open)go();else{dc.on('open',go);setTimeout(()=>{if(!dc.open)try{dc.close();}catch(e){}},10000);}};
  /* ---------- PeerJS matchmaking ---------- */
  const openPeer=id=>new Promise(res=>{if(!pjOk)return res(null);let p;try{p=cfg?new Peer(id,cfg):new Peer(id);}catch(e){return res(null);}
    let done=false;const fin=v=>{if(done)return;done=true;res(v);};
    p.on('open',()=>fin(p));p.on('error',e=>{if(!done){fin(e&&e.type==='unavailable-id'?'taken':null);try{p.destroy();}catch(x){}}});
    setTimeout(()=>{if(!done){fin(null);try{p.destroy();}catch(x){}}},9000);});
  const setPeer=p=>{st.peer=p;p.on('connection',acceptPJ);p.on('disconnected',()=>{if(!st.dead)try{p.reconnect();}catch(e){}});p.on('error',()=>{});};
  let aliasTry=0;
  const claimAlias=async strict=>{if(!pjOk||st.dead||st.role!=='host')return;
    const p=await openPeer('ttk-'+room);if(st.dead||st.role!=='host'){if(p&&p!=='taken')p.destroy();return;}
    if(p&&p!=='taken'){st.alias=p;p.on('connection',acceptPJ);p.on('disconnected',()=>{if(!st.dead)try{p.reconnect();}catch(e){}});p.on('error',()=>{});netLog('PeerJS matchmaking: room '+room.toUpperCase()+' is listed');return 'ok';}
    if(p==='taken'&&strict)return 'taken';
    if(++aliasTry<30)setTimeout(()=>claimAlias(false),5000);return p==='taken'?'taken':'down';};
  /* ---------- connect to the host ---------- */
  const helloTo=c=>new Promise((res,rej)=>{
    const t=setTimeout(()=>{c.close();rej({code:'timeout'});},7000);
    c.onmsg=m=>{if(m.t==='welcome'){clearTimeout(t);res(m);}else if(m.t==='reject'){clearTimeout(t);c.close();rej({code:m.code||'refused'});}};
    c.onclose=()=>{clearTimeout(t);rej({code:'blocked'});};
    c.send({t:'hello',id:me,pr:table.get(me)});});
  const dialPJ=(target,lock)=>new Promise((res,rej)=>{
    if(!st.peer||st.peer.destroyed)return rej({code:'unavailable'});
    let dc;try{dc=st.peer.connect(target,{reliable:true,serialization:'json'});}catch(e){return rej({code:'unavailable'});}
    let done=false;const fin=(f,v)=>{if(done)return;done=true;clearTimeout(t);st.peer.off('error',onErr);f(v);};
    const onErr=e=>{if(e&&e.type==='peer-unavailable'&&String(e.message||'').indexOf(target)>=0){fin(rej,{code:'not_found'});}};
    st.peer.on('error',onErr);
    const t=setTimeout(()=>{try{dc.close();}catch(e){}fin(rej,{code:'blocked'});},10000);
    dc.on('open',()=>{if(lock.won){try{dc.close();}catch(e){}fin(rej,{code:'cancel'});return;}fin(res,connPJ(dc));});
    dc.on('error',()=>fin(rej,{code:'blocked'}));});
  /* try every matchmaking route at once; the first channel that opens wins and says hello */
  const connectHost=async(pjTarget,quick)=>{
    const lock={won:false};const errsSeen=[];
    const attempt=async(kind)=>{
      let c;
      if(kind==='pj')c=await dialPJ(pjTarget,lock);
      else{if(!(await sigAvailable()))throw {code:'unavailable'};
        if(st.peer&&!st.peer.destroyed){for(let i=0;i<(quick?10:25)&&!lock.won;i++)await nsleep(100);}
        if(lock.won)throw {code:'cancel'};c=await sigDial(room,me,()=>lock.won);}
      if(lock.won){c.close();throw {code:'cancel'};}
      lock.won=true;
      try{const w=await helloTo(c);return {c,w};}catch(e){lock.won=false;throw e;}};
    const tries=['pj','sig'].map(k=>attempt(k).catch(e=>{errsSeen.push(e&&e.code||'error');throw e;}));
    let tmr;const limit=new Promise((_,rej)=>{tmr=setTimeout(()=>{if(!lock.won){lock.won=true;errsSeen.push('timeout');}rej({code:'timeout'});},quick?6500:40000);});
    try{const r=await Promise.race([Promise.any(tries),limit]);clearTimeout(tmr);return r;}
    catch(e){clearTimeout(tmr);const has=c=>errsSeen.includes(c);if(has('not_host'))throw {code:'not_host'};throw {code:has('full')?'full':has('blocked')||has('timeout')?'blocked':has('not_found')?'not_found':'upstream_error'};}
  };
  const onHostMsg=m=>{
    if(m.t==='join'){addPeer(m.peer,m.p||{});}
    else if(m.t==='p'){const pr=table.get(m.from);if(pr&&m.p){merge(pr,m.p);pend.updated.add(m.from);kick();}}
    else if(m.t==='left'){dropLocal(m.peer);}
    else if(m.t==='bye'){st.byeFrom=st.hostId;}};
  const adoptHost=({c,w})=>{
    st.role='client';st.hostId=w.host;st.hostConn=c;
    const seen=new Set([me]);
    for(const p of w.peers||[]){if(p.peer===me)continue;seen.add(p.peer);addPeer(p.peer,p.presence||{});}
    for(const id of [...table.keys()])if(!seen.has(id))dropLocal(id);
    c.onmsg=onHostMsg;c.onclose=()=>{if(st.hostConn!==c||st.dead)return;st.hostConn=null;hostLost();};
    netLog('Connected to the host ('+c.via+')');kick();};
  /* ---------- host migration ---------- */
  const elect=skip=>{let b=null;for(const [id,pr] of table){if(skip.has(id))continue;const t=+pr.t0||1e15;if(!b||t<b.t||(t===b.t&&id<b.id))b={t,id};}return b&&b.id;};
  const becomeHost=async prev=>{
    st.role='host';st.hostId=me;st.hostConn=null;netLog('You are the host now');status('host');
    for(const id of table.keys())if(id!==me&&!conns.has(id))rejoin.set(id,setTimeout(()=>{rejoin.delete(id);if(!conns.has(id))dropPeer(id);},30000));
    if(st.peer)claimAlias(false);
    if(await sigAvailable()){try{await sigCall({op:'host',room,id:me,prev});}catch(e){}if(!st.dead&&st.role==='host')st.stopSig=sigHostLoop(room,me,accept,()=>busy(),()=>{});}
  };
  const busy=()=>{for(const p of table.values())if(p.ph==='race')return true;return conns.size>=11;};
  const hostLost=async()=>{
    if(st.migrating||st.dead)return;st.migrating=true;const old=st.hostId,bye=st.byeFrom===old;
    netLog(bye?'The host left the room':'Lost the connection to the host');status('migrating');
    try{
      if(!bye){for(let k=0;k<1&&!st.dead;k++){try{adoptHost(await connectHost('ttkp-'+old,true));st.migrating=false;status('rejoined');return;}catch(e){if(e.code==='full'){fail('full');return;}}}}
      if(st.dead)return;
      dropLocal(old);const skip=new Set([old]);const end=performance.now()+45000;
      while(!st.dead&&performance.now()<end){
        const h=elect(skip);
        if(!h||h===me){await becomeHost(old);st.migrating=false;return;}
        netLog('Switching to the new host: '+nick(h));
        let ok=false;const giveUp=performance.now()+25000;
        while(!ok&&!st.dead&&performance.now()<giveUp){try{const r=await connectHost('ttkp-'+h,false);adoptHost(r);ok=true;}catch(e){if(e.code==='full'){fail('full');return;}await nsleep(e.code==='not_host'?1200:2000);}}
        if(ok){st.migrating=false;status('rejoined');return;}
        netLog('Could not reach '+nick(h));skip.add(h);dropLocal(h);}
      fail('revoked');
    }finally{st.migrating=false;}
  };
  /* ---------- start ---------- */
  const [p0]=await Promise.all([openPeer('ttkp-'+me),sigAvailable()]);
  if(p0&&p0!=='taken'){setPeer(p0);netLog('PeerJS matchmaking: online');}else netLog(pjOk?'PeerJS matchmaking: not reachable':'PeerJS library did not load');
  const R={name:'p2p',
    emit:async()=>{},on:()=>()=>{},connected:()=>!st.dead,onConnection:()=>()=>{},peers:()=>list(),
    presence:async patch=>{merge(table.get(me),patch);pend.updated.add(me);kick();
      if(st.role==='host')bcast({t:'p',from:me,p:patch});else if(st.hostConn)st.hostConn.send({t:'p',p:patch});},
    onPeers:(fn,onErr)=>{fns.push(fn);if(onErr)errs.push(onErr);for(const id of table.keys())pend.joined.add(id);kick();return()=>{const i=fns.indexOf(fn);if(i>=0)fns.splice(i,1);};},
    onStatus:fn=>{stats.push(fn);return()=>{const i=stats.indexOf(fn);if(i>=0)stats.splice(i,1);};},
    isHost:()=>st.role==='host',
    leave:async now=>{if(st.dead)return;
      if(st.role==='host'){bcast({t:'bye'});if(SIG.ok){const body=JSON.stringify({op:'close',room,id:me});
        if(now&&navigator.sendBeacon)navigator.sendBeacon(SIG.url,new Blob([body],{type:'text/plain'}));else sigCall({op:'close',room,id:me},3000).catch(()=>{});}}
      else if(st.hostConn)st.hostConn.send({t:'bye'});
      st.dead=true;netLog('Left the room');
      (now?f=>f():f=>setTimeout(f,150))(()=>{for(const c of conns.values())c.close();if(st.hostConn)st.hostConn.close();if(st.stopSig)st.stopSig();
        for(const t of rejoin.values())clearTimeout(t);for(const f of cleanups)f();
        try{if(st.alias)st.alias.destroy();}catch(e){}try{if(st.peer)st.peer.destroy();}catch(e){}},150);}};
  const abort=e=>{st.dead=true;for(const f of cleanups)f();if(st.stopSig)st.stopSig();try{if(st.alias)st.alias.destroy();}catch(x){}try{if(st.peer)st.peer.destroy();}catch(x){}throw e;};
  const anyRoute=st.peer||SIG.ok;
  if(!anyRoute)abort({code:'upstream_error',message:'no matchmaking reachable'});
  if(create){
    st.role='host';st.hostId=me;
    let pj=null,sg=null;
    if(st.peer){pj=await claimAlias(true);if(pj==='taken')abort({code:'exists'});}
    if(SIG.ok){try{const r=await sigCall({op:'host',room,id:me});sg=r.ok?'ok':r.code;}catch(e){sg='down';}if(sg==='exists')abort({code:'exists'});}
    if(pj!=='ok'&&sg!=='ok')abort({code:'upstream_error',message:'no matchmaking reachable'});
    if(sg==='ok')st.stopSig=sigHostLoop(room,me,accept,()=>busy(),()=>{});
    netLog('Room '+room.toUpperCase()+' is open'+(pj==='ok'&&sg==='ok'?' (both matchmaking services)':pj==='ok'?' (PeerJS only)':' (site matchmaking only)'));
  }else{
    netLog('Looking for room '+room.toUpperCase()+'…');
    try{adoptHost(await connectHost('ttk-'+room,false));}catch(e){abort(e);}
  }
  return R;
}
