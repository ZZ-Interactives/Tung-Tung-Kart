# Tung Tung Kart — Netlify deploy

- `public/index.html` — the game
- `netlify/functions/sig.mjs` — matchmaking for online rooms (Netlify Blobs store `ttk-signal`). Only introduces players; races are peer-to-peer.
- `tools/net_p2p.js` + `tools/apply_mp.py` — the multiplayer transport, and the script that patches it into a fresh copy of the game.

Deploy: `netlify deploy --prod` from this folder (needs the function, so drag-and-drop of index.html alone is not enough).

## Online races on strict networks (school Wi-Fi)

Online races connect players directly. Some networks block that, so the game can relay through a TURN server.
`netlify/functions/turn.mjs` hands out relay passes. Nothing to set up: by default it uses the free public
[Open Relay Project](https://www.metered.ca/tools/openrelay/) (shared, no account, best effort).

Optional, if you ever want your own relay account instead, add Netlify environment variables and redeploy:
Metered (`METERED_APP`, `METERED_API_KEY`) or Cloudflare (`CF_TURN_KEY_ID`, `CF_TURN_API_TOKEN`).

The online screen's connection log shows "Relay: ready (openrelay)" when it's working.
