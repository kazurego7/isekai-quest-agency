import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { client } from "./api-client.mjs";

const baseUrl = process.env.TEST_BASE_URL;
const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL を専用のローカル検証環境に設定してください。");
const dbLocation = new URL(databaseUrl);
if (!["127.0.0.1", "localhost"].includes(dbLocation.hostname) || !dbLocation.pathname.endsWith("_test") ||
  (baseUrl && !["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname))) {
  throw new Error("テストにはローカル環境と、名前が _test で終わる専用DBが必要です。");
}
const db = new PrismaClient({ datasourceUrl: databaseUrl });
process.env.DATABASE_URL = databaseUrl;
const password = randomUUID();
const prefix = "qa_" + randomUUID().slice(0, 8);
const userIds = [];
const clients = {};
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=";
const report = { mode: "report", reportComment: "完了しました", checklist: [{ label: "成果確認", checked: true }], photos: [{ name: "成果.png", url: png }] };

async function expect(call, status = 200) {
  const response = await call;
  assert.equal(response.status, status, response.data?.error);
  return response.data;
}
async function login(call, loginId) {
  if (!baseUrl) {
    const user = await db.user.findUnique({ where: { userId: loginId },
      select: { id: true, userId: true, displayName: true, userType: true, role: true } });
    call.setUser(user);
    return;
  }
  const csrf = await expect(call("/api/auth/csrf"));
  await call("/api/auth/callback/credentials", "POST", new URLSearchParams({
    csrfToken: csrf.csrfToken, loginId, password, json: "true", callbackUrl: baseUrl,
  }));
  const session = await expect(call("/api/auth/session"));
  assert.equal(session.user.userId, loginId);
}
async function createQuest() {
  const { request } = await expect(clients.requester("/api/requests", "POST", { title: "テスト依頼", purpose: "検証" }), 201);
  await expect(clients.staff("/api/requests/" + request.id, "PATCH", { mode: "agree" }));
  const { quest } = await expect(clients.staff("/api/quests", "POST", {
    requestId: request.id, publishFields: { detail: "テスト", slots: "2" },
    checklist: [{ label: "成果確認", note: "受付が指定した条件" }],
  }), 201);
  return { request, quest };
}
async function apply(quest, who) {
  const { application } = await expect(clients[who]("/api/quests/" + quest.id, "PATCH", { mode: "apply" }));
  return application.adventurerId;
}
const patchQuest = (who, quest, body) => clients[who]("/api/quests/" + quest.id, "PATCH", body);

test(baseUrl ? "HTTP経由のクエストフロー" : "実DB・API処理のクエストフロー（セッションはテスト用）", async (t) => {
  t.after(async () => {
    const requestWhere = { requesterId: { in: userIds } };
    const quests = await db.quest.findMany({ where: { request: requestWhere }, select: { id: true } });
    const questWhere = { questId: { in: quests.map(({ id }) => id) } };
    await db.$transaction([
      db.questApplication.deleteMany({ where: questWhere }),
      db.questAdventurer.deleteMany({ where: questWhere }),
      db.quest.deleteMany({ where: { id: { in: quests.map(({ id }) => id) } } }),
      db.request.deleteMany({ where: requestWhere }),
      db.adventurer.deleteMany({ where: { userId: { in: userIds } } }),
      db.user.deleteMany({ where: { id: { in: userIds } } }),
    ]);
    await db.$disconnect();
  });
  for (const role of ["requester", "staff", "first", "second", "outsider"]) {
    const userId = prefix + "_" + role;
    clients[role] = client();
    if (role === "staff") {
      const user = await db.user.create({ data: { userId, displayName: role, userType: "staff", role: "reception", passwordHash: await bcrypt.hash(password, 10) } });
      userIds.push(user.id);
    } else {
      const { user } = await expect(clients[role]("/api/signup", "POST", { userId, displayName: role, password }), 201);
      userIds.push(user.id);
    }
    await login(clients[role], userId);
  }
  await t.test("未認証・役割違い・下書きの閲覧を拒否", async () => {
    const anonymous = client();
    for (const path of ["/api/requests", "/api/quests", "/api/quests/fake.id", "/api/adventurers", "/api/users"]) {
      await expect(anonymous(path), 401);
    }
    await expect(clients.outsider("/api/adventurers"), 403);
    await expect(clients.outsider("/api/users"), 403);
    const { request } = await expect(clients.requester("/api/requests", "POST", { mode: "draft", title: "非公開" }), 201);
    for (const who of ["staff", "outsider"]) {
      await expect(clients[who]("/api/requests/" + request.id), 404);
      await expect(clients[who]("/api/requests/" + request.id, "PATCH", { mode: "agree" }), 404);
    }
    const { requests } = await expect(clients.staff("/api/requests"));
    assert.ok(!requests.some(({ id }) => id === request.id));
    await expect(clients.requester("/api/requests/" + request.id, "PATCH", { mode: "draft-save", fields: { title: "更新" } }));
    const submitted = await expect(clients.requester("/api/requests/" + request.id, "PATCH", { mode: "submit", fields: { title: "提出" } }));
    assert.equal(submitted.request.status, "確認前");
    const adjusted = await expect(clients.staff("/api/requests/" + request.id, "PATCH", { mode: "adjust", fields: { title: "調整" }, reason: "条件修正" }));
    assert.equal(adjusted.request.requesterAgreed, false);
    await expect(clients.requester("/api/requests/" + request.id, "PATCH", { mode: "agree" }));
    await expect(clients.requester("/api/requests/" + request.id, "DELETE"), 409);
    const draft = await expect(clients.requester("/api/requests", "POST", { mode: "draft" }), 201);
    await expect(clients.requester("/api/requests/" + draft.request.id, "DELETE"));
  });
  await t.test("1人選定・写真保存・差し戻し・完了・担当外操作の拒否", async () => {
    const { request, quest } = await createQuest();
    const member = await apply(quest, "first");
    await apply(quest, "second");
    await expect(patchQuest("outsider", quest, { mode: "accept" }), 403);
    await expect(patchQuest("staff", quest, { mode: "verify" }), 409);
    for (const selectedIds of [[], [member, member], ["invalid"]]) {
      await expect(patchQuest("staff", quest, { mode: "finalize-selection", selectedIds }), 400);
    }
    await expect(patchQuest("staff", quest, { mode: "select", selectedIds: [member] }));
    const started = await expect(patchQuest("staff", quest, { mode: "finalize-selection", selectedIds: [member] }));
    const profile = await db.adventurer.findUnique({ where: { id: member } });
    assert.equal(started.quest.adventurerId, profile.userId);
    assert.notEqual(profile.id, profile.userId);
    assert.equal((await db.request.findUnique({ where: { id: request.id } })).status, "クエスト進行中");
    const detail = await expect(clients.first("/api/quests/" + quest.id));
    assert.equal(detail.quest.canReport, true);
    await expect(clients.outsider("/api/quests/" + quest.id), 404);
    const foreignList = await expect(clients.outsider("/api/quests"));
    assert.ok(!foreignList.quests.some(({ id }) => id === quest.id));
    await expect(patchQuest("second", quest, report), 403);
    await expect(patchQuest("staff", quest, report), 403);
    await expect(patchQuest("staff", quest, { mode: "select", selectedIds: [] }), 409);
    await expect(clients.requester("/api/requests/" + request.id, "PATCH", { mode: "adjust", fields: { title: "巻き戻し" } }), 409);
    await expect(patchQuest("first", quest, { ...report, photos: [{ url: "blob:invalid" }] }), 400);
    await expect(patchQuest("first", quest, { ...report, photos: [{ url: "data:image/svg+xml;base64,PHN2Zy8+" }] }), 400);
    await expect(patchQuest("first", quest, { ...report, photos: [{ url: "data:image/png;base64,YmFk" }] }), 400);
    await expect(patchQuest("first", quest, { ...report, photos: Array(6).fill({ url: png }) }), 400);
    const sizedPhoto = (size) => {
      const bytes = Buffer.alloc(size);
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
      return { url: "data:image/png;base64," + bytes.toString("base64") };
    };
    await expect(patchQuest("first", quest, { ...report, photos: [sizedPhoto(1024 * 1024 + 1)] }), 413);
    await expect(patchQuest("first", quest, { ...report, photos: Array(3).fill(sizedPhoto(750 * 1024)) }), 413);
    await expect(patchQuest("first", quest, { ...report, checklist: [] }), 400);
    await expect(patchQuest("first", quest, report));
    const stored = await db.quest.findUnique({ where: { id: quest.id } });
    assert.equal(stored.photos[0].url, png);
    assert.equal(stored.adventurerId, profile.userId);
    assert.equal(stored.checklist[0].note, "受付が指定した条件");
    const reviewed = await expect(clients.staff("/api/quests/" + quest.id));
    assert.equal(reviewed.quest.photos[0].url, png);
    await expect(patchQuest("first", quest, report), 409);
    await expect(patchQuest("staff", quest, { mode: "remand", reviewNote: "" }), 400);
    await expect(patchQuest("staff", quest, { mode: "remand", reviewNote: "再確認" }));
    await expect(patchQuest("first", quest, { ...report, photos: reviewed.quest.photos }));
    await expect(patchQuest("staff", quest, { mode: "verify", reviewNote: "確認済み" }));
    assert.equal((await db.request.findUnique({ where: { id: request.id } })).status, "完了");
    await expect(patchQuest("first", quest, report), 409);
    await expect(patchQuest("staff", quest, { mode: "remand", reviewNote: "巻き戻し" }), 409);
  });
  await t.test("複数人選定でも選定メンバーが報告でき、担当情報を上書きしない", async () => {
    const { quest } = await createQuest();
    const members = [await apply(quest, "first"), await apply(quest, "second")];
    const started = await expect(patchQuest("staff", quest, { mode: "finalize-selection", selectedIds: members }));
    assert.equal(started.quest.adventurerId, null);
    for (const who of ["first", "second"]) {
      assert.equal((await expect(clients[who]("/api/quests/" + quest.id))).quest.canReport, true);
    }
    const responses = await Promise.all([patchQuest("first", quest, report), patchQuest("second", quest, report)]);
    assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 409]);
    const saved = await db.quest.findUnique({ where: { id: quest.id }, include: { selectedAdventurers: true } });
    assert.equal(saved.adventurerId, null);
    assert.equal(saved.selectedAdventurers.length, 2);
  });
  await t.test("同時クエスト化は1件だけ作成し、APIエラーをJSONで返す", async () => {
    const { request } = await expect(clients.requester("/api/requests", "POST", { title: "同時公開" }), 201);
    await expect(clients.staff("/api/requests/" + request.id, "PATCH", { mode: "agree" }));
    const responses = await Promise.all([1, 2].map(() => clients.staff("/api/quests", "POST", { requestId: request.id })));
    assert.deepEqual(responses.map(({ status }) => status).sort(), [201, 409]);
    assert.equal(await db.quest.count({ where: { requestId: request.id } }), 1);
    await expect(clients.staff("/api/quests", "POST", null), 400);
    await expect(clients.staff("/api/quests/missing", "PATCH", { mode: "verify" }), 404);
  });
});
