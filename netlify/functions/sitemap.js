import {getStore} from "@netlify/blobs";
import {SITE} from "./site.js";
const xe = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));

function lastmod(v) {
  if (v === undefined || v === null || v === "") return "";
  const s = String(v), num = /^\d+$/.test(s) ? +s : NaN;
  const d = Number.isFinite(num) ? new Date(num < 1e12 ? num * 1000 : num) : new Date(s);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function buildSitemap(products) {
  const urls = ['<url><loc>' + xe(SITE + "/") + '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>'];
  for (const p of (Array.isArray(products) ? products : [])) {
    if (!p || p.hid || p.id === undefined || p.id === null || p.id === "") continue;
    const loc = SITE + "/p/" + encodeURIComponent(String(p.id));
    const lm = lastmod(p.t || p.updated || p.ut || p.date);
    urls.push("<url><loc>" + xe(loc) + "</loc>" + (lm ? "<lastmod>" + lm + "</lastmod>" : "") +
      "<changefreq>weekly</changefreq><priority>0.8</priority></url>");
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") + "\n</urlset>\n";
}

export default async function sitemap() {
  const db = getStore({name: "shop", consistency: "strong"});
  const products = await db.get("products", {type: "json"}).catch(() => []);
  const xml = buildSitemap(products);
  return new Response(xml, {status: 200, headers: {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, max-age=0, must-revalidate",
    "netlify-cdn-cache-control": "public, max-age=3600, stale-while-revalidate=86400"
  }});
}
