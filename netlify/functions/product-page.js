import {getStore} from "@netlify/blobs";

const SITE = "https://crossroads-shopping.netlify.app";
const OG_IMAGE = SITE + "/og-image.png";
const CACHE = {
  "cache-control": "public, max-age=0, must-revalidate",
  "netlify-cdn-cache-control": "public, max-age=0, must-revalidate, stale-while-revalidate=86400"
};
const HTML_HEADERS = {"content-type": "text/html; charset=utf-8", ...CACHE};

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cut = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const jsStr = s => JSON.stringify(String(s)).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

function idFrom(req) {
  const u = new URL(req.url), parts = u.pathname.split("/").filter(Boolean), i = parts.indexOf("p");
  if (i >= 0 && parts[i + 1]) {
    try { return decodeURIComponent(parts[i + 1]); } catch (e) { return parts[i + 1]; }
  }
  return u.searchParams.get("id") || u.searchParams.get("pid") || "";
}

function replaceTag(html, re, tag) {
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, tag + "</head>");
}

function productSchema(p, id, canonical, title, desc, images) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title.replace(/\s*\|\s*Crossroads Shopping$/, ""),
    "description": desc,
    "sku": String(id),
    "url": canonical,
    "image": images,
    "brand": {"@type": "Brand", "name": "Crossroads Shopping"},
    "offers": {
      "@type": "Offer",
      "url": canonical,
      "priceCurrency": "INR",
      "price": Math.max(0, +p.p || 0),
      "availability": p.sold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    }
  };
}

export default async function productPage(req) {
  if (req.method && !/^(GET|HEAD)$/.test(req.method)) {
    return new Response("Method Not Allowed", {status: 405, headers: {allow: "GET, HEAD"}});
  }
  const id = idFrom(req), canonical = SITE + "/p/" + encodeURIComponent(id);

  // Fetch the published static shell directly: never request /p/<id> here, or we would loop.
  let source;
  try {
    const res = await fetch(new URL("/index.html", req.url), {cache: "no-store"});
    source = await res.text();
  } catch (e) {
    source = '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><main><h1>Crossroads Shopping</h1></main></body></html>';
  }

  const store = getStore({name: "shop", consistency: "strong"});
  const products = await store.get("products", {type: "json"}).catch(() => []);
  const product = (Array.isArray(products) ? products : []).find(p => p && String(p.id) === String(id));

  let title, desc, ogType, schema = null;
  if (product) {
    const name = cut(product.n || product.sn || "Product", 120) || "Product";
    title = name + " | Crossroads Shopping";
    desc = cut(product.d || (name + ". Free delivery across India within 5 days."), 300);
    ogType = "product";
    const raw = Array.isArray(product.images) && product.images.length ? product.images : (product.img ? [product.img] : []);
    const images = raw.map(x => String(x)).filter(Boolean).slice(0, 4).map(x =>
      /^https?:\/\//i.test(x) ? x : (x.startsWith("/") ? SITE + x : SITE + "/" + x));
    schema = productSchema(product, id, canonical, title, desc, images);
  } else {
    title = "Product not found | Crossroads Shopping";
    desc = "This product is no longer available at Crossroads Shopping.";
    ogType = "website";
  }

  let out = source;
  const tags = [
    [/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`],
    [/<meta\s+[^>]*name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(desc)}">`],
    [/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${esc(canonical)}">`],
    [/<meta\s+[^>]*property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${ogType}">`],
    [/<meta\s+[^>]*property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(title)}">`],
    [/<meta\s+[^>]*property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(desc)}">`],
    [/<meta\s+[^>]*property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${esc(canonical)}">`],
    [/<meta\s+[^>]*property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${OG_IMAGE}">`],
    [/<meta\s+[^>]*name=["']twitter:card["'][^>]*>/i, '<meta name="twitter:card" content="summary_large_image">'],
    [/<meta\s+[^>]*name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${esc(title)}">`],
    [/<meta\s+[^>]*name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${esc(desc)}">`],
    [/<meta\s+[^>]*name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${esc(canonical)}">`],
    [/<meta\s+[^>]*name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${OG_IMAGE}">`]
  ];
  if (!product) {
    tags.push([/<meta\s+[^>]*name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow">']);
    tags.push([/<meta\s+[^>]*name=["']cr:status["'][^>]*>/i, '<meta name="cr:status" content="Product not found">']);
  }
  for (const [re, tag] of tags) out = replaceTag(out, re, tag);

  // Do not leave a stale Product schema behind, then add the one for this URL.
  out = out.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    m => /"@type"\s*:\s*"Product"/i.test(m) ? "" : m);
  if (schema) out = out.replace(/<\/head>/i, ld(schema) + "</head>");

  // Make the shell render the requested product even before its own scripts boot.
  out = out.replace(/<script[^>]*>\s*window\.CR_PRERENDER_PID\s*=[\s\S]*?<\/script>/i, "");
  out = out.replace(/<head\b[^>]*>/i, m => m + `<script>window.CR_PRERENDER_PID = ${jsStr(id)};</script>`);

  return new Response(out, {status: 200, headers: HTML_HEADERS});
}
