import test from 'node:test';import assert from 'node:assert/strict';
import { initialPublicBrief,rewardBreakdown,validatePublicBrief } from '../lib/public-quest.js';
const base=process.env.TEST_BASE_URL??'http://localhost:5177';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local tests only');
async function call(actor,path,method='GET',body,status=200){const r=await fetch(base+path,{method,headers:{...(actor?{cookie:`quest_test_actor=${actor}`} : {}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.status,status,await r.clone().text());return r.headers.get('content-type')?.includes('json')?r.json():r;}
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=';
test('公開用コピー・仲介料・非公開情報・資料の選択を一連で確認',async()=>{
 const {request}=await call('general','/api/requests','POST',{formatVersion:1,title:'公開準備検証・秘密の任務',categoryId:'explore',purpose:'PRIVATE_PURPOSE',regionId:'east',location:'PRIVATE_LOCATION',deadlineMode:'date',deadlineDate:'2026-10-20',rewardMode:'amount',rewardAmount:1001,requesterNote:'PRIVATE_NOTE',attachments:[{name:'非公開.png',url:png},{name:'公開資料.png',url:png}]},201);
 await call('reception','/api/requests/'+request.id,'PATCH',{mode:'agree'});
 const draft=initialPublicBrief(request);assert.equal(draft.publicNote,'PRIVATE_NOTE');assert.equal(draft.detail,'PRIVATE_PURPOSE');assert.equal(draft.grossReward,1001);assert.equal(draft.commissionRate,10);
 const fields={...draft,title:'公開用の任務',detail:'遺跡を調査する',location:'遺跡入口',publicNote:'足元に注意',rank:'C',minimumRank:'C',recruitCount:2,meetingAt:'2026-10-18T07:00',meetingPlace:'東門'};
 const body={requestId:request.id,publishFields:fields,checklist:[{label:'調査記録を提出',note:'写真を添える'}],attachmentIds:[request.attachments[1].id]};
 for(const invalid of [{commissionRate:-1},{commissionRate:101},{commissionRate:1.5},{grossReward:-1},{recruitCount:0},{rank:'Cランク'},{deadlineDate:'2026-02-30'},{meetingAt:'2026-02-30T07:00'},{distributionMode:'custom',distributionNote:''}])await call('reception','/api/quests','POST',{...body,publishFields:{...fields,...invalid}},400);
 await call('reception','/api/quests','POST',{...body,attachmentIds:['not-owned']},400);
 await call('general','/api/quests','POST',body,403);
 const {quest}=await call('reception','/api/quests','POST',body,201);assert.equal(quest.title,fields.title);assert.equal(quest.commissionAmount,100);assert.equal(quest.netReward,901);assert.equal(quest.requestAttachments.length,1);assert.equal(quest.checklist[0].checked,false);
 const publicData=await call('general2','/api/quests/'+quest.id);for(const marker of ['PRIVATE_','非公開.png',request.requesterId,'previousConditions','requesterName'])assert.ok(!JSON.stringify(publicData).includes(marker),marker);
 const list=await call('general2','/api/quests');assert.ok(!JSON.stringify(list.quests.find(x=>x.id===quest.id)).includes('PRIVATE_'));
 for(const file of request.attachments)await call('general2',file.url,'GET',undefined,404);
 await call('general2',`/api/quests/${quest.id}/attachments/${request.attachments[0].id}`,'GET',undefined,404);
 await call('general2',quest.requestAttachments[0].url);await call(null,quest.requestAttachments[0].url,'GET',undefined,401);
 const {request:unchanged}=await call('general','/api/requests/'+request.id);assert.equal(unchanged.title,request.title);assert.equal(unchanged.questId,quest.id);assert.equal(unchanged.publishedTitle,quest.title);assert.equal(unchanged.questStatus,'募集中');assert.equal(unchanged.purpose,'PRIVATE_PURPOSE');assert.equal(unchanged.requesterNote,'PRIVATE_NOTE');assert.equal(unchanged.rewardAmount,1001);
 assert.deepEqual(unchanged.relatedQuest,{id:quest.id,status:'募集中',canView:true});
 const staffRequest=await call('reception','/api/requests/'+request.id);assert.equal(staffRequest.request.relatedQuest.canView,true);
 await call('general2','/api/requests/'+request.id,'GET',undefined,404);
 await call('general','/api/quests/'+quest.id,'PATCH',{mode:'apply'});
 const applied=await call('general','/api/quests/'+quest.id);assert.ok(applied.quest.applicants.some(a=>a.id===applied.quest.viewerAdventurerId));
 assert.deepEqual(rewardBreakdown(1001,10),{commissionAmount:100,netReward:901});assert.deepEqual(rewardBreakdown(1001,100),{commissionAmount:1001,netReward:0});assert.equal(validatePublicBrief(fields,body.checklist),'');
});
test('添付は初期状態で非公開、人数・参加ランク条件を満たす必要がある',async()=>{
 const {request}=await call('general','/api/requests','POST',{formatVersion:1,title:'参加条件検証',categoryId:'hunt',purpose:'討伐',rewardMode:'amount',rewardAmount:1000,attachments:[{name:'秘密の資料.png',url:png}]},201);await call('reception','/api/requests/'+request.id,'PATCH',{mode:'agree'});
 const {quest}=await call('reception','/api/quests','POST',{requestId:request.id,publishFields:{...initialPublicBrief(request),locationMode:'after-selection',deadlineMode:'none',rank:'S',minimumRank:'S',recruitCount:1,netReward:999999,commissionAmount:0},checklist:[{label:'討伐証明を提出'}]},201);
 assert.deepEqual(quest.requestAttachments,[]);assert.equal(quest.netReward,900);assert.equal(quest.commissionAmount,100);
 await call('general2','/api/quests/'+quest.id,'PATCH',{mode:'apply'},403);
 const {adventurers}=await call('reception','/api/adventurers');const ordinary=adventurers.filter(x=>x.rank!=='S'&&x.rank!=='Sランク');assert.ok(ordinary.length>=2);
 await call('reception','/api/quests/'+quest.id,'PATCH',{mode:'finalize-selection',selectedIds:[ordinary[0].id]},400);
 await call('reception','/api/quests/'+quest.id,'PATCH',{mode:'finalize-selection',selectedIds:ordinary.slice(0,2).map(x=>x.id)},400);
});
