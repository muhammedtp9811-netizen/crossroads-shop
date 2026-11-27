/* Generates one build version from the actual site source.
   Netlify runs this before publishing, so every deploy gives every visitor a new
   version automatically. The inline checker line is ignored when hashing so the
   generated version is stable and does not create a loop. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const files = [
  "index.html",
  "admin.js",
  "chat.js",
  "feedback.js",
  "build-version.js",
  "netlify.toml",
  "netlify/functions/api.js",
  "netlify/functions/site.js",
  "netlify/functions/product-page.js",
  "netlify/functions/sitemap.js",
  "robots.txt",
  "sitemap.xml"
];

const hash = crypto.createHash("sha256");
for (const rel of files) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  let body = fs.readFileSync(file, "utf8");
  if (rel === "index.html") {
    body = body.replace(/var V="[^"]*"/, 'var V="__BUILD_VERSION__"');
  }
  hash.update(rel + "\0" + body + "\0");
}
const version = "v" + hash.digest("hex").slice(0, 10);
fs.writeFileSync(path.join(root, "build.json"), '{"v":"' + version + '"}\n');

const indexFile = path.join(root, "index.html");
if (fs.existsSync(indexFile)) {
  const html = fs.readFileSync(indexFile, "utf8");
  fs.writeFileSync(indexFile, html.replace(/var V="[^"]*"/, 'var V="' + version + '"'));
}
console.log("Build version:", version);
