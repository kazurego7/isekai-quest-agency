import test from "node:test";
import assert from "node:assert/strict";
const base=process.env.TEST_PRODUCTION_URL;
if(!base || !["127.0.0.1","localhost"].includes(new URL(base).hostname)) throw new Error("ローカルの公開用ビルドURLを指定してください。");
test("公開用ビルドでは検証用アカウントに切り替えられない",async()=> {
  const headers={cookie:"quest_test_actor=reception; __sites_local_auth=1"};
  const root=await fetch(base,{headers});
  assert.equal(root.status,200);
  const html=await root.text();
  assert.ok(html.includes("ChatGPTでログイン"));
  assert.ok(!html.includes("ローカル検証"));
  const session=await fetch(base+"/api/session",{headers});
  assert.deepEqual(await session.json(),{user:null});
  const setup=await fetch(base+"/__test/signin?actor=reception",{headers,redirect:"manual"});
  assert.equal(setup.status,404);
  assert.equal(setup.headers.get("set-cookie"),null);
  for(const path of ["/api/requests","/api/quests","/api/adventurers"]) assert.equal((await fetch(base+path,{headers})).status,401);
});
