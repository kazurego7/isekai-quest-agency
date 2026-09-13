import test from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { gunzipSync, brotliDecompressSync } from "node:zlib";
const base = "http://127.0.0.1:5177/isekai";
function raw(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = request(base + path, { headers }, res => {
      const chunks = []; res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }); req.on("error", reject); req.end();
  });
}
test("圧縮・静的キャッシュと私的レスポンスの分離", async () => {
  const html = await raw("/", { "accept-encoding": "gzip" });
  assert.equal(html.headers["content-encoding"], "gzip");
  assert.match(html.headers["cache-control"], /no-store/);
  const text = gunzipSync(html.body).toString();
  assert.ok(text.includes("ローカル検証")); assert.ok(!text.includes("@vite/client"));
  const asset = text.match(/(?:src|href)="(\/isekai\/_next\/static\/[^" ]+\.js)"/)[1].slice("/isekai".length);
  const compressed = await raw(asset, { "accept-encoding": "br" });
  assert.equal(compressed.status, 200); assert.equal(compressed.headers["content-encoding"], "br");
  assert.match(compressed.headers["cache-control"], /immutable/);
  assert.ok(brotliDecompressSync(compressed.body).length > compressed.body.length);
  assert.equal((await raw(asset, { "if-none-match": compressed.headers.etag })).status, 304);
  assert.equal((await raw(asset, { "accept-encoding": "br;q=0,gzip;q=0" })).headers["content-encoding"], undefined);
  const session = await raw("/api/session", { "oai-authenticated-user-id": "local-reception", "oai-authenticated-user-email": "reception@sites.test" });
  assert.deepEqual(JSON.parse(session.body), { user: null });
  assert.match(session.headers["cache-control"], /no-store/);
  assert.equal((await raw("/api/session", { host: "untrusted.example" })).status, 403);
  assert.equal((await raw("/__test/signin?actor=reception", { origin: "https://untrusted.example" })).status, 403);
});
test("途中で切断された接続がサーバー全体を停止させない", async () => {
  await Promise.all(Array.from({ length: 10 }, () => new Promise(resolve => {
    const req = request(base + "/", res => { res.destroy(); resolve(); });
    req.on("error", resolve); req.end();
  })));
  assert.equal((await fetch(base + "/api/session")).status, 200);
});
