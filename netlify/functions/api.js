import {getStore} from "@netlify/blobs";
import crypto from "node:crypto";
export const config={path:"/api/*"};
const E=process.env, WA=E.WA_NUMBER||"918281036836";
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json"}});
const cut=(s,n)=>String(s??"").slice(0,n);
export default async(req,context)=>{
  const db=getStore("shop"), path=new URL(req.url).pathname.replace(/^\/api\/?/,"");
  const get=async(k,d)=>(await db.get(k,{type:"json"}))??d;
  const admin=()=>E.ADMIN_PASSWORD&&req.headers.get("x-admin")===E.ADMIN_PASSWORD;
  const b=req.method==="POST"?await req.json().catch(()=>({})):{};
  const allow=async()=>{const h=new Date().toISOString().slice(0,13),rl=await get("rl",{h:"",n:0});if(rl.h!==h){rl.h=h;rl.n=0}if(rl.n>=80)return false;rl.n++;await db.setJSON("rl",rl);return true};
  const mail=(subject,text)=>fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+E.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:"Crossroads <onboarding@resend.dev>",to:[E.ALERT_EMAIL||"producingmj@gmail.com"],subject:cut(subject,80),text})}).catch(()=>{});
  async function notify(t,imp){
    if(!E.DISCORD_WEBHOOK&&!E.FAST2SMS_KEY&&!E.NTFY_TOPIC&&!E.RESEND_API_KEY&&!E.CALLMEBOT_KEY&&!(E.TELEGRAM_BOT_TOKEN&&E.TELEGRAM_CHAT_ID))return;
    if(!await allow())return;
    if(imp&&E.FAST2SMS_KEY)await fetch("https://www.fast2sms.com/dev/bulkV2?"+new URLSearchParams({authorization:E.FAST2SMS_KEY,route:"q",message:t.replace(/[^\x20-\x7E\n]/g,"").slice(0,150),flash:"0",numbers:E.SMS_TO||"8281036836"})).catch(()=>{});
    if(E.DISCORD_WEBHOOK)await fetch(E.DISCORD_WEBHOOK,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:t})}).catch(()=>{});
    if(E.NTFY_TOPIC)await fetch("https://ntfy.sh/"+encodeURIComponent(E.NTFY_TOPIC),{method:"POST",headers:{Title:"Crossroads"},body:t}).catch(()=>{});
    if(imp&&E.RESEND_API_KEY)await mail(t.split("\n").filter(Boolean)[0],t);
    if(E.CALLMEBOT_KEY)await fetch(`https://api.callmebot.com/whatsapp.php?phone=${WA}&apikey=${E.CALLMEBOT_KEY}&text=${encodeURIComponent(t)}`).catch(()=>{});
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
    await db.setJSON("settings",{upi:cut(b.upi,80),name:cut(b.name,60),qr:cut(b.qr,400000)});return J({ok:1});
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
    orders.unshift({id:"upi"+Date.now(),lines,total,paid:false,manual:true,utr,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300)});
    await db.setJSON("orders",orders.slice(0,500));
    await notify(`💰 UPI payment claimed ₹${total}\nTxn ID: ${utr}\n${lines.join("\n")}\n\n${c.name}\n${c.phone}\n${c.address}\nCheck your bank app, then mark it paid in #admin.`,true);
    return J({ok:1});
  }
  if(path==="orders/paid"){
    if(!admin())return J({error:"Wrong password"},401);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.id);
    if(o){o.paid=true;await db.setJSON("orders",orders)}return J({ok:1});
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
    orders.unshift({id:o.id,lines,total,paid:false,t:new Date().toISOString(),name:cut(c.name,60),phone:cut(c.phone,20),email:cut(c.email,80),address:cut(c.address,300)});
    await db.setJSON("orders",orders.slice(0,500));
    return J({order:o.id,amount:o.amount,key:E.RAZORPAY_KEY_ID});
  }
  if(path==="pay/verify"){
    const sig=crypto.createHmac("sha256",E.RAZORPAY_KEY_SECRET||"").update(b.order_id+"|"+b.payment_id).digest("hex");
    if(sig!==b.signature)return J({error:"Payment could not be verified."},400);
    const orders=await get("orders",[]),o=orders.find(x=>x.id===b.order_id);
    if(o&&!o.paid){o.paid=true;o.pay=cut(b.payment_id,40);await db.setJSON("orders",orders);
      await notify(`✅ PAID ₹${o.total}\n${o.lines.join("\n")}\n\n${o.name}\n${o.phone}\n${o.address}`,true);}
    return J({ok:1});
  }
  return J({error:"Not found"},404);
};
