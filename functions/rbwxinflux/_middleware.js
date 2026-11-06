// Password gate for /rbwxinflux. The password lives in Cloudflare (Settings → Variables): BRIEFER_RBWXINFLUX_PASSWORD
// The gate page carries the share-preview tags, so pasted links still show the St Michael preview.
const COOKIE = "briefer_rbwxinflux";
const PATH = "/rbwxinflux";

async function token(secret) {
  const data = new TextEncoder().encode(secret + "|briefer|rbwxinflux");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function same(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

export async function onRequest({ request, env, next }) {
  const pass = env.BRIEFER_RBWXINFLUX_PASSWORD;
  if (!pass) return new Response("This brief is locked and its password hasn’t been set yet.", { status: 503 });
  const url = new URL(request.url);
  const want = await token(pass);
  const jar = request.headers.get("Cookie") || "";
  const have = (jar.match(new RegExp(`${COOKIE}=([a-f0-9]+)`)) || [])[1] || "";
  if (have && same(have, want)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    out.headers.set("Cache-Control", "private, no-store");
    return out;
  }
  if (request.method === "POST") {
    const form = await request.formData();
    if (same(String(form.get("password") || ""), pass)) {
      return new Response(null, { status: 303, headers: {
        Location: url.pathname.startsWith(PATH) ? url.pathname : PATH + "/",
        "Set-Cookie": `${COOKIE}=${want}; Path=${PATH}; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      }});
    }
    return gate(true);
  }
  return gate(false);
}

function gate(wrong) {
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>briefer · RBW Systems × Influx</title>
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="description" content="The brief for RBW Systems and Guardian, built as an instrument. Play it. Made by Discussed Inc.">
<meta property="og:type" content="website"><meta property="og:site_name" content="briefer by Discussed Inc.">
<meta property="og:title" content="briefer · RBW Systems × Influx">
<meta property="og:description" content="The brief for RBW Systems and Guardian, built as an instrument. Play it. Made by Discussed Inc.">
<meta property="og:image" content="https://briefer.discussedinc.com/assets/og-rbwxinflux.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://briefer.discussedinc.com/assets/og-rbwxinflux.jpg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icon-32.png"><link rel="apple-touch-icon" href="/assets/icon-180.png">
<style>
@font-face{font-family:FS;src:url(/assets/fonts/funnel-sans-latin-wght-normal.woff2) format("woff2");font-weight:300 800}
@font-face{font-family:FD;src:url(/assets/fonts/funnel-display-latin-wght-normal.woff2) format("woff2");font-weight:300 800}
@font-face{font-family:DT;src:url(/assets/fonts/doto-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:radial-gradient(ellipse at 40% 40%,#16191D,#08090B 70%);color:#fff;font-family:FS,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px}
.w{display:flex;align-items:center;gap:56px;max-width:860px}
img{height:380px;flex:none}
.k{font-family:DT;font-weight:800;color:#FF9A26;font-size:15px;letter-spacing:.03em}
h1{font-family:FD;font-weight:600;font-size:56px;letter-spacing:-.04em;margin:6px 0 4px;line-height:1}
p{color:#9AA2A8;font-size:16px;line-height:1.5;margin:0 0 22px}
form{display:flex;gap:8px}
input{flex:1;min-width:0;font:inherit;font-size:16px;color:#fff;background:#111418;border:1px solid #2A3036;border-radius:10px;padding:12px 14px;outline:none}
input:focus{border-color:#FF9A26}
button{font:inherit;font-size:15px;font-weight:600;color:#0B0C0E;background:#FF9A26;border:0;border-radius:10px;padding:0 18px;cursor:pointer}
.err{color:#FF8F84;font-size:14px;margin:10px 0 0;min-height:20px}
.c{margin-top:28px;font-size:12px;color:#5E666D}.c a{color:#8A939B}
@media (max-width:640px){.w{flex-direction:column;gap:20px;text-align:center}img{height:200px}h1{font-size:44px}}
</style></head><body><main class="w">
<img src="/assets/st-michael.png" alt="Discussed Inc.">
<div><div class="k">RBW SYSTEMS × INFLUX</div><h1>briefer</h1>
<p>The brief, built as an instrument. This one’s private, so you’ll need the password.</p>
<form method="post"><input type="password" name="password" placeholder="Password" autocomplete="current-password" autofocus aria-label="Password"><button>Play</button></form>
<p class="err">${wrong ? "Not quite. Try again, or ask Marcus." : ""}</p>
<div class="c">Made by <a href="https://discussedinc.com">Discussed Inc.</a></div></div>
</main></body></html>`;
  return new Response(html, { status: wrong ? 401 : 200, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } });
}
