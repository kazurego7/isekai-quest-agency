import { publishFixture } from './publish-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL??'http://localhost:5177';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('ローカル検証専用です。');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=';
const fields={formatVersion:1,title:'添付検証',categoryId:'explore',purpose:'遺跡を調査する',regionId:'east',deadlineMode:'date',deadlineDate:'2026-10-15',rewardMode:'amount',rewardAmount:0};
async function call(actor,path,method='GET',body,status=200){if(path==="/api/quests"&&method==="POST")body=await publishFixture(base,body);const res=await fetch(base+path,{method,headers:{...(actor?{cookie:`quest_test_actor=${actor}`}:{ }),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(res.status,status,await res.clone().text());return res.headers.get('content-type')?.includes('application/json')?res.json():res;}
test('新項目の検証と、添付の権限・調整履歴・公開引継ぎ',async()=>{
for(const override of [{categoryId:'invalid'},{purpose:''},{regionId:'invalid'},{deadlineDate:'2026-02-30'},{rewardAmount:-1},{rewardAmount:1.5},{attachments:Array(6).fill({name:'a.png',url:png})},{attachments:[{url:'data:image/png;base64,YmFk'}]}])await call('general','/api/requests','POST',{...fields,...override},400);
let {request}=await call('general','/api/requests','POST',{...fields,attachments:[{name:'参考.png',url:png}]},201);
assert.equal(request.rewardAmount,0);assert.equal(request.regionId,'east');assert.equal(request.deadlineDate,'2026-10-15');
const path='/api/requests/'+request.id,old=request.attachments[0];
await call(null,old.url,'GET',undefined,401);await call('general2',old.url,'GET',undefined,404);await call('reception',old.url);
({request}=await call('reception',path,'PATCH',{mode:'adjust',fields:{...request,rewardAmount:500,attachments:[]},reason:'新しい資料に差し替え'}));
assert.equal(request.previousConditions.attachments[0].id,old.id);await call('general',old.url);
({request}=await call('general',path,'PATCH',{mode:'adjust',fields:{...request,attachments:[{name:'新資料.png',url:png}]},reason:'差し替え資料を確認'}));
await call('general',old.url,'GET',undefined,404);
await call('reception',path,'PATCH',{mode:'agree'});
const {quest}=await call('reception','/api/quests','POST',{requestId:request.id,attachmentIds:request.attachments.map(f=>f.id)},201);
assert.equal(quest.reward,'450 G');assert.equal(quest.requestAttachments.length,1);
await call('general2',request.attachments[0].url,'GET',undefined,404);await call('general2',quest.requestAttachments[0].url);
const {request:draft}=await call('general','/api/requests','POST',{mode:'draft',attachments:[{name:'下書き.png',url:png}]},201);
await call('reception',draft.attachments[0].url,'GET',undefined,404);
await call('general','/api/requests/'+draft.id,'DELETE');await call('general',draft.attachments[0].url,'GET',undefined,404);
});
