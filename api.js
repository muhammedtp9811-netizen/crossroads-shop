import {getStore} from "@netlify/blobs";
import crypto from "node:crypto";
export const config={path:"/api/*"};
const E=process.env, WA=E.WA_NUMBER||"918281036836";
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json"}});
const cut=(s,n)=>String(s??"").slice(0,n);
export default async(req)=>{
  const db=getStore("shop"), path=new URL(req.url).pathname.replace(/^\/api\/?/,"");
  const get=async(k,d)=>(await db.get(k,{type:"json"}))??d;
  const admin=()=>E.ADMIN_PASSWORD&&req.headers.get("x-admin")===E.ADMIN_PASSWORD;
  const b=req.method==="POST"?await req.json().catch(()=>({})):{};
  async function notify(t){
    if(!E.CALLMEBOT_KEY)return;
    const h=new Date().toISOString().slice(0,13), rl=await get("rl",{h:"",n:0});
    if(rl.h!==h){rl.h=h;rl.n=0}
    if(rl.n>=80)return;
    rl.n++; await db.setJSON("rl",rl);
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${WA}&apikey=${E.CALLMEBOT_KEY}&text=${encodeURIComponent(t)}`).catch(()=>{});
  }
  if(path==="products"&&req.method==="GET")return J(await get("products",[]));
  if(path==="products"&&req.method==="POST"){
    if(!admin())return J({error:"Wrong password"},401);
    await db.setJSON("products",Array.isArray(b.products)?b.products:[]);return J({ok:1});
  }
  if(path==="admin"&&req.method==="GET"){
    if(!admin())return J({error:"Wrong password"},401);
    return J({orders:await get("orders",[]),messages:await get("messages",[])});
  }
  if(path==="event"){
    const L={open:"👀 Someone opened your store",view:"🛍️ Viewing: ",cart:"➕ Added to cart: ",buy:"💳 Going to pay: "};
    if(L[b.type])await notify("Crossroads\n"+L[b.type]+cut(b.name,80));
    return J({ok:1});
  }
  if(path==="message"){
    const m={name:cut(b.name,60),contact:cut(b.contact,80),text:cut(b.text,800),t:new Date().toISOString()};
    if(!m.text)return J({error:"Write a message first."},400);
    const all=await get("messages",[]);all.unshift(m);await db.setJSON("messages",all.slice(0,200));
    await notify(`✉️ New message\n${m.name} (${m.contact})\n${m.text}`);return J({ok:1});
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
    orders.unshift({id:o.id,lines,total,paid:false,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300)});
    await db.setJSON("orders",orders.slice(0,500));
    return J({order:o.id,amount:o.amount,key:E.RAZORPAY_KEY_ID});
  }
  if(path==="pay/verify"){
    const sig=crypto.createHmac("sha256",E.RAZORPAY_KEY_SECRET||"").update(b.order_id+"|"+b.payment_id).digest("hex");
    if(sig!==b.signature)return J({error:"Payment could not be verified."},400);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.order_id);
    if(o&&!o.paid){o.paid=true;o.pay=cut(b.payment_id,40);await db.setJSON("orders",orders);
      await notify(`✅ PAID ₹${o.total}\n${o.lines.join("\n")}\n\n${o.name}\n${o.phone}\n${o.address}`);}
    return J({ok:1});
  }
  return J({error:"Not found"},404);
};
