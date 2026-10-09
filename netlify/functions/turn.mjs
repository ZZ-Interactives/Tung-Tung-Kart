/* Tung Tung Kart relay passes for online races.
   Some networks (school Wi-Fi, some phone carriers) block direct player-to-player connections.
   This hands the game short-lived Cloudflare TURN credentials so those players can connect through
   Cloudflare's relay instead. The Cloudflare key itself stays here on the server, never in the game.
   Set these in Netlify: Site configuration > Environment variables
     CF_TURN_KEY_ID      the TURN key ID from the Cloudflare dashboard (Realtime > TURN)
     CF_TURN_API_TOKEN   that key's API token                                                    */
const TTL = 4 * 3600; // a pass lasts 4 hours, longer than any race session
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const env = k => (globalThis.Netlify && Netlify.env && Netlify.env.get(k)) || process.env[k] || "";

export default async (req) => {
  if (req.method !== "GET") return json({ ok: false, code: "method" }, 405);
  // only hand passes to pages on this site
  const site = new URL(req.url).host, from = req.headers.get("origin") || req.headers.get("referer") || "";
  if (from) { try { if (new URL(from).host !== site) return json({ ok: false, code: "origin" }, 403); } catch { return json({ ok: false, code: "origin" }, 403); } }
  const id = env("CF_TURN_KEY_ID"), token = env("CF_TURN_API_TOKEN");
  if (!id || !token) return json({ ok: false, code: "not_configured" });
  try {
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(id)}/credentials/generate-ice-servers`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ttl: TTL }) });
    if (!r.ok) return json({ ok: false, code: "cloudflare_" + r.status }, 502);
    const j = await r.json();
    const list = Array.isArray(j.iceServers) ? j.iceServers : j.iceServers ? [j.iceServers] : [];
    // browsers block port 53, and the game gathers all candidates up front, so drop those URLs
    const iceServers = list.map(s => ({ ...s, urls: [].concat(s.urls || []).filter(u => !/:53(\?|$)/.test(u)) })).filter(s => s.urls.length);
    if (!iceServers.length) return json({ ok: false, code: "empty" }, 502);
    return json({ ok: true, iceServers, ttl: TTL });
  } catch (e) { return json({ ok: false, code: "unreachable" }, 502); }
};
