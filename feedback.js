/* Crossroads Shopping - feedback widget.
   Asks a leaving visitor what they would improve, then posts it to
   POST /api/feedback so it reaches the shop on WhatsApp, Telegram and email.
   Self-contained: injects its own styles and markup. */
(function () {
  "use strict";
  if (document.getElementById("crFbRoot")) return;

  var SEEN_KEY = "cr_fb_seen";
  var HIDE_DAYS = 14;
  var MOBILE_WAIT = 45000;
  var TOPICS = ["Price", "Products", "Delivery", "Website", "Something else"];

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var css = [
    "#crFbRoot{position:fixed;left:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:69;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.5}",
    "#crFbRoot.hide{display:none}",
    "#crFbBtn{display:flex;align-items:center;gap:9px;height:48px;padding:0 18px 0 14px;border:0;border-radius:999px;background:var(--card,#fff);color:var(--ink,#0E1220);cursor:pointer;box-shadow:0 12px 30px rgba(8,10,16,.22);border:1px solid var(--line,#E1E5EF);font:600 .86rem Inter,sans-serif;transition:transform .2s,box-shadow .2s}",
    "#crFbBtn:hover{transform:translateY(-2px);box-shadow:0 18px 38px rgba(8,10,16,.28)}",
    "#crFbBtn:active{transform:none}",
    "#crFbBtn svg{width:19px;height:19px;color:var(--acc,#2548E6);flex:none}",
    "#crFbRoot.on #crFbBtn{opacity:0;pointer-events:none;transform:scale(.85)}",
    "#crFbPanel{position:absolute;left:0;bottom:0;width:min(360px,calc(100vw - 32px));background:var(--card,#fff);color:var(--ink,#0E1220);border:1px solid var(--line,#E1E5EF);border-radius:18px;box-shadow:0 30px 70px rgba(8,10,16,.3);opacity:0;visibility:hidden;transform:translateY(14px) scale(.985);pointer-events:none;transition:opacity .22s ease,transform .22s ease,visibility .22s;overflow:hidden}",
    "#crFbRoot.on #crFbPanel{opacity:1;visibility:visible;transform:none;pointer-events:auto}",
    "#crFbPanel header{display:flex;align-items:center;gap:10px;padding:14px 12px 14px 16px;background:var(--navy,#0E1220);color:#fff}",
    "#crFbPanel header b{display:block;font-size:.94rem;font-weight:600}",
    "#crFbPanel header small{display:block;font-size:.74rem;color:#C9CEEA}",
    "#crFbClose{margin-left:auto;width:32px;height:32px;flex:none;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:1.2rem;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .2s,transform .2s}",
    "#crFbClose:hover{background:rgba(255,255,255,.22);transform:rotate(90deg)}",
    "#crFbBody{padding:14px 14px 16px;display:grid;gap:10px}",
    "#crFbBody p{margin:0;font-size:.88rem;color:var(--mut,#586078)}",
    "#crFbTopics{display:flex;flex-wrap:wrap;gap:6px}",
    "#crFbTopics button{border:1px solid var(--line,#E1E5EF);background:var(--bg,#F4F6FB);color:var(--ink,#0E1220);font:600 .78rem Inter,sans-serif;padding:7px 12px;border-radius:999px;cursor:pointer;transition:border-color .2s,background .2s,color .2s}",
    "#crFbTopics button:hover{border-color:var(--acc,#2548E6)}",
    "#crFbTopics button[aria-pressed=true]{background:var(--acc,#2548E6);border-color:var(--acc,#2548E6);color:#fff}",
    "#crFbText{width:100%;min-height:78px;resize:vertical;border:1px solid var(--line,#E1E5EF);border-radius:12px;background:var(--bg,#F4F6FB);color:var(--ink,#0E1220);padding:10px 12px;font:400 .88rem Inter,sans-serif}",
    "#crFbText:focus{outline:none;border-color:var(--acc,#2548E6);box-shadow:0 0 0 3px rgba(63,109,255,.2)}",
    "#crFbWho{width:100%;height:40px;border:1px solid var(--line,#E1E5EF);border-radius:999px;background:var(--bg,#F4F6FB);color:var(--ink,#0E1220);padding:0 14px;font:400 .86rem Inter,sans-serif}",
    "#crFbWho:focus{outline:none;border-color:var(--acc,#2548E6);box-shadow:0 0 0 3px rgba(63,109,255,.2)}",
    "#crFbSend{width:100%;height:44px;border:0;border-radius:999px;background:var(--acc,#2548E6);color:#fff;font:600 .9rem Inter,sans-serif;cursor:pointer;transition:opacity .2s,transform .2s}",
    "#crFbSend:hover{transform:translateY(-1px)}",
    "#crFbSend:disabled{opacity:.5;cursor:default;transform:none}",
    "#crFbMsg{font-size:.82rem;min-height:1.1em;color:var(--mut,#586078)}",
    "#crFbMsg.bad{color:#C0392B}",
    "#crFbDone{padding:26px 20px 30px;text-align:center;display:none}",
    "#crFbDone b{display:block;font:600 1.1rem 'Playfair Display',Georgia,serif;margin-bottom:6px}",
    "#crFbDone p{margin:0;font-size:.88rem;color:var(--mut,#586078)}",
    "#crFbRoot.sent #crFbBody{display:none}",
    "#crFbRoot.sent #crFbDone{display:block}",
    "@keyframes crFbIn{from{opacity:0;transform:translateY(8px)}}",
    "#crFbRoot.nudge #crFbBtn{animation:crFbPulse 2.2s ease-in-out 2}",
    "@keyframes crFbPulse{0%,100%{box-shadow:0 12px 30px rgba(8,10,16,.22)}50%{box-shadow:0 0 0 6px rgba(63,109,255,.18),0 12px 30px rgba(8,10,16,.22)}}",
    "@media(max-width:700px){#crFbRoot{left:12px;bottom:calc(78px + env(safe-area-inset-bottom))}#crFbBtn{height:44px;padding:0 15px 0 12px;font-size:.8rem}#crFbPanel{position:fixed;left:0;right:0;bottom:0;width:100%;border-radius:20px 20px 0 0;border-bottom:0}}",
    "@media(prefers-reduced-motion:reduce){#crFbRoot *,#crFbRoot *:before{animation:none!important;transition:none!important}}"
  ].join("");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "crFbRoot";
  root.innerHTML =
    '<button id="crFbBtn" type="button" aria-label="Give feedback about this shop">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>' +
        '<path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>' +
      "</svg><span>Feedback</span></button>" +
    '<div id="crFbPanel" role="dialog" aria-modal="false" aria-label="Shop feedback">' +
      '<header><span><b>Help us improve</b><small>One message, 20 seconds</small></span>' +
        '<button id="crFbClose" type="button" aria-label="Close feedback">&times;</button></header>' +
      '<div id="crFbBody">' +
        "<p>What should we fix or add in the shop?</p>" +
        '<div id="crFbTopics" role="group" aria-label="Pick a topic">' +
          TOPICS.map(function (t) { return '<button type="button" data-t="' + esc(t) + '" aria-pressed="false">' + esc(t) + "</button>"; }).join("") +
        "</div>" +
        '<textarea id="crFbText" maxlength="900" placeholder="Tell us in your own words…"></textarea>' +
        '<input id="crFbWho" maxlength="80" placeholder="Your name or WhatsApp number (optional)">' +
        '<div id="crFbMsg" role="status"></div>' +
        '<button id="crFbSend" type="button">Send feedback</button>' +
      "</div>" +
      '<div id="crFbDone"><b>Thank you</b><p>We read every message. If you left a contact, we may reply to you.</p></div>' +
    "</div>";
  document.body.appendChild(root);

  var btn = document.getElementById("crFbBtn");
  var closeBtn = document.getElementById("crFbClose");
  var text = document.getElementById("crFbText");
  var who = document.getElementById("crFbWho");
  var msg = document.getElementById("crFbMsg");
  var send = document.getElementById("crFbSend");
  var topic = "";

  function pageLabel() {
    var h = location.hash || "";
    if (/\/p\/[^/]+/.test(location.pathname) || h.indexOf("#p/") === 0) return "Product page";
    if (h === "#checkout") return "Checkout";
    if (h === "#contact") return "Contact";
    if (h === "#about") return "About";
    return "Home";
  }

  function device() {
    var ua = navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua) ? "iPhone" : /android/i.test(ua) ? "Android phone" : "Computer";
  }

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch (e) {}
  }

  function shouldAutoOpen() {
    try {
      var t = +localStorage.getItem(SEEN_KEY) || 0;
      if (t && Date.now() - t < HIDE_DAYS * 864e5) return false;
    } catch (e) {}
    if (location.hash.indexOf("#admin") === 0) return false;
    if (location.hash === "#checkout") return false;
    return true;
  }

  function open() {
    if (document.getElementById("crChatRoot") && document.getElementById("crChatRoot").classList.contains("on")) return;
    root.classList.add("on");
    root.classList.remove("nudge");
    setTimeout(function () { try { text.focus(); } catch (e) {} }, 180);
  }

  function close() {
    root.classList.remove("on");
    markSeen();
  }

  btn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  document.getElementById("crFbTopics").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-t]");
    if (!b) return;
    var on = b.getAttribute("aria-pressed") === "true";
    Array.prototype.forEach.call(document.querySelectorAll("#crFbTopics button"), function (x) { x.setAttribute("aria-pressed", "false"); });
    if (on) { topic = ""; return; }
    b.setAttribute("aria-pressed", "true");
    topic = b.getAttribute("data-t");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("on")) close();
  });

  send.addEventListener("click", function () {
    var body = String(text.value || "").trim();
    if (body.length < 3) {
      msg.className = "bad";
      msg.textContent = "Please write a sentence first.";
      text.focus();
      return;
    }
    send.disabled = true;
    msg.className = "";
    msg.textContent = "Sending…";
    fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: topic,
        text: body,
        name: String(who.value || "").trim(),
        contact: "",
        page: pageLabel(),
        device: device()
      })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        send.disabled = false;
        if (res.ok) {
          root.classList.add("sent");
          markSeen();
          return;
        }
        msg.className = "bad";
        msg.textContent = (res.d && res.d.error) || "Could not send. Please try again.";
      })
      .catch(function () {
        send.disabled = false;
        msg.className = "bad";
        msg.textContent = "No connection. Please try again.";
      });
  });

  /* Leave intent: mouse leaving the top of the window on desktop. */
  var armed = false;
  setTimeout(function () { armed = true; }, 12000);
  document.addEventListener("mouseout", function (e) {
    if (!armed || !shouldAutoOpen()) return;
    if (e.relatedTarget || e.clientY > 0) return;
    open();
  });

  /* Touch devices have no mouse, so ask once after a while. */
  if (matchMedia("(pointer:coarse)").matches) {
    setTimeout(function () {
      if (!shouldAutoOpen() || root.classList.contains("on")) return;
      root.classList.add("nudge");
    }, 25000);
    setTimeout(function () {
      if (!shouldAutoOpen() || root.classList.contains("on")) return;
      open();
    }, MOBILE_WAIT);
  }

  window.CRFeedback = { open: open, close: close };
})();
