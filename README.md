# Tung Tung Kart — Netlify deploy

- `public/index.html` — the game
- `netlify/functions/sig.mjs` — matchmaking for online rooms (Netlify Blobs store `ttk-signal`). Only introduces players; races are peer-to-peer.
- `tools/net_p2p.js` + `tools/apply_mp.py` — the multiplayer transport, and the script that patches it into a fresh copy of the game.

Deploy: `netlify deploy --prod` from this folder (needs the function, so drag-and-drop of index.html alone is not enough).

## Online races on strict networks (school Wi-Fi)

Online races connect players directly. Some networks block that, so the game can relay through Cloudflare TURN.
`netlify/functions/turn.mjs` hands out short-lived relay passes; the Cloudflare key stays on Netlify.

Set two environment variables in Netlify (Site configuration > Environment variables), then redeploy:

- `CF_TURN_KEY_ID`: the TURN key ID (Cloudflare dashboard > Realtime > TURN Server > Create)
- `CF_TURN_API_TOKEN`: that key's API token (shown once when the key is created)

In the online screen's connection log you should see "Relay: Cloudflare ready".
