/* Tung Tung Kart matchmaking ("signaling") for online races.
   Only used to introduce players to each other: the race itself is peer-to-peer and never touches this function.
   Records live in Netlify Blobs under r/<room>/...:
     host        {id,t}       who hosts the room + last heartbeat
     in/<id>     {from,sdp,t} a joiner's WebRTC offer, waiting for the host
     out/<id>    {sdp,host,t} the host's answer, waiting for that joiner          */
import { getStore } from "@netlify/blobs";

const ROOM = /^[a-z0-9]{3,8}$/, ID = /^[a-z0-9]{6,24}$/, NONCE = /^[a-z0-9]{4,16}$/;
const ALIVE = 20000, OFFER_TTL = 45000, MAX_SDP = 16000;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  if (req.method === "GET") return json({ ok: true, v: 1 });
  if (req.method !== "POST") return json({ ok: false, code: "method" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, code: "bad_json" }, 400); }
  const { op, room, id } = b || {};
  if (!ROOM.test(room || "") || !ID.test(id || "")) return json({ ok: false, code: "bad_args" }, 400);
  const sdpOk = s => typeof s === "string" && s.length > 20 && s.length <= MAX_SDP;
  const st = getStore({ name: "ttk-signal", consistency: "strong" });
  const P = "r/" + room + "/", now = Date.now();
  const host = async () => { try { return await st.get(P + "host", { type: "json" }); } catch { return null; } };
  const wipe = async prefix => { const { blobs } = await st.list({ prefix }); await Promise.all(blobs.map(x => st.delete(x.key))); };

  switch (op) {
    case "host": { // claim a room. prev = the host we are taking over from (host migration)
      const cur = await host(), fresh = cur && now - cur.t < ALIVE;
      if (fresh && cur.id !== id && !(b.prev && cur.id === b.prev)) return json({ ok: false, code: "exists" });
      if (!b.prev && !(cur && cur.id === id)) await wipe(P); // brand-new room: clear leftovers from an old one
      await st.setJSON(P + "host", { id, t: now });
      return json({ ok: true });
    }
    case "poll": { // host heartbeat + collect waiting offers
      const cur = await host();
      if (!cur || cur.id !== id) return json({ ok: false, code: "not_host", host: cur && cur.id });
      await st.setJSON(P + "host", { id, t: now });
      const { blobs } = await st.list({ prefix: P + "in/" });
      const offers = [];
      for (const x of blobs.slice(0, 8)) {
        const o = await st.get(x.key, { type: "json" }).catch(() => null);
        await st.delete(x.key);
        if (o && now - o.t < OFFER_TTL && sdpOk(o.sdp)) offers.push({ from: o.from, n: o.n, sdp: o.sdp });
      }
      return json({ ok: true, offers });
    }
    case "offer": { // joiner asks to connect
      const cur = await host();
      if (!cur || now - cur.t > 60000) return json({ ok: false, code: "not_found" });
      if (!sdpOk(b.sdp)) return json({ ok: false, code: "bad_sdp" }, 400);
      await st.delete(P + "out/" + id);
      if (!NONCE.test(b.n || "")) return json({ ok: false, code: "bad_args" }, 400);
      await st.setJSON(P + "in/" + id, { from: id, n: b.n, sdp: b.sdp, t: now });
      return json({ ok: true, host: cur.id });
    }
    case "answer": { // host replies to one joiner
      const cur = await host();
      if (!cur || cur.id !== id) return json({ ok: false, code: "not_host" });
      if (!ID.test(b.to || "") || !NONCE.test(b.n || "") || !sdpOk(b.sdp)) return json({ ok: false, code: "bad_args" }, 400);
      await st.setJSON(P + "out/" + b.to, { sdp: b.sdp, n: b.n, host: id, t: now });
      return json({ ok: true });
    }
    case "fetch": { // joiner waits for the answer
      const a = await st.get(P + "out/" + id, { type: "json" }).catch(() => null);
      if (a) {
        await st.delete(P + "out/" + id);
        if (a.n === b.n) return json({ ok: true, sdp: a.sdp, host: a.host }); // otherwise it answers an older request: drop it
      }
      const cur = await host();
      return json({ ok: true, wait: true, alive: !!cur && now - cur.t < ALIVE });
    }
    case "close": { // host leaves for good
      const cur = await host();
      if (cur && cur.id === id) await wipe(P);
      return json({ ok: true });
    }
  }
  return json({ ok: false, code: "bad_op" }, 400);
};
