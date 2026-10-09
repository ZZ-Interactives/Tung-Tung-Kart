/* Tung Tung Kart relay passes for online races.
   Some networks (school Wi-Fi, some phone carriers) block direct player-to-player connections.
   This hands the game TURN relay servers so those players can connect through a relay instead.
   Keys stay here on the server (Netlify environment variables), never in the game file.

   Default (nothing to set up): the free public Open Relay Project by Metered (metered.ca/tools/openrelay),
   using its published static-auth secret to make passes that expire after a few hours.
   Optional, your own account instead:
   Option A, Metered:   METERED_APP      your app name, the "xxx" in xxx.metered.live
                                             METERED_API_KEY  the TURN credential API key from the Metered dashboard
   Option B, Cloudflare:                     CF_TURN_KEY_ID, CF_TURN_API_TOKEN
   Set them in Netlify: Site configuration > Environment variables, then redeploy.                          */
import { createHmac } from "node:crypto";
const TTL = 4 * 3600;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const env = k => (globalThis.Netlify && Netlify.env && Netlify.env.get(k)) || process.env[k] || "";
// browsers block port 53, and the game gathers all candidates up front, so drop those URLs
const clean = list => (Array.isArray(list) ? list : list ? [list] : [])
  .map(s => ({ ...s, urls: [].concat(s.urls || s.url || []).filter(u => typeof u === "string" && !/:53(\?|$)/.test(u)) }))
  .filter(s => s.urls.length).map(({ url, ...s }) => s);

async function metered(app, key) {
  const host = app.replace(/^https?:\/\//, "").replace(/\.metered\.live.*$/, "");
  const r = await fetch(`https://${encodeURIComponent(host)}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(key)}`);
  if (!r.ok) throw { code: "metered_" + r.status };
  return clean(await r.json());
}
// Open Relay static auth (standard TURN REST scheme): username "<expiry>:<name>", password base64(HMAC-SHA1(secret, username))
function openRelay() {
  const host = "staticauth.openrelay.metered.ca", secret = "openrelayprojectsecret";
  const username = `${Math.floor(Date.now() / 1000) + TTL}:ttk`;
  const credential = createHmac("sha1", secret).update(username).digest("base64");
  return [{ urls: [`stun:${host}:80`] },
    { urls: [`turn:${host}:80`, `turn:${host}:443`, `turn:${host}:443?transport=tcp`, `turns:${host}:443?transport=tcp`], username, credential }];
}
async function cloudflare(id, token) {
  const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(id)}/credentials/generate-ice-servers`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ttl: TTL }) });
  if (!r.ok) throw { code: "cloudflare_" + r.status };
  return clean((await r.json()).iceServers);
}

export default async (req) => {
  if (req.method !== "GET") return json({ ok: false, code: "method" }, 405);
  const site = new URL(req.url).host, from = req.headers.get("origin") || req.headers.get("referer") || "";
  if (from) { try { if (new URL(from).host !== site) return json({ ok: false, code: "origin" }, 403); } catch { return json({ ok: false, code: "origin" }, 403); } }
  const mApp = env("METERED_APP"), mKey = env("METERED_API_KEY"), cId = env("CF_TURN_KEY_ID"), cTok = env("CF_TURN_API_TOKEN");
  const via = mApp && mKey ? "metered" : cId && cTok ? "cloudflare" : "openrelay";
  try {
    const iceServers = via === "metered" ? await metered(mApp, mKey) : via === "cloudflare" ? await cloudflare(cId, cTok) : openRelay();
    if (!iceServers.length) return json({ ok: false, code: "empty" }, 502);
    return json({ ok: true, iceServers, via });
  } catch (e) { return json({ ok: false, code: (e && e.code) || "unreachable" }, 502); }
};
