import {getStore} from "@netlify/blobs";
import crypto from "node:crypto";
export const config={path:"/api/*"};
const E=process.env, WA=E.WA_NUMBER||"918281036836";
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const cut=(s,n)=>String(s??"").slice(0,n);
const ist=(t=Date.now())=>new Date(t+19800000).toISOString().slice(0,10);
const hourOf=t=>new Date(t+19800000).getUTCHours();
const devOf=u=>/iPhone/.test(u)?"iPhone":/iPad/.test(u)?"iPad":/Android/.test(u)?"Android phone":/Windows/.test(u)?"Windows PC":/Macintosh|Mac OS/.test(u)?"Mac":/Linux/.test(u)?"Linux":"Other";
const brOf=u=>/Instagram/.test(u)?"Instagram app":/FBAN|FBAV/.test(u)?"Facebook app":/Edg\//.test(u)?"Edge":/OPR\//.test(u)?"Opera":/CriOS|Chrome\//.test(u)?"Chrome":/FxiOS|Firefox/.test(u)?"Firefox":/Safari\//.test(u)?"Safari":"Other";
function srcOf(ref,utm,ua,host){const x=String(utm||"").toLowerCase();if(x){if(/insta|^ig/.test(x))return"Instagram";if(/whats|^wa/.test(x))return"WhatsApp";return cut(utm,20)}
  let h="";try{h=new URL(ref).hostname.replace(/^www\./,"")}catch(e){}
  if(!h)return /Instagram/.test(ua)?"Instagram":"Direct";if(h===host)return"Direct";
  if(/instagram\.com$/.test(h))return"Instagram";if(/whatsapp|wa\.me$/.test(h))return"WhatsApp";if(/google\./.test(h))return"Google";if(/facebook\.com$|fb\.com$|l\.facebook/.test(h))return"Facebook";if(/youtube\.com$|youtu\.be$/.test(h))return"YouTube";if(/^t\.co$|twitter\.com$|x\.com$/.test(h))return"X (Twitter)";
  return cut(h,30)}

/* ---------- Store assistant ----------
   Facts shown to customers. Edit these lines to change the bot's answers.
   Optional real AI: set AI_API_KEY (OpenAI-compatible) + AI_MODEL in Netlify
   environment variables. Without a key the rule engine below answers. */
const STORE={ig:"crossroads_shopping",mail:"producingmj@gmail.com",
  delivery:"Most orders are dispatched within 24 hours and reach most pin codes in 3–7 working days. Remote areas can take up to 10 days.",
  ship:"The delivery charge, if any, is shown at checkout before you pay.",
  pay:"We accept UPI (scan the QR, then enter the UPI transaction ID from your payment app) and online payment by card, UPI or net banking. Cash on delivery is not available.",
  returns:"If an item arrives damaged or in the wrong size, message us on Instagram within 48 hours with a photo and we will sort it out.",
  hours:"We usually reply within a few hours, between 9 AM and 9 PM IST."};
const inr=n=>"₹"+(+n||0).toLocaleString("en-IN");
const shortN=(s,n=58)=>{s=String(s??"").replace(/\s+/g," ").trim();if(s.length<=n)return s;const c=s.slice(0,n),i=c.lastIndexOf(" ");return(i>20?c.slice(0,i):c)+"…"};
const DASH="https://crossroads-shopping.netlify.app/#admin";
let cfgCache={t:0,v:null};
function orderText(o,head){
  let when="";try{when=new Date(o.t||Date.now()).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}catch(e){when=new Date(o.t||Date.now()).toISOString().slice(0,16).replace("T"," ")}
  return `${head}\nOrder #${o.no||"—"} · ${inr(o.total)}\n${(o.lines||[]).join("\n")}\n\n${o.name}\n${o.phone}${o.email?" · "+o.email:""}\n${o.address}\n\n${o.method==="upi"?"UPI QR":o.method==="online"?"Online payment":"Payment"}${o.utr?" · UTR "+o.utr:""}${o.pay?" · Pay ID "+o.pay:""}${o.paid?" · PAID":""}\n${when} IST\n${DASH}`;
}
const STOP=new Set(("a an the and or of for with to in on is are be do does did you your i my me we our us can could would should please show some any what which how who when where have has it this that these those under below less upto max rs rupee rupees size sizes price cost costs buy get want need looking look find").split(" "));
const SYN={headphones:"audio earphones earbuds headset",headphone:"audio earphones earbuds headset",earphones:"audio headphones",earbud:"audio headphones",earbuds:"audio headphones",speaker:"audio sound",music:"audio",shoes:"shoe sneakers footwear",shoe:"sneakers footwear",sneakers:"shoes footwear",shirt:"cotton fleece tee",tshirt:"cotton tee shirt",tee:"shirt cotton",hoodie:"fleece sweatshirt",sweatshirt:"fleece hoodie",mousepad:"mouse pad desk",mat:"mouse pad desk",desk:"mouse pad mat",bag:"backpack",backpack:"bag",watch:"watch",charger:"charger cable",mobile:"phone case"};
const tk=s=>{const w=String(s??"").toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(x=>x.length>1&&!STOP.has(x)),out=new Set(w);
  for(const x of w){const e=SYN[x];if(e)e.split(" ").forEach(y=>out.add(y))}return[...out]};
const cardsFor=list=>list.slice(0,4).map(p=>({id:p.id,n:shortN(p.n,58),p:+p.p||0,img:(p.images&&p.images[0])||p.img||""}));
function matchProds(q,list){
  const T=tk(q);if(!T.length)return[];
  return list.map(p=>{const h=((p.n||"")+" "+(p.c||"")+" "+(p.d||"")).toLowerCase();let s=0;
    for(const t of T)if(h.includes(t))s+=t.length>3?3:2;return{p,s}}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,4).map(x=>x.p);
}
function chatRule(text,prods,cart){
  const q=String(text||"").toLowerCase().trim(),live=prods.filter(p=>!p.hid),ok=re=>re.test(q);
  const ig={l:"Message on Instagram",href:"https://ig.me/m/"+STORE.ig},shop={l:"Browse the shop",href:"./"};
  if(ok(/^(thanks|thank you|thankyou|thx)\b/))return{text:"Happy to help! Anything else you'd like to know?",quick:[shop,ig]};
  if(ok(/^(bye|goodbye|see you)\b/))return{text:"Thanks for stopping by — hope to see you at checkout soon!",quick:[shop]};
  if(ok(/^(hi|hey|hello|hai|hiya|namaste|yo)\b/)||ok(/^good (morning|afternoon|evening)/))
    return{text:"Hi! 👋 What are you looking for today? I can help with products, sizes, delivery or payment.",quick:[{l:"What's new?"},{l:"Delivery time"},ig]};
  if(ok(/\b(human|agent|owner|real person|whatsapp|call|phone|contact|email|support)\b/)&&!ok(/\b(product|price|size|delivery)\b/))
    return{text:`The fastest way to reach a person is Instagram — @${STORE.ig}. ${STORE.hours}\n\nYou can also email ${STORE.mail} or use the Contact page.`,quick:[ig,{l:"Contact page",href:"#contact"}]};
  if(ok(/\b(track|tracking|order status|parcel|where is my|my order|order number)\b/))
    return{text:"I can't see live order status from here yet. Send your order number to the owner on Instagram and they'll check it for you. You'll also be contacted once your parcel is shipped.",quick:[ig,{l:"Message form",href:"#contact"}]};
  if(ok(/\b(deliver|delivery|shipping|ship|courier|how long|days|arrive|reach)\b/))
    return{text:STORE.delivery+"\n\n"+STORE.ship,quick:[shop,ig]};
  if(ok(/\b(pay|payment|upi|gpay|google pay|phonepe|paytm|razorpay|card|netbanking|net banking|cod|cash on delivery)\b/))
    return{text:STORE.pay,quick:[shop,ig]};
  if(ok(/\b(return|returns|exchange|refund|replace|damaged|broken|wrong size|defect)\b/))
    return{text:STORE.returns,quick:[ig,{l:"Contact page",href:"#contact"}]};
  if(ok(/\b(size|sizes|fit|fitting|measurement|measurements|xl|xxl|small|medium|large)\b/)){
    const S=[...new Set(live.flatMap(p=>p.s||[]))];
    return{text:"Sizes differ by product — the exact sizes in stock are shown on each product page"+(S.length?` (for example ${S.slice(0,6).join(", ")})`:"")+". If you're between two sizes, size up for a relaxed fit. Tell me the product name and I'll check what's available.",quick:[shop,ig]};
  }
  if(ok(/\b(cart|bag|basket)\b/)){
    if(cart.length){const t=cart.reduce((a,i)=>a+(+i.p||0)*(+i.q||1),0);
      return{text:`Your bag has ${cart.reduce((a,i)=>a+(+i.q||1),0)} item(s):\n`+cart.map(i=>`• ${shortN(i.n,40)} × ${+i.q||1} — ${inr((+i.p||0)*(+i.q||1))}`).join("\n")+`\n\nTotal: ${inr(t)}`,quick:[{l:"Go to checkout",href:"#checkout"},shop]};
    }
    return{text:"Your bag is empty right now. Everything in the shop is one tap away.",quick:[shop]};
  }
  if(ok(/\b(trending|popular|best ?seller|best selling|hot|most wanted)\b/)){
    const T=live.filter(p=>p.tr),L=(T.length?T:live).slice(0,4);
    return{text:L.length?"These are getting the most attention right now:":"Nothing is marked trending yet, but here's the newest stock:",products:cardsFor(L),quick:[shop]};
  }
  if(ok(/\b(new|newest|latest|arrival|arrivals|collection|drop|just in)\b/)){
    const L=[...live].sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,4);
    return{text:L.length?"Fresh in the shop:":"New pieces are on the way. Message us on Instagram to ask what's coming.",products:cardsFor(L),quick:[shop,ig]};
  }
  if(ok(/\b(stock|available|sold out|in stock|restock)\b/)){
    const sold=prods.filter(p=>p.sold&&!p.hid);
    return{text:sold.length?`${sold.length===1?"One item is":"A few items are"} sold out right now (marked "Sold out" in the shop). Everything else listed is available.`:"Everything currently listed is in stock. Sold-out items are marked on the shop page.",quick:[shop]};
  }
  let lo=0,hi=0,m=/(?:between)\s*(\d{2,5})\s*(?:and|to|-)\s*(\d{2,5})/.exec(q);
  if(m){lo=+m[1];hi=+m[2]}
  if(!hi){m=/(?:under|below|less than|upto|up to|max)\s*(?:rs\.?|₹)?\s*(\d{2,5})/.exec(q);if(m)hi=+m[1]}
  if(!hi&&ok(/\b(cheap|cheapest|lowest price|budget|affordable)\b/)&&live.length){hi=Math.min(...live.map(p=>+p.p||0))}
  if(hi){
    let L=live.filter(p=>(+p.p||0)>=lo&&(+p.p||0)<=hi);
    const hitsB=matchProds(q,live);
    if(hitsB.length){const X=L.filter(p=>hitsB.includes(p));if(X.length)L=X}
    L=[...L].sort((a,b)=>a.p-b.p);
    const only=hitsB.length&&L.length&&L.every(p=>hitsB.includes(p));
    return{text:L.length?(only?"Here's what matches:":"Here's what's available in that range:"):"Nothing sits in that range right now."+(live.length?` The lowest price in the shop is ${inr(Math.min(...live.map(p=>+p.p||0)))}.`:""),products:cardsFor(L),quick:[shop,ig]};
  }
  const hits=matchProds(q,live);
  if(hits.length)return{text:"Here's what I found:",products:cardsFor(hits),quick:[shop,ig]};
  if(tk(q).length)
    return{text:"I couldn't find that in the shop right now. New pieces are added regularly — here's the latest:",products:cardsFor([...live].sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,3)),quick:[ig,shop]};
  return{text:"I can help with products, prices, sizes, delivery, payment and orders. What would you like to know?",quick:[{l:"What's new?"},{l:"Delivery time"},ig]};
}
async function chatAI(messages,prods){
  const key=E.AI_API_KEY||E.OPENAI_API_KEY||E.OPENROUTER_API_KEY;
  if(!key)return null;
  const url=E.AI_URL||"https://openrouter.ai/api/v1/chat/completions",model=E.AI_MODEL||"openai/gpt-4o-mini";
  const list=prods.slice(0,30).map(p=>`- ${cut(p.n,70)} | ${p.c||"Other"} | ₹${p.p}${p.s&&p.s.length?" | sizes: "+p.s.join("/"):""}${p.sold?" | SOLD OUT":""}`).join("\n");
  const sys=`You are the shopping assistant for Crossroads Shopping, a small online store in India. Reply in the customer's language, warmly, in at most 60 words. Use only the facts below. Never invent prices, stock, delivery times or policies. If you don't know, point them to Instagram @${STORE.ig} or the Contact page.\nStore facts:\n${STORE.delivery}\n${STORE.ship}\n${STORE.pay}\n${STORE.returns}\nSupport hours: ${STORE.hours}\nProducts:\n${list}\nWhen suggesting products, give the name and price only.`;
  try{
    const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+key},
      body:JSON.stringify({model,messages:[{role:"system",content:sys},...messages.slice(-8)],max_tokens:220,temperature:0.4}),signal:AbortSignal.timeout(9000)});
    if(!r.ok)return null;
    const d=await r.json(),t=d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content;
    return cut(t,700).trim()||null;
  }catch(e){return null}
}
export default async(req,context)=>{
  const db=getStore({name:"shop",consistency:"strong"}), path=new URL(req.url).pathname.replace(/^\/api\/?/,"");
  const get=async(k,d)=>(await db.get(k,{type:"json"}))??d;
  const cfg=async()=>{if(cfgCache.v&&Date.now()-cfgCache.t<60000)return cfgCache.v;const s=await get("settings",{});cfgCache={t:Date.now(),v:s};return s};
  const admin=()=>E.ADMIN_PASSWORD&&req.headers.get("x-admin")===E.ADMIN_PASSWORD;
  const b=req.method==="POST"?await req.json().catch(()=>({})):{};
  const imgId=b=>crypto.createHash("sha1").update(b).digest("hex").slice(0,24);
  async function pack(list){let changed=false;
    for(const p of list){
      const arr=Array.isArray(p.images)&&p.images.length?p.images:(Array.isArray(p.imgs)&&p.imgs.length?p.imgs:(p.img?[p.img]:[])),out=[];
      for(const x of arr){
        const str=String(x),m=/^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(str);
        if(m){const buf=Buffer.from(m[2],"base64");if(!buf.length||buf.length>3000000)continue;
          const id=imgId(buf),ab=buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength);
          await db.set("img/"+id,ab,{metadata:{type:"image/"+(m[1]==="png"?"png":m[1]==="webp"?"webp":"jpeg")}});out.push("/api/img/"+id)}
        else if(str.startsWith("/api/img/")||/^https?:\/\//.test(str))out.push(str);
      }
      if(out.length!==arr.length||arr.some((x,i)=>x!==out[i])||p.img!==(out[0]||"")||("imgs" in p))changed=true;
      p.images=out;p.img=out[0]||"";delete p.imgs;
    }
    return changed}
  const allow=async()=>{const h=new Date().toISOString().slice(0,13),rl=await get("rl",{h:"",n:0});if(rl.h!==h){rl.h=h;rl.n=0}if(rl.n>=80)return false;rl.n++;await db.setJSON("rl",rl);return true};
  const mail=(subject,text)=>fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+E.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:"Crossroads <onboarding@resend.dev>",to:[E.ALERT_EMAIL||"producingmj@gmail.com"],subject:cut(subject,80),text})}).catch(()=>{});
  async function notify(t,imp,skipWa){
    const st=await cfg().catch(()=>({})),waKey=E.CALLMEBOT_KEY||st.waKey||"",waPhone=String(E.WA_NUMBER||st.waPhone||WA).replace(/\D/g,"");
    if(!waKey&&!E.DISCORD_WEBHOOK&&!E.FAST2SMS_KEY&&!E.NTFY_TOPIC&&!E.RESEND_API_KEY&&!(E.TELEGRAM_BOT_TOKEN&&E.TELEGRAM_CHAT_ID))return;
    if(!imp&&!await allow())return;
    if(waKey&&!skipWa)await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waPhone}&apikey=${encodeURIComponent(waKey)}&text=${encodeURIComponent(t)}`).catch(()=>{});
    if(imp&&E.FAST2SMS_KEY)await fetch("https://www.fast2sms.com/dev/bulkV2?"+new URLSearchParams({authorization:E.FAST2SMS_KEY,route:"q",message:t.replace(/[^\x20-\x7E\n]/g,"").slice(0,150),flash:"0",numbers:E.SMS_TO||"8281036836"})).catch(()=>{});
    if(E.DISCORD_WEBHOOK)await fetch(E.DISCORD_WEBHOOK,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:t})}).catch(()=>{});
    if(E.NTFY_TOPIC)await fetch("https://ntfy.sh/"+encodeURIComponent(E.NTFY_TOPIC),{method:"POST",headers:{Title:"Crossroads"},body:t}).catch(()=>{});
    if(imp&&E.RESEND_API_KEY)await mail(t.split("\n").filter(Boolean)[0],t);
    if(E.TELEGRAM_BOT_TOKEN&&E.TELEGRAM_CHAT_ID)await fetch(`https://api.telegram.org/bot${E.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:E.TELEGRAM_CHAT_ID,text:t})}).catch(()=>{});
  }
  if(path==="test"){
    const k=new URL(req.url).searchParams.get("k");
    if(!E.ADMIN_PASSWORD||k!==E.ADMIN_PASSWORD)return J({error:"Open this link as /api/test?k=YOUR_ADMIN_PASSWORD"},401);
    const r={admin_password_set:true,resend_key_set:!!E.RESEND_API_KEY,ntfy_set:!!E.NTFY_TOPIC};
    if(E.RESEND_API_KEY){
      const x=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+E.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:"Crossroads <onboarding@resend.dev>",to:[E.ALERT_EMAIL||"producingmj@gmail.com"],subject:"Crossroads test email",text:"If you can read this, Gmail alerts work."})}).catch(e=>({status:0,text:async()=>String(e)}));
      r.resend_status=x.status;r.resend_reply=await x.text();
    }
    return J(r);
  }
  if(path==="settings"&&req.method==="GET"){const t=await get("settings",{});return J({upi:t.upi||"",name:t.name||"",qr:t.qr||"",online:!!(E.RAZORPAY_KEY_ID&&E.RAZORPAY_KEY_SECRET)})}
  if(path==="settings"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const cur=await get("settings",{}),nxt={...cur};
    if(b.upi!==undefined)nxt.upi=cut(b.upi,80);
    if(b.name!==undefined)nxt.name=cut(b.name,60);
    if(b.qr!==undefined)nxt.qr=cut(b.qr,400000);
    if(b.waPhone!==undefined)nxt.waPhone=String(b.waPhone).replace(/\D/g,"").slice(0,15);
    if(b.waKey!==undefined)nxt.waKey=cut(String(b.waKey).trim(),90);
    await db.setJSON("settings",nxt);cfgCache={t:0,v:null};return J({ok:1});
  }
  if(path==="notify"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const s=await get("settings",{});
    return J({whatsapp:!!(E.CALLMEBOT_KEY||s.waKey),whatsapp_number:String(E.WA_NUMBER||s.waPhone||WA).replace(/\D/g,""),
      email:!!E.RESEND_API_KEY,email_to:E.ALERT_EMAIL||"producingmj@gmail.com",
      telegram:!!(E.TELEGRAM_BOT_TOKEN&&E.TELEGRAM_CHAT_ID),ntfy:!!E.NTFY_TOPIC,discord:!!E.DISCORD_WEBHOOK,sms:!!E.FAST2SMS_KEY});
  }
  if(path==="notify/test"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const st=await cfg().catch(()=>({})),waKey=E.CALLMEBOT_KEY||st.waKey||"",waPhone=String(E.WA_NUMBER||st.waPhone||WA).replace(/\D/g,"");
    const other=E.RESEND_API_KEY||E.NTFY_TOPIC||E.DISCORD_WEBHOOK||(E.TELEGRAM_BOT_TOKEN&&E.TELEGRAM_CHAT_ID);
    if(!waKey&&!other)return J({error:"No alert channel is set up yet."},400);
    const msg="🔔 Test alert from Crossroads Shopping\nIf you can read this, order alerts are working.\n"+DASH;
    let reply="";
    if(waKey){
      try{
        const r=await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waPhone}&apikey=${encodeURIComponent(waKey)}&text=${encodeURIComponent(msg)}`);
        reply=cut(await r.text(),160).replace(/\s+/g," ").trim();
      }catch(e){reply="Could not reach CallMeBot. Check the number and key."}
    }
    if(other)await notify(msg,true,true);
    return J({ok:1,whatsapp:!!waKey,whatsapp_reply:reply});
  }
  if(path==="order/manual"){
    const prods=await get("products",[]),c=b.customer||{},lines=[];let total=0;
    for(const i of b.items||[]){
      const p=prods.find(x=>x.id===i.id),q=Math.max(1,Math.min(10,+i.q||1));
      if(!p||p.sold)return J({error:"An item in your cart is no longer available."},400);
      lines.push(`${p.n} (${cut(i.size,20)}) x${q}`);total+=p.p*q;
    }
    const utr=String(b.utr||"").replace(/\W/g,"").slice(0,30);
    if(!lines.length||!c.name||!c.phone||!c.address||utr.length<8)return J({error:"Fill in your details and the UPI transaction ID."},400);
    const orders=await get("orders",[]);
    if(orders.some(x=>x.utr===utr))return J({error:"This transaction ID was already used."},400);
    const mx=Math.max(1000,...orders.map(o=>o.no||0));
    orders.unshift({id:"upi"+Date.now(),no:mx+1,method:"upi",ev:[{a:"placed",t:new Date().toISOString()}],lines,total,paid:false,manual:true,utr,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300)});
    await db.setJSON("orders",orders.slice(0,500));
    await notify(orderText(orders[0],"🛒 New order — UPI payment claimed. Check your bank app, then mark it paid."),true);
    return J({ok:1});
  }
  if(path==="orders/paid"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.id);
    if(o&&!o.paid){o.paid=true;(o.ev=o.ev||[]).push({a:"paid",t:new Date().toISOString()});await db.setJSON("orders",orders)}return J({ok:1});
  }
  if(path==="orders/update"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.id);
    if(o){for(const k of ["paid","shipped","delivered","cancelled"])if(typeof b[k]==="boolean"&&o[k]!==b[k]){o[k]=b[k];if(b[k])(o.ev=o.ev||[]).push({a:k==="cancelled"?"cancelled":k,t:new Date().toISOString()})}
      if(b.track!==undefined)o.track=cut(b.track,120);if(b.note!==undefined)o.note=cut(b.note,500);await db.setJSON("orders",orders)}
    return J({ok:1});
  }
  if(path==="orders/delete"){
    if(!admin())return J({error:"Wrong password"},401);
    await db.setJSON("orders",(await get("orders",[])).filter(x=>x.id!==b.id));return J({ok:1});
  }
  if(path==="messages/delete"){
    if(!admin())return J({error:"Wrong password"},401);
    await db.setJSON("messages",(await get("messages",[])).filter(x=>x.t!==b.t));return J({ok:1});
  }
  if(path==="track"&&req.method==="POST"&&b.forget){
    if(!admin())return J({error:"Wrong password"},401);
    const key="an/"+ist(Math.min(+b.t0||Date.now(),Date.now())),doc=await get(key,{s:{}});
    if(doc.s[b.sid]){delete doc.s[b.sid];await db.setJSON(key,doc)}return J({ok:1});
  }
  if(path==="track"&&req.method==="POST"){
    const ua=req.headers.get("user-agent")||"";
    if(/bot|crawl|spider|headless|preview|facebookexternalhit|slurp|lighthouse|pingdom/i.test(ua))return J({ok:1});
    const sid=cut(b.sid,48),vid=cut(b.vid,48),t0=+b.t0||Date.now();if(!sid||!vid)return J({ok:1});
    const day=ist(Math.min(t0,Date.now())),key="an/"+day,doc=await get(key,{s:{}});let s=doc.s[sid];
    if(!s){if(Object.keys(doc.s).length>=2000)return J({ok:1});
      const g=(context&&context.geo)||{},host=new URL(req.url).hostname;
      s=doc.s[sid]={sid,vid,t0:Math.min(t0,Date.now()),nv:b.nv?1:0,src:srcOf(b.ref,b.utm,ua,host),dev:devOf(ua),br:brOf(ua),w:Math.min(+b.w||0,5000),loc:[g.city,g.subdivision&&g.subdivision.name,g.country&&g.country.name].filter(Boolean).slice(0,2).join(", ")||"Unknown"}}
    s.t1=Date.now();s.dur=Math.max(0,Math.min(+b.dur||0,86400));
    s.pages=(Array.isArray(b.pages)?b.pages:[]).slice(0,40).map(x=>({p:cut(x&&x.p,80),t:Math.max(0,+x.t||0)}));
    s.acts=(Array.isArray(b.acts)?b.acts:[]).slice(0,30).map(x=>({a:cut(x&&x.a,10),n:cut(x&&x.n,80)}));
    const e=b.ev||{};s.ev={v:Math.min(+e.v||0,99),c:Math.min(+e.c||0,99),k:Math.min(+e.k||0,99),o:Math.min(+e.o||0,9)};s.ov=Math.min(+b.ov||0,1e7);
    await db.setJSON(key,doc);return J({ok:1});
  }
  if(path==="analytics"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const days=Math.max(1,Math.min(30,+new URL(req.url).searchParams.get("days")||7)),list=[];
    for(let i=0;i<days;i++)list.push(ist(Date.now()-i*864e5));
    const docs=await Promise.all(list.map(d=>get("an/"+d,{s:{}}))),orders=await get("orders",[]),S=[];
    docs.forEach(d=>Object.values(d.s||{}).forEach(x=>S.push(x)));
    const top=(arr,f,n=8)=>{const m={};arr.forEach(x=>{const k=f(x);if(k)m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,c)=>c[1]-a[1]).slice(0,n).map(([k,v])=>({k,v}))};
    const lastP=x=>{const p=x.pages||[];return p.length?p[p.length-1].p:""},firstP=x=>{const p=x.pages||[];return p.length?p[0].p:""};
    const inR=o=>list.includes(ist(Date.parse(o.t))),ordR=orders.filter(o=>inR(o)&&!o.cancelled),paid=ordR.filter(o=>o.paid);
    const funnel={sessions:S.length,viewed:S.filter(x=>x.ev&&x.ev.v>0).length,cart:S.filter(x=>x.ev&&x.ev.c>0).length,checkout:S.filter(x=>x.ev&&x.ev.k>0).length,ordered:S.filter(x=>x.ev&&x.ev.o>0).length};
    const prod={};S.forEach(x=>(x.acts||[]).forEach(a=>{if(a.a==="view"||a.a==="cart"){const p=prod[a.n]||(prod[a.n]={n:a.n,v:0,c:0});a.a==="view"?p.v++:p.c++}}));
    const series=list.slice().reverse().map(d=>{const ss=S.filter(x=>ist(x.t0)===d);return{d,sessions:ss.length,visitors:new Set(ss.map(x=>x.vid)).size,orders:orders.filter(o=>!o.cancelled&&ist(Date.parse(o.t))===d).length,sales:orders.filter(o=>o.paid&&!o.cancelled&&ist(Date.parse(o.t))===d).reduce((a,o)=>a+o.total,0)}});
    const hours=Array(24).fill(0);S.forEach(x=>hours[hourOf(x.t0)]++);
    const durs=S.filter(x=>x.dur>0).map(x=>x.dur),now=Date.now();
    const outcome=x=>x.ev&&x.ev.o>0?"Ordered":x.ev&&x.ev.k>0?"Reached checkout":x.ev&&x.ev.c>0?"Added to cart":x.ev&&x.ev.v>0?"Viewed a product":(x.pages||[]).length>1?"Browsed":"Left quickly";
    return J({days,series,kpi:{sessions:S.length,visitors:new Set(S.map(x=>x.vid)).size,newV:S.filter(x=>x.nv).length,pageviews:S.reduce((a,x)=>a+(x.pages||[]).length,0),avgDur:durs.length?Math.round(durs.reduce((a,b)=>a+b,0)/durs.length):0,bounce:S.length?Math.round(100*S.filter(x=>(x.pages||[]).length<=1&&!(x.ev&&x.ev.c)).length/S.length):0,orders:ordR.length,paidOrders:paid.length,sales:paid.reduce((a,o)=>a+o.total,0),abandoned:S.filter(x=>x.ev&&x.ev.c>0&&!(x.ev.o>0)).length},
      funnel,sources:top(S,x=>x.src),devices:top(S,x=>x.dev),browsers:top(S,x=>x.br),places:top(S,x=>x.loc),entry:top(S,firstP),exit:top(S,lastP),hours,
      products:Object.values(prod).sort((a,b)=>(b.v+b.c*3)-(a.v+a.c*3)).slice(0,8),
      live:S.filter(x=>now-x.t1<300000).map(x=>({loc:x.loc,dev:x.dev,page:lastP(x),src:x.src})),
      recent:S.sort((a,b)=>b.t0-a.t0).slice(0,80).map(x=>({t:x.t0,loc:x.loc,dev:x.dev,br:x.br,src:x.src,nv:x.nv,dur:x.dur,pages:(x.pages||[]).map(p=>p.p),exit:lastP(x),acts:(x.acts||[]).filter(a=>a.a!=="view").map(a=>a.a+": "+String(a.n).replace(/^Product: /,"")).slice(0,6),out:outcome(x)}))});
  }
  if(path==="session"){
    const L=Array.isArray(b.log)?b.log.slice(0,60):[];
    if(L.length&&E.RESEND_API_KEY&&await allow()){
      const g=(context&&context.geo)||{},where=[g.city,g.subdivision&&g.subdivision.name,g.country&&g.country.name].filter(Boolean).join(", ")||"unknown place";
      const dev=/iphone|ipad/i.test(b.ua||"")?"iPhone":/android/i.test(b.ua||"")?"Android phone":"Computer";
      await mail("Visitor: "+L.length+" actions",`Visitor summary\nFrom: ${where}\nDevice: ${dev}\nCame from: ${cut(b.ref,120)||"direct link"}\n\n`+L.map(x=>cut(x.t,8)+"  "+cut(x.x,100)).join("\n"));
    }
    return J({ok:1});
  }
  if(path.startsWith("img/")&&req.method==="GET"){
    const id=path.slice(4);if(!/^[a-f0-9]{24}$/.test(id))return J({error:"Not found"},404);
    const r=await db.getWithMetadata("img/"+id,{type:"arrayBuffer"});if(!r)return J({error:"Not found"},404);
    return new Response(r.data,{headers:{"content-type":(r.metadata&&r.metadata.type)||"image/jpeg","cache-control":"public, max-age=31536000, immutable"}});
  }
  if(path==="products"&&req.method==="GET"){const all=await get("products",[]);if(await pack(all))await db.setJSON("products",all);return J(admin()?all:all.filter(p=>!p.hid))}
  if(path==="products"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const list=Array.isArray(b.products)?b.products:[];await pack(list);await db.setJSON("products",list);return J({ok:1});
  }
  if(path==="admin"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]);let mx=Math.max(1000,...orders.map(o=>o.no||0)),ch=false;
    [...orders].reverse().forEach(o=>{if(!o.no){o.no=++mx;ch=true}if(!o.method)o.method=o.manual?"upi":"online"});if(ch)await db.setJSON("orders",orders);
    return J({orders,messages:await get("messages",[])});
  }
  if(path==="event"){
    const L={open:"👀 Someone opened your store",view:"🛍️ Viewing: ",cart:"➕ Added to cart: ",buy:"💳 Going to pay: "};
    if(L[b.type])await notify("Crossroads\n"+L[b.type]+cut(b.name,80),b.type==="cart"||b.type==="buy");
    return J({ok:1});
  }
  if(path==="message"){
    const m={name:cut(b.name,60),contact:cut(b.contact,80),text:cut(b.text,800),t:new Date().toISOString()};
    if(!m.text)return J({error:"Write a message first."},400);
    const all=await get("messages",[]);all.unshift(m);await db.setJSON("messages",all.slice(0,200));
    await notify(`✉️ New message\n${m.name} (${m.contact})\n${m.text}`,true);return J({ok:1});
  }
  if(path==="pay/create"){
    if(!E.RAZORPAY_KEY_ID||!E.RAZORPAY_KEY_SECRET)return J({error:"Online payment isn't switched on yet."},503);
    const prods=await get("products",[]),c=b.customer||{},lines=[];let total=0;
    for(const i of b.items||[]){
      const p=prods.find(x=>x.id===i.id);const q=Math.max(1,Math.min(10,+i.q||1));
      if(!p||p.sold)return J({error:"An item in your cart is no longer available."},400);
      lines.push(`${p.n} (${cut(i.size,20)}) x${q}`);total+=p.p*q;
    }
    if(!lines.length||!c.name||!c.phone||!c.address)return J({error:"Fill in your details."},400);
    const r=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",
      headers:{"content-type":"application/json",authorization:"Basic "+Buffer.from(E.RAZORPAY_KEY_ID+":"+E.RAZORPAY_KEY_SECRET).toString("base64")},
      body:JSON.stringify({amount:Math.round(total*100),currency:"INR",receipt:"cr"+Date.now()})});
    const o=await r.json();
    if(!r.ok)return J({error:"Could not start payment. Try again."},502);
    const orders=await get("orders",[]);
    const mx=Math.max(1000,...orders.map(x=>x.no||0));
    orders.unshift({id:o.id,no:mx+1,method:"online",ev:[{a:"placed",t:new Date().toISOString()}],lines,total,paid:false,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300)});
    await db.setJSON("orders",orders.slice(0,500));
    return J({order:o.id,amount:o.amount,key:E.RAZORPAY_KEY_ID});
  }
  if(path==="pay/verify"){
    const sig=crypto.createHmac("sha256",E.RAZORPAY_KEY_SECRET||"").update(b.order_id+"|"+b.payment_id).digest("hex");
    if(sig!==b.signature)return J({error:"Payment could not be verified."},400);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.order_id);
    if(o&&!o.paid){o.paid=true;o.pay=cut(b.payment_id,40);(o.ev=o.ev||[]).push({a:"paid",t:new Date().toISOString()});await db.setJSON("orders",orders);
      await notify(orderText(o,"✅ PAID order — ready to ship"),true);}
    return J({ok:1});
  }
  if(path==="chat"&&req.method==="POST"){
    const prods=(await get("products",[])).filter(p=>!p.hid);
    const hist=Array.isArray(b.messages)?b.messages.slice(-10):[];
    const last=[...hist].reverse().find(x=>x&&x.role==="user");
    const text=cut(last&&last.text,400).trim();
    if(!text)return J({error:"Type a question first."},400);
    const cart=Array.isArray(b.cart)?b.cart.slice(0,10):[];
    let answer=null;
    try{answer=await chatAI(hist.map(x=>({role:x.role==="user"?"user":"assistant",content:cut(x.text,400)})),prods)}catch(e){}
    if(answer)return J({text:answer,quick:[{l:"Message on Instagram",href:"https://ig.me/m/"+STORE.ig},{l:"Browse the shop",href:"./"}]});
    return J(chatRule(text,prods,cart));
  }
  return J({error:"Not found"},404);
};
