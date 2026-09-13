import { publishFixture } from './publish-fixture.mjs';
import test from "node:test";
import assert from "node:assert/strict";
const base=process.env.TEST_BASE_URL??"http://localhost:5177";
if(!["localhost","127.0.0.1"].includes(new URL(base).hostname)) throw new Error("ローカル検証専用です。");
const png="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=";
const report={mode:"report",reportComment:"採集を完了しました。",checklist:[{label:"成果確認",checked:true}],photos:[{name:"成果.png",url:png}]};
const roles={staff:"reception",a:"general",b:"general2",other:"general3"};
async function call(who,path,method="GET",body,extra={}) {
  if(path==="/api/quests"&&method==="POST")body=await publishFixture(base,body);
  const response=await fetch(base+path,{method,redirect:"manual",headers:{...(who?{cookie:"quest_test_actor="+roles[who]}:{}),...(body===undefined?{}:{"Content-Type":"application/json"}),...extra},body:body===undefined?undefined:JSON.stringify(body)});
  const data=response.headers.get("content-type")?.includes("application/json")?await response.json():null;
  assert.ok(!JSON.stringify(data).includes("passwordHash"));
  return {status:response.status,data,response};
}
async function expect(promise,status=200) {const r=await promise;assert.equal(r.status,status,JSON.stringify(r.data));return r.data;}
async function createQuest() {
  const {request}=await expect(call("a","/api/requests","POST",{title:"検証・薬草採集",categoryId:"gather",purpose:"保存と権限の確認",requesterNote:"非公開の依頼者メモ"}),201);
  await expect(call("staff","/api/requests/"+request.id,"PATCH",{mode:"agree"}));
  const {quest}=await expect(call("staff","/api/quests","POST",{requestId:request.id,publishFields:{detail:"薬草を採集する",rank:"C",slots:"2"},checklist:[{label:"成果確認",note:"依頼した数量"}]}),201);
  return {request,quest};
}
const patch=(who,q,body)=>call(who,"/api/quests/"+q.id,"PATCH",body);
test("Sites版：実D1・R2で依頼から完了まで",async t=> {
  const users={};
  for(const role of Object.keys(roles)) users[role]=(await expect(call(role,"/api/session"))).user;
  assert.equal(users.staff.role,"reception");assert.equal(users.a.userType,"general");
  await t.test("未認証・偽装・役割違い・下書きの閲覧を拒否",async()=> {
    for(const path of ["/api/requests","/api/quests","/api/quests/fake.id","/api/adventurers"]) await expect(call(null,path),401);
    await expect(call(null,"/api/requests","GET",undefined,{"oai-authenticated-user-id":"local-reception","oai-authenticated-user-email":"reception@sites.test"}),401);
    await expect(call("a","/api/adventurers"),403);
    const {request}=await expect(call("a","/api/requests","POST",{mode:"draft",title:"非公開の下書き"}),201);
    for(const who of ["staff","other"]) await expect(call(who,"/api/requests/"+request.id),404);
    await expect(call("a","/api/requests/"+request.id,"PATCH",{mode:"draft-save",fields:{title:"下書き更新"}}));
    await expect(call("a","/api/requests/"+request.id,"PATCH",{mode:"submit",fields:{title:"提出した依頼",categoryId:"gather",purpose:"薬草を採集する"}}));
    await expect(call("a","/api/requests/"+request.id,"DELETE"),409);
    await expect(call("staff","/api/requests/"+request.id,"PATCH",{mode:"adjust",fields:{title:"条件調整",categoryId:"gather",purpose:"薬草を採集する"},reason:"条件確認"}));
    const agreed=await expect(call("a","/api/requests/"+request.id,"PATCH",{mode:"agree"}));
    assert.equal(agreed.request.status,"合意済み");
    await expect(call("a","/api/requests","POST",{title:"不正送信"},{origin:"https://untrusted.example"}),403);
    const draft=await expect(call("a","/api/requests","POST",{mode:"draft"}),201);
    await expect(call("a","/api/requests/"+draft.request.id,"DELETE"));
  });
  await t.test("単独選定・R2写真・差し戻し・再提出・完了承認",async()=> {
    const {request,quest}=await createQuest();
    const {application}=await expect(patch("a",quest,{mode:"apply"}));
    await expect(patch("b",quest,{mode:"apply"}));
    for(const ids of [[],[application.adventurerId,application.adventurerId],["missing"]]) await expect(patch("staff",quest,{mode:"finalize-selection",selectedIds:ids}),400);
    const started=await expect(patch("staff",quest,{mode:"finalize-selection",selectedIds:[application.adventurerId]}));
    assert.equal(started.quest.adventurerId,users.a.id);
    assert.equal((await expect(call("a","/api/requests/"+request.id))).request.status,"クエスト進行中");
    await expect(call("other","/api/quests/"+quest.id),404);
    await expect(patch("b",quest,report),403);
    await expect(patch("staff",quest,report),403);
    await expect(patch("staff",quest,{mode:"verify"}),409);
    await expect(patch("a",quest,{...report,checklist:[]}),400);
    for(const url of ["blob:missing","data:image/svg+xml;base64,PHN2Zy8+","data:image/png;base64,YmFk"]) await expect(patch("a",quest,{...report,photos:[{url}]}),400);
    await expect(patch("a",quest,{...report,photos:Array(6).fill({url:png})}),400);
    const completed=await expect(patch("a",quest,report));
    assert.ok(completed.quest.photos[0].url.startsWith("/api/quests/"));
    const detail=await expect(call("staff","/api/quests/"+quest.id));
    assert.ok(!JSON.stringify(detail).includes("非公開の依頼者メモ"));
    assert.equal(detail.quest.checklist[0].note,"依頼した数量");
    const image=await call("staff",detail.quest.photos[0].url);
    assert.equal(image.status,200);assert.equal(image.response.headers.get("content-type"),"image/png");
    assert.equal(Buffer.from(await image.response.arrayBuffer()).toString("base64"),png.split(",")[1]);
    await expect(call("other",detail.quest.photos[0].url),404);
    await expect(call(null,detail.quest.photos[0].url),401);
    await expect(patch("staff",quest,{mode:"remand",reviewNote:""}),400);
    await expect(patch("staff",quest,{mode:"remand",reviewNote:"再確認してください"}));
    await expect(patch("a",quest,{...report,photos:detail.quest.photos}));
    await expect(patch("staff",quest,{mode:"verify",reviewNote:"確認しました"}));
    assert.equal((await expect(call("a","/api/requests/"+request.id))).request.status,"完了");
    await expect(patch("a",quest,report),409);
    await expect(patch("staff",quest,{mode:"remand",reviewNote:"巻き戻し"}),409);
  });
  await t.test("複数選定・同時報告でも一回だけ成功し担当を維持",async()=> {
    const {quest}=await createQuest();
    const ids=[];for(const who of ["a","b"]) ids.push((await expect(patch(who,quest,{mode:"apply"}))).application.adventurerId);
    await expect(patch("staff",quest,{mode:"select",selectedIds:ids}));
    await expect(patch("staff",quest,{mode:"finalize-selection",selectedIds:ids}));
    const results=await Promise.all([patch("a",quest,report),patch("b",quest,report)]);
    assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
    const detail=await expect(call("staff","/api/quests/"+quest.id));
    assert.equal(detail.quest.adventurerId,null);assert.equal(detail.quest.selectedAdventurerIds.length,2);
    assert.equal((await call("staff",detail.quest.photos[0].url)).status,200);
  });
  await t.test("同時公開は一件だけ成功し、依頼とクエストが同期",async()=> {
    const {request}=await expect(call("a","/api/requests","POST",{title:"同時公開",categoryId:"gather",purpose:"薬草を採集する"}),201);
    await expect(call("staff","/api/requests/"+request.id,"PATCH",{mode:"agree"}));
    const results=await Promise.all([1,2].map(()=>call("staff","/api/quests","POST",{requestId:request.id})));
    assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
    const list=await expect(call("staff","/api/quests"));assert.equal(list.quests.filter(q=>q.requestId===request.id).length,1);
    assert.equal((await expect(call("a","/api/requests/"+request.id))).request.status,"クエスト化済み");
  });
});
