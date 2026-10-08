import sys,re
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
NEW=open('/home/claude/ttk-net/src/net_p2p.js').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: sys.exit('anchor count %d != %d: %r'%(c,n,a[:120]))
    s=s.replace(a,b)
# 1. transport
i=s.index('/* ---- fallback transport: WebRTC peer-to-peer via PeerJS')
j=s.index('\nconst withTimeout=',i)
s=s[:i]+NEW.rstrip()+'\n'+s[j:]
# 2. platform -> p2p fallback no longer needs PeerJS itself
rep("catch(e){if(typeof Peer!=='undefined'){olMsg('Trying a direct connection…');NET.api=p2pApi();}else throw e;}",
    "catch(e){const pa=p2pApi();if(pa){olMsg('Trying a direct connection…');NET.api=pa;}else throw e;}")
rep("catch(e){if(api===NET.platform&&typeof Peer!=='undefined'){olMsg('Trying a direct connection…');NET.api=p2pApi();R=await NET.api.join('tt-'+code.toLowerCase(),false);}else throw e;}",
    "catch(e){const pa=api===NET.platform?p2pApi():null;if(pa){olMsg('Trying a direct connection…');NET.api=pa;R=await NET.api.join('tt-'+code.toLowerCase(),false);}else throw e;}")
rep("if(!api){olMsg('Online play could not start here (the connection library did not load). Check your network and reload.',true);return;}",
    "if(!api){olMsg('Online play is not supported in this browser. Try an up-to-date Chrome, Safari, Edge or Brave.',true);return;}")
rep("olMsg('Connecting to the online service…');","olMsg('Connecting to the online service…');netLog((create?'Creating a room':'Joining room '+String(code).toUpperCase())+' from '+location.host);")
# 3. clearer errors
i=s.index("  }catch(e){if(e&&e.code==='timeout'){olMsg('The room did not answer.")
j=s.index("\n  finally{NET.joining=false;}",i)
s=s[:i]+"""  }catch(e){const c=e&&e.code,p2p=NET.api&&NET.api.name==='p2p';netLog('Could not '+(create?'create':'join')+' the room: '+(c||String(e&&e.message||e)));
    const M={timeout:p2p?'The room did not answer in time. Check the code, make sure the host still has the game open, and try again.':'The room did not answer. Make sure you and your friend are both signed in to Claude and opening this same shared game, then try again.',
      not_permitted:'Online play is not available for your account on this game. Ask the owner to share it with you.',
      not_found:'No room with that code. Check the code, and make sure the host still has the game open.',
      blocked:'Found the room but could not connect to the host. One of your networks is blocking direct connections (common on school Wi-Fi and some phone networks). Try a different Wi-Fi or a phone hotspot.',
      full:'That room is full.',exists:'Could not get a free room code. Try again.',
      upstream_error:'Could not reach the matchmaking servers. Check your internet connection and try again.'};
    olMsg(M[c]||('Could not '+(create?'create':'join')+' a room'+(c?' ('+c+')':'')+'.'),true);NET.R=null;}"""+s[j:]
# 4. host-switch status
rep("    R.presence({t0:NET.t0,nm:netNick(),rc:SET.racer,ph:'lobby'}).catch(()=>{});",
    "    if(R.onStatus)NET.unsub.push(R.onStatus(netStatus));\n    R.presence({t0:NET.t0,nm:netNick(),rc:SET.racer,ph:'lobby'}).catch(()=>{});")
rep("function netLeaveRoom(){",
"""function netStatus(st){
  if(st==='migrating'){if(NET.racing)showMsg('Host left. Switching host…',3,'warn');else lobbyNote('Lost the host. Reconnecting…',true);}
  else if(st==='host'){if(NET.racing)showMsg('You are the host now',2.5,'good');else lobbyNote('The host left. You are the host now.');renderLobby();}
  else if(st==='rejoined'){if(NET.racing)showMsg('Reconnected',1.6,'good');else lobbyNote('Reconnected.');renderLobby();}
}
addEventListener('pagehide',()=>{if(NET.R&&NET.R.name==='p2p')try{NET.R.leave(true);}catch(e){}});
function lobbyNote(t,bad){const e=$('olNet');if(e){e.textContent=t||'';e.className='ol-msg'+(bad?' bad':'');}}
function netLeaveRoom(){""")
# 5. new host takes over the old host's bots (mid-race) and track settings (lobby)
rep("  for(const p of ch.left){delete NET.snaps[p.peer];",
"""  const nh=netHost();
  for(const p of ch.left){delete NET.snaps[p.peer];
    if(NET.racing)for(const k of karts){if(k.bot==null||k.peer!==p.peer)continue;
      if(nh===NET.me){k.remote=false;k.peer=undefined;k.bot=null;k.sync=false;k.vp&&k.vp.forEach(v=>disposeObj(v.mesh));k.vp=[];if(k.ai)k.ai.cap=CPU[SET.cpu].cap*(.965+Math.random()*.06);locate(k);}
      else if(nh)k.peer=nh;}
    if(!NET.racing&&nh===NET.me&&p.presence&&p.presence.cfg&&NET.R){NET.cfg=Object.assign({},NET.cfg,p.presence.cfg);NET.R.presence({cfg:NET.cfg}).catch(()=>{});}""")
rep("const host=netHost(),iHost=host===NET.me,ul=$('olPlayers');","const host=netHost(),iHost=!!NET.me&&host===NET.me,ul=$('olPlayers');")
# 6. UI: connection details + updated note
rep('<p id="olWait" class="ol-note"></p>','<p id="olNet" class="ol-msg" role="status"></p>\n      <p id="olWait" class="ol-note"></p>')
rep("function showLobby(){$('olHome').hidden=true;","function showLobby(){if(!NET.racing&&$('olLobby').hidden)lobbyNote('');$('olHome').hidden=true;")
rep("""      <button class="cta alt" id="olLeave">Leave room</button>
    </div>""","""      <button class="cta alt" id="olLeave">Leave room</button>
    </div>
    <details class="ol-log"><summary>Connection details</summary><pre id="olLog">Nothing yet.</pre></details>""")
rep("Everyone races live on the same track, no bots. Friends join by opening this game and typing your room code (peer-to-peer, so the host should keep the tab open).",
    "Everyone races live on the same track. Friends join by opening this game and typing your room code. If the host leaves, the next player takes over automatically.")
rep("#olPlayers{list-style:none;",""".ol-log{margin-top:16px;color:var(--muted);font:700 12px var(--body)}.ol-log summary{cursor:pointer;letter-spacing:.08em;text-transform:uppercase}
#olLog{margin:8px 0 0;max-height:180px;overflow:auto;padding:8px 10px;border:2px solid var(--line);border-radius:9px;background:rgba(0,0,0,.25);font:600 11.5px/1.45 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;color:#d9d4ff;-webkit-user-select:text;user-select:text}
#olPlayers{list-style:none;""")
open(dst,'w').write(s)
print('applied')
