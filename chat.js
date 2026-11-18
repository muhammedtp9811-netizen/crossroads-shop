/* Crossroads Shopping - floating shopping assistant.
   Self-contained widget: injects its own styles and markup.
   Talks to POST /api/chat and falls back to a helpful message if offline. */
(function () {
  "use strict";
  if (document.getElementById("crChatRoot")) return;

  const IG = "crossroads_shopping";
  const KEY = "cr_chat_v1";
  const WELCOME = "Hi 👋 I'm the Crossroads assistant. I can help you find a product, check a price, or answer delivery, size and payment questions. What are you looking for?";
  const WELCOME_QUICK = [
    { l: "What's new?" },
    { l: "Delivery time" },
    { l: "Payment options" },
    { l: "Track my order" }
  ];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => "₹" + (+n || 0).toLocaleString("en-IN");

  const css = `
#crChatRoot{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:70;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.5}
#crChatRoot.hide{display:none}
#crChatBtn{position:relative;width:56px;height:56px;border:0;border-radius:50%;background:var(--navy,#0E1220);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 16px 36px rgba(8,10,16,.35);transition:transform .2s,box-shadow .2s}
#crChatBtn:hover{transform:translateY(-2px);box-shadow:0 20px 42px rgba(8,10,16,.42)}
#crChatBtn:active{transform:none}
#crChatBtn svg{width:25px;height:25px}
#crChatBtn .cr-dot{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:var(--hot,#FF5C39);border:2px solid var(--bg,#F4F6FB)}
#crChatRoot.on #crChatBtn{opacity:0;pointer-events:none;transform:scale(.85)}
#crChatPanel{position:absolute;right:0;bottom:0;width:min(384px,calc(100vw - 36px));height:min(600px,calc(100dvh - 130px));display:flex;flex-direction:column;overflow:hidden;background:var(--card,#fff);color:var(--ink,#0E1220);border:1px solid var(--line,#E1E5EF);border-radius:20px;box-shadow:0 32px 74px rgba(8,10,16,.3);opacity:0;visibility:hidden;transform:translateY(14px) scale(.985);pointer-events:none;transition:opacity .22s ease,transform .22s ease,visibility .22s}
#crChatRoot.on #crChatPanel{opacity:1;visibility:visible;transform:none;pointer-events:auto}
#crChatPanel header{display:flex;align-items:center;gap:11px;padding:14px 12px 14px 16px;background:var(--navy,#0E1220);color:#fff;flex:none}
.cr-av{width:38px;height:38px;flex:none;border-radius:50%;background:linear-gradient(135deg,#3F6DFF,#7C5CFF);display:grid;place-items:center;font:700 1rem "Playfair Display",Georgia,serif}
#crChatPanel header b{display:block;font-size:.95rem;font-weight:600;letter-spacing:.01em}
#crChatPanel header small{display:flex;align-items:center;gap:6px;font-size:.74rem;color:#C9CEEA}
#crChatPanel header small i{width:6px;height:6px;flex:none;border-radius:50%;background:#5FD39A;box-shadow:0 0 0 3px rgba(95,211,154,.2)}
#crChatClose{margin-left:auto;width:34px;height:34px;flex:none;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:1.25rem;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .2s,transform .2s}
#crChatClose:hover{background:rgba(255,255,255,.22);transform:rotate(90deg)}
#crChatLog{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 8px;display:flex;flex-direction:column;gap:10px;background:var(--bg,#F4F6FB)}
.cr-m{max-width:87%;font-size:.9rem;line-height:1.5;padding:10px 13px;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere;animation:crIn .24s ease}
.cr-m.b{align-self:flex-start;background:var(--card,#fff);border:1px solid var(--line,#E1E5EF);border-bottom-left-radius:6px}
.cr-m.u{align-self:flex-end;background:var(--acc,#2548E6);color:#fff;border-bottom-right-radius:6px}
.cr-ps{display:grid;gap:8px;width:87%;align-self:flex-start}
.cr-p{display:flex;gap:10px;align-items:center;padding:8px;border:1px solid var(--line,#E1E5EF);border-radius:12px;background:var(--card,#fff);text-decoration:none;color:inherit;transition:border-color .2s,transform .2s}
.cr-p:hover{border-color:var(--acc,#2548E6);transform:translateY(-1px)}
.cr-p img,.cr-p .cr-ph{width:46px;height:58px;flex:none;border-radius:8px;object-fit:cover;background:var(--line,#E1E5EF);display:grid;place-items:center;font-weight:700;color:var(--mut,#586078)}
.cr-p span{display:block;min-width:0}
.cr-p b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.82rem;line-height:1.35;font-weight:600}
.cr-p em{display:block;font-size:.82rem;font-style:normal;font-weight:700;color:var(--acc,#2548E6);margin-top:2px}
.cr-t{display:flex;gap:5px;align-items:center;padding:13px 14px}
.cr-t i{width:6px;height:6px;border-radius:50%;background:var(--mut,#586078);animation:crB 1.1s infinite}
.cr-t i:nth-child(2){animation-delay:.15s}
.cr-t i:nth-child(3){animation-delay:.3s}
#crChatQuick{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px 0;background:var(--bg,#F4F6FB);flex:none}
#crChatQuick:empty{display:none}
#crChatQuick button,#crChatQuick a{border:1px solid var(--line,#E1E5EF);background:var(--card,#fff);color:var(--ink,#0E1220);font:600 .77rem Inter,sans-serif;padding:7px 12px;border-radius:999px;cursor:pointer;text-decoration:none;transition:border-color .2s,background .2s}
#crChatQuick button:hover,#crChatQuick a:hover{border-color:var(--acc,#2548E6);background:var(--bg,#F4F6FB)}
#crChatForm{display:flex;gap:8px;padding:10px 12px calc(12px + env(safe-area-inset-bottom));background:var(--bg,#F4F6FB);border-top:1px solid var(--line,#E1E5EF);flex:none}
#crChatInput{flex:1;min-width:0;height:44px;border:1px solid var(--line,#E1E5EF);border-radius:999px;background:var(--card,#fff);padding:0 16px;font:400 .9rem Inter,sans-serif;color:var(--ink,#0E1220)}
#crChatInput:focus{outline:none;border-color:var(--acc,#2548E6);box-shadow:0 0 0 3px rgba(63,109,255,.2)}
#crChatSend{flex:none;width:44px;height:44px;border:0;border-radius:50%;background:var(--acc,#2548E6);color:#fff;cursor:pointer;display:grid;place-items:center;transition:opacity .2s,transform .2s}
#crChatSend:hover{transform:translateY(-1px)}
#crChatSend:disabled{opacity:.45;cursor:default;transform:none}
#crChatSend svg{width:20px;height:20px}
@keyframes crIn{from{opacity:0;transform:translateY(6px)}}
@keyframes crB{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@media(max-width:700px){
 #crChatRoot{right:12px;bottom:calc(78px + env(safe-area-inset-bottom))}
 #crChatPanel{position:fixed;left:0;right:0;bottom:0;width:100%;height:min(80dvh,640px);border-radius:20px 20px 0 0;border-bottom:0}
 #crChatPanel header{padding-top:16px}
}
@media(prefers-reduced-motion:reduce){
 #crChatRoot *,#crChatRoot *:before{animation:none!important;transition:none!important}
}`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "crChatRoot";
  root.innerHTML = `
<button id="crChatBtn" type="button" aria-label="Chat with the Crossroads assistant" aria-expanded="false" aria-controls="crChatPanel">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-3.2-.9L4 20.5l1.5-4.2A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>
  <span class="cr-dot"></span>
</button>
<section id="crChatPanel" role="dialog" aria-modal="false" aria-label="Crossroads assistant" aria-hidden="true">
  <header>
    <div class="cr-av" aria-hidden="true">C</div>
    <div><b>Crossroads Assistant</b><small><i></i>Online · replies instantly</small></div>
    <button id="crChatClose" type="button" aria-label="Close chat">×</button>
  </header>
  <div id="crChatLog" aria-live="polite" aria-relevant="additions"></div>
  <div id="crChatQuick"></div>
  <form id="crChatForm" autocomplete="off">
    <input id="crChatInput" type="text" maxlength="400" placeholder="Ask about a product, size or delivery" aria-label="Your message">
    <button id="crChatSend" type="submit" aria-label="Send message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></svg></button>
  </form>
</section>`;
  document.body.appendChild(root);

  const $ = s => root.querySelector(s);
  const btn = $("#crChatBtn"), panel = $("#crChatPanel"), log = $("#crChatLog"),
    quick = $("#crChatQuick"), form = $("#crChatForm"), input = $("#crChatInput"), send = $("#crChatSend");

  let msgs = [], open = false, busy = false, typingEl = null;

  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) {}
  }

  function bubble(m) {
    let h = `<div class="cr-m ${m.r === "u" ? "u" : "b"}">${esc(m.t).replace(/\n/g, "<br>")}</div>`;
    if (m.products && m.products.length) {
      h += `<div class="cr-ps">` + m.products.map(p =>
        `<a class="cr-p" href="#p/${encodeURIComponent(p.id)}" data-p>${p.img
          ? `<img src="${esc(p.img)}" alt="" loading="lazy" decoding="async">`
          : `<span class="cr-ph">${esc((p.n || "?").trim().charAt(0).toUpperCase())}</span>`}<span><b>${esc(p.n)}</b><em>${money(p.p)}</em></span></a>`
      ).join("") + `</div>`;
    }
    return h;
  }

  function setQuick(list) {
    quick.innerHTML = (list || []).map(q => q.href
      ? `<a href="${esc(q.href)}"${/^https?:/.test(q.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(q.l)}</a>`
      : `<button type="button" data-q="${esc(q.t || q.l)}">${esc(q.l)}</button>`
    ).join("");
  }

  function draw() {
    log.innerHTML = msgs.map(bubble).join("");
    const last = [...msgs].reverse().find(m => m.r === "b");
    setQuick(last && last.quick);
    log.scrollTop = log.scrollHeight;
  }

  function typing(on) {
    if (on) {
      if (typingEl) return;
      typingEl = document.createElement("div");
      typingEl.className = "cr-m b cr-t";
      typingEl.setAttribute("aria-label", "The assistant is typing");
      typingEl.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(typingEl);
      log.scrollTop = log.scrollHeight;
    } else if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  function openPanel() {
    if (open) return;
    open = true;
    root.classList.add("on");
    panel.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    setTimeout(() => input.focus({ preventScroll: true }), 190);
  }

  function closePanel() {
    if (!open) return;
    open = false;
    root.classList.remove("on");
    panel.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.focus({ preventScroll: true });
  }

  async function ask(raw) {
    const text = String(raw || "").trim().slice(0, 400);
    if (!text || busy) return;
    openPanel();
    msgs.push({ r: "u", t: text });
    busy = true;
    send.disabled = true;
    setQuick([]);
    draw();
    save();
    typing(true);

    const bridge = window.CRShop || {};
    const cart = (bridge.cart || []).slice(0, 10).map(i => ({ n: i.n, p: i.p, q: i.q }));

    let out;
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: msgs.slice(-10).map(m => ({ role: m.r === "u" ? "user" : "assistant", text: m.t })),
          page: location.hash,
          cart
        })
      });
      out = await r.json();
      if (!r.ok || !out || !out.text) throw new Error("bad reply");
    } catch (e) {
      out = {
        text: "I couldn't reach the store just now. Please try again in a moment — or message the owner directly on Instagram, they reply quickly.",
        quick: [{ l: "Message on Instagram", href: "https://ig.me/m/" + IG }]
      };
    }

    typing(false);
    busy = false;
    send.disabled = false;
    out.t = String(out.text);
    msgs.push({ r: "b", t: out.t, products: out.products, quick: out.quick });
    draw();
    save();
  }

  btn.addEventListener("click", openPanel);
  $("#crChatClose").addEventListener("click", closePanel);
  form.addEventListener("submit", e => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    ask(v);
  });
  quick.addEventListener("click", e => {
    const b = e.target.closest("button[data-q]");
    if (b) ask(b.dataset.q);
  });
  log.addEventListener("click", e => {
    if (e.target.closest("a.cr-p")) closePanel();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && open) closePanel();
  });

  function syncVis() {
    root.classList.toggle("hide", location.hash.startsWith("#admin"));
  }
  addEventListener("hashchange", syncVis);
  syncVis();

  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    if (Array.isArray(saved) && saved.length) msgs = saved.filter(m => m && m.t);
  } catch (e) { msgs = []; }
  if (!msgs.length) msgs = [{ r: "b", t: WELCOME, quick: WELCOME_QUICK }];
  draw();
})();
