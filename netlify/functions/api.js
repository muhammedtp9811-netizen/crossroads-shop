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
  delivery:"Most orders are dispatched within 24 hours and delivered in about 5 days. The maximum for any pin code is 2 weeks.",
  ship:"Shipping is free. The price you see at checkout is the final price.",
  pay:"We accept Cash on Delivery (COD), UPI (scan the QR, then enter the UPI transaction ID from your payment app) and online payment by card, UPI or net banking.",
  returns:"If an item arrives damaged or in the wrong size, message us on Instagram within 48 hours with a photo and we will sort it out.",
  hours:"We usually reply within a few hours, between 9 AM and 9 PM IST."};
const inr=n=>"â‚¹"+(+n||0).toLocaleString("en-IN");
const shortN=(s,n=58)=>{s=String(s??"").replace(/\s+/g," ").trim();if(s.length<=n)return s;const c=s.slice(0,n),i=c.lastIndexOf(" ");return(i>20?c.slice(0,i):c)+"â€¦"};
const DASH="https://crossroads-shopping.netlify.app/#admin";
const normPhone=v=>String(v??"").replace(/\D/g,"").replace(/^00+/,"").slice(0,15);
const last10=v=>String(v??"").replace(/\D/g,"").slice(-10);
const CODE_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode=()=>"CR-"+Array.from({length:6},()=>CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)]).join("");
const CODE_OFF=30;
let cfgCache={t:0,v:null};
function orderText(o,head){
  let when="";try{when=new Date(o.t||Date.now()).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}catch(e){when=new Date(o.t||Date.now()).toISOString().slice(0,16).replace("T"," ")}
  return `${head}\nOrder #${o.no||"â€”"} Â· ${inr(o.total)}\n${(o.lines||[]).join("\n")}\n\n${o.name}\n${o.phone}${o.email?" Â· "+o.email:""}\n${o.address}\n\n${o.method==="upi"?"UPI QR":o.method==="online"?"Online payment":"Payment"}${o.utr?" Â· UTR "+o.utr:""}${o.pay?" Â· Pay ID "+o.pay:""}${o.paid?" Â· PAID":""}\n${when} IST\n${DASH}`;
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
  if(ok(/^(bye|goodbye|see you)\b/))return{text:"Thanks for stopping by â€” hope to see you at checkout soon!",quick:[shop]};
  if(ok(/^(hi|hey|hello|hai|hiya|namaste|yo)\b/)||ok(/^good (morning|afternoon|evening)/))
    return{text:"Hi! ðŸ‘‹ What are you looking for today? I can help with products, sizes, delivery or payment.",quick:[{l:"What's new?"},{l:"Delivery time"},ig]};
  if(ok(/\b(human|agent|owner|real person|whatsapp|call|phone|contact|email|support)\b/)&&!ok(/\b(product|price|size|delivery)\b/))
    return{text:`The fastest way to reach a person is Instagram â€” @${STORE.ig}. ${STORE.hours}\n\nYou can also email ${STORE.mail} or use the Contact page.`,quick:[ig,{l:"Contact page",href:"#contact"}]};
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
    return{text:"Sizes differ by product â€” the exact sizes in stock are shown on each product page"+(S.length?` (for example ${S.slice(0,6).join(", ")})`:"")+". If you're between two sizes, size up for a relaxed fit. Tell me the product name and I'll check what's available.",quick:[shop,ig]};
  }
  if(ok(/\b(cart|bag|basket)\b/)){
    if(cart.length){const t=cart.reduce((a,i)=>a+(+i.p||0)*(+i.q||1),0);
      return{text:`Your bag has ${cart.reduce((a,i)=>a+(+i.q||1),0)} item(s):\n`+cart.map(i=>`â€¢ ${shortN(i.n,40)} Ã— ${+i.q||1} â€” ${inr((+i.p||0)*(+i.q||1))}`).join("\n")+`\n\nTotal: ${inr(t)}`,quick:[{l:"Go to checkout",href:"#checkout"},shop]};
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
  if(!hi){m=/(?:under|below|less than|upto|up to|max)\s*(?:rs\.?|â‚¹)?\s*(\d{2,5})/.exec(q);if(m)hi=+m[1]}
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
    return{text:"I couldn't find that in the shop right now. New pieces are added regularly â€” here's the latest:",products:cardsFor([...live].sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,3)),quick:[ig,shop]};
  return{text:"I can help with products, prices, sizes, delivery, payment and orders. What would you like to know?",quick:[{l:"What's new?"},{l:"Delivery time"},ig]};
}
async function chatAI(messages,prods){
  const key=E.AI_API_KEY||E.OPENAI_API_KEY||E.OPENROUTER_API_KEY;
  if(!key)return null;
  const url=E.AI_URL||"https://openrouter.ai/api/v1/chat/completions",model=E.AI_MODEL||"openai/gpt-4o-mini";
  const list=prods.slice(0,30).map(p=>`- ${cut(p.n,70)} | ${p.c||"Other"} | â‚¹${p.p}${p.s&&p.s.length?" | sizes: "+p.s.join("/"):""}${p.sold?" | SOLD OUT":""}`).join("\n");
  const sys=`You are the shopping assistant for Crossroads Shopping, a small online store in India. Reply in the customer's language, warmly, in at most 60 words. Use only the facts below. Never invent prices, stock, delivery times or policies. If you don't know, point them to Instagram @${STORE.ig} or the Contact page.\nStore facts:\n${STORE.delivery}\n${STORE.ship}\n${STORE.pay}\n${STORE.returns}\nSupport hours: ${STORE.hours}\nProducts:\n${list}\nWhen suggesting products, give the name and price only.`;
  try{
    const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+key},
      body:JSON.stringify({model,messages:[{role:"system",content:sys},...messages.slice(-8)],max_tokens:220,temperature:0.4}),signal:AbortSignal.timeout(9000)});
    if(!r.ok)return null;
    const d=await r.json(),t=d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content;
    return cut(t,700).trim()||null;
  }catch(e){return null}
}
/* ---------- Supplier product import (admin only) ---------- */
const UA={"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36","accept-language":"en-IN,en;q=0.9"};
const round9=n=>{n=+n||0;if(n<=0)return 0;return Math.max(9,Math.ceil(n/10)*10-1)};
const plainText=s=>String(s??"")
  .replace(/<br\s*\/?>/gi,"\n").replace(/<\/(p|div|li|h[1-6])>/gi,"\n")
  .replace(/<[^>]*>/g," ")
  .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">")
  .replace(/&quot;/gi,'"').replace(/&#0?39;/gi,"'").replace(/&#x27;/gi,"'")
  .replace(/[ \t]+/g," ").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
const metaMap=html=>{const out={},re=/<meta\b[^>]*>/gi;let m;while((m=re.exec(html))){const k=/\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(m[0]),v=/\bcontent\s*=\s*["']([^"']*)["']/i.exec(m[0]);if(k&&v)out[k[1].toLowerCase()]=v[1]}return out};
const ldProduct=html=>{const flat=[],re=/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;let m;
  while((m=re.exec(html))){try{const j=JSON.parse(m[1].trim());(function push(x){if(!x)return;if(Array.isArray(x))return x.forEach(push);if(x["@graph"])return push(x["@graph"]);flat.push(x)})(j)}catch(e){}}
  return flat.find(x=>{const t=[].concat(x["@type"]||[]).map(String).join(" ").toLowerCase();return t.includes("product")})||null};
const ldImages=v=>{if(!v)return[];const a=Array.isArray(v)?v:[v];return a.map(x=>typeof x==="string"?x:(x&&(x.url||x.contentUrl))||"").filter(Boolean)};
const ldPrice=o=>{if(!o)return 0;const a=Array.isArray(o)?o:[o];for(const x of a){const p=+(x&&(x.price||x.lowPrice||x.highPrice));if(p>0)return p}return 0};
function deepFind(o,pred,depth=0){
  if(!o||depth>9||typeof o!=="object")return null;
  try{if(pred(o))return o}catch(e){}
  const vals=Array.isArray(o)?o:Object.values(o);
  for(const v of vals){const r=deepFind(v,pred,depth+1);if(r)return r}
  return null;
}
function cleanImgList(arr){
  if(!Array.isArray(arr))arr=arr?[arr]:[];
  const out=[];
  for(let x of arr){
    if(x&&typeof x==="object")x=x.url||x.src||x.image_url||x.image||x.link||"";
    x=String(x||"").trim();if(!x)continue;
    if(x.startsWith("//"))x="https:"+x;
    if(!/^https?:\/\//.test(x))continue;
    if(out.indexOf(x)<0)out.push(x);
  }
  return out.slice(0,6);
}
function nextDataProduct(html){
  const m=/<script[^>]+id\s*=\s*["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if(!m)return null;
  let j;try{j=JSON.parse(m[1])}catch(e){return null}
  return deepFind(j,o=>o&&typeof o==="object"&&!Array.isArray(o)&&(o.name||o.title||o.product_name)&&(o.images||o.image_urls||o.media||o.image||o.offers));
}
async function genericProduct(u){
  const r=await fetch(u.href,{headers:UA,redirect:"follow"});if(!r.ok)return null;
  const html=await r.text(),ld=ldProduct(html),meta=metaMap(html),base=(()=>{try{return new URL(r.url||u.href).hostname.replace(/^www\./,"")}catch(e){return u.hostname.replace(/^www\./,"")}})();
  const nd=nextDataProduct(html);
  const title=plainText((ld&&ld.name)||meta["og:title"]||meta["twitter:title"]||(nd&&(nd.name||nd.title||nd.product_name))||(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)||[])[1]||"").replace(/\s+/g," ");
  if(!title)return null;
  let images=ldImages(ld&&ld.image);if(!images.length)images=cleanImgList(meta["og:image"]||meta["twitter:image"]);
  if(!images.length&&nd)images=cleanImgList(nd.images||nd.image_urls||nd.media||nd.image);
  const desc=plainText((ld&&ld.description)||meta["og:description"]||meta.description||(nd&&(nd.description||nd.product_description))||"");
  const price=ldPrice(ld&&ld.offers)||(()=>{if(!nd)return 0;const v=nd.price||nd.discounted_price||nd.selling_price||(nd.offers&&(nd.offers.price||nd.offers.lowPrice));return +String(v??"").replace(/[^\d.]/g,"")||0})();
  return{n:cut(title,120),sn:cut(title,60),c:"",d:desc,images:cleanImgList(images),cost:price,sup:{s:base||u.hostname.replace(/^www\./,""),u:u.href}};
}

/* ---- Meesho product fetch (share links from the app or website) ---- */
const MEESHO_RE=/(^|\.)meesho\.(com|link|app\.link)$/i;
function probeId(str){
  const s0=String(str||"");
  let m=/\/p\/([A-Za-z0-9_-]{4,})/.exec(s0);if(m)return m[1];
  m=/\/(?:product|products)\/([A-Za-z0-9_-]{4,})/.exec(s0);if(m)return m[1];
  m=/[?&](?:product_id|pid|productId|deep_link_value|id)=([A-Za-z0-9_-]{4,})/i.exec(s0);if(m)return m[1];
  return "";
}
function meeshoPrice(v){
  if(v&&typeof v==="object")v=v.price||v.value||v.amount||v.discounted_price||v.final_price||0;
  let n=+String(v??"").replace(/[^\d.]/g,"");if(!isFinite(n))n=0;
  if(n>=10000&&n%100===0)n=n/100;
  return Math.round(n)||0;
}
function guessCat(n){
  const t=String(n||"").toLowerCase();
  if(/watch|smart ?watch|chronograph/.test(t))return"Watches";
  if(/shoe|sneaker|sandal|slipper|heel|footwear|loafer|boot|flip ?flop/.test(t))return"Shoes";
  if(/bag|backpack|purse|wallet|clutch|handbag|trolley|sling/.test(t))return"Bags";
  if(/earring|necklace|jewell?ery|bracelet|\bring\b|pendant|anklet|bangle|chain|kada|mangalsutra/.test(t))return"Accessories";
  if(/kurti|kurta|saree|sari|lehenga|dress|shirt|tshirt|t-shirt|jeans|trouser|top|blouse|suit|jacket|hoodie|skirt|dupatta|co-?ord|nightsuit|night ?suit/.test(t))return"Fashion";
  return"";
}
const MEESHO_HEADERS={...UA,accept:"application/json, text/plain, */*",referer:"https://www.meesho.com/","sec-fetch-site":"same-origin","sec-fetch-mode":"cors","sec-fetch-dest":"empty"};
function priceHint(html){
  const t=String(html||"");
  const m=/"(?:discounted_?price|selling_?price|final_?price|price)"\s*:\s*"?(\d{2,7})"?/i.exec(t);
  return m?meeshoPrice(m[1]):0;
}
function normMeesho(j,u,id){
  if(!j)return null;
  let p=j.product||j.data||j.result||null;
  if(!p)p=deepFind(j,o=>o&&typeof o==="object"&&!Array.isArray(o)&&(o.name||o.product_name)&&(o.images||o.image_urls||o.media||o.image))||null;
  if(!p)return null;
  const name=plainText(p.name||p.product_name||p.title||"");
  if(!name||name.length<3)return null;
  const images=cleanImgList(p.images||p.image_urls||p.media||p.product_images||p.image||[]);
  const cost=meeshoPrice(p.price||p.discounted_price||p.selling_price||p.min_price||p.final_price||(p.price_range&&p.price_range.min));
  const desc=plainText(p.description||p.product_description||p.desc||p.details||"");
  const cat=plainText(p.category||p.category_name||p.sub_category||p.categoryName||"");
  return{n:cut(name,120),sn:cut(name,60),c:cut(cat,40)||guessCat(name),d:desc,images,cost,sup:{s:"meesho",id:id||"",u:u.href}};
}
function parseMeeshoHtml(html,u,id){
  const meta=metaMap(html);
  const nd=nextDataProduct(html);if(nd){const p=normMeesho(nd,u,id);if(p&&p.images.length)return p}
  const ld=ldProduct(html);
  const price=ldPrice(ld&&ld.offers)||meeshoPrice(meta["product:price:amount"]||meta["og:price:amount"])||priceHint(html);
  if(ld&&ld.name){const n=plainText(ld.name);if(n)return{n:cut(n,120),sn:cut(n,60),c:guessCat(n),d:plainText(ld.description||meta["og:description"]||""),images:cleanImgList(ldImages(ld.image).concat(ldImages(meta["og:image"]))),cost:price,sup:{s:"meesho",id:id||"",u:u.href}}}
  const title=plainText(meta["og:title"]||meta["twitter:title"]||"");
  if(!title)return null;
  return{n:cut(title,120),sn:cut(title,60),c:guessCat(title),d:plainText(meta["og:description"]||meta.description||""),images:cleanImgList(ldImages(meta["og:image"]||meta["twitter:image"])),cost:price,sup:{s:"meesho",id:id||"",u:u.href}};
}
async function meeshoProduct(u){
  let id=probeId(u.pathname);
  if(!id)for(const k of ["$canonical_url","deep_link_value","deeplink","url","link","redirect","target_url","$desktop_url","af_dp","pid","product_id"]){const pid=probeId(u.searchParams.get(k)||"");if(pid){id=pid;break}}
  if(!id&&/(^|\.)(meesho\.link|app\.link|meesho\.app\.link)$/i.test(u.hostname)){
    try{const r=await fetch(u.href,{headers:UA,redirect:"follow",signal:AbortSignal.timeout(8000)});id=probeId(r.url)||"";if(!id)id=probeId(await r.text())||""}catch(e){}
  }
  if(id){
    for(const api of ["https://www.meesho.com/api/v1/products/","https://www.meesho.com/api/v1/product/"]){
      try{const r=await fetch(api+encodeURIComponent(id),{headers:MEESHO_HEADERS,signal:AbortSignal.timeout(6000)});
        if(r.ok){const p=normMeesho(await r.json().catch(()=>null),u,id);if(p&&p.n)return p}
      }catch(e){}
    }
    for(const page of ["https://www.meesho.com/p/"+encodeURIComponent(id),u.href]){
      try{const r=await fetch(page,{headers:UA,redirect:"follow",signal:AbortSignal.timeout(6000)});
        if(r.ok){const p=parseMeeshoHtml(await r.text(),u,id);if(p&&p.n&&p.n.length>3)return p}
      }catch(e){}
    }
    return null;
  }
  try{const r=await fetch(u.href,{headers:UA,redirect:"follow",signal:AbortSignal.timeout(8000)});if(r.ok){const p=parseMeeshoHtml(await r.text(),u,id);if(p)return p}}catch(e){}
  throw new Error("Open a Meesho product and tap Share > Copy link. The link should contain /p/.");
}
let jvCred={t:0,url:"",key:""},jvCat={t:0,map:{}};
async function jvecCreds(){
  if(jvCred.url&&Date.now()-jvCred.t<6*3600*1000)return jvCred;
  const home=await fetch("https://www.jvecomb2b.com/",{headers:UA});
  if(!home.ok)throw new Error("The supplier site is not reachable right now.");
  const html=await home.text(),m=/<script[^>]+src\s*=\s*["']([^"']*\/assets\/[^"']+\.js)["']/i.exec(html);
  if(!m)throw new Error("The supplier page changed. Open the product and copy the link again.");
  const js=await(await fetch(m[1].startsWith("http")?m[1]:"https://www.jvecomb2b.com"+m[1],{headers:UA})).text();
  const url=(js.match(/https:\/\/[a-z0-9]+\.supabase\.co/)||[])[0],key=(js.match(/eyJ[A-Za-z0-9_\-.]{60,}/)||[])[0];
  if(!url||!key)throw new Error("Could not reach the supplier catalogue.");
  jvCred={t:Date.now(),url,key};return jvCred;
}
async function jvecFetch(creds,path){
  const r=await fetch(creds.url+"/rest/v1/"+path,{headers:{apikey:creds.key,authorization:"Bearer "+creds.key}});
  if(!r.ok)return null;return r.json().catch(()=>null);
}
async function jvecProduct(u){
  const parts=u.pathname.split("/").filter(Boolean);let slug=parts[0]==="product"&&parts[1]?decodeURIComponent(parts[1]):"";
  if(!slug&&parts[0]==="products"&&parts.length>1)slug=decodeURIComponent(parts[parts.length-1]);
  if(!slug)slug=u.searchParams.get("slug")||u.searchParams.get("id")||"";
  if(!slug)throw new Error("Open one product, not the whole list, and copy that product link (it contains /product/).");
  const creds=await jvecCreds();
  let row=null;
  if(/^[0-9a-f-]{36}$/i.test(slug)){const rr=await jvecFetch(creds,"products?id=eq."+encodeURIComponent(slug)+"&select=*&limit=1");row=rr&&rr[0]}
  if(!row){const rr=await jvecFetch(creds,"products?slug=eq."+encodeURIComponent(slug)+"&select=*&limit=1");row=rr&&rr[0]}
  if(!row)return null;
  if(Date.now()-jvCat.t>6*3600*1000){const rows=await jvecFetch(creds,"categories?select=id,name&limit=500");const map={};(rows||[]).forEach(c=>{if(c&&c.id)map[c.id]=c.name||""});jvCat={t:Date.now(),map}}
  const cost=[+row.discounted_price,+row.original_price].filter(x=>x>0).sort((a,b)=>a-b)[0]||0;
  const images=[row.image].concat(Array.isArray(row.images)?row.images:[]).filter(x=>x&&/^https?:\/\//.test(x)).filter((x,i,a)=>a.indexOf(x)===i).slice(0,5);
  const name=String(row.name||"").replace(/\s+/g," ").trim();
  if(!name)return null;
  return{n:cut(name,120),sn:cut(name,60),c:jvCat.map[row.category_id]||"",d:plainText(row.description),images,cost,
    sup:{s:"jvecomb2b",id:row.id||"",slug:row.slug||slug,cost,stock:+(row.on_hand_stock??row.stock??0)||0,u:u.href}};
}

/* ---------- Instagram publishing (official Graph API) ---------- */
const IG_VER="v21.0",IG_BASE="https://crossroads-shopping.netlify.app";
const IG_TAGS={Electronics:["#electronics","#tech","#gadgets","#techdeals"],Accessories:["#accessories","#style","#gifts"],Shirts:["#shirts","#fashion","#menswear"],Fashion:["#fashion","#style","#ootd"],Shoes:["#shoes","#sneakers","#footwear"]};
function igCaption(p){
  const name=cut(String(p.n||"").trim(),90),desc=plainText(p.d||"").replace(/\s+/g," ").slice(0,300),price=+p.p||0,old=+p.o||0;
  const lines=[name,"",desc,"",price?("Price: ₹"+price.toLocaleString("en-IN")+(old>price?" (was ₹"+old.toLocaleString("en-IN")+")":"")):"","Free delivery across India in about 5 days. Cash on Delivery available.","Order here: "+IG_BASE+"/#product/"+p.id,""];
  const tags=["#CrossroadsShopping","#OnlineShoppingIndia","#IndiaShopping","#ShopNow"];
  const cat=String(p.c||"").toLowerCase();Object.keys(IG_TAGS).forEach(k=>{if(cat.includes(k.toLowerCase()))tags.push(...IG_TAGS[k])});
  const nameTags=name.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>3).slice(0,3).map(w=>"#"+w);
  const out=[...lines,...tags,...nameTags].join("\n");
  return out.length>2100?out.slice(0,2100):out;
}
async function igCall(url,opt){
  const r=await fetch(url,opt),d=await r.json().catch(()=>({}));
  if(!r.ok||!d||d.error)throw new Error((d&&d.error&&d.error.message)||("Instagram error "+r.status));
  return d;
}
async function igVerify(user,token){return igCall("https://graph.facebook.com/"+IG_VER+"/"+encodeURIComponent(user)+"?fields=username,name&access_token="+encodeURIComponent(token))}
async function igCreate(user,token,params){
  const body=new URLSearchParams(Object.assign({},params,{access_token:token}));
  const d=await igCall("https://graph.facebook.com/"+IG_VER+"/"+encodeURIComponent(user)+"/media",{method:"POST",body});
  if(!d.id)throw new Error("Instagram did not return a media ID.");return d.id;
}
async function igPublish(user,token,id){
  const body=new URLSearchParams({creation_id:id,access_token:token});
  const d=await igCall("https://graph.facebook.com/"+IG_VER+"/"+encodeURIComponent(user)+"/media_publish",{method:"POST",body});
  if(!d.id)throw new Error("Instagram did not publish the media.");return d.id;
}

export default async(req,context)=>{
  const db=getStore({name:"shop",consistency:"strong"}), path=new URL(req.url).pathname.replace(/^\/api\/?/,"");
  const get=async(k,d)=>(await db.get(k,{type:"json"}))??d;
  const cfg=async()=>{if(cfgCache.v&&Date.now()-cfgCache.t<15000)return cfgCache.v;const s=await get("settings",{});cfgCache={t:Date.now(),v:s};return s};
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
  const mail=(subject,text,cred)=>fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+((cred&&cred.key)||E.RESEND_API_KEY),"content-type":"application/json"},body:JSON.stringify({from:(cred&&cred.from)||E.MAIL_FROM||"Crossroads <onboarding@resend.dev>",to:[(cred&&cred.to)||E.ALERT_EMAIL||"producingmj@gmail.com"],subject:cut(subject,80),text})});
  const custMail=async(o,kind)=>{
    const email=String(o&&o.email||"").trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return;
    const st=await cfg().catch(()=>({})),key=E.RESEND_API_KEY||st.rsKey||"";
    if(!key)return;
    const from=E.MAIL_FROM||st.rsFrom||"Crossroads <onboarding@resend.dev>";
    const when=(()=>{try{return new Date(o.t||Date.now()).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"})}catch(e){return""}})();
    const body=
`Hi ${o.name||"there"},

Thank you for shopping with Crossroads Shopping. We have received your order.

Order #${o.no||""}  Â·  ${when} IST

${(o.lines||[]).join("\n")}

Total: ${inr(o.total)}

${kind==="paid"
  ? "Payment received. We are packing your order and will dispatch it within 24 hours. Delivery takes about 5 days, and never more than 2 weeks."
  : "We are checking your UPI payment now. You will get another email as soon as it is confirmed."}
${o.next?`
Your code for the next order: ${o.next}
Use it at checkout for a discount. It works with this phone number only.
`:""}
Delivering to:
${o.name||""}
${o.address||""}
${o.phone||""}

Need help? Just reply to this email, or message us on Instagram @${STORE.ig}.

â€” Crossroads Shopping`;
    await mail(kind==="paid"?"Order #"+(o.no||"")+" confirmed â€” payment received":"Order #"+(o.no||"")+" received",body,{key,to:email,from}).catch(()=>{});
  };
  const codeNorm=v=>String(v||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const getCodes=()=>get("codes",[]);
  async function issueCode(phone){
    const ph=last10(phone);if(ph.length<10)return "";
    const list=await getCodes(),have=list.find(k=>k.ph===ph&&!k.used);
    if(have)return have.c;
    let c="";do{c=newCode()}while(list.some(k=>k.c===c));
    list.unshift({c,ph,used:false,t:new Date().toISOString()});
    await db.setJSON("codes",list.slice(0,3000));
    return c;
  }
  async function checkCode(raw,phone,consume,ref){
    const c=codeNorm(raw);
    if(!c)return{off:0};
    const ph=last10(phone),list=await getCodes(),x=list.find(k=>codeNorm(k.c)===c);
    if(!x)return{off:0,err:"That code is not valid. Check the spelling."};
    if(x.used)return{off:0,err:"That code has already been used."};
    if(x.ph!==ph)return{off:0,err:"That code belongs to a different phone number."};
    if(consume){x.used=true;x.ut=new Date().toISOString();if(ref)x.ord=String(ref);await db.setJSON("codes",list)}
    return{off:CODE_OFF,code:x.c};
  }
  async function freeCode(raw){
    const c=codeNorm(raw);if(!c)return;
    const list=await getCodes(),x=list.find(k=>codeNorm(k.c)===c);
    if(x&&x.used){x.used=false;delete x.ut;delete x.ord;await db.setJSON("codes",list)}
  }
  const shortName=v=>{const p=String(v||"").trim().split(/\s+/).filter(Boolean);if(!p.length)return "Customer";return p.length>1?p[0]+" "+p[p.length-1][0].toUpperCase()+".":p[0]};
  const getReviews=()=>get("reviews",[]);
  const me=async()=>{const t=String(req.headers.get("x-cr-token")||"").trim();if(!t)return null;const ss=await get("sessions",[]),s=ss.find(k=>k.token===t);if(!s)return null;if(Date.now()-new Date(s.t||0).getTime()>90*864e5)return null;return s};
  const otpText=code=>`${code} is your Crossroads Shopping code. It expires in 10 minutes. Never share it with anyone.`;
  async function sendOtp(phone,code){
    const st=await cfg().catch(()=>({})),text=otpText(code);
    const hooks=[String(E.SMS_WEBHOOK||st.smsHook||"").trim(),String(E.SMS_WEBHOOK2||st.smsHook2||"").trim()].filter(Boolean);
    for(const hook of hooks){
      const full="91"+phone;
      if(/api\.pushcut\.io/i.test(hook)){
        try{
          const r=await fetch(hook,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({input:{phone:full,message:text,code}})});
          if(r.ok)return{ok:1,via:"gateway"};
          // try next hook
        }catch(e){}
        continue;
      }
      try{
        if(/\{(phone|msg|code)\}/.test(hook)){
          const url=hook.replace(/\{phone\}/g,encodeURIComponent(full)).replace(/\{msg\}/g,encodeURIComponent(text)).replace(/\{code\}/g,encodeURIComponent(code));
          if((await fetch(url,{method:"GET"})).ok)return{ok:1,via:"gateway"};
        }else{
          const r=await fetch(hook,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({to:full,phone:full,message:text,text,code})});
          if(r.ok)return{ok:1,via:"gateway"};
        }
      }catch(e){}
    }
    const key=String(E.FAST2SMS_KEY||st.f2sKey||"").trim();
    if(key){
      try{
        const route=String(E.FAST2SMS_ROUTE||st.f2sRoute||"q")==="otp"?"otp":"q";
        const r=await fetch("https://www.fast2sms.com/dev/bulkV2?"+new URLSearchParams({route,message:text,flash:"0",numbers:phone}),{headers:{Authorization:key}});
        const d=await r.json().catch(()=>({}));
        if(r.ok&&(d.return===true||d.status==="success"))return{ok:1,via:"sms"};
        const msg=String(d.message||d.msg||d.error||"").trim();
        return{ok:0,configured:true,err:msg?"Fast2SMS: "+msg:"Our SMS provider did not accept the message. Check the key in Settings."};
      }catch(e){return{ok:0,configured:true,err:"Could not reach the SMS provider."}}
    }
    const tb=String(E.TEXTBELT_KEY||"").trim();
    if(tb){
      try{
        const r=await fetch("https://textbelt.com/text",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({phone:"+91"+phone,message:text,key:tb})});
        const d=await r.json().catch(()=>({}));
        if(d.success)return{ok:1,via:"sms"};
        return{ok:0,configured:true,err:d.error||"The SMS provider did not accept the message."};
      }catch(e){return{ok:0,configured:true,err:"Could not reach the SMS provider."}}
    }
    return{ok:0,configured:false};
  }
  const applyOff=(total,off)=>Math.max(1,total-Math.min(off||0,total-1));
  const tgCreds=async()=>{const s=await cfg().catch(()=>({}));return{tok:E.TELEGRAM_BOT_TOKEN||s.tgToken||"",chat:String(E.TELEGRAM_CHAT_ID||s.tgChat||"").trim()}};
  async function tgSend(t,cred){
    const c=cred||await tgCreds();
    if(!c.tok||!c.chat)return "";
    try{
      const r=await fetch(`https://api.telegram.org/bot${c.tok}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:c.chat,text:t,disable_web_page_preview:true})});
      const d=await r.json().catch(()=>({}));
      return d.ok?"" : (d.description||"Telegram refused the message.");
    }catch(e){return "Could not reach Telegram."}
  }
  async function notify(t,imp,skipWa,skip){
    skip=skip||{};
    const st=await cfg().catch(()=>({})),waKey=E.CALLMEBOT_KEY||st.waKey||"",waPhone=String(E.WA_NUMBER||st.waPhone||WA).replace(/\D/g,"");
    const tgTok=E.TELEGRAM_BOT_TOKEN||st.tgToken||"",tgChat=E.TELEGRAM_CHAT_ID||st.tgChat||"";
    const rsKey=E.RESEND_API_KEY||st.rsKey||"",rsTo=E.ALERT_EMAIL||st.rsTo||"producingmj@gmail.com",rsFrom=E.MAIL_FROM||st.rsFrom||"";
    if(!waKey&&!E.DISCORD_WEBHOOK&&!E.FAST2SMS_KEY&&!E.NTFY_TOPIC&&!rsKey&&!(tgTok&&tgChat))return;
    if(!imp&&!await allow())return;
    if(waKey&&!skipWa)await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waPhone}&apikey=${encodeURIComponent(waKey)}&text=${encodeURIComponent(t)}`).catch(()=>{});
    if(imp&&E.FAST2SMS_KEY&&!skip.sms)await fetch("https://www.fast2sms.com/dev/bulkV2?"+new URLSearchParams({route:"q",message:t.replace(/[^\x20-\x7E\n]/g,"").slice(0,150),flash:"0",numbers:E.SMS_TO||"8281036836"}),{headers:{Authorization:E.FAST2SMS_KEY}}).catch(()=>{});
    if(E.DISCORD_WEBHOOK&&!skip.discord)await fetch(E.DISCORD_WEBHOOK,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:t})}).catch(()=>{});
    if(E.NTFY_TOPIC&&!skip.ntfy)await fetch("https://ntfy.sh/"+encodeURIComponent(E.NTFY_TOPIC),{method:"POST",headers:{Title:"Crossroads"},body:t}).catch(()=>{});
    if(imp&&rsKey&&!skip.email)await mail(t.split("\n").filter(Boolean)[0],t,{key:rsKey,to:rsTo,from:rsFrom}).catch(()=>{});
    if(tgTok&&tgChat&&!skip.tg)await tgSend(t,{tok:tgTok,chat:tgChat});
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
  if(path==="settings"&&req.method==="GET"){const t=await get("settings",{});return J({upi:t.upi||"",name:t.name||"",qr:t.qr||"",online:!!(E.RAZORPAY_KEY_ID&&E.RAZORPAY_KEY_SECRET),paymentMethod:t.paymentMethod||"both",googleClientId:t.googleClientId||""})}
  if(path==="settings"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const cur=await get("settings",{}),nxt={...cur};
    if(b.upi!==undefined)nxt.upi=cut(b.upi,80);
    if(b.paymentMethod!==undefined)nxt.paymentMethod=["cod","upi","both"].includes(b.paymentMethod)?b.paymentMethod:"both";
    if(b.googleClientId!==undefined)nxt.googleClientId=cut(String(b.googleClientId).trim(),160);
    if(b.name!==undefined)nxt.name=cut(b.name,60);
    if(b.qr!==undefined)nxt.qr=cut(b.qr,400000);
    if(b.brand!==undefined){const x=b.brand&&typeof b.brand==="object"?b.brand:null;nxt.brand=x?{name:cut(x.name,40)||"Crossroads Shopping",tag:cut(x.tag,70),mono:cut(x.mono,3)||"CS",bg:/^#[0-9a-f]{3,8}$/i.test(x.bg||"")?x.bg:"#111318",fg:/^#[0-9a-f]{3,8}$/i.test(x.fg||"")?x.fg:"#ffffff",ac:/^#[0-9a-f]{3,8}$/i.test(x.ac||"")?x.ac:"#c9a227",shape:["rounded","circle","square"].includes(x.shape)?x.shape:"rounded"}:null;}
    if(b.waPhone!==undefined)nxt.waPhone=normPhone(b.waPhone);
    if(b.waKey!==undefined)nxt.waKey=cut(String(b.waKey).trim(),90);
    if(b.tgToken!==undefined)nxt.tgToken=cut(String(b.tgToken).trim(),120);
    if(b.tgChat!==undefined)nxt.tgChat=cut(String(b.tgChat).trim(),40);
    if(b.rsKey!==undefined)nxt.rsKey=cut(String(b.rsKey).trim(),90);
    if(b.rsTo!==undefined)nxt.rsTo=cut(String(b.rsTo).trim().toLowerCase(),120);
    if(b.rsFrom!==undefined)nxt.rsFrom=cut(String(b.rsFrom).trim(),120);
    if(b.smsHook!==undefined){const h=String(b.smsHook).trim();nxt.smsHook=/^https?:\/\//i.test(h)?cut(h,300):""}
    if(b.smsHook2!==undefined){const h=String(b.smsHook2).trim();nxt.smsHook2=/^https?:\/\//i.test(h)?cut(h,300):""}
    if(b.f2sKey!==undefined&&String(b.f2sKey).trim())nxt.f2sKey=cut(String(b.f2sKey).trim(),120);
    if(b.f2sKey==="")delete nxt.f2sKey;
    if(b.f2sRoute!==undefined)nxt.f2sRoute=String(b.f2sRoute)==="otp"?"otp":"q";
    if(b.igUser!==undefined)nxt.igUser=cut(String(b.igUser).trim(),40);
    if(b.igToken!==undefined){const t=String(b.igToken).trim();if(t)nxt.igToken=cut(t,500);else delete nxt.igToken}
    if(b.igAuto!==undefined)nxt.igAuto=!!b.igAuto;
    if(b.igStory!==undefined)nxt.igStory=!!b.igStory;
    await db.setJSON("settings",nxt);cfgCache={t:0,v:null};return J({ok:1});
  }
  if(path==="notify"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const s=await get("settings",{}),tgTok=E.TELEGRAM_BOT_TOKEN||s.tgToken||"",tgChat=E.TELEGRAM_CHAT_ID||s.tgChat||"";
    return J({whatsapp:!!(E.CALLMEBOT_KEY||s.waKey),whatsapp_number:String(E.WA_NUMBER||s.waPhone||WA).replace(/\D/g,""),
      email:!!(E.RESEND_API_KEY||s.rsKey),email_to:E.ALERT_EMAIL||s.rsTo||"producingmj@gmail.com",email_saved:!!s.rsKey,email_from:E.MAIL_FROM||s.rsFrom||"",
      telegram:!!(tgTok&&tgChat),telegram_saved:!!s.tgToken,telegram_chat:tgChat,
      ntfy:!!E.NTFY_TOPIC,discord:!!E.DISCORD_WEBHOOK,sms:!!E.FAST2SMS_KEY,
      otp:{gateway:!!String(E.SMS_WEBHOOK||s.smsHook||"").trim(),fast2sms:!!String(E.FAST2SMS_KEY||s.f2sKey||"").trim(),
        textbelt:!!String(E.TEXTBELT_KEY||"").trim(),hook:s.smsHook||"",hook2:s.smsHook2||"",f2s:!!String(s.f2sKey||"").trim()}});
  }
  if(path==="notify/telegram"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const cur=await get("settings",{}),tok=String(b.token||cur.tgToken||E.TELEGRAM_BOT_TOKEN||"").trim();
    if(!tok)return J({error:"Paste the bot token from @BotFather first."},400);
    let me;
    try{me=await (await fetch(`https://api.telegram.org/bot${tok}/getMe`)).json()}catch(e){return J({error:"Could not reach Telegram. Check your internet and try again."},400)}
    if(!me.ok)return J({error:"That token is not valid. Copy it again from @BotFather (it looks like 123456789:ABCdef...)."},400);
    let chat=String(cur.tgChat||"").trim(),who="";
    if(!chat){
      let up={};
      try{up=await (await fetch(`https://api.telegram.org/bot${tok}/getUpdates?limit=20`)).json()}catch(e){}
      const list=(up.result||[]).slice().reverse();
      for(const u of list){
        const c=u.message&&u.message.chat||u.channel_post&&u.channel_post.chat||u.my_chat_member&&u.my_chat_member.chat;
        if(c&&c.id){chat=String(c.id);who=[c.first_name,c.last_name].filter(Boolean).join(" ")||c.title||c.username||"";break}
      }
      if(!chat)return J({error:`Token is good (@${me.result.username}). Now open Telegram, find @${me.result.username}, tap Start (or send "hi"), then press Connect again.`},400);
    }
    const nxt={...cur,tgToken:cut(tok,120),tgChat:cut(chat,40)};
    await db.setJSON("settings",nxt);cfgCache={t:0,v:null};
    const err=await tgSend("âœ… Telegram alerts are connected to Crossroads Shopping.\nYou will get every new order here.\n"+DASH,{tok,chat});
    if(err)return J({error:"Saved, but Telegram said: "+err},400);
    return J({ok:1,bot:me.result.username,chat,who});
  }
  if(path==="notify/email"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const cur=await get("settings",{}),key=String(b.key||cur.rsKey||E.RESEND_API_KEY||"").trim();
    const to=String(b.to||cur.rsTo||E.ALERT_EMAIL||"producingmj@gmail.com").trim().toLowerCase();
    const from=String(b.from||cur.rsFrom||E.MAIL_FROM||"").trim();
    if(!key)return J({error:"Paste your Resend API key first (resend.com â†’ API Keys)."},400);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))return J({error:"That email address does not look right."},400);
    let r,d={};
    try{
      r=await mail("Test alert from Crossroads Shopping","ðŸ”” Test alert from Crossroads Shopping\nIf you can read this, order alerts are working.\n"+DASH,{key,to,from});
      d=await r.json().catch(()=>({}));
    }catch(e){return J({error:"Could not reach Resend. Check your internet and try again."},400)}
    if(!r.ok){
      const m=String(d.message||d.error||"").trim();
      if(/only send testing emails/i.test(m))return J({error:"Resend blocked this: the free sender can only email the address that owns the Resend account. Use that same address here."},400);
      if(/invalid|not authorized|unauthorized/i.test(m))return J({error:"Resend says the API key is invalid. Copy it again from resend.com â†’ API Keys."},400);
      return J({error:"Resend refused the email: "+(m||("status "+r.status))},400);
    }
    await db.setJSON("settings",{...cur,rsKey:cut(key,90),rsTo:cut(to,120),rsFrom:cut(from,120)});cfgCache={t:0,v:null};
    return J({ok:1,to,from});
  }
  if(path==="notify/test"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const st=await cfg().catch(()=>({})),waKey=E.CALLMEBOT_KEY||st.waKey||"",waPhone=normPhone(E.WA_NUMBER||st.waPhone||WA);
    const tgTok=E.TELEGRAM_BOT_TOKEN||st.tgToken||"",tgChat=E.TELEGRAM_CHAT_ID||st.tgChat||"";
    const rsKey=E.RESEND_API_KEY||st.rsKey||"",rsTo=E.ALERT_EMAIL||st.rsTo||"producingmj@gmail.com",rsFrom=E.MAIL_FROM||st.rsFrom||"";
    const other=rsKey||E.NTFY_TOPIC||E.DISCORD_WEBHOOK||(tgTok&&tgChat);
    if(!waKey&&!other)return J({error:"No alert channel is set up yet."},400);
    const msg="ðŸ”” Test alert from Crossroads Shopping\nIf you can read this, order alerts are working.\n"+DASH;
    let wa="",waOk=false;
    if(waKey){
      try{
        const r=await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waPhone}&apikey=${encodeURIComponent(waKey)}&text=${encodeURIComponent(msg)}`);
        const raw=await r.text();
        wa=cut(raw,400).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,200);
        waOk=/Message (queued|sent)/i.test(raw)||!/(invalid|error|not valid)/i.test(raw);
        if(/apikey is invalid/i.test(raw))wa="CallMeBot says the key is invalid. Send the bot a WhatsApp message: Recover APIKey";
        else if(/not valid|invalid phone/i.test(raw))wa="CallMeBot says the number is wrong. Use country code, no + and no spaces.";
      }catch(e){wa="Could not reach CallMeBot. Try again in a minute."}
    }
    let tg="";
    if(tgTok&&tgChat)tg=await tgSend(msg,{tok:tgTok,chat:tgChat});
    let em="";
    if(rsKey){
      try{
        const x=await mail("Test alert from Crossroads Shopping",msg,{key:rsKey,to:rsTo,from:rsFrom});
        if(!x.ok){const d=await x.json().catch(()=>({}));em=String(d.message||("status "+x.status)).slice(0,160)}
      }catch(e){em="Could not reach Resend."}
    }
    if(other)await notify(msg,true,true,{tg:true,email:true});
    return J({ok:1,whatsapp:!!waKey,whatsapp_ok:waOk,whatsapp_reply:wa,telegram:!!(tgTok&&tgChat),telegram_error:tg,email:!!rsKey,email_to:rsTo,email_error:em});
  }
  if(path==="order/manual"){
    const prods=await get("products",[]),c=b.customer||{},lines=[],its=[];let total=0;
    for(const i of b.items||[]){
      const p=prods.find(x=>x.id===i.id),q=Math.max(1,Math.min(10,+i.q||1));
      if(!p||p.sold)return J({error:"An item in your cart is no longer available."},400);
      lines.push(`${p.n} (${cut(i.size,20)}) x${q}`);its.push({n:shortN(p.n,90),s:cut(i.size,20),q,p:p.p});total+=p.p*q;
    }
    const method=String(b.method||"upi")==="cod"?"cod":"upi";
    const utr=String(b.utr||"").replace(/\W/g,"").slice(0,30);
    if(!lines.length||!c.name||!c.phone||!c.address)return J({error:"Fill in your details."},400);
    if(method==="upi"&&utr.length<8)return J({error:"Fill in your details and the UPI transaction ID."},400);
    const orders=await get("orders",[]);
    if(orders.some(x=>x.utr===utr))return J({error:"This transaction ID was already used."},400);
    const id="upi"+Date.now();
    const cc=await checkCode(b.code,c.phone,true,id);
    if(cc.err)return J({error:cc.err},400);
    total=applyOff(total,cc.off);
    const first=!orders.some(x=>!x.cancelled&&last10(x.phone)===last10(c.phone));
    const mx=Math.max(1000,...orders.map(o=>o.no||0));
    const o={id,no:mx+1,method:method,ev:[{a:"placed",t:new Date().toISOString()}],lines,it:its,total,paid:false,manual:true,utr:method==="cod"?"":utr,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300),track:{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[{a:"placed",t:new Date().toISOString()}]}};
    if(cc.off)o.disc={code:cc.code,off:cc.off};
    if(first){const nc=await issueCode(c.phone);if(nc)o.next=nc}
    orders.unshift(o);
    await db.setJSON("orders",orders.slice(0,500));
    await notify(orderText(o,method==="cod"?"New order - Cash on Delivery. Collect payment on delivery.":"New order - UPI payment claimed. Check your bank app, then mark it paid.")+(cc.off?`\nDiscount code used: ${cc.code}`:""),true);
    await custMail(o,"received");
    return J({ok:1,next:o.next||""});
  }
  if(path==="orders/paid"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.id);
    if(o&&!o.paid){o.paid=true;(o.ev=o.ev||[]).push({a:"paid",t:new Date().toISOString()});if(!o.next&&!orders.some(x=>x.id!==o.id&&x.paid&&!x.cancelled&&last10(x.phone)===last10(o.phone))){const nc=await issueCode(o.phone);if(nc)o.next=nc}await db.setJSON("orders",orders);await custMail(o,"paid")}return J({ok:1});
  }
  if(path==="orders/update"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.id);
    if(o){let justPaid=false;for(const k of ["paid","shipped","delivered","cancelled"])if(typeof b[k]==="boolean"&&o[k]!==b[k]){o[k]=b[k];if(b[k])(o.ev=o.ev||[]).push({a:k==="cancelled"?"cancelled":k,t:new Date().toISOString()});if(k==="paid"&&b[k])justPaid=true}
      if(b.track!==undefined)o.track=cut(b.track,120);if(b.note!==undefined)o.note=cut(b.note,500);
       if(b.trackStatus!==undefined){const ts=String(b.trackStatus);if(["placed","confirmed","processing","shipped","intransit","outfordelivery","delivered","cancelled"].includes(ts)){o.track=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};o.track.status=ts;o.track.events=o.track.events||[];o.track.events.push({a:ts,t:new Date().toISOString(),note:cut(b.trackNote||"",200)});if(ts==="shipped"&&!o.shipped){o.shipped=true;(o.ev=o.ev||[]).push({a:"shipped",t:new Date().toISOString()})}if(ts==="delivered"&&!o.delivered){o.delivered=true;(o.ev=o.ev||[]).push({a:"delivered",t:new Date().toISOString()})}}}
       if(b.courier!==undefined){o.track=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};o.track.courier=cut(String(b.courier||""),60)}
       if(b.trackNo!==undefined){o.track=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};o.track.trackNo=cut(String(b.trackNo||""),60)}
       if(b.estDays!==undefined){o.track=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};o.track.estDays=Math.max(1,Math.min(30,+b.estDays||5))}
       if(b.estDate!==undefined){o.track=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};o.track.estDate=cut(String(b.estDate||""),20)}
       if(b.trackNote!==undefined){o.track=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};o.track.note=cut(String(b.trackNote||""),300)}
      if(justPaid&&!o.next&&!orders.some(x=>x.id!==o.id&&x.paid&&!x.cancelled&&last10(x.phone)===last10(o.phone))){const nc=await issueCode(o.phone);if(nc)o.next=nc}
      await db.setJSON("orders",orders);
      if(b.cancelled===true&&o.disc&&o.disc.code)await freeCode(o.disc.code);
      if(justPaid)await custMail(o,"paid")}
    return J({ok:1});
  }

  if(path==="orders/track"&&req.method==="POST"){
    const no=+b.no||0,phone=String(b.phone||"").replace(/\D/g,"").slice(-10);
    if(!no||phone.length<10)return J({error:"Enter your order number and phone number."},400);
    const orders=await get("orders",[]),o=orders.find(x=>x.no===no&&last10(x.phone)===phone);
    if(!o)return J({error:"No order found with that number and phone."},404);
    const t=o.track||{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[]};
    const placed=new Date(o.t||Date.now());
    const estDate=t.estDate?t.estDate:new Date(placed.getTime()+t.estDays*864e5).toISOString().slice(0,10);
    const daysLeft=Math.max(0,Math.ceil((new Date(estDate)-Date.now())/864e5));
    const statusLabels={placed:"Order Placed",confirmed:"Confirmed",processing:"Processing",shipped:"Shipped",intransit:"In Transit",outfordelivery:"Out for Delivery",delivered:"Delivered",cancelled:"Cancelled"};
    return J({ok:1,order:{no:o.no,name:o.name,phone:o.phone,total:o.total,paid:!!o.paid,method:o.method||"upi",placed:o.t,estDate,daysLeft,status:t.status,statusLabel:statusLabels[t.status]||t.status,courier:t.courier||"",trackNo:t.trackNo||"",note:t.note||"",events:(t.events||[]).map(e=>({a:e.a,t:e.t,note:e.note||""})),lines:o.lines||[],items:o.it||[]}});
  }
  if(path==="orders/delete"){
    if(!admin())return J({error:"Wrong password"},401);
    const all=await get("orders",[]),o=all.find(x=>x.id===b.id);
    await db.setJSON("orders",all.filter(x=>x.id!==b.id));
    if(o&&o.disc&&o.disc.code)await freeCode(o.disc.code);
    return J({ok:1});
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
      await mail("Visitor: "+L.length+" actions",`Visitor summary\nFrom: ${where}\nDevice: ${dev}\nCame from: ${cut(b.ref,120)||"direct link"}\n\n`+L.map(x=>cut(x.t,8)+"  "+cut(x.x,100)).join("\n")).catch(()=>{});
    }
    return J({ok:1});
  }
  if(path==="dbg/meesho"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const out={};
    const probe=async(label,url,headers)=>{
      const t0=Date.now();
      try{const r=await fetch(url,{headers,signal:AbortSignal.timeout(8000)});
        const t=await r.text();
        out[label]={s:r.status,ms:Date.now()-t0,len:t.length,ct:r.headers.get("content-type"),head:t.slice(0,120).replace(/\s+/g," ")};
      }catch(e){out[label]={err:String((e&&e.message)||e).slice(0,140),ms:Date.now()-t0}}
    };
    await probe("index","https://www.meesho.com/sitemap.xml",{...UA});
    await probe("shard7","https://www.meesho.com/sitemap/pdp/7.xml",{...UA,range:"bytes=0-600"});
    await probe("page","https://www.meesho.com/p/1izwjr",{...UA});
    await probe("img","https://images.meesho.com/images/products/92374407/2sayp.jpg?width=512",{...UA});
    return J(out);
  }
  if(path==="resolve"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const raw=String(b.url||"").trim();let u;try{u=new URL(raw)}catch(e){return J({error:"Bad URL"},400)}
    // follow redirects server-side (no CORS)
    try{const r=await fetch(u.href,{headers:UA,redirect:"follow",signal:AbortSignal.timeout(10000)});return J({ok:1,url:r.url||u.href})}
    catch(e){return J({error:String((e&&e.message)||e)},502)}
  }
    let target="";try{target=new URL(req.url).searchParams.get("u")||""}catch(e){}
    let tu;try{tu=new URL(target)}catch(e){return J({error:"Bad image URL"},400)}
    if(!/^https?:$/.test(tu.protocol))return J({error:"Bad image URL"},400);
    const host=tu.hostname.toLowerCase();
    if(/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)||/\.local$/.test(host)||host==="::1")return J({error:"Blocked"},400);
    try{
      const r=await fetch(tu.href,{headers:{...UA,accept:"image/avif,image/webp,image/apng,image/*,*/*;q=0.8",referer:tu.origin+"/"},redirect:"follow"});
      if(!r.ok)return J({error:"Image fetch failed"},404);
      const ct=String(r.headers.get("content-type")||"").toLowerCase();
      if(ct&&!ct.startsWith("image/"))return J({error:"Not an image"},415);
      const buf=Buffer.from(await r.arrayBuffer());
      if(!buf.length)return J({error:"Empty image"},404);
      if(buf.length>8*1024*1024)return J({error:"Image too large"},413);
      return new Response(buf,{headers:{"content-type":ct&&ct.startsWith("image/")?ct:"image/jpeg","cache-control":"public, max-age=86400","access-control-allow-origin":"*"}});
    }catch(e){return J({error:"Image fetch failed"},502)}
  }
  if(path.startsWith("img/")&&req.method==="GET"){
    const id=path.slice(4);if(!/^[a-f0-9]{24}$/.test(id))return J({error:"Not found"},404);
    const r=await db.getWithMetadata("img/"+id,{type:"arrayBuffer"});if(!r)return J({error:"Not found"},404);
    return new Response(r.data,{headers:{"content-type":(r.metadata&&r.metadata.type)||"image/jpeg","cache-control":"public, max-age=31536000, immutable"}});
  }
  if(path==="ig/test"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const s=await get("settings",{}),user=E.IG_USER_ID||s.igUser||"",token=E.IG_TOKEN||s.igToken||"";
    if(!user||!token)return J({error:"Add your Instagram user ID and access token first."},400);
    try{const d=await igVerify(user,token);return J({ok:1,username:d.username||"",name:d.name||""})}
    catch(e){return J({error:String((e&&e.message)||e)},400)}
  }
  if(path==="ig/post"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const s=await get("settings",{}),user=E.IG_USER_ID||s.igUser||"",token=E.IG_TOKEN||s.igToken||"";
    if(!user||!token)return J({error:"Instagram is not connected. Add your user ID and token in Settings."},400);
    const list=await get("products",[]),p=list.find(x=>String(x.id)===String(b.id));
    if(!p)return J({error:"Product not found."},404);
    let img=(p.images&&p.images[0])||p.img||"";
    if(img.startsWith("/"))img=IG_BASE+img;
    if(!/^https:\/\//i.test(img))return J({error:"This product needs a public photo before it can be posted to Instagram."},400);
    const cap=igCaption(p),done=[];
    try{
      const id=await igCreate(user,token,{image_url:img,caption:cap});
      done.push("post:"+await igPublish(user,token,id));
      if(b.story||s.igStory){try{const sid=await igCreate(user,token,{media_type:"STORIES",image_url:img});done.push("story:"+await igPublish(user,token,sid))}catch(e){done.push("story-error:"+String((e&&e.message)||e))}}
      p.ig={t:Date.now(),ids:done};await db.setJSON("products",list);
      return J({ok:1,posted:done,caption:cap});
    }catch(e){return J({error:String((e&&e.message)||e)},502)}
  }
  if(path==="import/product"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    let raw=String(b.url||"").trim();
    const found=raw.match(/https?:\/\/[^\s"'<>]+/i);
    if(found)raw=found[0];
    else if(/^meesho:\/\//i.test(raw)){const did=probeId(raw);if(did)raw="https://www.meesho.com/p/"+did}
    let u;try{u=new URL(raw)}catch(e){return J({error:"Paste the full product link, starting with https://"},400)}
    if(!/^https?:$/.test(u.protocol))return J({error:"Only http and https links work"},400);
    let p=null;
    try{
      if(/(^|\.)jvecomb2b\.com$/i.test(u.hostname))p=await jvecProduct(u);
      if(!p&&(MEESHO_RE.test(u.hostname)||/meesho/i.test(u.hostname)))p=await meeshoProduct(u);
      if(!p)p=await genericProduct(u);
    }
    catch(e){return J({error:String((e&&e.message)||e)},502)}
    if(!p)return J({error:"Could not read that product. Open it in your browser, copy the link again, or add the product manually."},422);
    const mk=Math.min(10,Math.max(1,+b.markup||2)),cost=+p.cost||0,explicit=+b.price||0;
    p.cost=cost;p.p=explicit>0?Math.round(explicit):(cost>0?round9(cost*mk):0);p.o=p.p?round9(Math.max(p.p*1.5,p.p+1)):0;
    return J({ok:1,product:p,markup:mk});
  }
  if(path==="import/sync"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const list=await get("products",[]),rows=list.filter(p=>p.sup&&p.sup.s==="jvecomb2b"&&p.sup.id);
    if(!rows.length)return J({ok:1,updated:0});
    let creds;try{creds=await jvecCreds()}catch(e){return J({error:String((e&&e.message)||e)},502)}
    const data=await jvecFetch(creds,"products?id=in.("+rows.map(p=>encodeURIComponent(p.sup.id)).join(",")+")&select=id,discounted_price,original_price,on_hand_stock,stock");
    const map={};(data||[]).forEach(r=>{map[r.id]=r});
    let n=0;for(const p of list){if(!p.sup||p.sup.s!=="jvecomb2b")continue;const r=map[p.sup.id];if(!r)continue;
      const cost=[+r.discounted_price,+r.original_price].filter(x=>x>0).sort((a,b)=>a-b)[0]||0;
      p.sup.cost=cost;p.sup.stock=+(r.on_hand_stock??r.stock??0)||0;n++}
    if(n)await db.setJSON("products",list);
    return J({ok:1,updated:n});
  }
  if(path==="products"&&req.method==="GET"){const all=await get("products",[]);if(await pack(all))await db.setJSON("products",all);return J(admin()?all:all.filter(p=>!p.hid))}
  if(path==="products"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const list=Array.isArray(b.products)?b.products:[];await pack(list);await db.setJSON("products",list);return J({ok:1});
  }
  if(path==="admin/boot"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const [orders,messages,products,settings,feedback,codes,reviews,sessions]=await Promise.all([get("orders",[]),get("messages",[]),get("products",[]),get("settings",{}),get("feedback",[]),get("codes",[]),get("reviews",[]),get("sessions",[])]);
    let mx=Math.max(1000,...orders.map(o=>o.no||0)),ch=false;
    [...orders].reverse().forEach(o=>{if(!o.no){o.no=++mx;ch=true}if(!o.method)o.method=o.manual?"upi":"online"});
    if(ch)await db.setJSON("orders",orders);
    const tgTok=E.TELEGRAM_BOT_TOKEN||settings.tgToken||"",tgChat=E.TELEGRAM_CHAT_ID||settings.tgChat||"";
    const igUser=settings.igUser||"",igTok=E.IG_TOKEN||settings.igToken||"";
    const safe={upi:settings.upi||"",name:settings.name||"",qr:settings.qr||"",brand:settings.brand||null,paymentMethod:settings.paymentMethod||"both",googleClientId:settings.googleClientId||"",ig:{connected:!!(igUser&&igTok),user:igUser,auto:!!settings.igAuto,story:!!settings.igStory}};
    const acctMap={};(sessions||[]).forEach(s=>{const k=String(s.ph||"").replace(/\D/g,"").slice(-10);if(!k)return;if(!acctMap[k]||new Date(s.t||0)>new Date(acctMap[k].t||0))acctMap[k]={name:s.name||"Customer",phone:s.ph,t:s.t};});const accounts=Object.values(acctMap).sort((a,b)=>new Date(b.t||0)-new Date(a.t||0));
    return J({orders,messages,products,settings:safe,feedback,codes,reviews,accounts,
      notify:{whatsapp:!!(E.CALLMEBOT_KEY||settings.waKey),whatsapp_number:String(E.WA_NUMBER||settings.waPhone||WA).replace(/\D/g,""),
      email:!!(E.RESEND_API_KEY||settings.rsKey),email_to:E.ALERT_EMAIL||settings.rsTo||"producingmj@gmail.com",email_saved:!!settings.rsKey,email_from:E.MAIL_FROM||settings.rsFrom||"",
      telegram:!!(tgTok&&tgChat),telegram_saved:!!settings.tgToken,telegram_chat:tgChat,
      ntfy:!!E.NTFY_TOPIC,discord:!!E.DISCORD_WEBHOOK,sms:!!E.FAST2SMS_KEY},
      otp:{gateway:!!String(E.SMS_WEBHOOK||settings.smsHook||"").trim(),fast2sms:!!String(E.FAST2SMS_KEY||settings.f2sKey||"").trim(),
        textbelt:!!String(E.TEXTBELT_KEY||"").trim(),hook:settings.smsHook||"",hook2:settings.smsHook2||"",f2s:!!String(settings.f2sKey||"").trim()}});
  }
  if(path==="admin"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]);let mx=Math.max(1000,...orders.map(o=>o.no||0)),ch=false;
    [...orders].reverse().forEach(o=>{if(!o.no){o.no=++mx;ch=true}if(!o.method)o.method=o.manual?"upi":"online"});if(ch)await db.setJSON("orders",orders);
    return J({orders,messages:await get("messages",[])});
  }
  if(path==="event"){
    const L={open:"ðŸ‘€ Someone opened your store",view:"ðŸ›ï¸ Viewing: ",cart:"âž• Added to cart: ",buy:"ðŸ’³ Going to pay: "};
    if(L[b.type])await notify("Crossroads\n"+L[b.type]+cut(b.name,80),b.type==="cart"||b.type==="buy");
    return J({ok:1});
  }
  if(path==="message"){
    const m={name:cut(b.name,60),contact:cut(b.contact,80),text:cut(b.text,800),t:new Date().toISOString()};
    if(!m.text)return J({error:"Write a message first."},400);
    const all=await get("messages",[]);all.unshift(m);await db.setJSON("messages",all.slice(0,200));
    await notify(`âœ‰ï¸ New message\n${m.name} (${m.contact})\n${m.text}`,true);return J({ok:1});
  }
  if(path==="feedback"&&req.method==="POST"){
    const f={topic:cut(b.topic,40),text:cut(b.text,900),name:cut(b.name,60),contact:cut(b.contact,80),page:cut(b.page,120),device:cut(b.device,40),t:new Date().toISOString()};
    if(!f.text||f.text.length<3)return J({error:"Tell us what to improve first."},400);
    const hk=new Date().toISOString().slice(0,13),rl=await get("rlf",{h:"",n:0});
    if(rl.h!==hk){rl.h=hk;rl.n=0}
    if(rl.n>=30)return J({error:"Too many messages just now. Try again in a while."},429);
    rl.n++;await db.setJSON("rlf",rl);
    const all=await get("feedback",[]);all.unshift(f);await db.setJSON("feedback",all.slice(0,400));
    const who=[f.name,f.contact].filter(Boolean).join(" Â· ")||"Anonymous visitor";
    await notify(`ðŸ’¬ New shop feedback\n${f.topic?f.topic+" â€” ":""}${f.text}\n\n${who}\nPage: ${f.page||"/"}${f.device?" Â· "+f.device:""}`,true);
    return J({ok:1});
  }
  if(path==="feedback"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    return J({feedback:await get("feedback",[])});
  }
  if(path==="feedback/delete"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    await db.setJSON("feedback",(await get("feedback",[])).filter(x=>x.t!==b.t));return J({ok:1});
  }
  if(path==="code/check"&&req.method==="POST"){
    const r=await checkCode(b.code,b.phone,false);
    if(r.err)return J({error:r.err},400);
    if(!r.off)return J({error:"Enter a valid code."},400);
    return J({ok:1,off:r.off});
  }
  if(path==="codes"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    return J({codes:(await getCodes()).slice(0,300)});
  }
  if(path==="codes/free"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    await freeCode(b.code);
    return J({ok:1});
  }
  if(path==="codes/delete"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const c=codeNorm(b.code);if(!c)return J({ok:1});
    const list=(await getCodes()).filter(k=>codeNorm(k.c)!==c);
    await db.setJSON("codes",list);
    return J({ok:1});
  }
  if(path==="sms/test"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const ph=last10(b.phone);
    if(ph.length!==10)return J({error:"Enter a 10-digit mobile number to test."},400);
    const r=await sendOtp(ph,String(Math.floor(100000+Math.random()*900000)));
    if(r.ok)return J({ok:1,via:r.via});
    if(!r.configured)return J({error:"No SMS method is set up yet. Paste a gateway URL or a Fast2SMS key first."},400);
    return J({error:r.err||"The provider did not accept the message."},502);
  }
  if(path==="auth/start"&&req.method==="POST"){
    const ph=last10(b.phone),name=cut(String(b.name||"").trim(),60);
    if(ph.length!==10)return J({error:"Enter a valid 10-digit phone number."},400);
    if(name.length<2)return J({error:"Enter your name."},400);
    const hk=new Date().toISOString().slice(0,13),rl=await get("rla",{h:"",n:0});
    if(rl.h!==hk){rl.h=hk;rl.n=0}
    if(rl.n>=60)return J({error:"Too many codes requested just now. Try again later."},429);
    rl.n++;await db.setJSON("rla",rl);
    const otps=await get("otps",{}),prev=otps[ph];
    if(prev&&Date.now()-new Date(prev.t||0).getTime()<30000)return J({error:"Wait a few seconds, then ask for another code."},429);
    const code=String(Math.floor(100000+Math.random()*900000));
    otps[ph]={c:code,n:name,t:new Date().toISOString(),tries:0};
    const keys=Object.keys(otps);if(keys.length>800)keys.sort((a,b)=>String(otps[a].t).localeCompare(String(otps[b].t))).slice(0,keys.length-800).forEach(k=>delete otps[k]);
    await db.setJSON("otps",otps);
    const sent=await sendOtp(ph,code);
    if(sent.ok)return J({ok:1,sent:true,via:sent.via,phone:ph});
    if(sent.configured)return J({error:sent.err||"We could not send the code just now. Please try again."},502);
    return J({ok:1,sent:false,demo:true,code,phone:ph});
  }
  if(path==="auth/verify"&&req.method==="POST"){
    const ph=last10(b.phone),code=String(b.code||"").replace(/\D/g,"");
    const otps=await get("otps",{}),x=otps[ph];
    if(!x)return J({error:"Ask for a new code."},400);
    if(Date.now()-new Date(x.t||0).getTime()>10*60000){delete otps[ph];await db.setJSON("otps",otps);return J({error:"That code expired. Ask for a new one."},400)}
    if((x.tries||0)>=5){delete otps[ph];await db.setJSON("otps",otps);return J({error:"Too many tries. Ask for a new code."},400)}
    if(code!==String(x.c)){x.tries=(x.tries||0)+1;await db.setJSON("otps",otps);return J({error:"That code is not correct."},400)}
    delete otps[ph];await db.setJSON("otps",otps);
    const token=crypto.randomBytes(24).toString("hex"),ss=await get("sessions",[]);
    ss.unshift({token,ph,name:x.n,t:new Date().toISOString()});
    await db.setJSON("sessions",ss.slice(0,3000));
    return J({ok:1,token,name:x.n,phone:ph});
  }
  if(path==="auth/me"&&req.method==="GET"){
    const s=await me();
    return J(s?{user:{name:s.name,phone:s.ph}}:{user:null});
  }
  if(path==="auth/logout"&&req.method==="POST"){
    const t=String(req.headers.get("x-cr-token")||"").trim();
    if(t)await db.setJSON("sessions",(await get("sessions",[])).filter(k=>k.token!==t));
    return J({ok:1});
  }
  if(path==="auth/clear"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    await db.setJSON("sessions",[]);return J({ok:1});
  }
  if(path==="reviews"&&req.method==="GET"){
    const pid=String(new URL(req.url).searchParams.get("pid")||""),all=await getReviews();
    const L=pid?all.filter(r=>String(r.pid)===pid):all, n=L.length;
    const avg=n?Math.round(L.reduce((a,r)=>a+(+r.s||0),0)/n*10)/10:0;
    const dist=[5,4,3,2,1].map(s=>({s,n:L.filter(r=>+r.s===s).length}));
    const s=await me().catch(()=>null),mine=s?L.find(r=>r.ph===s.ph):null;
    return J({pid,count:n,avg,dist,mine:mine?{s:mine.s,x:mine.x||"",t:mine.t}:null,
      reviews:L.slice(0,25).map(r=>({s:+r.s,n:shortName(r.nm),x:r.x||"",t:r.t,v:!!r.v,src:r.src||"customer",photo:r.photo||""}))});
  }
  if(path==="reviews"&&req.method==="POST"){
    const s=await me();if(!s)return J({error:"Log in to rate this product."},401);
    const pid=String(b.pid||""),stars=Math.max(1,Math.min(5,Math.round(+b.stars||0)));
    if(!pid||!stars)return J({error:"Choose a star rating first."},400);
    const text=cut(String(b.text||"").trim(),500),photo=typeof b.photo==="string"&&b.photo.startsWith("data:image/")?b.photo.slice(0,200000):"";
    const all=await getReviews(),i=all.findIndex(r=>String(r.pid)===pid&&r.ph===s.ph);
    const orders=await get("orders",[]),verified=orders.some(o=>!o.cancelled&&last10(o.phone)===s.ph);
    const rec={id:i>=0?all[i].id:Date.now(),pid,ph:s.ph,nm:cut(s.name,60),s:stars,x:text,t:new Date().toISOString(),v:verified,src:"customer",photo:photo||""};
    if(i>=0)all[i]=rec;else all.unshift(rec);
    await db.setJSON("reviews",all.slice(0,2000));
    return J({ok:1,review:{s:stars,x:text,v:verified}});
  }
  if(path==="reviews/add"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const pid=String(b.pid||""),name=cut(String(b.name||"").trim(),60),stars=Math.max(1,Math.min(5,Math.round(+b.stars||0))),text=cut(String(b.text||"").trim(),500),photo=typeof b.photo==="string"&&b.photo.startsWith("data:image/")?b.photo.slice(0,200000):"";
    if(!pid||!name||!stars)return J({error:"Pick a product, add a name and choose stars."},400);
    const prods=await get("products",[]),p=prods.find(x=>String(x.id)===pid);
    const all=await getReviews();
    let when=new Date().toISOString();
    if(b.t){const d=new Date(b.t);if(!isNaN(d.getTime())&&d.getTime()<Date.now())when=d.toISOString()}
    const rec={id:Date.now(),pid,pn:p?shortN(p.sn||p.n,80):"",ph:"",nm:name,s:stars,x:text,t:when,v:false,src:"shop",photo:photo||""};
    all.unshift(rec);await db.setJSON("reviews",all.slice(0,2000));
    return J({ok:1,review:rec});
  }
  if(path==="reviews/delete"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const id=String(b.id||"");
    await db.setJSON("reviews",(await getReviews()).filter(r=>String(r.id)!==id));
    return J({ok:1});
  }
  if(path==="welcome"&&req.method==="POST"){
    const email=String(b.email||"").trim().toLowerCase(),name=cut(String(b.name||"").trim(),60);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return J({error:"Valid email required."},400);
    const st=await cfg().catch(()=>({})),key=E.RESEND_API_KEY||st.rsKey||"";
    if(!key)return J({ok:1,emailed:false,msg:"Email service not configured. Welcome shown on screen only."});
    const from=E.MAIL_FROM||st.rsFrom||"Crossroads <onboarding@resend.dev>";
    const subject="Welcome to Crossroads Shopping!";
    const text="Hi "+(name||"there")+",\n\nWelcome to Crossroads Shopping! We are glad you are here.\n\nHere is what you can do:\n- Browse our latest products at https://crossroads-shopping.netlify.app/\n- Track your orders anytime from the Track Order page\n- Rate and review products you have purchased\n- Get updates on new arrivals and offers\n\nWe deliver free across India in about 5 days.\n\nIf you have any questions, reply to this email or message us on Instagram @crossroads_shopping.\n\nHappy shopping!\nCrossroads Shopping Team";
    try{await mail(subject,text,{key,to:email,from});return J({ok:1,emailed:true})}catch(e){return J({ok:1,emailed:false,msg:"Could not send email."})}
  }
  if(path==="broadcast"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    const subject=cut(String(b.subject||"").trim(),80),text=cut(String(b.text||"").trim(),2000);
    if(!subject||!text)return J({error:"Subject and message are required."},400);
    const st=await cfg().catch(()=>({})),key=E.RESEND_API_KEY||st.rsKey||"";
    if(!key)return J({error:"Email service not configured. Set up Resend in Settings."},400);
    const from=E.MAIL_FROM||st.rsFrom||"Crossroads <onboarding@resend.dev>";
    const orders=await get("orders",[]);
    const emails=[...new Set(orders.map(o=>String(o.email||"").trim().toLowerCase()).filter(e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))];
    if(!emails.length)return J({error:"No customer emails found."},400);
    let sent=0;for(const em of emails){try{await mail(subject,text,{key,to:em,from});sent++}catch(e){}}
    return J({ok:1,sent,total:emails.length});
  }
  if(path==="pay/create"){
    if(!E.RAZORPAY_KEY_ID||!E.RAZORPAY_KEY_SECRET)return J({error:"Online payment isn't switched on yet."},503);
    const prods=await get("products",[]),c=b.customer||{},lines=[],its=[];let total=0;
    for(const i of b.items||[]){
      const p=prods.find(x=>x.id===i.id);const q=Math.max(1,Math.min(10,+i.q||1));
      if(!p||p.sold)return J({error:"An item in your cart is no longer available."},400);
      lines.push(`${p.n} (${cut(i.size,20)}) x${q}`);its.push({n:shortN(p.n,90),s:cut(i.size,20),q,p:p.p});total+=p.p*q;
    }
    if(!lines.length||!c.name||!c.phone||!c.address)return J({error:"Fill in your details."},400);
    const cc=await checkCode(b.code,c.phone,false);
    if(cc.err)return J({error:cc.err},400);
    total=applyOff(total,cc.off);
    const r=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",
      headers:{"content-type":"application/json",authorization:"Basic "+Buffer.from(E.RAZORPAY_KEY_ID+":"+E.RAZORPAY_KEY_SECRET).toString("base64")},
      body:JSON.stringify({amount:Math.round(total*100),currency:"INR",receipt:"cr"+Date.now()})});
    const o=await r.json();
    if(!r.ok)return J({error:"Could not start payment. Try again."},502);
    const orders=await get("orders",[]);
    const mx=Math.max(1000,...orders.map(x=>x.no||0));
    const ord={id:o.id,no:mx+1,method:"online",ev:[{a:"placed",t:new Date().toISOString()}],lines,it:its,total,paid:false,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300),track:{status:"placed",estDays:5,courier:"",trackNo:"",note:"",events:[{a:"placed",t:new Date().toISOString()}]}};
    if(cc.off){ord.code=cc.code;ord.disc={code:cc.code,off:cc.off}}
    orders.unshift(ord);
    await db.setJSON("orders",orders.slice(0,500));
    return J({order:o.id,amount:o.amount,key:E.RAZORPAY_KEY_ID});
  }
  if(path==="pay/verify"){
    const sig=crypto.createHmac("sha256",E.RAZORPAY_KEY_SECRET||"").update(b.order_id+"|"+b.payment_id).digest("hex");
    if(sig!==b.signature)return J({error:"Payment could not be verified."},400);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.order_id);
    if(o&&!o.paid){
      o.paid=true;o.pay=cut(b.payment_id,40);(o.ev=o.ev||[]).push({a:"paid",t:new Date().toISOString()});
      if(o.code)await checkCode(o.code,o.phone,true,o.id);
      const first=!orders.some(x=>x.id!==o.id&&x.paid&&!x.cancelled&&last10(x.phone)===last10(o.phone));
      if(first){const nc=await issueCode(o.phone);if(nc)o.next=nc}
      await db.setJSON("orders",orders);
      await notify(orderText(o,method==="cod"?"New order - Cash on Delivery. Collect payment on delivery.":"New order - UPI payment claimed. Check your bank app, then mark it paid.")+(o.disc?`\nDiscount code used: ${o.disc.code}`:""),true);
      await custMail(o,"paid");
      return J({ok:1,next:o.next||""});
    }
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
