import test from 'node:test';import assert from 'node:assert/strict';import {initialPublicBrief} from '../lib/public-quest.js';
const base=process.env.TEST_BASE_URL??'http://localhost:5177';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local tests only');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=';
async function request(actor,path,method='GET',body){return fetch(base+path,{method,headers:{...(actor?{cookie:`quest_test_actor=${actor}`} : {}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});}
async function call(actor,path,method='GET',body,status=200){const r=await request(actor,path,method,body);assert.equal(r.status,status,await r.clone().text());return r.headers.get('content-type')?.includes('json')?r.json():r;}
async function source(){const {request:r}=await call('general','/api/requests','POST',{title:'公開追加添付検証',categoryId:'explore',purpose:'現地を調べる',attachments:[{name:'依頼資料.png',url:png}]},201);await call('reception','/api/requests/'+r.id,'PATCH',{mode:'agree'});return r;}
const fields=r=>({...initialPublicBrief(r),locationMode:'after-selection',deadlineMode:'none',rank:'C',grossReward:1000});
test('受付の追加資料は下書きで非公開、公開時のみ冒険者に渡る',async()=>{
 const r=await source(),path='/api/requests/'+r.id+'/publication-draft';
 const body={fields:fields(r),checklist:[{label:'調査記録を提出',note:''}],attachmentIds:[r.attachments[0].id],additionalAttachments:[{name:'受付の地図.png',url:png}],revision:null};
 await call('general',path,'PUT',body,403);
 let {draft}=await call('reception',path,'PUT',body);let file=draft.additionalAttachments[0];assert.ok(file.url.includes('/publication-draft/attachments/'));assert.equal((await call('reception',path)).draft.additionalAttachments.length,1);
 await call('reception',file.url);await call('general',file.url,'GET',undefined,403);await call('general2',file.url,'GET',undefined,403);await call(null,file.url,'GET',undefined,401);
 assert.equal((await call('general','/api/requests/'+r.id)).request.attachments.length,1);
 const other=await source();await call('reception','/api/requests/'+other.id+'/publication-draft','PUT',{...body,attachmentIds:[],additionalAttachments:[file]},400);
 await call('reception',path,'PUT',{...body,revision:draft.revision,additionalAttachments:Array(5).fill({name:'追加.png',url:png})},400);
 await call('reception',path,'PUT',{...body,revision:draft.revision,additionalAttachments:[{name:'bad.png',url:'data:image/png;base64,YmFk'}]},400);
 ({draft}=await call('reception',path,'PUT',{...body,revision:draft.revision,additionalAttachments:[]}));await call('reception',file.url,'GET',undefined,404);
 ({draft}=await call('reception',path,'PUT',{...body,revision:draft.revision}));file=draft.additionalAttachments[0];
 const publication={requestId:r.id,publishFields:body.fields,checklist:body.checklist,attachmentIds:body.attachmentIds,additionalAttachments:[file],draftRevision:draft.revision};
 await call('reception','/api/quests','POST',{...publication,draftRevision:draft.revision-1},409);
 const {quest}=await call('reception','/api/quests','POST',publication,201);assert.equal(quest.requestAttachments.length,2);for(const f of quest.requestAttachments)await call('general2',f.url);
 await call('reception',file.url,'GET',undefined,404);assert.equal((await call('general','/api/requests/'+r.id)).request.attachments.length,1);
});
test('保存せず追加資料を公開でき、下書き更新と公開の競合で参照が壊れない',async()=>{
 const r=await source(),body={fields:fields(r),checklist:[{label:'調査',note:''}],attachmentIds:[],additionalAttachments:[{name:'公開案内.png',url:png}],revision:null},path='/api/requests/'+r.id+'/publication-draft';
 const {draft}=await call('reception',path,'PUT',body);const publication={requestId:r.id,publishFields:body.fields,checklist:body.checklist,additionalAttachments:draft.additionalAttachments,draftRevision:draft.revision};
 const responses=await Promise.all([request('reception',path,'PUT',{...body,additionalAttachments:[],revision:draft.revision}),request('reception','/api/quests','POST',publication)]);
 const codes=responses.map(r=>r.status);assert.ok(JSON.stringify(codes)==='[200,409]'||JSON.stringify(codes)==='[409,201]',JSON.stringify(codes));
 if(codes[1]===201){const {quest}=await responses[1].json();await call('general2',quest.requestAttachments[0].url);}else{const {draft:latest}=await responses[0].json();await call('reception','/api/quests','POST',{...publication,additionalAttachments:[{name:'新規の案内.png',url:png}],draftRevision:latest.revision},201);}
 const other=await source();const {quest}=await call('reception','/api/quests','POST',{requestId:other.id,publishFields:fields(other),checklist:body.checklist,additionalAttachments:[{name:'直接追加.png',url:png}]},201);assert.equal(quest.requestAttachments.length,1);await call('general2',quest.requestAttachments[0].url);
});
