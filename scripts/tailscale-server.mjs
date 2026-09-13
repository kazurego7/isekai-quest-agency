import { createServer, request as httpRequest } from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { brotliCompressSync, gzipSync, createGzip, constants } from "node:zlib";
import { pipeline } from "node:stream";
import { projectRoot } from "./sites-env.mjs";

const buildRoot = path.join(projectRoot, ".local/tailscale-build");
const marker = JSON.parse(await readFile(path.join(buildRoot, "runtime.json"), "utf8"));
if (marker.basePath !== "/isekai" || marker.local !== true) throw new Error("Run npm run build:tailscale first.");
const base = marker.basePath;
const tailscale = process.platform === "win32" ? "C:/Program Files/Tailscale/tailscale.exe" : "tailscale";
const status = JSON.parse(execFileSync(tailscale, ["status", "--json"], { encoding: "utf8" }));
const tailHost = status.Self?.DNSName?.replace(/\.$/, "");
if (!tailHost) throw new Error("Tailscale host is unavailable.");
const allowedHosts = new Set(["localhost", "127.0.0.1", "[::1]", tailHost]);
const loopbacks = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const actors = { reception: "検証用受付", general: "検証用冒険者A", general2: "検証用冒険者B", general3: "担当外の冒険者" };
const mime = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".jpg": "image/jpeg" };
const assetCache = new Map();
const clientRoot = path.join(buildRoot, "client");
function accepts(header, encoding) {
  return (header || "").split(",").some(part => {
    const [name, ...params] = part.trim().split(";");
    const quality = params.find(p => p.trim().startsWith("q="));
    return name === encoding && (!quality || Number(quality.trim().slice(2)) > 0);
  });
}
async function staticAsset(urlPath) {
  if (assetCache.has(urlPath)) return assetCache.get(urlPath);
  const parts = decodeURIComponent(urlPath).split("/");
  if (parts.some(p => p.startsWith(".") || p.includes("\\"))) return null;
  // Vinext puts hashed files under client/isekai/_next, but public files at client/.
  const file = path.resolve(clientRoot, ...(urlPath.startsWith("/_next/") ? [base.slice(1)] : []), ...parts.filter(Boolean));
  if (!file.startsWith(clientRoot + path.sep) || !mime[path.extname(file)]) return null;
  let info;
  try { info = await stat(file); } catch (error) { if (error.code === "ENOENT") return null; throw error; }
  if (!info.isFile()) return null;
  const bytes = await readFile(file);
  const type = mime[path.extname(file)];
  const compressible = /javascript|css|svg/.test(type);
  const asset = { bytes, type, etag: '"' + createHash("sha256").update(bytes).digest("hex") + '"',
    br: compressible ? brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }) : null,
    gzip: compressible ? gzipSync(bytes) : null };
  assetCache.set(urlPath, asset);
  return asset;
}
const worker = spawn(process.execPath, ["--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js", "dev", "--config", path.join(buildRoot, "server/wrangler.json"), "--local", "--persist-to", path.join(projectRoot, ".wrangler/state"), "--ip", "127.0.0.1", "--inspector-port", "0", "--port", "5178"], { cwd: projectRoot, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
worker.stdout.on("data", chunk => { if (!chunk.toString().includes("│")) process.stdout.write(chunk); });
worker.stderr.pipe(process.stderr);
let stopping = false;
worker.on("exit", code => { if (!stopping) { console.error("Local Worker exited:", code); process.exit(1); } });
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const origin = `${url.hostname === tailHost ? "https" : "http"}://${url.host}`;
    if (!allowedHosts.has(url.hostname) || !loopbacks.has(req.socket.remoteAddress)) { res.writeHead(403).end(); return; }
    if ((req.headers.origin && req.headers.origin !== origin) || req.headers["sec-fetch-site"] === "cross-site") { res.writeHead(403).end(); return; }
    if (url.pathname === "/" || url.pathname === base) { res.writeHead(302, { Location: base + "/", "Cache-Control": "no-store" }).end(); return; }
    if (!url.pathname.startsWith(base + "/")) { res.writeHead(404).end(); return; }
    const route = url.pathname.slice(base.length);
    if (["/__test/signin", "/signin-with-chatgpt", "/__test/signout", "/signout-with-chatgpt"].includes(route)) {
      if (req.method !== "GET") { res.writeHead(405).end(); return; }
      const signout = route.includes("signout");
      const actor = url.searchParams.get("actor") || "general";
      if (!signout && !Object.hasOwn(actors, actor)) { res.writeHead(400).end(); return; }
      res.writeHead(302, { Location: base + "/", "Cache-Control": "private, no-store", "Set-Cookie": `quest_test_actor=${signout ? "" : actor}; Path=${base}; HttpOnly; SameSite=Lax${signout ? "; Max-Age=0" : ""}${url.hostname === tailHost ? "; Secure" : ""}` }).end(); return;
    }
    const asset = (req.method === "GET" || req.method === "HEAD") ? await staticAsset(route) : null;
    if (asset) {
      const immutable = /^\/_next\/static\/.+[-.][\w-]{8,}\.(js|css|woff2)$/.test(route);
      const headers = { "Content-Type": asset.type, "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate", ETag: asset.etag, Vary: "Accept-Encoding", "X-Content-Type-Options": "nosniff" };
      if (req.headers["if-none-match"] === asset.etag) { res.writeHead(304, headers).end(); return; }
      const encoding = asset.br && accepts(req.headers["accept-encoding"], "br") ? "br" : asset.gzip && accepts(req.headers["accept-encoding"], "gzip") ? "gzip" : null;
      const body = encoding ? asset[encoding] : asset.bytes;
      if (encoding) headers["Content-Encoding"] = encoding;
      headers["Content-Length"] = body.length;
      res.writeHead(200, headers).end(req.method === "HEAD" ? undefined : body); return;
    }
    const headers = { ...req.headers, "accept-encoding": "identity" };
    for (const name of Object.keys(headers)) if (name.startsWith("oai-authenticated-user-") || name.startsWith("x-forwarded-") || ["forwarded", "connection", "transfer-encoding"].includes(name)) delete headers[name];
    // Origin was checked against the external URL above; Worker receives HTTP locally.
    if (headers.origin) headers.origin = url.origin;
    const actor = (req.headers.cookie || "").split(";").map(p => p.trim()).find(p => p.startsWith("quest_test_actor="))?.slice(17);
    if (Object.hasOwn(actors, actor || "")) {
      headers["oai-authenticated-user-id"] = "local-" + actor;
      headers["oai-authenticated-user-email"] = actor + "@sites.test";
      headers["oai-authenticated-user-full-name"] = encodeURIComponent(actors[actor]);
      headers["oai-authenticated-user-full-name-encoding"] = "percent-encoded-utf-8";
    }
    const upstream = httpRequest({ hostname: "127.0.0.1", port: 5178, method: req.method, path: req.url, headers }, response => {
      if (res.destroyed) { response.destroy(); return; }
      try {
      const responseHeaders = { ...response.headers, "cache-control": "private, no-store" };
      delete responseHeaders["transfer-encoding"];
      const compress = req.method !== "HEAD" && ![204,304].includes(response.statusCode) && /text\/|json|javascript/.test(responseHeaders["content-type"] || "") && accepts(req.headers["accept-encoding"], "gzip");
      if (compress) { delete responseHeaders["content-length"]; responseHeaders["content-encoding"] = "gzip"; responseHeaders.vary = [responseHeaders.vary, "Accept-Encoding"].filter(Boolean).join(", "); }
      res.writeHead(response.statusCode, responseHeaders);
      const done = error => { if (error) res.destroy(error); };
      if (compress) pipeline(response, createGzip({ flush: constants.Z_SYNC_FLUSH }), res, done);
      else pipeline(response, res, done);
      } catch (error) { response.destroy(); res.destroy(error); }
    });
    upstream.on("error", error => { console.error(error.message); if (!res.headersSent) res.writeHead(502); res.end(); });
    req.on("aborted", () => upstream.destroy());
    res.on("close", () => upstream.destroy());
    req.pipe(upstream);
  } catch (error) { console.error(error); if (!res.headersSent) res.writeHead(400); res.end(); }
});
for (let attempt = 0; attempt < 120; attempt++) {
  try { const ready = await fetch("http://127.0.0.1:5178/isekai/", { signal: AbortSignal.timeout(1000) }); if (ready.ok) break; } catch {}
  if (attempt === 119) { worker.kill(); throw new Error("Local Worker did not become ready."); }
  await new Promise(resolve => setTimeout(resolve, 500));
}
server.listen(5177, "127.0.0.1", () => console.log("Optimized Sites: http://127.0.0.1:5177/isekai/"));
server.on("error", error => { console.error(error); worker.kill(); process.exit(1); });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { stopping = true; server.close(); worker.kill(); process.exit(0); });
