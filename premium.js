/* Crossroads: full product page (replaces the popup). Loads after the main script. */
(()=>{
const el=document.createElement("section");el.className="pg";el.id="prod";el.hidden=true;$("shop").after(el);
let sy=0,tm=null,wasP=false;const R0=route,T0=document.title;
openP=id=>{sy=scrollY;location.hash="#product/"+id};
route=function(){const m=/^#product\/(\d+)$/.exec(location.hash);clearInterval(tm);
 if(!m){el.hidden=true;wasP=false;document.title=T0;return R0()}
 ["shop","about","contact","admin"].forEach(i=>$(i).hidden=true);$("foot").hidden=false;el.hidden=false;cats();show(+m[1]);scrollTo(0,0);wasP=true};
addEventListener("hashchange",()=>{if(location.hash.startsWith("#product/"))route();else{const b=wasP;el.hidden=true;wasP=false;clearInterval(tm);document.title=T0;if(b&&!location.hash)requestAnimationFrame(()=>scrollTo(0,sy))}});
$("cats").addEventListener("click",e=>{if(e.target.closest("button.chip")&&location.hash.startsWith("#product/")){history.pushState(null,"",location.pathname);route()}},true);
function show(id){const p=P.find(x=>x.id===id);
 if(!p){el.innerHTML='<div class="wrap pp"><div class="empty">This product is not available.<br><a href="./">Back to the shop</a></div></div>';return}
 cur=p;ev("view",p.n,1);document.title=p.n+" | Crossroads Shopping";
 const S=p.s&&p.s.length?p.s:["One size"],im=productImages(p),off=+p.o>p.p?Math.round((1-p.p/p.o)*100):0,rel=P.filter(x=>x.id!==p.id&&x.c===p.c).slice(0,4);
 let sz=S.length===1?S[0]:null,q=1,g=0;
 el.innerHTML=`<div class="wrap pp"><nav class="crumb"><a href="./">Home</a><i>/</i><span>${esc(p.c||"Shop")}</span></nav>
<div class="pgrid"><div class="gal"><div class="gmain" id="gmain">${im.length?im.map((s,i)=>`<img src="${esc(s)}" alt="${esc(p.n)} photo ${i+1}" class="${i?"":"on"}">`).join(""):`<div class="gnone">${esc(p.n)}</div>`}${p.sold?'<span class="badge">Sold out</span>':""}${im.length>1?'<button class="ga l" data-a="-1" aria-label="Previous photo">‹</button><button class="ga r" data-a="1" aria-label="Next photo">›</button>':""}</div>
${im.length>1?`<div class="gth">${im.map((s,i)=>`<button type="button" data-t="${i}" class="${i?"":"on"}" aria-label="Photo ${i+1}"><img src="${esc(s)}" alt=""></button>`).join("")}</div>`:""}</div>
<div class="info"><h1>${esc(p.n)}</h1><div class="price big">${money(p.p)}${+p.o?`<s>${money(p.o)}</s>`:""}${off?`<em class="off">${off}% off</em>`:""}</div>
${p.d?`<p class="desc">${esc(p.d)}</p>`:""}
<div><b>${S.length===1?"Size":"Select size"}</b><div class="sizes" id="psz">${S.map(s=>`<button type="button" data-s="${esc(s)}" aria-pressed="${s===sz}">${esc(s)}</button>`).join("")}</div></div>
<div class="qty"><b>Quantity</b><div class="q"><button type="button" data-q="-1" aria-label="Less">−</button><span id="pq">1</span><button type="button" data-q="1" aria-label="More">+</button></div></div>
<div class="err" id="pe2" role="alert"></div>
<div class="acts"><button class="btn dk" id="pbuy" ${p.sold?"disabled":""}>${p.sold?"Sold out":"Buy now"}</button><button class="btn alt" id="padd" ${p.sold?"disabled":""}>Add to cart</button></div>
<ul class="trust"><li>Secure UPI and online payment</li><li>Delivered to your door</li><li>Questions? <a href="${igl}" target="_blank" rel="noopener">Message us on Instagram</a></li></ul>
<button class="link" id="pshare" type="button" style="align-self:flex-start">Share this product</button></div></div>
${rel.length?`<h2 class="rh">You may also like</h2><div class="grid rg">${rel.map(x=>`<a class="card" href="#product/${x.id}"><div class="ph" style="${bg(x)}">${x.img?"":esc(x.n)}</div><b>${esc(x.n)}</b><div class="price">${money(x.p)}</div></a>`).join("")}</div>`:""}</div>
<div class="sbar"><div class="price">${money(p.p)}</div><button class="btn dk" id="pbar" ${p.sold?"disabled":""}>${p.sold?"Sold out":"Add to cart"}</button></div>`;
 const sl=[...el.querySelectorAll("#gmain img")],th=[...el.querySelectorAll(".gth button")],gm=$("gmain");
 const go=i=>{if(!sl.length)return;g=(i+sl.length)%sl.length;sl.forEach((s,k)=>s.classList.toggle("on",k===g));th.forEach((b,k)=>b.classList.toggle("on",k===g))};
 const auto=on=>{clearInterval(tm);if(on&&sl.length>1&&!matchMedia("(prefers-reduced-motion:reduce)").matches)tm=setInterval(()=>go(g+1),3500)};auto(1);
 const add=()=>{if(!sz){$("pe2").textContent="Choose a size to continue.";$("psz").scrollIntoView({block:"center",behavior:"smooth"});return false}
  const k=p.id+"|"+sz,f=cart.find(i=>i.k===k);if(f)f.q+=q;else cart.push({k,id:p.id,n:p.n,p:p.p,s:sz,q});save();render();ev("cart",p.n+" ("+sz+")");return true};
 let x0=null;gm.ontouchstart=e=>{x0=e.touches[0].clientX;auto(0)};gm.ontouchend=e=>{if(x0!==null){const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)go(g+(d<0?1:-1));x0=null}auto(1)};
 el.onclick=e=>{const t=e.target.closest("[data-t]"),s=e.target.closest("[data-s]"),n=e.target.closest("[data-q]"),a=e.target.closest("[data-a]"),id=(e.target.closest("button")||{}).id;
  if(t){go(+t.dataset.t);auto(1)}if(a){go(g+ +a.dataset.a);auto(1)}
  if(s){sz=s.dataset.s;el.querySelectorAll("#psz button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===sz));$("pe2").textContent=""}
  if(n){q=Math.max(1,Math.min(10,q+ +n.dataset.q));$("pq").textContent=q}
  if((id==="padd"||id==="pbar")&&add())openCart();
  if(id==="pbuy"&&add()){ev("buy",p.n);openCart()}
  if(id==="pshare"){if(navigator.share)navigator.share({title:p.n,url:location.href}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(()=>{$("pshare").textContent="Link copied"})}};
}
})();
