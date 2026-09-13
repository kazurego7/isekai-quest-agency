import { publishFixture } from './publish-fixture.mjs';
import test from "node:test";
import assert from "node:assert/strict";
import { deriveViewStatus } from "../lib/request-status.js";
const base = process.env.TEST_BASE_URL ?? "http://localhost:5177";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("ローカル検証専用です。");
async function call(actor, path, method = "GET", body, status = 200) {
  if(path==="/api/quests"&&method==="POST")body=await publishFixture(base,body);
  const response = await fetch(base + path, { method, headers: { cookie: `quest_test_actor=${actor}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json(); assert.equal(response.status, status, JSON.stringify(data)); return data;
}
test("提案の往復で、受信側は確認前・送信側は合意待ちとなり、直前の条件を比較できる", async () => {
  const original = { formatVersion:1,categoryId:"gather",regionId:null,deadlineMode:"none",deadlineDate:null,rewardMode:"amount",rewardAmount:1000,attachments:[],title: "差分検証・薬草の採集", purpose: "診療所へ薬草を届ける", location: "北の森", deadline: "明日", reward: "金貨10枚", risk: "護衛なし", requesterNote: "午前中に出発" };
  let { request } = await call("general3", "/api/requests", "POST", original, 201);
  const path = `/api/requests/${request.id}`;
  assert.equal(request.previousConditions, null);
  assert.equal(deriveViewStatus(request, "requester"), "合意待ち");
  assert.equal(deriveViewStatus(request, "reception"), "確認前");
  const proposal = { ...original, title: "差分検証・森の薬草", reward: "金貨20枚", requesterNote: "" };
  ({ request } = await call("reception", path, "PATCH", { mode: "adjust", fields: proposal, reason: "護衛費を追加" }));
  assert.deepEqual(request.previousConditions, original);
  assert.equal(deriveViewStatus(request, "requester"), "確認前");
  assert.equal(deriveViewStatus(request, "reception"), "合意待ち");
  assert.equal(request.requesterNote, null);
  // A repeated proposal must not erase the recipient's last submitted conditions.
  proposal.reward = "金貨25枚";
  ({ request } = await call("reception", path, "PATCH", { mode: "adjust", fields: proposal, reason: "費用を再確認" }));
  assert.deepEqual(request.previousConditions, original);
  const counter = { ...proposal, reward: "金貨22枚", location: "西の森" };
  ({ request } = await call("general3", path, "PATCH", { mode: "adjust", fields: counter, reason: "場所の変更を希望" }));
  assert.deepEqual(request.previousConditions, { ...proposal, requesterNote: null });
  assert.equal(deriveViewStatus(request, "reception"), "確認前");
  assert.equal(deriveViewStatus(request, "requester"), "合意待ち");
  const listed = (await call("reception", "/api/requests")).requests.find(x => x.id === request.id);
  assert.equal(deriveViewStatus(listed, "reception"), "確認前");
  await call("general2", path, "GET", undefined, 404);
  ({ request } = await call("reception", path, "PATCH", { mode: "agree" }));
  for (const role of ["requester", "reception"]) assert.equal(deriveViewStatus(request, role), "合意済み");
  const { quest } = await call("reception", "/api/quests", "POST", { requestId: request.id }, 201);
  assert.ok(quest);
  request = (await call("general3", path)).request;
  assert.equal(deriveViewStatus(request, "requester"), "クエスト化済み");
});
