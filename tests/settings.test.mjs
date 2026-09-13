import test from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL ?? "http://localhost:5177";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("ローカル検証専用です。");
const call = (actor, path, body) => fetch(base + path, {
  method: body ? "PATCH" : "GET",
  headers: { ...(actor ? { cookie: "quest_test_actor=" + actor } : {}), "Content-Type": "application/json" },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
test("外観設定は本人だけが更新でき、アカウントごとに保存される", async () => {
  const actor = "general", other = "general2";
  const before = (await (await call(actor, "/api/session")).json()).user;
  const otherBefore = (await (await call(other, "/api/session")).json()).user;
  try {
    for (const themePreference of ["light", "dark", "system"]) {
      assert.equal((await call(actor, "/api/settings", { themePreference })).status, 200);
      const saved = (await (await call(actor, "/api/session")).json()).user;
      assert.equal(saved.themePreference, themePreference);
      assert.equal((await (await call(other, "/api/session")).json()).user.themePreference, otherBefore.themePreference);
    }
    assert.equal((await call(null, "/api/settings", { themePreference: "dark" })).status, 401);
    assert.equal((await call(actor, "/api/settings", { themePreference: "invalid" })).status, 400);
    assert.equal((await call(actor, "/api/settings", { themePreference: "dark", id: otherBefore.id })).status, 400);
    assert.equal((await (await call(actor, "/api/session")).json()).user.themePreference, "system");
  } finally {
    assert.equal((await call(actor, "/api/settings", { themePreference: before.themePreference })).status, 200);
  }
});
