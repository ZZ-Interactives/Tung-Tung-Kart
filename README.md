# Tung Tung Kart — Netlify deploy

- `public/index.html` — the game
- `netlify/functions/sig.mjs` — matchmaking for online rooms (Netlify Blobs store `ttk-signal`). Only introduces players; races are peer-to-peer.
- `tools/net_p2p.js` + `tools/apply_mp.py` — the multiplayer transport, and the script that patches it into a fresh copy of the game.

Deploy: `netlify deploy --prod` from this folder (needs the function, so drag-and-drop of index.html alone is not enough).
