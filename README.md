# Tung Tung Kart — Netlify deploy

- `public/index.html` — the game
- `netlify/functions/sig.mjs` — matchmaking for online rooms (Netlify Blobs store `ttk-signal`). Only introduces players; races are peer-to-peer.
- `tools/net_p2p.js` + `tools/apply_mp.py` — the multiplayer transport, and the script that patches it into a fresh copy of the game.

Deploy: `netlify deploy --prod` from this folder (needs the function, so drag-and-drop of index.html alone is not enough).

## Online races on strict networks (school Wi-Fi)

Online races connect players directly. Some networks block that, so the game can relay through a TURN server.
`netlify/functions/turn.mjs` hands out the relay details; your key stays on Netlify, never in the game.

**Metered (free plan, no card):** sign up at dashboard.metered.ca, create an app, then in Netlify
(Site configuration > Environment variables) add:

- `METERED_APP`: your app name, the `xxx` in `xxx.metered.live`
- `METERED_API_KEY`: the TURN credential API key from the Metered dashboard

(Cloudflare also works instead: `CF_TURN_KEY_ID` and `CF_TURN_API_TOKEN`.)

Redeploy, then check the online screen's connection log for "Relay: ready".
