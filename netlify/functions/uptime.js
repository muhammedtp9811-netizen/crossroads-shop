import {getStore} from "@netlify/blobs";

const E = process.env;
const SITE = E.URL || "https://crossroads-shopping.netlify.app";
const J = (d, s = 200) => new Response(JSON.stringify(d), {status: s, headers: {
  "content-type": "application/json", "cache-control": "no-store"
}});
const cut = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

async function check() {
  const url = SITE.replace(/\/$/, "") + "/api/health?t=" + Date.now();
  const opts = {cache: "no-store"};
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    opts.signal = AbortSignal.timeout(10000);
  }
  try {
    const r = await fetch(url, opts);
    let detail = "HTTP " + r.status;
    try {
      const d = await r.json();
      if (d && (d.ok === false || d.status === "error")) return {ok: false, detail: cut(d.error || d.message || "health reported down", 100)};
      if (d && d.ok) detail = "ok";
    } catch (e) {}
    return {ok: r.ok, detail};
  } catch (e) {
    return {ok: false, detail: cut(e && e.name === "TimeoutError" ? "timeout" : e, 100)};
  }
}

// Owner-only alert channels. Nothing here ever goes to a customer.
async function alert(msg) {
  const jobs = [];
  if (E.NTFY_TOPIC) jobs.push(fetch("https://ntfy.sh/" + encodeURIComponent(E.NTFY_TOPIC), {
    method: "POST", headers: {Title: "Crossroads uptime", "content-type": "text/plain"}, body: msg
  }).catch(() => {}));
  if (E.TELEGRAM_BOT_TOKEN && E.TELEGRAM_CHAT_ID) jobs.push(fetch(
    "https://api.telegram.org/bot" + E.TELEGRAM_BOT_TOKEN + "/sendMessage", {
      method: "POST", headers: {"content-type": "application/json"},
      body: JSON.stringify({chat_id: E.TELEGRAM_CHAT_ID, text: msg})
    }).catch(() => {}));
  if (E.DISCORD_WEBHOOK) jobs.push(fetch(E.DISCORD_WEBHOOK, {
    method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({content: msg})
  }).catch(() => {}));
  if (E.RESEND_API_KEY && E.ALERT_EMAIL) jobs.push(fetch("https://api.resend.com/emails", {
    method: "POST", headers: {authorization: "Bearer " + E.RESEND_API_KEY, "content-type": "application/json"},
    body: JSON.stringify({
      from: E.MAIL_FROM || "Crossroads <onboarding@resend.dev>",
      to: [E.ALERT_EMAIL], subject: "Crossroads uptime", text: msg
    })
  }).catch(() => {}));
  await Promise.allSettled(jobs);
  return jobs.length;
}

export default async function uptime() {
  const db = getStore({name: "shop", consistency: "strong"});
  const prev = await db.get("uptime", {type: "json"}).catch(() => null) || {};
  const now = new Date().toISOString();
  const result = await check();
  const state = {
    down: prev.down === true,
    since: prev.since ? String(prev.since) : "",
    fails: +prev.fails || 0
  };

  let msg = "";
  if (!result.ok) {
    state.fails++;
    if (!state.down) {
      state.down = true;
      state.since = now;
      msg = "🔴 Crossroads site is down — " + result.detail;
    } else if (state.fails % 12 === 0) {
      msg = "⚠️ Crossroads still down — " + state.fails + " failed checks";
    }
  } else if (state.down) {
    const mins = state.since ? Math.max(0, Math.round((Date.now() - Date.parse(state.since)) / 60000)) : 0;
    msg = "🟢 Crossroads site is back up" + (mins ? " after " + mins + " min" : "");
    state.down = false;
    state.since = "";
    state.fails = 0;
  } else {
    state.fails = 0;
  }

  await db.setJSON("uptime", state).catch(() => {});
  const notified = msg ? await alert(msg) : 0;
  return J({ok: 1, healthy: result.ok, detail: result.detail, down: state.down,
    since: state.since, fails: state.fails, checkedAt: now, notified});
}
