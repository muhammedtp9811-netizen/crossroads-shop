/* One canonical site address for every server-rendered URL. Set SITE_URL in
   Netlify environment variables when the shop is moved to a custom domain. */
export const SITE = String(process.env.SITE_URL || "https://crossroads-shopping.netlify.app").replace(/\/+$/, "");
export const abs = path => SITE + (String(path || "").startsWith("/") ? path : "/" + String(path || ""));
