/* Crossroads owner admin (loads only when you open /#admin) */
(()=>{
if(window.CRAdmin)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>"₹"+(+n||0).toLocaleString("en-IN");
const CATNORM={electronics:"Electronics",electronic:"Electronics",gadgets:"Electronics",gadget:"Electronics",shirts:"Shirts",shirt:"Shirts"};
const normCat=s=>{const t=String(s||"").trim().replace(/\s+/g," ");if(!t)return"";const k=t.toLowerCase();if(CATNORM[k])return CATNORM[k];return(t===t.toLowerCase()||t===t.toUpperCase())?t.replace(/\b[a-z]/g,ch=>ch.toUpperCase()):t};
const dt=t=>{try{return new Date(t).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}catch(e){return""}};
const dur=s=>s<60?s+"s":Math.floor(s/60)+"m "+(s%60)+"s";
const imgs=p=>p.images&&p.images.length?p.images:(p.imgs&&p.imgs.length?p.imgs:(p.img?[p.img]:[]));
let PW=sessionStorage.getItem("cr_pw")||"",root=null,draft=[],impDraft=null;
const H=()=>({"x-admin":PW,"content-type":"application/json"});
async function api(p,b){const o=b===undefined?{headers:H(),cache:"no-store"}:{method:"POST",headers:H(),body:JSON.stringify(b)};try{const r=await fetch("/api/"+p,o);let d={};try{d=await r.json()}catch(e){}return{ok:r.ok,s:r.status,d}}catch(e){return{ok:false,s:0,d:{error:"No connection"}}}}
const S={orders:[],messages:[],products:[],feedback:[],codes:[],settings:{},notify:{},known:new Set(),seen:new Set(),range:7,of:"all",oq:"",pq:"",pf:"all",vf:"all",poll:null,loaded:false,t:0,hydrated:false,ana:null,reviews:[],otp:{},accounts:[]};
try{S.seen=new Set(JSON.parse(localStorage.getItem("cr_seen")||"[]"))}catch(e){}
const BRAND_DEF={name:"Crossroads Shopping",tag:"Your next favourite find is here.",mono:"CS",bg:"#111318",fg:"#ffffff",ac:"#c9a227",shape:"rounded"};
let bDraft=null;
function hydrate(){try{const c=JSON.parse(localStorage.getItem("cr_adm1")||"null");if(!c||c.v!==1)return;S.orders=c.o||[];S.messages=c.m||[];S.settings=c.s||{};S.notify=c.n||{};S.feedback=c.f||[];S.codes=c.c||[];S.reviews=c.rv||[];S.products=c.p||[];S.otp=c.ot||{};S.accounts=c.a||[];S.known=new Set(S.orders.map(o=>o.id));S.hydrated=true}catch(e){}try{const a=JSON.parse(localStorage.getItem("cr_ana")||"null");if(a&&a.d&&a.days)S.ana=a}catch(e){}}
function saveCache(){try{const d=JSON.stringify({v:1,t:Date.now(),o:S.orders.slice(0,300),m:S.messages.slice(0,80),s:S.settings,n:S.notify,f:S.feedback.slice(0,80),c:S.codes.slice(0,300),rv:(S.reviews||[]).slice(0,300),p:(S.products||[]).slice(0,200),ot:S.otp||{},a:(S.accounts||[]).slice(0,500)});if(d===saveCache._last)return;saveCache._last=d;localStorage.setItem("cr_adm1",d)}catch(e){}}
function resetData(){S.orders=[];S.messages=[];S.products=[];S.feedback=[];S.codes=[];S.reviews=[];S.settings={};S.notify={};S.loaded=false;S.hydrated=false;S.t=0;S.ana=null;bDraft=null;try{localStorage.removeItem("cr_adm1");localStorage.removeItem("cr_ana")}catch(e){}}
const say=m=>{if(window.toast)window.toast(m);else alert(m)};
const ic=d=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const NAV=[["home","Home","M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"],["orders","Orders","M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"],["products","Products","M3 12l9-9h8v8l-9 9zM15 8h.01"],["customers","Customers","M16 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0"],["accounts","Accounts","M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"],["analytics","Analytics","M4 20V10M10 20V4M16 20v-8M22 20H2"],["messages","Messages","M4 5h16v11H9l-5 4z"],["feedback","Feedback","M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 10h.01M12 10h.01M15.5 10h.01M8 15h8"],["reviews","Reviews","M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.8l6.5-.9z"],["settings","Settings","M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"]];
const css=`.ad{display:grid;grid-template-columns:240px minmax(0,1fr);min-height:100vh;background:var(--bg);color:var(--ink)}
.ad *{box-sizing:border-box}.ad form{padding:0}.ad h2,.ad h3{margin:0}
.ads{position:sticky;top:0;height:100vh;overflow:auto;background:var(--card);border-right:1px solid var(--line);padding:18px 12px;display:flex;flex-direction:column;gap:4px}
.ads .bn{font:700 1.25rem "Playfair Display",Georgia,serif;padding:6px 10px 16px}.ads .bn small{display:block;font:500 .7rem Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.ads a.nv{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;text-decoration:none;color:var(--mut);font-weight:600;font-size:.95rem}
.ads a.nv:hover{background:var(--line);color:var(--ink)}.ads a.nv.on{background:rgba(63,109,255,.14);color:var(--acc)}
.ads .bg{margin-left:auto;background:var(--acc);color:#fff;border-radius:999px;font-size:.72rem;padding:1px 8px}.ads .bg:empty{display:none}
.ads .ft{margin-top:auto;padding:10px;display:grid;gap:6px;font-size:.88rem}.ads .ft a,.ads .ft button{color:var(--mut)}
.amain{min-width:0}.adt{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:12px 20px;background:var(--bg);border-bottom:1px solid var(--line)}
.adt h1{font:700 1.3rem "Playfair Display",Georgia,serif;margin:0;flex:1}.adt .mb{display:none;border:0;background:none;color:var(--ink);cursor:pointer;padding:4px}
.adc{padding:22px 20px 90px;max-width:1120px}.adov{display:none}
.cd{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;min-width:0}.cd h3{font-size:1rem;margin-bottom:10px}
.g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}.g3{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-top:14px}
.kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kp .cd{padding:14px 16px}.kp b{display:block;font-size:1.5rem;font-variant-numeric:tabular-nums}.kp span{color:var(--mut);font-size:.85rem}.kp small{display:block;color:var(--mut);font-size:.75rem;margin-top:2px}
.rowh{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}.rowh select{width:auto}
.todo{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.todo a{display:flex;gap:8px;align-items:center;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card);text-decoration:none;font-weight:600;font-size:.9rem}.todo a b{background:var(--acc);color:#fff;border-radius:999px;padding:0 9px}
.ch{display:flex;align-items:flex-end;gap:4px;height:130px}.cb{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.cb i{display:block;width:100%;background:var(--acc);border-radius:4px 4px 0 0;min-height:2px;opacity:.9}.cb span{font-size:.62rem;color:var(--mut);height:14px;margin-top:4px;white-space:nowrap}
.bl{display:grid;gap:8px}.bl>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;font-size:.9rem}.bl em{font-style:normal;color:var(--mut);font-variant-numeric:tabular-nums}.bl u{grid-column:1/-1;display:block;height:5px;border-radius:3px;background:var(--line);overflow:hidden}.bl u i{display:block;height:100%;background:var(--acc)}.bl span{overflow-wrap:anywhere}
.fun>div{display:grid;grid-template-columns:130px minmax(0,1fr) 60px;gap:10px;align-items:center;margin:8px 0;font-size:.9rem}.fun u{display:block;height:14px;border-radius:7px;background:var(--line);overflow:hidden}.fun u i{display:block;height:100%;background:var(--acc)}
.hr24{display:grid;grid-template-columns:repeat(24,1fr);gap:3px;align-items:end;height:70px}.hr24 i{display:block;background:var(--acc);border-radius:3px 3px 0 0;min-height:2px}.hl{display:flex;justify-content:space-between;color:var(--mut);font-size:.7rem;margin-top:4px}
.tg{display:inline-block;font-size:.72rem;font-weight:700;padding:2px 9px;border-radius:999px;background:var(--line);color:var(--ink);white-space:nowrap}.tg.g{background:rgba(18,122,69,.16);color:var(--ok)}.tg.y{background:rgba(255,160,0,.18);color:#B26A00}.tg.r{background:rgba(192,38,27,.14);color:var(--err)}.tg.b{background:rgba(63,109,255,.16);color:var(--acc)}
.tabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;scrollbar-width:none}.tabs button{flex:none;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 14px;cursor:pointer;font-weight:600;font-size:.85rem}.tabs button.on{background:var(--acc);border-color:var(--acc);color:#fff}
.ol{display:grid;gap:8px}.or{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 14px;padding:13px 16px;border:1px solid var(--line);background:var(--card);border-radius:12px;cursor:pointer;text-align:left;width:100%}.or:hover{border-color:var(--acc)}
.or .n{font-weight:700}.or .s{color:var(--mut);font-size:.85rem;overflow-wrap:anywhere}.or .t{text-align:right;font-weight:700}.or .bd2{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;grid-column:2}
.pl{display:grid;grid-template-columns:54px minmax(0,1fr);gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line)}.pl .th{width:54px;height:66px;border-radius:8px;background:var(--line);overflow:hidden}.pl .th img{width:100%;height:100%;object-fit:cover;display:block}
.pl b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}.pl small{color:var(--mut)}.pl .ra{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:2px}
.tl{list-style:none;padding:0;margin:0;display:grid;gap:12px}.tl li{position:relative;padding-left:20px;font-size:.92rem}.tl li:before{content:"";position:absolute;left:0;top:7px;width:9px;height:9px;border-radius:50%;background:var(--acc)}.tl small{display:block;color:var(--mut)}
.vl{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:13px 15px;margin-bottom:10px}.vh{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.vm{color:var(--mut);font-size:.85rem;margin-top:4px;overflow-wrap:anywhere}.vj{display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;margin-top:8px;font-size:.85rem}.vj span{background:var(--line);padding:2px 9px;border-radius:999px;overflow-wrap:anywhere}.vj i{font-style:normal;color:var(--mut)}.vx{margin-top:8px;font-size:.88rem}
.fl{display:grid;gap:12px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.impcard{border:1px solid color-mix(in srgb,var(--acc) 35%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--acc) 6%,var(--card)),var(--card))}.impcard textarea{min-height:54px;resize:vertical}.chk{flex-direction:row;align-items:center;gap:8px;font-weight:500}.chk input{width:auto}
.igm{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}.igi{position:relative;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card)}.igi img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block}.igi i{position:absolute;top:6px;left:6px;background:var(--acc);color:#fff;font-style:normal;font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:999px}.igi div{display:flex;flex-wrap:wrap;justify-content:space-between;padding:2px 4px}.igi .link{padding:2px 4px;font-size:.8rem}
.acts2{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.acts2 .btn,.ad .btn.sm{width:auto;display:inline-block;padding:9px 16px;font-size:.85rem}
.muted{color:var(--mut)}.empty2{padding:30px;text-align:center;color:var(--mut)}.ad table{width:100%;border-collapse:collapse;font-size:.9rem}.ad th,.ad td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line)}.ad th{color:var(--mut);font-weight:600}.ad .sc{overflow-x:auto}
@media(max-width:860px){.ad{grid-template-columns:1fr}.ads{position:fixed;top:0;bottom:0;left:0;width:270px;height:100%;z-index:40;transform:translateX(-100%);transition:transform .25s}.ads.on{transform:none}.adt .mb{display:inline-block}.adov.on{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:39}.g2,.g3,.two{grid-template-columns:1fr}.adc{padding:16px 14px 90px}.fun>div{grid-template-columns:96px minmax(0,1fr) 44px}.or{grid-template-columns:minmax(0,1fr) auto}.or .bd2{grid-column:1/-1}}
.sk{padding:8px 0}
.skb{height:14px;border-radius:8px;margin:10px 0;background:linear-gradient(90deg,var(--line) 25%,rgba(127,127,127,.18) 37%,var(--line) 63%);background-size:400% 100%;animation:sks 1.15s ease-in-out infinite}
.skg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}
.skc{height:92px;border-radius:12px;background:linear-gradient(90deg,var(--line) 25%,rgba(127,127,127,.18) 37%,var(--line) 63%);background-size:400% 100%;animation:sks 1.15s ease-in-out infinite}
@keyframes sks{0%{background-position:100% 0}100%{background-position:0 0}}
.brandp{margin-bottom:14px;padding:14px 16px}
.brandp>summary{cursor:pointer;font-weight:700;font-size:.95rem;list-style:none}
.brandp>summary::-webkit-details-marker{display:none}
.brandp>summary:before{content:"\\25B8";display:inline-block;margin-right:8px;transition:transform .2s}
.brandp[open]>summary:before{transform:rotate(90deg)}
.bpv{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:16px;margin-top:14px;align-items:start}
.bpp{background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px;display:flex;align-items:center;justify-content:center}
.bpp svg{width:100%;height:auto}
.bpg{display:grid;gap:9px}
.bpr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.brandp input[type=color]{width:100%;height:38px;padding:2px;border:1px solid var(--line);border-radius:8px;background:var(--card);cursor:pointer}
@media(max-width:860px){.bpv{grid-template-columns:1fr}.skg{grid-template-columns:1fr 1fr}}`;
function ensureCss(){if($("adcss"))return;const s=document.createElement("style");s.id="adcss";s.textContent=css;document.head.appendChild(s)}
const st=o=>o.cancelled?"Cancelled":o.delivered?"Delivered":o.shipped?"Shipped":o.paid?"To ship":"Unpaid";
const stc=o=>o.cancelled?"r":o.delivered?"g":o.shipped?"b":o.paid?"y":"r";
const where=()=>{const p=location.hash.replace(/^#admin\/?/,"").split("/");return[p[0]||"home",p[1]||""]};
const need=()=>S.orders.filter(o=>!o.cancelled&&((o.manual&&!o.paid)||(o.paid&&!o.shipped))).length;
function badge(){const e=$("nb-orders");if(e){const n=need();e.textContent=n?String(n):""}}
function beep(){try{if(localStorage.getItem("cr_snd")==="0")return;const a=new(window.AudioContext||window.webkitAudioContext)(),t=a.currentTime;[880,1175].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.18,t+i*.16);g.gain.exponentialRampToValueAtTime(.001,t+i*.16+.3);o.start(t+i*.16);o.stop(t+i*.16+.32)})}catch(e){}}
function urlFromText(t){const m=String(t||"").match(/https?:\/\/[^\s"'<>]+/i);return m?m[0]:""}
function guessCat(n){const t=String(n||"").toLowerCase();
 if(/watch|smart ?watch|chronograph/.test(t))return"Watches";
 if(/shoe|sneaker|sandal|slipper|heel|footwear|loafer|boot|flip ?flop/.test(t))return"Shoes";
 if(/bag|backpack|purse|wallet|clutch|handbag|trolley|sling/.test(t))return"Bags";
 if(/earring|necklace|jewell?ery|bracelet|\bring\b|pendant|anklet|bangle|chain|kada|mangalsutra/.test(t))return"Accessories";
 if(/kurti|kurta|saree|sari|lehenga|dress|shirt|tshirt|t-shirt|jeans|trouser|top|blouse|suit|jacket|hoodie|skirt|dupatta|co-?ord|nightsuit|night ?suit/.test(t))return"Fashion";
 return""}
let _mIdx=null,_mIdxP=null;
function meeshoIndex(){
 if(_mIdx)return _mIdx;
 if(!_mIdxP)_mIdxP=fetch("/meesho-index.json",{cache:"force-cache"}).then(r=>r.json()).then(j=>{_mIdx=Object.keys(j).map(k=>({s:+k,v:parseInt(j[k],36)})).sort((a,b)=>a.v-b.v);return _mIdx}).catch(()=>{_mIdxP=null;return null});
 return _mIdxP}
async function meeshoResolve(raw){
  let u=String(raw||"").trim();
  const found=u.match(/https?:\/\/[^\s"'<>]+/i);if(found)u=found[0];
  // follow redirects for short links (meesho.app.link, meesho.link, /s/, etc.)
  if(!/\/p\//i.test(u)){
    for(let i=0;i<3;i++){
      try{const r=await fetch(u,{method:"GET",redirect:"follow",mode:"cors"});if(r.url&&r.url!==u){u=r.url;if(/\/p\//i.test(u))break}}catch(e){break}
    }
  }
  // if still no /p/, try reading the page HTML for a product link
  if(!/\/p\//i.test(u)){
    try{const r=await fetch(u,{method:"GET",redirect:"follow",mode:"cors"});const t=await r.text();const m=t.match(/https?:\/\/www\.meesho\.com\/[^"\s<>]*\/p\/([A-Za-z0-9_-]{4,})/i);if(m)u=m[0]}catch(e){}
  }
  return u}
function meeshoId(t){const s=String(t||"");
  let m=/\/p\/([A-Za-z0-9_-]{4,})/.exec(s);if(m)return m[1];
  m=/\/(?:product|products)\/([A-Za-z0-9_-]{4,})/.exec(s);if(m)return m[1];
  m=/[?&](?:product_id|pid|productId|id|deep_link_value|catalog_id)=([A-Za-z0-9_-]{4,})/i.exec(s);if(m)return m[1];
  // Meesho app sometimes shares links with the ID in the path without /p/
  m=/meesho\.com\/[^\/]*?([a-z0-9]{5,8})(?:[?#]|$)/i.exec(s);if(m&&m[1].length>=5&&m[1].length<=8)return m[1];
  return""}
async function meeshoLookup(raw,note){
 if(note)note("Resolving link...");
 const resolved=await meeshoResolve(raw);
 console.log("Meesho resolved URL:", resolved);
 const id=meeshoId(resolved);
 console.log("Meesho extracted ID:", id);
 if(!id){if(note)note("Could not find a product ID in that link. Paste the full Meesho product link (it should contain /p/).");return null}
 if(note)note("Looking up product "+id+"...");
 const list=await meeshoIndex();if(!list||!list.length)return null;
 const target=parseInt(id,36);if(!isFinite(target))return null;
 let lo=0,hi=list.length-1,j=-1;
 while(lo<=hi){const mid=(lo+hi)>>1;if(list[mid].v<=target){j=mid;lo=mid+1}else hi=mid-1}
 if(j<0)return null;
 const cands=[list[j].s,list[j+1]&&list[j+1].s,list[j+2]&&list[j+2].s].filter(x=>typeof x==="number");
 if(note)note("Reading the Meesho catalogue…");
 // fetch all candidate shards in parallel for speed
 const results=await Promise.all(cands.map(async(s)=>{
  try{const r=await fetch("https://r.jina.ai/https://www.meesho.com/sitemap/pdp/"+s+".xml",{headers:{"x-return-format":"html"}});if(!r.ok){console.log("Shard",s,"fetch failed:",r.status);return null}const t=await r.text();console.log("Shard",s,"fetched, len:",t.length,"has target:",t.includes("/p/"+id+"<"));return t}catch(e){console.log("Shard",s,"error:",e.message);return null}
 }));
 for(let k=0;k<results.length;k++){
  const xml=results[k];if(!xml)continue;
  const at=xml.indexOf("/p/"+id+"<");if(at<0)continue;
  const st=xml.lastIndexOf("<url>",at),en=xml.indexOf("</url>",at);
  const block=xml.slice(st<0?Math.max(0,at-2000):st,en<0?Math.min(xml.length,at+4000):en);
  const loc=(/<loc>([^<]+)<\/loc>/i.exec(block)||[])[1]||"";
  const imgs=[];let m;const re=/<image:loc>([^<]+)<\/image:loc>/gi;
  while((m=re.exec(block))){
   let x=m[1].trim();if(x.startsWith("//"))x="https:"+x;
   if(!/^https?:\/\//.test(x))continue;
   x=x.replace(/\.avif(\?|$)/i,".jpg$1");
   if(/[?&]width=\d+/i.test(x))x=x.replace(/([?&])width=\d+/i,"$1width=1024");
   else x+=(x.includes("?")?"&":"?")+"width=1024";
   if(imgs.indexOf(x)<0)imgs.push(x);
  }
  const sm=/meesho\.com\/([^/]+)\/p\//i.exec(loc);
  let name=sm?decodeURIComponent(sm[1]).replace(/[-_]+/g," ").replace(/\s+/g," ").trim():"";
  if(!name||name.length<3)continue;
  name=name.replace(/\b[a-z]/g,c=>c.toUpperCase());
  return{n:name.slice(0,120),sn:name.slice(0,60),c:guessCat(name),d:"",images:imgs.slice(0,6),cost:0,sup:{s:"meesho",id,u:resolved}};
 }
 return null}
function rrPath(x,a,b,w,h,r){r=Math.max(0,Math.min(r,h/2));x.beginPath();x.moveTo(a+r,b);x.lineTo(a+w-r,b);x.arcTo(a+w,b,a+w,b+r,r);x.lineTo(a+w,b+h-r);x.arcTo(a+w,b+h,a+w-r,b+h,r);x.lineTo(a+r,b+h);x.arcTo(a,b+h,a,b+h-r,r);x.lineTo(a,b+r);x.arcTo(a,b,a+r,b,r);x.closePath()}
async function brandWatermark(url){
  const b=getBrand(),label=String(b.name||"Crossroads Shopping").trim().slice(0,26)||"Crossroads",ac=/^#[0-9a-f]{3,8}$/i.test(b.ac||"")?(b.ac||"#c9a227"):"#c9a227";
  const res=await fetch("/api/proxy/img?u="+encodeURIComponent(url),{cache:"force-cache"});
  if(!res.ok)throw new Error("img");
  const blob=await res.blob();
  let src;try{src=await createImageBitmap(blob)}catch(e){src=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(blob)})}
  const iw=src.width||src.naturalWidth,ih=src.height||src.naturalHeight;
  const max=1000,sc=Math.min(1,max/Math.max(iw,ih));
  const w=Math.max(1,Math.round(iw*sc)),h=Math.max(1,Math.round(ih*sc));
  const cv=document.createElement("canvas");cv.width=w;cv.height=h;
  const x=cv.getContext("2d");x.drawImage(src,0,0,w,h);
  const fs=Math.max(14,Math.round(w*0.034)),pad=Math.round(fs*.72),dot=Math.round(fs*.5);
  x.font="600 "+fs+"px Inter,Arial,sans-serif";
  const lw=x.measureText(label).width;
  const bw=Math.round(lw+dot+pad*3.1),bh=Math.round(fs+pad*1.5);
  const bx=w-bw-Math.round(w*.028),by=h-bh-Math.round(h*.032);
  x.save();
  x.globalAlpha=.8;x.fillStyle="rgba(6,8,14,.72)";rrPath(x,bx,by,bw,bh,bh/2);x.fill();
  x.globalAlpha=1;x.lineWidth=Math.max(1,fs*.055);x.strokeStyle="rgba(255,255,255,.16)";rrPath(x,bx,by,bw,bh,bh/2);x.stroke();
  x.fillStyle=ac;x.beginPath();x.arc(bx+pad+dot/2,by+bh/2,dot/2,0,Math.PI*2);x.fill();
  x.fillStyle="#fff";x.textBaseline="middle";x.font="600 "+fs+"px Inter,Arial,sans-serif";x.fillText(label,bx+pad*1.6+dot,by+bh/2+1);
  x.restore();
  return cv.toDataURL("image/jpeg",.8);
}
async function watermarkList(list,onStep){
  const out=[];
  for(let i=0;i<list.length;i++){if(onStep)onStep(i+1,list.length);try{out.push(await brandWatermark(list[i]))}catch(e){out.push(list[i])}}
  return out;
}
function shrink(file,m=720){return new Promise(ok=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,m/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.72))};i.onerror=()=>ok("");i.src=r.result};r.readAsDataURL(file)})}

/* ---------- shell + login ---------- */
function login(){root.innerHTML=`<div style="max-width:380px;margin:12vh auto;padding:0 20px;color:var(--ink)"><h2 style="font:700 1.6rem 'Playfair Display',Georgia,serif;margin-bottom:14px">Owner login</h2><form id="lf" class="fl"><label>Password<input id="lp" type="password" autocomplete="current-password"></label><div class="err" id="le"></div><button class="btn" type="submit">Log in</button></form><p style="margin-top:16px"><a href="./">Back to store</a></p></div>`;
 $("lf").onsubmit=async e=>{e.preventDefault();PW=$("lp").value;const r=await api("admin");if(r.ok){sessionStorage.setItem("cr_pw",PW);try{localStorage.setItem("cr_owner","1")}catch(x){}const sid=sessionStorage.getItem("cr_sid");if(sid)api("track",{forget:1,sid,t0:+sessionStorage.getItem("cr_t0")||Date.now()});root.dataset.ready="";CRAdmin.open(root)}else{PW="";$("le").textContent="Wrong password."}}}
function shell(){root.innerHTML=`<div class="ad"><nav class="ads" id="ads"><div class="bn">Crossroads<small>Admin</small></div>${NAV.map(([k,l,d])=>`<a class="nv" href="#admin${k==="home"?"":"/"+k}" data-nv="${k}">${ic(d)}<span>${l}</span>${k==="orders"?'<b class="bg" id="nb-orders"></b>':""}</a>`).join("")}<div class="ft"><a href="./">View store</a><button class="link" id="lo" type="button" style="text-align:left;padding:0">Log out</button></div></nav><div class="adov" id="adov"></div><div class="amain"><div class="adt"><button class="mb" id="mb" aria-label="Menu">${ic("M4 6h16M4 12h16M4 18h16")}</button><h1 id="adT">Home</h1></div><div class="adc" id="adc"></div></div></div>`;
 root.dataset.ready="1";
 $("mb").onclick=()=>{$("ads").classList.toggle("on");$("adov").classList.toggle("on")};$("adov").onclick=()=>{$("ads").classList.remove("on");$("adov").classList.remove("on")};
 $("ads").onclick=e=>{if(e.target.closest("a.nv")){$("ads").classList.remove("on");$("adov").classList.remove("on")}};
 $("lo").onclick=()=>{PW="";sessionStorage.removeItem("cr_pw");clearInterval(S.poll);S.poll=null;resetData();root.dataset.ready="";CRAdmin.open(root)};
 $("adc").onclick=onClick;$("adc").oninput=onInput;$("adc").onchange=onChange;$("adc").onsubmit=onSubmit}

/* ---------- data ---------- */
async function loadAll(){const r=await api("admin/boot");
 if(r.s===401){PW="";sessionStorage.removeItem("cr_pw");resetData();return false}
 if(!r.ok){if(S.loaded||S.hydrated){say("Could not refresh — showing the last loaded data.");return true}return false}
 const d=r.d||{};
 S.orders=d.orders||[];S.messages=d.messages||[];S.products=d.products||[];S.settings=d.settings||{};S.notify=d.notify||{};
 S.feedback=Array.isArray(d.feedback)?d.feedback:[];S.codes=Array.isArray(d.codes)?d.codes:[];S.reviews=Array.isArray(d.reviews)?d.reviews:[];S.otp=d.otp||S.otp||{};S.accounts=Array.isArray(d.accounts)?d.accounts:[];
 S.loaded=true;S.hydrated=true;S.t=Date.now();S.known=new Set(S.orders.map(o=>o.id));
 saveCache();badge();return true}
function startPoll(){if(S.poll)return;S.poll=setInterval(async()=>{if(!location.hash.startsWith("#admin")||document.hidden||!PW)return;const a=await api("admin");if(!a.ok)return;
 const nw=(a.d.orders||[]).filter(o=>!S.known.has(o.id));S.orders=a.d.orders||[];S.messages=a.d.messages||[];S.known=new Set(S.orders.map(o=>o.id));S.loaded=true;S.t=Date.now();saveCache();badge();
 if(nw.length){say("New order #"+nw[0].no+" · "+money(nw[0].total));beep();const[p,i]=where();const ae=document.activeElement;if(ae&&(ae.tagName==="INPUT"||ae.tagName==="TEXTAREA")&&$("adc")&&$("adc").contains(ae))return;if((p==="orders"&&!i)||p==="home")render(true)}},30000)}

/* ---------- small ui helpers ---------- */
const kpi=(l,v,s)=>`<div class="cd"><span>${l}</span><b>${v}</b>${s?`<small>${s}</small>`:""}</div>`;
const rangeSel=()=>`<select id="rg" aria-label="Date range"><option value="1" ${S.range==1?"selected":""}>Today</option><option value="7" ${S.range==7?"selected":""}>Last 7 days</option><option value="30" ${S.range==30?"selected":""}>Last 30 days</option></select>`;
function blist(a,tot,empty="No data yet"){if(!a||!a.length)return`<p class="muted">${empty}</p>`;const mx=Math.max(1,...a.map(x=>x.v));return`<div class="bl">${a.map(x=>`<div><span>${esc(x.k)}</span><em>${x.v}${tot?" · "+Math.round(100*x.v/tot)+"%":""}</em><u><i style="width:${Math.round(100*x.v/mx)}%"></i></u></div>`).join("")}</div>`}
function chart(ser,key,f){const mx=Math.max(1,...ser.map(x=>x[key])),step=ser.length>12?3:1;return`<div class="ch">${ser.map((x,k)=>`<div class="cb" title="${esc(x.d)}: ${f?f(x[key]):x[key]}"><i style="height:${Math.round(100*x[key]/mx)}%"></i><span>${k%step?"":x.d.slice(8)}</span></div>`).join("")}</div>`}
function funnel(f){const mx=Math.max(1,f.sessions),rows=[["Sessions",f.sessions],["Viewed a product",f.viewed],["Added to cart",f.cart],["Reached checkout",f.checkout],["Ordered",f.ordered]];return`<div class="fun">${rows.map(([l,v])=>`<div><span>${l}</span><u><i style="width:${Math.round(100*v/mx)}%"></i></u><b>${v}</b></div>`).join("")}</div>`}
function hours(h){const mx=Math.max(1,...h);return`<div class="hr24">${h.map((v,i)=>`<i title="${i}:00 · ${v} visits" style="height:${Math.max(3,Math.round(100*v/mx))}%"></i>`).join("")}</div><div class="hl"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>`}
function visitor(v){return`<div class="vl"><div class="vh"><b>${esc(dt(v.t))}</b><span class="tg">${v.nv?"New visitor":"Returning"}</span><span class="tg ${v.out==="Ordered"?"g":v.out==="Left quickly"?"r":"b"}">${esc(v.out)}</span></div>
<div class="vm">${esc(v.loc)} · ${esc(v.dev)} (${esc(v.br)}) · came from ${esc(v.src)}</div>
<div class="vj">${v.pages.length?v.pages.map(p=>`<span>${esc(p)}</span>`).join("<i>›</i>"):'<span>No pages recorded</span>'}</div>
<div class="vx">Left from: <b>${esc(v.exit||"Unknown")}</b> · ${dur(v.dur||0)} on site</div>${v.acts.length?`<div class="vm">${v.acts.map(esc).join(" · ")}</div>`:""}</div>`}

/* ---------- pages ---------- */
async function anaData(){
 const key=+S.range;
 if(S.ana&&S.ana.days===key&&S.ana.d)return S.ana.d;
 const r=await api("analytics?days="+key);
 if(!r.ok)throw new Error((r.d&&r.d.error)||("HTTP "+r.s));
 S.ana={t:Date.now(),days:key,d:r.d};
 try{localStorage.setItem("cr_ana",JSON.stringify(S.ana))}catch(e){}
 return r.d}
async function refreshAna(){
 if(!PW)return;
 const key=+S.range;
 if(S.ana&&S.ana.days===key&&Date.now()-(S.ana.t||0)<120000)return;
 const r=await api("analytics?days="+key);if(!r.ok)return;
 S.ana={t:Date.now(),days:key,d:r.d};
 try{localStorage.setItem("cr_ana",JSON.stringify(S.ana))}catch(e){}
 const[p,i]=where();if(!i&&(p==="home"||p==="analytics")&&!document.hidden)render(true)}
async function pHome(){let a;try{a=await anaData()}catch(e){return`<div class="empty2">Could not load analytics (${esc((e&&e.message)||"network error")}). Check your connection and try again.</div>`}
 const k=a.kpi,conv=k.sessions?(100*a.funnel.ordered/k.sessions).toFixed(1):"0.0",aov=k.paidOrders?Math.round(k.sales/k.paidOrders):0,unp=S.orders.filter(o=>o.manual&&!o.paid&&!o.cancelled).length,ship=S.orders.filter(o=>o.paid&&!o.shipped&&!o.cancelled).length;
 const hr=new Date().getHours(),hi=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
 return`<div class="rowh"><h2 style="font:700 1.4rem 'Playfair Display',Georgia,serif">${hi}</h2>${rangeSel()}</div>
<div class="todo">${unp?`<a href="#admin/orders">UPI payments to verify <b>${unp}</b></a>`:""}${ship?`<a href="#admin/orders">Orders to ship <b>${ship}</b></a>`:""}${k.abandoned?`<a href="#admin/analytics">Carts left without buying <b>${k.abandoned}</b></a>`:""}${!unp&&!ship&&!k.abandoned?'<span class="muted">Nothing needs your attention right now.</span>':""}</div>
<div class="kp">${kpi("Total sales",money(k.sales),k.paidOrders+" paid orders")}${kpi("Orders",k.orders,"all non-cancelled")}${kpi("Sessions",k.sessions,k.pageviews+" page views")}${kpi("Visitors",k.visitors,k.newV+" new")}${kpi("Conversion",conv+"%","sessions that ordered")}${kpi("Avg order",money(aov))}${kpi("Live now",a.live.length,"active in 5 min")}</div>
<div class="g2"><div class="cd"><h3>Sessions per day</h3>${chart(a.series,"sessions")}</div><div class="cd"><h3>Sales per day</h3>${chart(a.series,"sales",money)}</div></div>
<div class="g2"><div class="cd"><h3>Conversion funnel</h3>${funnel(a.funnel)}</div><div class="cd"><h3>Visits by hour (India time)</h3>${hours(a.hours)}<p class="muted" style="margin-top:10px;font-size:.85rem">Avg time on site: <b>${dur(k.avgDur)}</b> · Left after one page: <b>${k.bounce}%</b></p></div></div>
<div class="g2"><div class="cd"><h3>Where visitors come from</h3>${blist(a.sources,k.sessions)}</div><div class="cd"><h3>Devices</h3>${blist(a.devices,k.sessions)}</div></div>
<div class="g2"><div class="cd"><h3>Locations</h3>${blist(a.places,k.sessions)}</div><div class="cd"><h3>Top products</h3>${a.products.length?`<div class="sc"><table><tr><th>Product</th><th>Views</th><th>Carts</th></tr>${a.products.map(p=>`<tr><td>${esc(p.n.replace(/^Product: /,""))}</td><td>${p.v}</td><td>${p.c}</td></tr>`).join("")}</table></div>`:'<p class="muted">No product activity yet</p>'}</div></div>
<div class="g2"><div class="cd"><h3>Landing pages</h3>${blist(a.entry,k.sessions)}</div><div class="cd"><h3>Where visitors leave (exit pages)</h3>${blist(a.exit,k.sessions)}</div></div>
<div class="cd" style="margin-top:14px"><div class="rowh" style="margin:0 0 10px"><h3 style="margin:0">Latest visitors</h3><a href="#admin/analytics">See all</a></div>${a.recent.slice(0,5).map(visitor).join("")||'<p class="muted">No visitors recorded yet. Open your store on another device to test.</p>'}</div>
<p class="muted" style="margin-top:14px;font-size:.85rem">Your own visits are not counted on devices where you have logged in to this admin page. Log in once on your iPhone and your laptop.</p>`}
async function pAnalytics(){let a;try{a=await anaData()}catch(e){return`<div class="empty2">Could not load analytics.</div>`}const k=a.kpi;
 const fl=a.recent.filter(v=>S.vf==="all"||(S.vf==="ordered"&&v.out==="Ordered")||(S.vf==="cart"&&(v.out==="Added to cart"||v.out==="Reached checkout"))||(S.vf==="quick"&&v.out==="Left quickly"));
 return`<div class="rowh"><span class="muted">${k.sessions} sessions · ${k.visitors} visitors</span>${rangeSel()}</div>
<div class="g2" style="margin-top:0"><div class="cd"><h3>Exit pages: where people leave</h3>${blist(a.exit,k.sessions)}</div><div class="cd"><h3>Browsers</h3>${blist(a.browsers,k.sessions)}</div></div>
<div class="g2"><div class="cd"><h3>Traffic sources</h3>${blist(a.sources,k.sessions)}</div><div class="cd"><h3>Locations</h3>${blist(a.places,k.sessions)}</div></div>
<div class="g2"><div class="cd"><h3>Funnel</h3>${funnel(a.funnel)}</div><div class="cd"><h3>Live now</h3>${a.live.length?a.live.map(l=>`<p style="margin:6px 0">${esc(l.loc)} · ${esc(l.dev)}<br><span class="muted">on ${esc(l.page||"the store")} · from ${esc(l.src)}</span></p>`).join(""):'<p class="muted">Nobody is on the store right now.</p>'}</div></div>
<h3 style="margin:24px 0 10px">Visitor log</h3><div class="tabs">${[["all","All"],["ordered","Ordered"],["cart","Added to cart"],["quick","Left quickly"]].map(([v,l])=>`<button data-vf="${v}" class="${S.vf===v?"on":""}">${l}</button>`).join("")}</div>${fl.map(visitor).join("")||'<div class="empty2">No visitors in this view.</div>'}`}
function orderRow(o){const first=(o.lines||[])[0]||"",more=(o.lines||[]).length>1?` +${o.lines.length-1} more`:"";
 return`<button class="or" data-act="oview" data-id="${esc(o.id)}"><span class="n">#${o.no||"—"}${S.seen.has(o.id)?"":' <span class="tg b">New</span>'}</span><span class="s">${esc(o.name)} · ${esc(dt(o.t))}<br>${esc(first)}${more}</span><span class="t">${money(o.total)}</span><span class="bd2"><span class="tg ${o.paid?"g":"y"}">${o.paid?"Paid":"Payment pending"}</span><span class="tg ${stc(o)}">${st(o)}</span><span class="tg">${o.method==="cod"?"COD":o.method==="upi"?"UPI QR":"Online"}</span></span></button>`}
function pOrders(id){if(id)return pOrder(id);
 const f={all:()=>true,unpaid:o=>!o.paid&&!o.cancelled,toship:o=>o.paid&&!o.shipped&&!o.cancelled,shipped:o=>o.shipped&&!o.delivered&&!o.cancelled,delivered:o=>o.delivered&&!o.cancelled,cancelled:o=>o.cancelled},q=S.oq.toLowerCase();
 const cnt=k=>S.orders.filter(f[k]).length,L=S.orders.filter(f[S.of]).filter(o=>!q||[o.no,o.name,o.phone,o.email,o.address,(o.lines||[]).join(" ")].join(" ").toLowerCase().includes(q));
 return`${brandPanel()}<div class="tabs">${[["all","All"],["unpaid","Unpaid"],["toship","To ship"],["shipped","Shipped"],["delivered","Delivered"],["cancelled","Cancelled"]].map(([k,l])=>`<button data-of="${k}" class="${S.of===k?"on":""}">${l} ${cnt(k)}</button>`).join("")}</div>
<input id="oq" placeholder="Search by order number, name, phone or item" value="${esc(S.oq)}" style="margin-bottom:12px"><div class="ol">${L.map(orderRow).join("")||'<div class="empty2">No orders here yet. New orders appear automatically with a sound.</div>'}</div>${codePanel()}`}
function codePanel(){const L=S.codes||[],live=L.filter(k=>!k.used).length;
 if(!L.length)return "";
 return `<h3 style="margin:30px 0 8px">Discount codes <span class="tg g">${live} unused</span></h3>
 <p class="muted" style="font-size:.85rem;margin:0 0 10px">Every first order earns the customer one code for their next order. It is worth up to ₹30, tied to their phone number and works once.</p>
 <div class="ol">${L.slice(0,50).map(k=>`<div class="or" style="cursor:default;grid-template-columns:minmax(0,1fr) auto auto;align-items:center"><div><b style="letter-spacing:.08em">${esc(k.c)}</b><br><span class="muted" style="font-size:.85rem">${esc(k.ph)}${k.t?" · "+esc(dt(k.t)):""}</span></div><span class="tg ${k.used?"":"g"}">${k.used?"Used":"Unused"}</span><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="ccopy" data-c="${esc(k.c)}" type="button">Copy</button>${k.used?`<button class="btn sm" data-act="cfree" data-c="${esc(k.c)}" type="button">Re-enable</button>`:""}<button class="btn sm alt" data-act="cdel" data-c="${esc(k.c)}" type="button">Delete</button></div></div>`).join("")}</div>`}
function tlist(o){const lab={placed:"Order placed",paid:"Payment received",shipped:"Marked as shipped",delivered:"Marked as delivered",cancelled:"Order cancelled"},ev=(o.ev&&o.ev.length?o.ev:[{a:"placed",t:o.t}]);
 return`<ul class="tl">${ev.map(e=>`<li>${lab[e.a]||esc(e.a)}${e.a==="shipped"&&o.track?` · Tracking: ${esc(o.track)}`:""}<small>${esc(dt(e.t))}</small></li>`).join("")}</ul>`}
function pOrder(id){const o=S.orders.find(x=>x.id===id);if(!o)return`<div class="empty2">Order not found. <a href="#admin/orders">Back to orders</a></div>`;
 if(!S.seen.has(o.id)){S.seen.add(o.id);try{localStorage.setItem("cr_seen",JSON.stringify([...S.seen]))}catch(e){}}
 const ph=String(o.phone||"").replace(/\D/g,"").slice(-10),wa="https://wa.me/91"+ph+"?text="+encodeURIComponent("Hi "+o.name+", this is Crossroads Shopping about your order #"+o.no+".");
 return`<p><a href="#admin/orders">₹ All orders</a></p><div class="rowh"><h2 style="font:700 1.5rem 'Playfair Display',Georgia,serif">Order #${o.no}</h2><span><span class="tg ${o.paid?"g":"y"}">${o.paid?"Paid":"Payment pending"}</span> <span class="tg ${stc(o)}">${st(o)}</span></span></div><p class="muted" style="margin-top:-8px">${esc(dt(o.t))}</p>
<div class="acts2">${!o.paid&&!o.cancelled?'<button class="btn sm" data-act="opaid">Mark as paid</button>':""}${o.paid&&!o.shipped&&!o.cancelled?'<button class="btn sm" data-act="oship">Mark as shipped</button>':""}${o.shipped&&!o.delivered&&!o.cancelled?'<button class="btn sm" data-act="odeliv">Mark as delivered</button>':""}<button class="btn sm alt" data-act="oinv">Print invoice</button><button class="btn sm alt" data-act="oslip">Packing slip</button><button class="btn sm alt" data-act="olabel">Shipping label</button>${o.cancelled?'<button class="btn sm alt" data-act="orestore">Restore order</button>':'<button class="btn sm alt" data-act="ocancel">Cancel order</button>'}<button class="link" data-act="odel">Delete</button></div>
<div class="g3" style="margin-top:0"><div style="display:grid;gap:14px"><div class="cd"><h3>Items</h3>${(o.lines||[]).map(l=>`<p style="margin:6px 0">${esc(l)}</p>`).join("")}<hr style="border:0;border-top:1px solid var(--line);margin:12px 0"><p style="display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span>${money(o.total)}</span></p></div><div class="cd"><h3>Timeline</h3>${tlist(o)}</div>
<div class="cd"><h3>Order tracking (customer-facing)</h3><p class="muted" style="font-size:.85rem;margin:0 0 10px">Manage what the customer sees on the Track Order page.</p><div class="fl"><label>Status<select id="tkStatus"><option value="placed">Order Placed</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="intransit">In Transit</option><option value="outfordelivery">Out for Delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label><div class="two"><label>Courier / transport<input id="tkCourier" placeholder="Delhivery, India Post, etc."></label><label>Tracking number<input id="tkTrackNo" placeholder="AWB / consignment number"></label></div><div class="two"><label>Estimated delivery date<input id="tkEstDate" type="date"></label><label>Est. days from order<input id="tkEstDays" type="number" min="1" max="30" value="5"></label></div><label>Note to customer (optional)<textarea id="tkNote" rows="2" placeholder="Your order is on the way!"></textarea></label><div class="err" id="tkfe"></div><button class="btn sm" data-act="tkSave" data-id="${o.id}">Save tracking</button></div></div><div class="cd"><h3>Private note</h3><textarea id="onote" rows="3" placeholder="Only you can see this">${esc(o.note||"")}</textarea><p style="margin-top:8px"><button class="btn sm alt" data-act="onote">Save note</button></p></div></div>
<div style="display:grid;gap:14px;align-content:start"><div class="cd"><h3>Customer</h3><p><b>${esc(o.name)}</b></p><p>${esc(o.phone)} · <a href="tel:${esc(ph)}">Call</a> · <a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></p>${o.email?`<p><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></p>`:""}<p class="muted" style="white-space:pre-line;overflow-wrap:anywhere">${esc(o.address)}</p><p><button class="link" data-act="ocopy">Copy address</button></p></div>
<div class="cd"><h3>Payment</h3><p>${o.method==="cod"?"Cash on Delivery (COD)":o.method==="upi"?"UPI QR (manual)":"Online (Razorpay)"}</p>${o.utr?`<p class="muted">UPI transaction ID: <b>${esc(o.utr)}</b></p>`:""}${o.pay?`<p class="muted">Payment ID: ${esc(o.pay)}</p>`:""}${o.method==="upi"&&!o.paid?'<p class="muted">Check your bank app for this transaction ID, then tap Mark as paid.</p>':""}${o.track?`<p class="muted">Tracking: ${esc(o.track)}</p>`:""}${o.disc?`<p class="muted">Discount code used: <b>${esc(o.disc.code)}</b> (₹${money(o.disc.off)})</p>`:""}${o.next?`<p class="muted">Next-order code given: <b>${esc(o.next)}</b></p>`:""}</div></div></div>`}
function pProducts(id){if(id)return pForm(id);const q=S.pq.toLowerCase(),L=S.products.map((p,i)=>({p,i})).filter(({p})=>(S.pf==="all"||(S.pf==="hidden"&&p.hid)||(S.pf==="sold"&&p.sold)||(S.pf==="active"&&!p.hid&&!p.sold))&&(!q||(p.n+" "+(p.c||"")).toLowerCase().includes(q)));
 return`<div class="cd impcard" style="margin-bottom:12px"><h3>&#8595; Fetch a product from a link</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">Works with <b>Meesho</b> share links, <b>JVECOMB2B</b> and most online stores. Paste the link (or the whole message from the app) and tap Fetch. We grab the name and photos, plus the price and description wherever the store shares them, then you review before publishing.</p><form id="impf" class="fl" novalidate><label>Product link or shared message<textarea id="impu" rows="2" placeholder="https://www.meesho.com/.../p/abc123  —  or paste the full share text"></textarea></label><div class="two"><label>Markup<select id="impm"><option value="1.5">1.5x</option><option value="1.8">1.8x</option><option value="2" selected>2x</option><option value="2.5">2.5x</option><option value="3">3x</option></select></label><label>Or your selling price (₹, optional)<input id="impp" type="number" min="1" placeholder="Leave empty to use markup"></label></div><label class="chk"><input type="checkbox" id="impwm" checked>Add my brand watermark to the photos</label><div class="err" id="impe"></div><button class="btn sm" id="impbtn" type="submit">Fetch product</button></form><p class="muted" style="font-size:.78rem;margin-top:8px">Only import products you are allowed to resell. Watermarked photos are stored on your site, so nobody else can copy them.</p></div>`+`<div class="rowh"><div class="tabs" style="margin:0">${[["all","All"],["active","Active"],["hidden","Hidden"],["sold","Sold out"]].map(([k,l])=>`<button data-pf="${k}" class="${S.pf===k?"on":""}">${l}</button>`).join("")}</div><button class="btn sm alt" data-act="impsync">Sync supplier stock</button><a class="btn sm" href="#admin/products/new">Add product</a></div><input id="pq" placeholder="Search products" value="${esc(S.pq)}" style="margin-bottom:8px">
${L.map(({p,i})=>{const m=imgs(p);return`<div class="pl"><div class="th">${m[0]?`<img src="${esc(m[0])}" alt="">`:""}</div><div><b>${esc(p.n)}</b><small>${money(p.p)} · ${esc(p.c||"")} · ${m.length} photo${m.length===1?"":"s"}</small><br>${p.hid?'<span class="tg">Hidden</span> ':'<span class="tg g">Active</span> '}${p.sold?'<span class="tg r">Sold out</span> ':""}${p.tr?'<span class="tg b">Trending</span>':""}</div><div class="ra"><a class="link" href="#admin/products/${p.id}">Edit</a><button class="link" data-act="phide" data-id="${p.id}">${p.hid?"Show":"Hide"}</button><button class="link" data-act="pdup" data-id="${p.id}">Duplicate</button><button class="link" data-act="igpost" data-id="${p.id}">Post to IG</button>${i?`<button class="link" data-act="pup" data-id="${p.id}">Move up</button>`:""}${i<S.products.length-1?`<button class="link" data-act="pdown" data-id="${p.id}">Move down</button>`:""}<button class="link" data-act="pdel" data-id="${p.id}">Delete</button></div></div>`}).join("")||'<div class="empty2">No products here. Tap Add product to create your first one.</div>'}`}
function pForm(id){const e=id==="new"?(impDraft||{}):S.products.find(p=>String(p.id)===id);if(!e)return`<div class="empty2">Product not found. <a href="#admin/products">Back</a></div>`;draft=imgs(e).slice();
 const impNote=id==="new"&&impDraft?'<div class="cd" style="background:#fff8e6;border:1px solid #f0d9a8;margin-bottom:12px"><b>Imported product</b> - check the price, photos and description, then tap Add product.'+(impDraft.p?"":' <b>Type your selling price below</b> - the supplier hides it from automatic reading.')+' <button type="button" class="link" data-act="impclear">Start blank</button></div>':"";
 return`<p><a href="#admin/products">₹ Products</a></p>${impNote}<div class="cd"><form id="pf" class="fl" novalidate><h3>${e.id?"Edit product":"Add a product"}</h3><div><b style="font-size:.88rem">Photos (up to 5, the first is the main photo)</b></div><div class="igm" id="igm"></div><label class="btn alt sm" style="cursor:pointer;width:fit-content">+ Add photos<input id="pi" type="file" accept="image/*" multiple hidden></label>
<label>Product name<input id="pn" value="${esc(e.n)}"></label>
<label>Short name for cards and invoices (optional)<input id="psn" value="${esc(e.sn||"")}" maxlength="80" placeholder="Leave empty to use the full name"></label><div class="two"><label>Category (like Fashion or Shoes)<input id="pc" list="cl" value="${esc(e.c)}"></label><label>Sizes, separated by commas<input id="ps" value="${esc((e.s||[]).join(", "))}" placeholder="S, M, L, XL"></label></div>
<datalist id="cl"><option value="Fashion"><option value="Shoes"><option value="Accessories"><option value="Watches"><option value="Bags"></datalist><div class="two"><label>Price (₹)<input id="pp" type="number" min="1" value="${e.p||""}"></label><label>Old price (₹, optional)<input id="po" type="number" min="0" value="${e.o||""}"></label></div>
<label>Description (optional)<textarea id="pdsc" rows="3">${esc(e.d)}</textarea></label>${e.sup&&e.sup.u?`<p class="muted" style="font-size:.82rem;margin:-4px 0 10px">Imported from <a href="${esc(e.sup.u)}" target="_blank" rel="noopener">${esc(e.sup.s||"supplier")}</a>${+e.sup.cost>0?" · supplier price "+money(e.sup.cost):""}</p>`:""}<label>Payment method for this product<select id="ppm"><option value="both" ${(e.pm||"both")==="both"?"selected":""}>Both (COD + UPI)</option><option value="cod" ${(e.pm||"both")==="cod"?"selected":""}>Cash on Delivery only</option><option value="upi" ${(e.pm||"both")==="upi"?"selected":""}>UPI / Online only</option></select></label><label class="chk"><input type="checkbox" id="pso" ${e.sold?"checked":""}>Mark as sold out</label><label class="chk"><input type="checkbox" id="ptr" ${e.tr?"checked":""}>Show in Trending</label><label class="chk"><input type="checkbox" id="phd" ${e.hid?"checked":""}>Hide from the store</label>
<div class="err" id="pfe"></div><button class="btn" type="submit">${e.id?"Save changes":"Add product"}</button></form></div>`}
function pCustomers(){const m={};S.orders.forEach(o=>{const k=String(o.phone||"").replace(/\D/g,"").slice(-10)||String(o.name).toLowerCase(),c=m[k]||(m[k]={name:o.name,phone:o.phone,email:o.email,n:0,spent:0,last:o.t,k});if(!o.cancelled)c.n++;if(o.paid&&!o.cancelled)c.spent+=o.total;if(o.t>c.last)c.last=o.t;if(o.email)c.email=o.email});
 const L=Object.values(m).sort((a,b)=>b.spent-a.spent||(b.last>a.last?1:-1));
 return L.length?`<div class="cd sc"><table><tr><th>Customer</th><th>Orders</th><th>Spent</th><th>Last order</th><th></th></tr>${L.map(c=>`<tr><td><b>${esc(c.name)}</b><br><span class="muted">${esc(c.phone)}${c.email?" · "+esc(c.email):""}</span></td><td>${c.n}</td><td>${money(c.spent)}</td><td>${esc(dt(c.last))}</td><td><button class="link" data-act="cview" data-q="${esc(String(c.phone||c.name).replace(/\D/g,"").slice(-10)||c.name)}">Orders</button></td></tr>`).join("")}</table></div>`:'<div class="empty2">Customers appear here after their first order.</div>'}
function pAccounts(){const L=S.accounts||[];if(!L.length)return '<div class="empty2">No one has logged in yet. When a customer creates an account (name + phone), they appear here.</div>';return `<p class="muted" style="margin-bottom:12px">${L.length} account${L.length===1?"":"s"}, newest first. These are customers who logged in with a phone code.</p>`+`<div class="cd sc"><table><tr><th>Name</th><th>Phone</th><th>Last login</th><th></th></tr>${L.map(a=>`<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.phone)}</td><td>${esc(dt(a.t))}</td><td><a class="link" href="https://wa.me/91${String(a.phone||"").replace(/\\D/g,"").slice(-10)}" target="_blank" rel="noopener">WhatsApp</a></td></tr>`).join("")}</table></div>`}
function pMessages(){return S.messages.length?S.messages.map(m=>{const c=String(m.contact||""),ph=c.replace(/\D/g,"");return`<div class="cd" style="margin-bottom:10px"><p><b>${esc(m.name||"Visitor")}</b> · <span class="muted">${esc(m.contact)}</span></p><p class="muted" style="font-size:.82rem">${esc(dt(m.t))}</p><p style="white-space:pre-line;overflow-wrap:anywhere;margin:8px 0">${esc(m.text)}</p><p>${ph.length>=10?`<a class="link" href="https://wa.me/91${ph.slice(-10)}" target="_blank" rel="noopener">Reply on WhatsApp</a>`:""}${/@/.test(c)?`<a class="link" href="mailto:${esc(c)}">Reply by email</a>`:""}<button class="link" data-act="mdel" data-t="${esc(m.t)}">Delete</button></p></div>`}).join(""):'<div class="empty2">No messages yet.</div>'}
function pFeedback(){const L=S.feedback||[];
 if(!L.length)return '<div class="empty2">No feedback yet. When a visitor looks like they are leaving, the site asks them what to improve, and their answer shows up here and on WhatsApp plus email.</div>';
 return `<p class="muted" style="margin-bottom:12px">${L.length} message${L.length===1?"":"s"}, newest first. Every one also arrives on WhatsApp, Telegram and email.</p>`+L.map(f=>{const c=String(f.contact||""),ph=c.replace(/\D/g,"");const meta=[f.name,f.contact].filter(Boolean).join(" · ")||"Anonymous visitor";
 return `<div class="cd" style="margin-bottom:10px">${f.topic?`<span class="tg b">${esc(f.topic)}</span> `:""}<p style="white-space:pre-line;overflow-wrap:anywhere;margin:8px 0">${esc(f.text)}</p><p class="muted" style="font-size:.82rem">${esc(meta)} · ${esc(f.page||"/")}${f.device?" · "+esc(f.device):""} · ${esc(dt(f.t))}</p><p>${ph.length>=10?`<a class="link" href="https://wa.me/91${ph.slice(-10)}" target="_blank" rel="noopener">Reply on WhatsApp</a>`:""}${/@/.test(c)?`<a class="link" href="mailto:${esc(c)}">Reply by email</a>`:""}<button class="link" data-act="fdel" data-t="${esc(f.t)}">Delete</button></p></div>`}).join("")}
function pReviews(){const L=[...(S.reviews||[])].sort((a,b)=>String(b.t||"").localeCompare(String(a.t||""))),P=S.products||[],opts=P.map(p=>`<option value="${p.id}">${esc(short(p.sn||p.n,60))}</option>`).join("");
 return `<div class="rowh"><h2 style="font:700 1.4rem 'Playfair Display',Georgia,serif">Reviews</h2></div>
 <div class="cd"><h3>Add feedback you received</h3><p class="muted" style="font-size:.85rem;margin:0 0 10px">Paste what a customer told you on Instagram or WhatsApp. It shows on that product page with their name and stars.</p>
 ${opts?`<form id="rvf" class="fl"><label>Product<select id="rvp">${opts}</select></label><div class="two"><label>Customer name<input id="rvn" maxlength="60" placeholder="Ayesha R."></label><label>Stars<select id="rvs">${[5,4,3,2,1].map(n=>`<option value="${n}">${"★".repeat(n)} ${n}</option>`).join("")}</select></label></div><label>What they said (optional)<textarea id="rvx" rows="3" maxlength="500"></textarea></label><label>Photo (optional)<input id="rvphoto" type="file" accept="image/*"></label><div class="err" id="rve"></div><button class="btn" type="submit">Add review</button></form>`:'<p class="muted">Add a product first.</p>'}
  <div class="cd" style="margin-top:14px"><h3>Import reviews from another platform</h3><p class="muted" style="font-size:.85rem;margin:0 0 10px">Paste reviews from Amazon, Flipkart, or any store. One review per line:<br><code style="font-size:.78rem">Name|Stars|Review text|Photo URL (optional)</code></p><form id="rvimpf" class="fl"><label>Product<select id="rvimpp">${opts}</select></label><label>Paste reviews (one per line)<textarea id="rvimpt" rows="6" placeholder="Priya S.|5|Great product, fast delivery!"></textarea></label><div class="err" id="rvimpe"></div><button class="btn sm" type="submit">Import reviews</button></form></div></div>
 <h3 style="margin:26px 0 8px">${L.length} review${L.length===1?"":"s"}</h3>
 ${L.length?L.map(r=>{const p=P.find(x=>String(x.id)===String(r.pid));return `<div class="cd" style="margin-bottom:10px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><b>${esc(r.nm||"Customer")}</b><span style="color:#d29a00;letter-spacing:1px">${"★".repeat(+r.s||0)}${"☆".repeat(5-(+r.s||0))}</span><span class="tg ${r.src==="shop"?"b":"g"}">${r.src==="shop"?"Added by you":"Customer"}</span>${r.v?'<span class="tg g">Verified</span>':""}<span class="muted" style="font-size:.8rem">${esc(dt(r.t))}</span></div><p class="muted" style="font-size:.82rem;margin:4px 0 0">${esc(p?short(p.sn||p.n,80):"Product removed")}</p>${r.x?`<p style="margin:8px 0;white-space:pre-line;overflow-wrap:anywhere">${esc(r.x)}</p>`:""}${r.photo?`<img src="${esc(r.photo)}" alt="Review photo" style="max-width:120px;border-radius:8px;margin:6px 0;display:block">`:""}<button class="link" data-act="rvdel" data-id="${esc(r.id)}">Delete</button></div>`}).join(""):'<div class="empty2">No reviews yet. Customers can rate products on the product page, or you can add feedback you received.</div>'}`}
function pSettings(){const s=S.settings||{},n=S.notify||{},o=S.otp||{},ig=s.ig||{},own=(()=>{try{return localStorage.getItem("cr_owner")==="1"}catch(e){return false}})(),snd=localStorage.getItem("cr_snd")!=="0";
 const onAlert=ok=>`<span class="tg ${ok?"g":"r"}">${ok?"On":"Off"}</span>`;
 const alertLine=(label,ok,extra="")=>`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span>${label}${extra?` <span class="muted" style="font-size:.82rem">${extra}</span>`:""}</span>${onAlert(ok)}</div>`;
 return`<div class="cd"><h3>Payments (UPI QR)</h3><form id="sf" class="fl" novalidate><label>Your UPI ID (like name@bank)<input id="su" value="${esc(s.upi)}"></label><label>Name shown to customers<input id="sn" value="${esc(s.name)}"></label><label>QR code image (a screenshot of your UPI QR)<input id="sq" type="file" accept="image/*"></label>${s.qr?`<img src="${esc(s.qr)}" alt="Current QR" style="width:140px;border-radius:8px">`:""}<div class="err" id="sfe"></div><button class="btn sm" type="submit">Save payment settings</button></form></div>\n<div class="cd" style="margin-top:14px"><h3>Payment methods</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">Choose how customers can pay at checkout.</p><form id="pmf" class="fl" novalidate><label>Accepted payment methods<select id="pm"><option value="both" ${ (s.paymentMethod||"both")==="both"?"selected":""}>Both (COD + UPI)</option><option value="cod" ${ (s.paymentMethod||"both")==="cod"?"selected":""}>Cash on Delivery only</option><option value="upi" ${ (s.paymentMethod||"both")==="upi"?"selected":""}>UPI / Online only</option></select></label><div class="err" id="pmfe"></div><button class="btn sm" type="submit">Save payment method</button></form></div>
<div class="cd" style="margin-top:14px"><h3>Instagram auto-post</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">When you add a product, post it to your Instagram page automatically with photos, description, price, link and hashtags.</p><div style="display:grid;gap:8px;margin-bottom:14px">${alertLine("Connection",!!ig.connected,ig.user?"ID "+esc(ig.user):"")}${alertLine("Auto-post new products",!!ig.auto)}${alertLine("Also post a Story",!!ig.story)}</div><form id="igf" class="fl" novalidate><label>Instagram user ID<input id="igu" value="${esc(ig.user||"")}" placeholder="17841400000000000"></label><label>Access token (long-lived)<input id="igt" type="password" autocomplete="new-password" placeholder="${ig.connected?"Saved. Leave empty to keep it":"Paste the token from the Meta app"}"></label><label class="chk"><input type="checkbox" id="iga" ${ig.auto?"checked":""}>Post automatically when I add a product</label><label class="chk"><input type="checkbox" id="igs" ${ig.story?"checked":""}>Also post a Story</label><div class="err" id="igfe"></div><button class="btn sm" type="submit">Save Instagram settings</button> <button type="button" class="btn sm alt" data-act="igtest">Test connection</button></form><p class="muted" style="font-size:.8rem;margin-top:8px;line-height:1.7">Needs an Instagram Business account linked to a Facebook Page. Setup steps are in INSTAGRAM-SETUP.md. Music cannot be added through the API; add a song in the Instagram app after posting.</p></div>
<div class="cd" style="margin-top:14px"><h3>Google login</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">Let customers sign in with their Google account. Paste your Google OAuth Client ID here (free from console.cloud.google.com - see GOOGLE-SETUP.md). Leave empty to hide the button.</p><form id="gf" class="fl" novalidate><label>Google Client ID<input id="gcid" value="${esc(s.googleClientId||"")}" placeholder="123456789-abc...xyz.apps.googleusercontent.com"></label><div class="err" id="gfe"></div><button class="btn sm" type="submit">Save Google login</button></form><p class="muted" style="font-size:.8rem;margin-top:8px">Authorized JavaScript origin: <code>https://crossroads-shopping.netlify.app</code></p></div>
<div class="cd" style="margin-top:14px"><h3>Send update to customers</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">Email all customers who have placed an order. Use this for new arrivals, sales, or website updates.</p><form id="bcastf" class="fl" novalidate><label>Subject<input id="bcastsubj" placeholder="New arrivals at Crossroads Shopping!"></label><label>Message<textarea id="bcastmsg" rows="4" placeholder="Hi! We just added new products to our store. Check them out at https://crossroads-shopping.netlify.app/"></textarea></label><div class="err" id="bcaste"></div><button class="btn sm" type="submit">Send to all customers</button></form><p class="muted" style="font-size:.8rem;margin-top:8px">Requires Resend email to be configured. Sends to all unique customer emails from orders.</p></div>
<div class="cd" style="margin-top:14px"><h3>Order alerts</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">Get every order on your phone with the items, total, phone number and address.</p>
<div style="display:grid;gap:8px;margin-bottom:16px">${alertLine("WhatsApp",n.whatsapp,n.whatsapp_number?"+"+esc(n.whatsapp_number):"")}${alertLine("Telegram",n.telegram)}${alertLine("Email",n.email,n.email_to?esc(n.email_to):"")}${alertLine("Push (ntfy)",n.ntfy)}</div>
<h4 style="margin:0 0 8px">WhatsApp (free, CallMeBot)</h4>
<form id="nf" class="fl" novalidate><label>WhatsApp number with country code<input id="nw" inputmode="tel" placeholder="918281036836" value="${esc(n.whatsapp_number||"")}"></label>
<label>CallMeBot API key (free)<input id="nk" type="password" autocomplete="new-password" placeholder="${n.whatsapp?"Saved. Leave empty to keep it":"Paste the key the bot sent you"}"></label>
<div class="err" id="nfe"></div><button class="btn sm" type="submit">Save WhatsApp alerts</button></form>
<p class="muted" style="font-size:.84rem;margin-top:10px;line-height:1.8"><b>If the bot did not reply to you:</b><br>1. Check the number is exactly <b>+34 644 41 87 20</b> (Spain), saved as a contact.<br>2. Send it only this text, nothing else: <b>I allow callmebot to send me messages</b><br>3. No key after 2 minutes? Send it <b>Recover APIKey</b> and it replies with your key.<br>4. Still nothing? CallMeBot limits how often one number can ask. Try again after 24 hours, or use Telegram below — it always works and is also free.</p>
<h4 style="margin:22px 0 8px">Telegram (free, most reliable)</h4>
<form id="tf" class="fl" novalidate><label>Bot token from @BotFather<input id="tt" type="password" autocomplete="new-password" placeholder="${n.telegram_saved?"Saved. Leave empty to keep it":"123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"}"></label>
<div class="err" id="tfe"></div><button class="btn sm" type="submit">Connect Telegram</button></form>
<p class="muted" style="font-size:.84rem;margin-top:10px;line-height:1.8">In Telegram, message <b>@BotFather</b> and send <b>/newbot</b>. It gives you a token — paste it above and tap Connect. Then open your new bot in Telegram and tap <b>Start</b>, and tap Connect once more. We find your chat automatically and send a test message.${n.telegram?" Your chat is already connected.":""}</p>
<h4 style="margin:22px 0 8px">Email (free, Resend)</h4>
<form id="ef" class="fl" novalidate><label>Email that should get orders<input id="ee" type="email" value="${esc(n.email_to||"")}" placeholder="you@gmail.com"></label>
<label>Resend API key<input id="ek" type="password" autocomplete="new-password" placeholder="${n.email_saved?"Saved. Leave empty to keep it":"re_xxxxxxxxxxxx"}"></label>
<label>Send from (leave empty unless you verified a domain)<input id="efrom" value="${esc(n.email_from||"")}" placeholder="Crossroads &lt;orders@yourdomain.com&gt;"></label>
<div class="err" id="efe"></div><button class="btn sm" type="submit">Save and send test email</button></form>
<p class="muted" style="font-size:.84rem;margin-top:10px;line-height:1.8">Free, 3,000 emails a month. Create a key at <b>resend.com → API Keys</b> and paste it here. Resend's free sender can only email the address that owns the Resend account. To also send <b>customers</b> their order confirmation, verify a domain at resend.com → Domains, then put it in <b>Send from</b> (for example <b>Crossroads &lt;orders@yourdomain.com&gt;</b>).</p>
<button class="btn sm alt" type="button" data-act="ntest" style="margin-top:16px">Send a test alert</button><p class="muted" id="ntxt" style="font-size:.85rem;margin-top:8px;line-height:1.7"></p></div>
<div class="cd" style="margin-top:14px"><h3>Login codes (OTP)</h3><p class="muted" style="font-size:.9rem;margin-bottom:12px">Customers log in with a 6-digit code texted to their phone. Optional — the store works without it.</p>
<div style="display:grid;gap:8px;margin-bottom:16px">${alertLine("Primary gateway",o.gateway)}${alertLine("Backup gateway",!!o.hook2)}${alertLine("Fast2SMS",o.fast2sms)}${alertLine("Textbelt",o.textbelt)}</div>
${o.f2s?'<p style="margin:-8px 0 12px"><button class="link" type="button" data-act="of2s">Remove saved Fast2SMS key</button></p>':""}
${o.gateway||o.fast2sms||o.textbelt?"":'<p class="muted" style="font-size:.85rem;margin:-6px 0 12px">Nothing set up yet, so the code is shown on screen instead of being texted.</p>'}
<form id="of" class="fl" novalidate><label>Primary SMS gateway URL (free, your own phone)<input id="oh" value="${esc(o.hook||"")}" placeholder="MacroDroid: https://trigger.macrodroid.com/.../otp?num={phone}&msg={msg}"></label><label>Backup SMS gateway URL (optional, tries if primary fails)<input id="oh2" value="${esc(o.hook2||"")}" placeholder="Pushcut: https://api.pushcut.io/.../execute?shortcut=Crossroads%20OTP"></label>
<label>Fast2SMS API key (optional)<input id="ok" type="password" autocomplete="new-password" placeholder="${o.f2s?"Saved. Leave empty to keep it":"Paste the key from fast2sms.com"}"></label>
<div class="err" id="ofe"></div><button class="btn sm" type="submit">Save SMS settings</button></form>
<div style="display:flex;gap:8px;margin-top:14px;align-items:flex-end;flex-wrap:wrap"><label style="flex:1;min-width:170px">Send a test to<input id="ot" inputmode="tel" maxlength="10" placeholder="10-digit mobile number"></label><button class="btn sm alt" type="button" data-act="otest" style="flex:none">Send test code</button></div><p class="err" id="ote" style="margin-top:6px"></p>
<details style="margin-top:12px"><summary style="cursor:pointer;font-weight:600">Free way: your Android phone sends the SMS</summary><p class="muted" style="font-size:.85rem;line-height:1.8;margin-top:8px"><b>1.</b> Install <b>MacroDroid</b> (free) on any Android phone with a SIM and allow SMS permission. <b>2.</b> Add Macro → Trigger → <b>Webhook (URL)</b>: identifier <b>otp</b>, then tap the pink <b>+</b> and create two text variables named exactly <b>num</b> and <b>msg</b>. <b>3.</b> Action → <b>Send SMS</b>: number = variable <b>num</b>, message = variable <b>msg</b>. Save. <b>4.</b> Copy the trigger URL and paste it above as:<br><b>https://trigger.macrodroid.com/…/otp?num={phone}&amp;msg={msg}</b><br>The phone needs internet and to stay out of battery optimization. It costs nothing beyond your normal SMS pack and reaches any Indian number.</p></details>
<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">iPhone method (free, Pushcut)</summary><p class="muted" style="font-size:.85rem;line-height:1.8;margin-top:8px">Install <b>Pushcut</b> on an iPhone with a SIM, open <b>Automation Server → Start Server</b>, and set Auto-Lock to Never. In Shortcuts, create <b>Crossroads OTP</b>: <b>Get Dictionary from Input</b>, then <b>Send Message</b> to the <b>phone</b> value with the <b>message</b> value, <b>Show When Run off</b>. In Pushcut, enable the shortcut and copy its URL:<br><b>https://api.pushcut.io/&lt;secret&gt;/execute?shortcut=Crossroads%20OTP</b><br>Paste it above. Free tier = 100 messages/day; the app must stay open.</p></details>
<p class="muted" style="font-size:.82rem;margin-top:10px;line-height:1.7"><b>Fast2SMS</b> is the paid shortcut: sign up, copy the API key and paste it above (free credits on signup). <b>Textbelt</b> is switched on with a <b>TEXTBELT_KEY</b> environment variable; its free tier allows one message a day.</p></div>
<div class="cd" style="margin-top:14px"><h3>This device</h3><label class="chk"><input type="checkbox" id="sown" ${own?"checked":""}>Do not count my visits on this device in analytics</label><p class="muted" style="font-size:.85rem;margin-top:8px">Switch this on for your iPhone and your laptop, so only real customers are counted. It turns on automatically when you log in.</p><label class="chk" style="margin-top:10px"><input type="checkbox" id="ssnd" ${snd?"checked":""}>Play a sound when a new order arrives</label></div>
<div class="cd" style="margin-top:14px"><h3>Good to know</h3><p class="muted" style="font-size:.9rem">Your admin password is the ADMIN_PASSWORD setting in Netlify. To change it, edit it there and deploy again. Email, ntfy push and SMS alerts are switched on with Netlify environment variables, explained in <b>NOTIFY-SETUP.md</b> in your repository. WhatsApp and Telegram work right here, no redeploy needed.</p></div>`}

/* ---------- routing + render ---------- */
const TITLES={home:"Home",orders:"Orders",products:"Products",customers:"Customers",accounts:"Accounts",analytics:"Analytics",messages:"Messages",feedback:"Feedback",reviews:"Reviews",settings:"Settings"};
function skel(){return `<div class="sk"><div class="skb" style="width:38%"></div><div class="skb" style="width:62%"></div><div class="skg"><div class="skc"></div><div class="skc"></div><div class="skc"></div></div><div class="skb" style="width:100%;height:54px"></div><div class="skb" style="width:100%;height:54px"></div><div class="skb" style="width:100%;height:54px"></div></div>`}
let renderSeq=0;
async function render(silent,force){const[p,i]=where(),c=$("adc");if(!c)return;const seq=++renderSeq;
 document.querySelectorAll("#ads a.nv").forEach(a=>a.classList.toggle("on",a.dataset.nv===p));$("adT").textContent=TITLES[p]||"Home";
 if(!silent&&!S.hydrated&&!S.loaded)c.innerHTML=skel();
 const paint=async()=>{if(seq!==renderSeq)return;
  let h="";try{h=p==="orders"?pOrders(i):p==="products"?pProducts(i):p==="customers"?pCustomers():p==="accounts"?pAccounts():p==="messages"?pMessages():p==="feedback"?pFeedback():p==="reviews"?pReviews():p==="settings"?pSettings():p==="analytics"?await pAnalytics():await pHome()}catch(e){h='<div class="empty2">Something went wrong. Refresh and try again.</div>'}
  if(seq!==renderSeq||where().join("/")!==[p,i].join("/"))return;
  c.innerHTML=h;if(p==="products"&&i)bindForm();if(p==="orders"&&!i)bindBrand();};
 const stale=force||!S.loaded||Date.now()-(S.t||0)>300000;
 if(!stale){await paint();return}
 if(S.hydrated&&!silent)await paint();
 const ok=await loadAll();
 if(seq!==renderSeq)return;
 if(!ok){if(!PW){root.dataset.ready="";CRAdmin.open(root);return}c.innerHTML='<div class="empty2">Could not load the dashboard. Check your connection and <button class="link" data-act="retry" type="button">try again</button>.</div>';return}
 await paint();
 if(!silent)scrollTo({top:0,behavior:"instant"})}
function bindForm(){const g=()=>{const x=$("igm");if(x)x.innerHTML=draft.map((s,k)=>`<div class="igi"><img src="${esc(s)}" alt="">${k?"":"<i>Main</i>"}<div>${k?`<button type="button" class="link" data-m="${k}">Make main</button>`:"<span></span>"}<button type="button" class="link" data-r="${k}">Remove</button></div></div>`).join("")};g();
 $("igm").onclick=x=>{const b=x.target.closest("button");if(!b)return;if(b.dataset.r!==undefined)draft.splice(+b.dataset.r,1);if(b.dataset.m!==undefined){const[s]=draft.splice(+b.dataset.m,1);draft.unshift(s)}g()};
 $("pi").onchange=async x=>{const fs=[...x.target.files].slice(0,5-draft.length);if(!fs.length){$("pfe").textContent="You can add up to 5 photos.";return}$("pfe").textContent="Adding photos...";for(const f of fs){const s=await shrink(f);if(s)draft.push(s)}x.target.value="";$("pfe").textContent="";g()}}

/* ---------- events ---------- */
async function saveP(){const r=await api("products",{products:S.products});if(!r.ok)say(r.d.error||"Could not save");return r.ok}
async function upd(id,body){const r=await api("orders/update",Object.assign({id},body));if(!r.ok)say(r.d.error||"Could not update");await render(true,true);return r.ok}
/* ---------- brand, invoice, packing slip ---------- */
const STORE_IG="crossroads_shopping",STORE_MAIL="producingmj@gmail.com";
const short=(s,n=90)=>{s=String(s??"");return s.length>n?s.slice(0,n-1)+"…":s};
const dtl=t=>{try{return new Date(t||Date.now()).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}catch(e){return ""}};
function getBrand(){const s=(S.settings&&S.settings.brand)||{};return Object.assign({},BRAND_DEF,s,bDraft||{})}
function logoSVG(b,w=520){const h=Math.round(w*160/520),rx=b.shape==="circle"?60:b.shape==="square"?0:26;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 520 160" role="img" aria-label="${esc(b.name)}"><rect x="16" y="20" width="120" height="120" rx="${rx}" fill="${esc(b.bg)}"/><text x="76" y="95" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="46" fill="${esc(b.fg)}">${esc(b.mono)}</text><text x="160" y="70" font-family="Georgia,serif" font-weight="700" font-size="33" fill="#14161a">${esc(b.name)}</text><text x="160" y="98" font-family="Arial,Helvetica,sans-serif" font-size="15" fill="#6b7280">${esc(short(b.tag,52))}</text><rect x="160" y="112" width="54" height="4" rx="2" fill="${esc(b.ac)}"/></svg>`}
function brandPanel(){const b=getBrand();
 return `<details class="cardx brandp" id="bp"><summary>Brand &amp; logo <span class="muted" style="font-weight:400">— used on invoices and packing slips</span></summary>
 <div class="bpv"><div class="bpp" id="lgp">${logoSVG(b,520)}</div>
 <div class="bpg"><label>Shop name<input id="bnm" data-bg="name" maxlength="40" value="${esc(b.name)}"></label>
 <label>Tagline<input id="btg" data-bg="tag" maxlength="70" value="${esc(b.tag)}"></label>
 <div class="bpr"><label>Initials<input id="bmo" data-bg="mono" maxlength="3" value="${esc(b.mono)}"></label><label>Shape<select id="bsh" data-bg="shape">${["rounded","circle","square"].map(x=>`<option value="${x}" ${b.shape===x?"selected":""}>${x[0].toUpperCase()+x.slice(1)}</option>`).join("")}</select></label></div>
 <div class="bpr"><label>Logo colour<input type="color" id="bbg" data-bg="bg" value="${esc(b.bg)}"></label><label>Initials<input type="color" id="bfg" data-bg="fg" value="${esc(b.fg)}"></label><label>Accent<input type="color" id="bac" data-bg="ac" value="${esc(b.ac)}"></label></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="bsave" type="button">Save logo</button><button class="btn sm alt" data-act="bsvg" type="button">Download SVG</button><button class="btn sm alt" data-act="bpng" type="button">Download PNG</button></div>
 <p class="muted" id="bmsg" style="font-size:.82rem;margin:0">Your saved logo and colours appear on every invoice and packing slip.</p></div></div></details>`}
function bindBrand(){const p=$("lgp");if(p)p.innerHTML=logoSVG(getBrand(),520)}
function brandSet(k,v){bDraft=Object.assign({},getBrand(),{[k]:v});const p=$("lgp");if(p)p.innerHTML=logoSVG(bDraft,520);const m=$("bmsg");if(m){m.className="muted";m.textContent="Not saved yet — press Save logo to keep it."}}
async function saveBrand(){if(!bDraft){say("Change something first.");return}const b=getBrand(),r=await api("settings",{brand:b});const m=$("bmsg");if(r.ok){S.settings.brand=b;bDraft=null;saveCache();if(m){m.className="ok";m.textContent="Saved. Invoices and packing slips will use this logo."}say("Logo saved")}else if(m){m.className="err";m.textContent=r.d.error||"Could not save the logo."}}
function dlFile(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
function dlSVG(){const b=getBrand();dlFile((b.name||"logo").toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-logo.svg",new Blob([logoSVG(b,1040)],{type:"image/svg+xml"}))}
function dlPNG(){const b=getBrand(),svg=logoSVG(b,1040),img=new Image();img.onload=()=>{const cv=document.createElement("canvas");cv.width=1040;cv.height=Math.round(1040*160/520);cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);cv.toBlob(bl=>{if(bl)dlFile((b.name||"logo").toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-logo.png",bl)},"image/png")};img.onerror=()=>say("Could not build the PNG. Try the SVG download.");img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}
function orderItems(o){if(Array.isArray(o.it)&&o.it.length)return o.it.map(x=>({n:String(x.n||x.name||"Item"),s:String(x.s||""),q:Math.max(1,+x.q||1),p:Math.max(0,+x.p||0)}));
 const L=(o.lines||[]).map(l=>{const m=String(l).match(/\s*x\s*(\d+)\s*$/i);return{n:String(l).replace(/\s*x\s*\d+\s*$/i,""),s:"",q:m?+m[1]:1,p:0}});
 return L.length?L:[{n:"Order items",s:"",q:1,p:0}]}
function orderMoney(o){const its=orderItems(o),disc=o.disc?+o.disc.off||0:0,tot=+o.total||0;let sub=its.reduce((a,x)=>a+x.p*x.q,0);const itemised=sub>0;if(!itemised)sub=tot+disc;return{its,disc,tot,sub,itemised}}
const docCSS=`.pg{width:210mm;min-height:297mm;margin:16px auto;background:#fff;padding:15mm 14mm;box-shadow:0 10px 40px rgba(15,20,30,.16);position:relative}
*{box-sizing:border-box}body{margin:0;background:#eceef2;font:13px/1.5 Arial,Helvetica,sans-serif;color:#1b1d21;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hd{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:2px solid #14161a;padding-bottom:14px}
.hd h1{margin:0;font:700 30px/1 Georgia,serif;letter-spacing:.02em}.hd .k{font:600 11px/1.6 Arial;letter-spacing:.22em;text-transform:uppercase;color:#6b7280}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 18px;margin:16px 0 18px;font-size:12px}
.meta span{display:block;color:#6b7280;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:2px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
.box{border:1px solid #dfe2e8;border-radius:8px;padding:12px 14px;background:#fafbfc}
.box h4{margin:0 0 6px;font:700 10px/1 Arial;letter-spacing:.16em;text-transform:uppercase;color:#6b7280}
.box p{margin:0;white-space:pre-line}.box b{font-size:14px}
table.it{width:100%;border-collapse:collapse;margin-top:4px}
table.it th{font:700 10px/1 Arial;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;text-align:left;padding:9px 8px;border-bottom:1px solid #14161a;background:#f4f5f7}
table.it td{padding:10px 8px;border-bottom:1px solid #e6e8ec;vertical-align:top}
table.it .num{width:28px;color:#9aa0aa}.c{text-align:center}.r{text-align:right;white-space:nowrap}
.mut{display:block;font-size:11px;color:#7b818c;margin-top:2px}
.totw{display:flex;justify-content:flex-end;margin-top:14px}
.totw table{border-collapse:collapse;min-width:250px;font-size:13px}
.totw td{padding:7px 0 7px 18px}.totw td:last-child{text-align:right;white-space:nowrap}
.totw .dis td{color:#0f7a3d}.totw .tot td{border-top:1px solid #14161a;font:700 17px/1.2 Georgia,serif;padding-top:10px}
.chip{display:inline-block;font:700 10px/1 Arial;letter-spacing:.12em;text-transform:uppercase;padding:5px 9px;border-radius:999px}
.paid{background:#e7f5ec;color:#0f7a3d}.due{background:#fdf0e3;color:#a25b00}
.ft{margin-top:26px;border-top:1px solid #dfe2e8;padding-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;font-size:11.5px;color:#5b616b}
.ft b{color:#1b1d21}.ty{font:700 15px/1.3 Georgia,serif;color:#14161a}
.note{margin-top:10px;font-size:10.5px;color:#8a909a}
.nop{position:fixed;top:14px;right:14px;display:flex;gap:8px;z-index:9}
.nop button{font:600 13px Arial;padding:9px 14px;border:0;border-radius:8px;background:#14161a;color:#fff;cursor:pointer}
.nop button.alt{background:#fff;color:#14161a;border:1px solid #cfd4db}
.slip .pg{min-height:auto}
.chk{width:16px;height:16px;border:1.5px solid #14161a;border-radius:3px;display:inline-block}
@page{size:A4;margin:0}
@media print{body{background:#fff}.pg{margin:0;box-shadow:none;width:auto;min-height:0;padding:13mm}.nop{display:none!important}}
@media(max-width:800px){.pg{width:auto;margin:0;min-height:0;padding:18px}}`;
function docHTML(title,body){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${docCSS}</style></head><body><div class="nop"><button onclick="window.print()">Print</button><button class="alt" onclick="window.close()">Close</button></div>${body}</body></html>`}
function storeFoot(){const b=getBrand(),host=location.host||"crossroadsshoppings.in";return `<div class="ft"><div><b>Need help?</b><br>Instagram: @${STORE_IG}<br>Email: ${STORE_MAIL}</div><div><b>${esc(b.name)}</b><br>${esc(host)}<br>Open 9 AM – 9 PM IST<br>We reply within a few hours.</div></div>`}
function invoiceHTML(o){const b=getBrand(),m=orderMoney(o),paid=!!o.paid,inv="INV-"+String(o.no||0).padStart(4,"0");
 const rows=m.its.map((x,k)=>`<tr><td class="num">${k+1}</td><td><b>${esc(short(x.n,120))}</b>${x.s?`<span class="mut">Size: ${esc(x.s)}</span>`:""}</td><td class="c">${x.q}</td><td class="r">${m.itemised&&x.p?money(x.p):"—"}</td><td class="r">${m.itemised&&x.p?money(x.p*x.q):"—"}</td></tr>`).join("");
 const body=`<div class="pg"><div class="hd"><div>${logoSVG(b,320)}</div><div style="text-align:right"><div class="k">Invoice</div><h1>${inv}</h1><div style="margin-top:8px"><span class="chip ${paid?"paid":"due"}">${paid?"Paid":"Payment pending"}</span></div></div></div>
 <div class="meta"><div><span>Invoice date</span>${dtl(o.t)}</div><div><span>Order number</span>#${esc(o.no||"—")}</div><div><span>Payment method</span>${o.method==="upi"?"UPI":"Online (Razorpay)"}</div><div><span>Order placed</span>${esc(dt(o.t))}</div><div><span>${o.utr?"UPI transaction ID":"Payment ID"}</span>${esc(o.utr||o.pay||"—")}</div><div><span>Delivery estimate</span>About 5 days (max 2 weeks)</div></div>
 <div class="two"><div class="box"><h4>Billed to</h4><b>${esc(o.name||"Customer")}</b><p>${esc(o.phone||"")}${o.email?"\n"+esc(o.email):""}</p></div><div class="box"><h4>Ship to</h4><b>${esc(o.name||"Customer")}</b><p>${esc(o.address||"")}\n${esc(o.phone||"")}</p></div></div>
 <table class="it"><thead><tr><th>#</th><th>Item</th><th class="c">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="totw"><table><tr><td>Subtotal</td><td>${money(m.sub)}</td></tr>${m.disc?`<tr class="dis"><td>Discount${o.disc&&o.disc.code?` (${esc(o.disc.code)})`:""}</td><td>₹ ${money(m.disc)}</td></tr>`:""}<tr><td>Shipping</td><td>Free</td></tr><tr class="tot"><td>Total</td><td>${money(m.tot)}</td></tr></table></div>
 <div class="note">Shipping is free. Estimated delivery: about 5 days, and never more than 2 weeks. Keep this invoice for your records.</div>
 <div style="margin-top:22px" class="ty">Thank you for shopping with ${esc(b.name)}.</div>
 <div class="note">Questions about this order? Message us on Instagram @${STORE_IG} or email ${STORE_MAIL} and quote order #${esc(o.no||"")}.</div>
 ${storeFoot()}<div class="note">This is a computer-generated invoice. No signature is required.</div></div>`;
 return docHTML("Invoice "+inv,body)}
function slipHTML(o){const b=getBrand(),m=orderMoney(o);
 const rows=m.its.map((x,k)=>`<tr><td class="c"><span class="chk"></span></td><td><b>${esc(short(x.n,120))}</b>${x.s?`<span class="mut">Size: ${esc(x.s)}</span>`:""}</td><td class="c" style="font:700 18px/1 Georgia,serif">${x.q}</td></tr>`).join("");
 const body=`<div class="pg slip"><div class="hd"><div>${logoSVG(b,300)}</div><div style="text-align:right"><div class="k">Packing slip</div><h1>#${esc(o.no||"—")}</h1><div style="margin-top:6px;font-size:12px;color:#6b7280">${dtl(o.t)}</div></div></div>
 <div class="box" style="margin-top:16px"><h4>Deliver to</h4><b style="font-size:17px">${esc(o.name||"Customer")}</b><p style="font-size:14px">${esc(o.address||"")}\nPhone: ${esc(o.phone||"")}</p></div>
 <table class="it" style="margin-top:18px"><thead><tr><th class="c" style="width:44px">Check</th><th>Item</th><th class="c" style="width:60px">Qty</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="box" style="margin-top:18px;background:#fff"><h4>Before you pack</h4><p>✓  All items above are in the parcel
✓  Size and colour match the order
✓  Items are clean and undamaged
✓  This slip is inside the parcel</p></div>
 <div class="note" style="margin-top:14px">Please check your items when they arrive. If anything is damaged, missing or wrong, message us within 48 hours with a photo and we will fix it quickly.</div>
 <div style="margin-top:26px;text-align:center"><div class="ty">Thank you for shopping with ${esc(b.name)}!</div><div style="margin-top:8px;font:700 15px/1.4 Georgia,serif">@${STORE_IG}</div><div class="note" style="margin-top:4px">${esc(location.host||"crossroadsshoppings.in")} · ${STORE_MAIL}</div></div></div>`;
 return docHTML("Packing slip #"+(o.no||""),body)}
function labelHTML(o){const b=getBrand(),m=orderMoney(o),inv="ORD-"+String(o.no||0).padStart(4,"0");
 const body=`<div class="pg" style="max-width:105mm;margin:0 auto;padding:8mm;font:12px/1.4 Arial,sans-serif">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px">
   <div style="font:700 16px/1 Georgia,serif">${esc(b.name)}</div>
   <div style="text-align:right"><div style="font:700 14px/1 monospace">${inv}</div><div style="font-size:10px;color:#555">${dtl(o.t)}</div></div>
  </div>
  <div style="background:#f3f4f6;border-radius:6px;padding:8px;margin-bottom:8px">
   <div style="font:600 10px/1 Arial,sans-serif;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">SHIP TO</div>
   <div style="font:700 15px/1.3 Arial,sans-serif">${esc(o.name||"Customer")}</div>
   <div style="font-size:12px;margin-top:2px">${esc(o.address||"").replace(/\n/g,"<br>")}</div>
   <div style="font:700 13px/1.4 Arial,sans-serif;margin-top:4px">Phone: ${esc(o.phone||"")}</div>
   ${o.email?`<div style="font-size:11px;color:#555;margin-top:2px">Email: ${esc(o.email)}</div>`:""}
  </div>
  <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px">
   <div style="flex:1;background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px">
    <div style="font:600 9px/1 Arial,sans-serif;color:#6b7280;text-transform:uppercase;margin-bottom:2px">Payment</div>
    <div style="font:700 12px/1 Arial,sans-serif">${o.paid?"PAID":"COD"}</div>
    <div style="font-size:11px;margin-top:2px">${money(m.total)}</div>
   </div>
   <div style="flex:1;background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px">
    <div style="font:600 9px/1 Arial,sans-serif;color:#6b7280;text-transform:uppercase;margin-bottom:2px">Items</div>
    <div style="font:700 12px/1 Arial,sans-serif">${m.its.reduce((a,x)=>a+x.q,0)} pcs</div>
    <div style="font-size:10px;margin-top:2px;color:#555">${m.its.map(x=>short(x.n,20)+" x"+x.q).join(", ").slice(0,60)}</div>
   </div>
  </div>
  ${o.track?`<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:6px;margin-bottom:8px;text-align:center"><div style="font:600 9px/1 Arial,sans-serif;color:#856404;text-transform:uppercase;margin-bottom:2px">Tracking</div><div style="font:700 12px/1 monospace">${esc(o.track)}</div></div>`:""}
  <div style="border-top:1px dashed #999;padding-top:6px;text-align:center">
   <div style="font:700 11px/1 Arial,sans-serif">${esc(b.name)} · ${STORE_MAIL}</div>
   <div style="font-size:9px;color:#888;margin-top:2px">Handle with care · Do not bend</div>
  </div>
 </div>`;
 return docHTML("Shipping label #"+(o.no||""),body)}
function label(o){printDoc(labelHTML(o))}
function printDoc(html){const w=window.open("","_blank");if(!w){say("Allow pop-ups to open the invoice.");return}try{w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>{try{w.print()}catch(e){}},500)}catch(e){say("Could not open the print window.")}}
function slip(o){printDoc(slipHTML(o))}
async function onClick(e){const b=e.target.closest("[data-act],[data-of],[data-pf],[data-vf]");if(!b)return;const d=b.dataset;
 if(d.of){S.of=d.of;render(true);return}if(d.pf){S.pf=d.pf;render(true);return}if(d.vf){S.vf=d.vf;render();return}
 const a=d.act,id=d.id,[,oid]=where(),o=S.orders.find(x=>x.id===(a&&a[0]==="o"?(id||oid):oid)),i=S.products.findIndex(p=>String(p.id)===id);
 if(a==="ccopy"){try{await navigator.clipboard.writeText(d.c||"")}catch(e){}say("Discount code copied.");return}
 if(a==="otest"){const el=$("ote"),ph=($("ot")?$("ot").value:"").replace(/\D/g,"");if(!el)return;if(ph.length!==10){el.className="err";el.textContent="Enter a 10-digit mobile number.";return}el.className="";el.textContent="Sending…";const r=await api("sms/test",{phone:ph});if(r.ok){el.className="ok";el.textContent="Test code sent by SMS."}else{el.className="err";el.textContent=r.d.error||"Could not send the test."}return}
 if(a==="of2s"){if(!confirm("Remove the saved Fast2SMS key? Login codes will stop being texted until you add another."))return;const r=await api("settings",{f2sKey:""});if(r.ok){S.otp={...(S.otp||{}),fast2sms:false};saveCache();say("Fast2SMS key removed.");render()}else say(r.d.error||"Could not remove the key.");return}
 if(a==="cfree"){const r=await api("codes/free",{code:d.c});if(r.ok){const k=(S.codes||[]).find(x=>x.c===d.c);if(k){k.used=false;delete k.ut;delete k.ord}render();say("That code can be used again.")}else say(r.d.error||"Could not re-enable that code.");return}
 if(a==="cdel"){if(!confirm("Delete discount code "+d.c+"? It will stop working for the customer."))return;const r=await api("codes/delete",{code:d.c});if(r.ok){S.codes=(S.codes||[]).filter(x=>x.c!==d.c);saveCache();render();say("Discount code deleted.")}else say(r.d.error||"Could not delete that code.");return}
 if(a==="rvdel"){if(!confirm("Delete this review?"))return;const r=await api("reviews/delete",{id:d.id});if(r.ok){S.reviews=(S.reviews||[]).filter(x=>String(x.id)!==String(d.id));saveCache();render();say("Review deleted.")}else say(r.d.error||"Could not delete that review.");return}
 if(a==="bsave")return saveBrand();
 if(a==="retry"){render(false,true);return}
 if(a==="bsvg")return dlSVG();
 if(a==="bpng")return dlPNG();
 if(a==="oinv"&&o)return printDoc(invoiceHTML(o));
 if(a==="olabel"&&o)return label(o);
 if(a==="oview"){location.hash="#admin/orders/"+id;return}
 if(a==="ntest"){const el=$("ntxt");if(el){el.className="muted";el.textContent="Sending…"}const r=await api("notify/test",{});let m=r.ok?"Test sent.":(r.d.error||"Could not send the test.");if(r.ok&&r.d.whatsapp)m+=" WhatsApp: "+(r.d.whatsapp_ok?"sent — check your phone.":(r.d.whatsapp_reply||"sent, but check your phone."));if(r.ok&&r.d.telegram)m+=" Telegram: "+(r.d.telegram_error||"sent — check your phone.");if(r.ok&&r.d.email)m+=" Email: "+(r.d.email_error||"sent to "+r.d.email_to+".");if(el){el.className=r.ok?"ok":"err";el.textContent=m}else say(m);return}
 if(a==="cview"){S.oq=d.q||"";S.of="all";location.hash="#admin/orders";return}
 if(a==="fdel"){if(confirm("Delete this feedback?")){await api("feedback/delete",{t:d.t});S.feedback=(S.feedback||[]).filter(x=>x.t!==d.t);render()}return}
 if(a==="opaid")return upd(oid,{paid:true});
 if(a==="oship"){const t=prompt("Tracking number or courier note (optional)");if(t===null)return;return upd(oid,{shipped:true,track:t})}
 if(a==="tkSave"&&o){const el=$("tkfe");if(el){el.className="";el.textContent="Saving..."}const status=$("tkStatus")?$("tkStatus").value:"placed",courier=$("tkCourier")?$("tkCourier").value.trim():"",trackNo=$("tkTrackNo")?$("tkTrackNo").value.trim():"",estDate=$("tkEstDate")?$("tkEstDate").value:"",estDays=+$("tkEstDays")?$("tkEstDays").value:5,note=$("tkNote")?$("tkNote").value.trim():"";const r=await api("orders/update",{id:o.id,trackStatus:status,courier,trackNo,estDate,estDays,trackNote:note});if(r.ok){if(!o.track)o.track={};o.track.status=status;o.track.courier=courier;o.track.trackNo=trackNo;o.track.estDate=estDate;o.track.estDays=estDays;o.track.note=note;saveCache();say("Tracking saved");render(true)}else if(el){el.className="err";el.textContent=r.d.error||"Could not save tracking."}return}
 if(a==="odeliv")return upd(oid,{delivered:true});
 if(a==="ocancel"){if(confirm("Cancel this order?"))return upd(oid,{cancelled:true});return}
 if(a==="orestore")return upd(oid,{cancelled:false});
 if(a==="onote"){await api("orders/update",{id:oid,note:$("onote").value});say("Note saved");return}
 if(a==="ocopy"&&o){try{await navigator.clipboard.writeText(o.name+"\n"+o.phone+"\n"+o.address);say("Address copied")}catch(x){say("Could not copy")}return}
 if(a==="oslip"&&o)return slip(o);
 if(a==="odel"){if(confirm("Delete this order for good?")){const r=await api("orders/delete",{id:oid});if(r.ok){S.orders=S.orders.filter(x=>x.id!==oid);S.seen.delete(oid);saveCache();location.hash="#admin/orders";render(true,true)}else say(r.d.error||"Could not delete this order")}return}
 if(a==="mdel"){if(confirm("Delete this message?")){await api("messages/delete",{t:d.t});render(true);S.messages=S.messages.filter(m=>m.t!==d.t);$("adc").innerHTML=pMessages()}return}
 if(a==="igtest"){const el=$("igfe");if(el){el.className="";el.textContent="Checking..."}const r=await api("ig/test",{});if(el){el.className=r.ok?"ok":"err";el.textContent=r.ok?"Connected to @"+(r.d.username||"your account"):(r.d.error||"Could not connect.")}return}
 if(a==="igpost"){const igc=S.settings&&S.settings.ig;if(igc&&igc.connected){say("Posting to Instagram...");const r=await api("ig/post",{id:d.id});if(r.ok){say("Posted to Instagram"+(r.d.posted&&r.d.posted.some(x=>x.startsWith("story:"))?" + Story":""));return}say(r.d.error||"Auto-post failed. Opening manual posting...")}showIgPost(d.id);return}
 if(a==="impclear"){impDraft=null;render(true);return}
 if(a==="impsync"){say("Syncing supplier stock...");const r=await api("import/sync",{});if(r.ok){await render(true,true);say("Updated "+r.d.updated+" imported product"+(r.d.updated===1?"":"s")+".")}else say(r.d.error||"Could not sync.");return}
 if(i<0&&a&&a[0]==="p")return;
 if(a==="phide"){S.products[i].hid=!S.products[i].hid;await saveP();render(true);return}
 if(a==="pdup"){S.products.splice(i+1,0,Object.assign({},S.products[i],{id:Date.now(),n:S.products[i].n+" (copy)",hid:true}));await saveP();render(true);return}
 if(a==="pup"||a==="pdown"){const j=a==="pup"?i-1:i+1;if(j<0||j>=S.products.length)return;[S.products[i],S.products[j]]=[S.products[j],S.products[i]];await saveP();render(true);return}
 if(a==="pdel"){if(confirm("Delete this product?")){S.products.splice(i,1);await saveP();render(true)}}}
function onInput(e){const bg=e.target&&e.target.dataset?e.target.dataset.bg:"";if(bg){brandSet(bg,e.target.value);return}if(e.target.id==="oq"){S.oq=e.target.value;const c=e.target.selectionStart;render(true).then(()=>{const x=$("oq");if(x){x.focus();x.setSelectionRange(c,c)}})}if(e.target.id==="pq"){S.pq=e.target.value;const c=e.target.selectionStart;render(true).then(()=>{const x=$("pq");if(x){x.focus();x.setSelectionRange(c,c)}})}}
function onChange(e){const bg=e.target&&e.target.dataset?e.target.dataset.bg:"";if(bg){brandSet(bg,e.target.value);return}if(e.target.id==="rg"){S.range=+e.target.value;render()}
 if(e.target.id==="sown"){try{e.target.checked?localStorage.setItem("cr_owner","1"):localStorage.removeItem("cr_owner")}catch(x){}say(e.target.checked?"Your visits will not be counted":"Your visits will be counted")}
 if(e.target.id==="ssnd"){try{localStorage.setItem("cr_snd",e.target.checked?"1":"0")}catch(x){}}}
async function onSubmit(e){e.preventDefault();
 if(e.target.id==="pmf"){const pm=$("pm").value,el=$("pmfe");el.className="";el.textContent="Saving...";const r=await api("settings",{paymentMethod:pm});if(r.ok){S.settings={...(S.settings||{}),paymentMethod:pm};saveCache();say("Payment method saved");render()}else{el.className="err";el.textContent=r.d.error||"Could not save."}return}
 if(e.target.id==="of"){const hook=$("oh").value.trim(),hook2=$("oh2").value.trim(),key=$("ok").value.trim(),el=$("ofe");if(hook&&!/^https?:\/\/\//i.test(hook)){el.className="err";el.textContent="The primary gateway URL must start with https://";return}if(hook2&&!/^https?:\/\/\//i.test(hook2)){el.className="err";el.textContent="The backup gateway URL must start with https://";return}el.className="";el.textContent="Saving…";const body={smsHook:hook,smsHook2:hook2};if(key)body.f2sKey=key;const r=await api("settings",body);if(r.ok){S.otp={...(S.otp||{}),hook,hook2,fast2sms:!!key||!!(S.otp||{}).fast2sms};saveCache();say("SMS settings saved");render()}else{el.className="err";el.textContent=r.d.error||"Could not save."}return}
 if(e.target.id==="rvf"){const pid=$("rvp")?$("rvp").value:"",name=$("rvn").value.trim(),stars=+$("rvs").value,text=$("rvx").value.trim(),el=$("rve");if(!name){if(el){el.className="err";el.textContent="Add the customer's name."}return}let photo="";const fi=$("rvphoto");if(fi&&fi.files&&fi.files[0]){photo=await shrink(fi.files[0],720)}if(el){el.className="";el.textContent="Saving…"}const r=await api("reviews/add",{pid,name,stars,text,photo});if(r.ok){if(r.d.review)S.reviews=[r.d.review,...(S.reviews||[])];saveCache();say("Review added");render()}else if(el){el.className="err";el.textContent=r.d.error||"Could not add the review."}return}
 if(e.target.id==="rvimpf"){const pid=$("rvimpp")?$("rvimpp").value:"",lines=($("rvimpt").value||"").split("\n").map(l=>l.trim()).filter(Boolean),el=$("rvimpe");if(el){el.className="";el.textContent="Importing..."}let n=0;for(const line of lines){const parts=line.split("|");const name=(parts[0]||"").trim(),stars=Math.max(1,Math.min(5,Math.round(+parts[1]||5))),text=(parts[2]||"").trim(),photo=(parts[3]||"").trim();if(!name)continue;const r=await api("reviews/add",{pid,name,stars,text,photo});if(r.ok){S.reviews.unshift(r.d.review||{id:Date.now(),pid,nm:name,s:stars,x:text,t:new Date().toISOString(),src:"shop",photo:photo||""});n++}}saveCache();render();if(el){el.className="ok";el.textContent="Imported "+n+" review"+(n===1?"":"s")+"."}return}
 if(e.target.id==="sf"){const f=$("sq").files[0],qr=f?await shrink(f,800):(S.settings.qr||""),u=$("su").value.trim(),nm=$("sn").value.trim(),r=await api("settings",{upi:u,name:nm,qr});$("sfe").className=r.ok?"ok":"err";$("sfe").textContent=r.ok?"Saved.":(r.d.error||"Could not save.");if(r.ok)Object.assign(S.settings,{upi:u,name:nm,qr});return}
 if(e.target.id==="nf"){const ph=$("nw").value.replace(/\D/g,""),k=$("nk").value.trim(),body={waPhone:ph};if(k)body.waKey=k;const r=await api("settings",body);if(r.ok){say("WhatsApp alerts saved");render()}else{$("nfe").className="err";$("nfe").textContent=r.d.error||"Could not save."}return}
 if(e.target.id==="tf"){const tok=$("tt").value.trim(),el=$("tfe");if(el){el.className="";el.textContent="Connecting…"}const r=await api("notify/telegram",tok?{token:tok}:{});if(r.ok){say("Telegram connected"+(r.d.bot?" to @"+r.d.bot:""));render()}else if(el){el.className="err";el.textContent=r.d.error||"Could not connect Telegram."}return}
 if(e.target.id==="ef"){const k=$("ek").value.trim(),to=$("ee").value.trim(),from=$("efrom").value.trim(),el=$("efe");if(el){el.className="";el.textContent="Sending…"}const body={to};if(k)body.key=k;if(from)body.from=from;const r=await api("notify/email",body);if(r.ok){say("Test email sent to "+r.d.to);render()}else if(el){el.className="err";el.textContent=r.d.error||"Could not send the email."}return}
 if(e.target.id==="impf"){const el=$("impe"),btn=$("impbtn");const url=urlFromText($("impu").value)||$("impu").value.trim(),mk=+$("impm").value||2,px=+$("impp").value||0,wm=$("impwm")?$("impwm").checked:true;if(!/^https?:\/\//i.test(url)){el.className="err";el.textContent="Paste the full product link (starting with https://).";return}el.className="";el.textContent="Reading the product…";if(btn){btn.disabled=true;btn.textContent="Fetching…"}let got=null,why="";if(/meesho/i.test(url)){el.textContent="Reading the product from Meesho…";got=await meeshoLookup(url,t=>{el.className="";el.textContent=t});if(!got)why="Meesho catalogue did not return this product. It may be too new, or the link format is not supported."}if(!got){const r=await api("import/product",{url,markup:mk,price:px});if(btn){btn.disabled=false;btn.textContent="Fetch product"}if(!r.ok){el.className="err";el.textContent=r.d.error||why||"Could not import that link.";return}got=r.d.product}else if(btn){btn.disabled=false;btn.textContent="Fetch product"}const prod=Object.assign({pm:"both"},got);if(wm&&prod.images&&prod.images.length){prod.images=await watermarkList(prod.images,(i,n)=>{el.className="";el.textContent="Adding your brand watermark… "+i+"/"+n})}const dup=(S.products||[]).find(p=>String(p.n||"").trim().toLowerCase()===String(prod.n||"").trim().toLowerCase());if(dup&&!confirm("You already have \""+dup.n+"\". Import it again as a copy?")){el.textContent="";return}impDraft=prod;location.hash="#admin/products/new";say("Product fetched. Check it, then tap Add product.");return}
 if(e.target.id==="igf"){const el=$("igfe"),user=$("igu").value.trim(),tok=$("igt").value.trim(),auto=$("iga").checked,story=$("igs").checked;el.className="";el.textContent="Saving...";const body={igUser:user,igAuto:auto,igStory:story};if(tok)body.igToken=tok;const r=await api("settings",body);if(r.ok){S.settings.ig={connected:!!(tok||(S.settings.ig&&S.settings.ig.connected)),user,auto,story};saveCache();say("Instagram settings saved");render()}else{el.className="err";el.textContent=r.d.error||"Could not save."}return}
 if(e.target.id==="gf"){const g=$("gcid").value.trim(),el=$("gfe");el.className="";el.textContent="Saving...";const r=await api("settings",{googleClientId:g});if(r.ok){el.className="ok";el.textContent="Saved. Customers can now sign in with Google.";say("Google login updated")}else{el.className="err";el.textContent=r.d.error||"Could not save."}return}
 if(e.target.id==="bcastf"){const subj=$("bcastsubj").value.trim(),msg=$("bcastmsg").value.trim(),el=$("bcaste");if(!subj||!msg){if(el){el.className="err";el.textContent="Subject and message are required."}return}if(el){el.className="";el.textContent="Sending..."}const r=await api("broadcast",{subject:subj,text:msg});if(r.ok){if(el){el.className="ok";el.textContent="Sent to "+r.d.sent+" of "+r.d.total+" customers."}say("Update sent to "+r.d.sent+" customers.")}else if(el){el.className="err";el.textContent=r.d.error||"Could not send."}return}
 if(e.target.id==="pf"){const[,id]=where(),old=id==="new"?{}:S.products.find(p=>String(p.id)===id)||{},n=$("pn").value.trim(),pr=+$("pp").value;if(!n||!pr){$("pfe").className="err";$("pfe").textContent="Enter a name and a price.";return}
  const o={id:old.id||Date.now(),n,sn:$("psn").value.trim(),c:normCat($("pc").value)||"Fashion",p:pr,o:+$("po").value||0,s:$("ps").value.split(",").map(s=>s.trim()).filter(Boolean),d:$("pdsc").value.trim(),pm:$("ppm").value||"both",sup:(old.sup||((!old.id&&impDraft)?impDraft.sup:null)||undefined),sold:$("pso").checked,tr:$("ptr").checked,hid:$("phd").checked,images:draft.slice(),img:draft[0]||""};
  if(old.id)S.products=S.products.map(p=>p.id===old.id?o:p);else S.products.unshift(o);
  $("pfe").textContent="Saving...";if(await saveP()){impDraft=null;say("Product saved");location.hash="#admin/products";const igc=S.settings&&S.settings.ig;if(igc&&igc.auto){const ir=await api("ig/post",{id:o.id});say(ir.ok?"Posted to Instagram"+(ir.d.posted&&ir.d.posted.some(x=>x.startsWith("story:"))?" + Story":""):"Instagram: "+(ir.d.error||"could not post."))}}else{$("pfe").className="err";$("pfe").textContent="Could not save. Try again."}}}


function igCaption(p){
 const name=String(p.n||"").trim().slice(0,90),desc=String(p.d||"").replace(/\s+/g," ").slice(0,300),price=+p.p||0,old=+p.o||0;
 const lines=[name,"",desc,"",price?("Price: ₹"+price.toLocaleString("en-IN")+(old>price?" (was ₹"+old.toLocaleString("en-IN")+")":"")):"","Free delivery across India in about 5 days. Cash on Delivery available.","Order here: https://crossroads-shopping.netlify.app/#product/"+p.id,""];
 const tags=["#CrossroadsShopping","#OnlineShoppingIndia","#IndiaShopping","#ShopNow"];
 const cat=String(p.c||"").toLowerCase();
 if(cat.includes("electronic"))tags.push("#electronics","#tech","#gadgets","#techdeals");
 if(cat.includes("accessor"))tags.push("#accessories","#style","#gifts");
 if(cat.includes("shirt")||cat.includes("fashion"))tags.push("#fashion","#style","#ootd");
 if(cat.includes("shoe"))tags.push("#shoes","#sneakers","#footwear");
 const nameTags=name.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>3).slice(0,3).map(w=>"#"+w);
 return [...lines,...tags,...nameTags].join("\n").slice(0,2100);
}
function showIgPost(pid){
 const p=S.products.find(x=>String(x.id)===String(pid));if(!p){say("Product not found.");return}
 const imgs=(p.images&&p.images.length?p.images:[p.img]).filter(Boolean).map(s=>s.startsWith("/")?"https://crossroads-shopping.netlify.app"+s:s);
 const cap=igCaption(p);
 const ov=document.createElement("div");ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";
 const card=document.createElement("div");card.style.cssText="background:var(--card,#fff);color:var(--ink,#111);border-radius:14px;max-width:520px;width:100%;max-height:90vh;overflow:auto;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.4)";
 card.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:1.1rem">Post to Instagram</h3><button type="button" id="igclose" class="link" style="font-size:1.2rem;line-height:1">×</button></div>
 <p class="muted" style="font-size:.85rem;margin:0 0 12px">Semi-automatic: copy the caption, save the photo, then paste into Instagram. Music can be added in the Instagram app after posting.</p>
 <div style="display:grid;gap:8px;margin-bottom:14px">${imgs.map((s,i)=>`<div style="display:flex;gap:8px;align-items:center"><img src="${esc(s)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px"><button type="button" class="btn sm alt" data-dl="${esc(s)}" data-dn="crossroads-product-${i+1}.jpg" data-idx="${i+1}" style="flex:none">Save photo ${i+1}</button></div>`).join("")}</div>
 <label style="display:block;margin-bottom:6px;font-weight:600;font-size:.85rem">Caption (auto-generated)</label>
 <textarea id="igcap" readonly style="width:100%;min-height:180px;font-size:.82rem;padding:10px;border:1px solid var(--line,#ddd);border-radius:8px;background:var(--bg,#f7f7f7);color:var(--ink,#111);resize:vertical">${esc(cap)}</textarea>
 <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
  <button type="button" class="btn sm" id="igcopy">Copy caption</button>
  <button type="button" class="btn sm alt" id="igopen">Open Instagram</button>
  <button type="button" class="btn sm alt" id="igclose2">Close</button>
 </div>
 <p class="muted" style="font-size:.78rem;margin-top:10px;line-height:1.6"><b>Steps:</b> 1) Save the photo above. 2) Click "Copy caption". 3) Click "Open Instagram" → create a new post → upload the photo → paste caption → add music (optional) → Share.</p>
 <p class="muted" style="font-size:.78rem;margin-top:4px;line-height:1.6"><b>Tip:</b> If you later connect the Meta API in Settings, "Post to IG" will auto-post without these steps.</p>`;
 ov.appendChild(card);document.body.appendChild(ov);
 const close=()=>ov.remove();
 card.querySelector("#igclose").onclick=close;card.querySelector("#igclose2").onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
 card.querySelectorAll("[data-dl]").forEach(btn=>{btn.onclick=async()=>{const url=btn.dataset.dl;const name=btn.dataset.dn||"photo.jpg";const orig=btn.textContent;btn.textContent="Downloading...";try{const r=await fetch(url,{mode:"cors"});const blob=await r.blob();const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);btn.textContent="Saved ✓";setTimeout(()=>{btn.textContent=orig},1500)}catch(e){window.open(url,"_blank");btn.textContent="Opened (save manually)";setTimeout(()=>{btn.textContent=orig},2000)}}});
 card.querySelector("#igcopy").onclick=async()=>{try{await navigator.clipboard.writeText(cap);say("Caption copied to clipboard")}catch(e){const t=card.querySelector("#igcap");t.select();document.execCommand("copy");say("Caption copied")}};
 card.querySelector("#igopen").onclick=()=>window.open("https://www.instagram.com/","_blank");
}

window.CRAdmin={open(A){root=A;ensureCss();if(!PW){login();return}if(!A.dataset.ready||!A.querySelector(".ad"))shell();hydrate();startPoll();render();refreshAna()},preview:{invoice:invoiceHTML,slip:slipHTML,logo:logoSVG}};
})();
