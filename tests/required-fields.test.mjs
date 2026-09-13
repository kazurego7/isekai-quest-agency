import test from 'node:test';import assert from 'node:assert/strict';import {initialPublicBrief} from '../lib/public-quest.js';
const base=process.env.TEST_BASE_URL??'http://localhost:5177';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local tests only');
async function call(actor,path,method='GET',body,status=200){const r=await fetch(base+path,{method,headers:{...(actor?{cookie:`quest_test_actor=${actor}`} : {}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;}
test('依頼の下書きは未入力を保存し、送信時だけ必須項目を検証する',async()=>{
 const {request}=await call('general','/api/requests','POST',{mode:'draft',deadlineMode:'date',deadlineDate:'',rewardMode:'amount',rewardAmount:null},201);const path='/api/requests/'+request.id;
 assert.equal(request.title,'');assert.equal(request.deadlineDate,null);assert.equal(request.rewardAmount,null);
 await call('general',path,'PATCH',{mode:'submit',fields:request},400);
 let {request:r}=await call('general',path,'PATCH',{mode:'draft-save',fields:{...request,title:'必須検証・依頼の下書き',categoryId:'gather',purpose:'薬草を届ける'}});
 await call('general',path,'PATCH',{mode:'submit',fields:r},400);
 ({request:r}=await call('general',path,'PATCH',{mode:'draft-save',fields:{...r,title:''}}));assert.equal(r.title,'');
 ({request:r}=await call('general',path,'PATCH',{mode:'submit',fields:{...r,title:'必須検証・最小依頼',deadlineMode:'unknown',rewardMode:'consult'}}));assert.equal(r.deadlineMode,'unknown');assert.equal(r.rewardMode,'consult');assert.equal(r.status,'確認前');
 await call('general','/api/requests','POST',{title:'必須検証・未入力',categoryId:'gather',purpose:'   '},400);
});
test('公開準備の下書き・再読込・競合・権限と公開時の必須条件',async()=>{
 const {request}=await call('general','/api/requests','POST',{title:'必須検証・公開準備',categoryId:'escort',purpose:'護衛する'},201);await call('reception','/api/requests/'+request.id,'PATCH',{mode:'agree'});const path='/api/requests/'+request.id+'/publication-draft';
 assert.equal((await call('reception',path)).draft,null);await call('general',path,'GET',undefined,403);
 const blank={fields:{},checklist:[],attachmentIds:[],revision:null};let {draft}=await call('reception',path,'PUT',blank);assert.deepEqual(draft.fields,{});assert.equal((await call('reception',path)).draft.revision,0);
 await call('general',path,'PUT',blank,403);await call('reception',path,'PUT',blank,409);
 const fields={...initialPublicBrief(request),rank:'C',recruitCount:1,grossReward:0};const checklist=[{label:'目的地まで護衛する',note:''}];const publication={requestId:request.id,publishFields:fields,checklist};
 await call('reception','/api/quests','POST',publication,400);
 fields.locationMode='after-selection';await call('reception','/api/quests','POST',publication,400);
 fields.deadlineMode='none';fields.distributionMode='custom';await call('reception','/api/quests','POST',publication,400);fields.distributionMode='equal';
 for(const missing of [{title:''},{categoryId:''},{detail:''},{rank:''},{recruitCount:null},{grossReward:null},{commissionRate:null},{locationMode:'specified',location:'',regionId:''},{deadlineMode:'date',deadlineDate:''}])await call('reception','/api/quests','POST',{...publication,publishFields:{...fields,...missing}},400);
 await call('reception','/api/quests','POST',{...publication,checklist:[]},400);
 fields.location='PRIVATE_HIDDEN_LOCATION';fields.regionId='north';({draft}=await call('reception',path,'PUT',{fields,checklist,attachmentIds:[],revision:draft.revision}));assert.equal((await call('reception',path)).draft.fields.grossReward,0);
 publication.draftRevision=draft.revision;const {quest}=await call('reception','/api/quests','POST',publication,201);assert.equal(quest.location,'参加決定後に案内');assert.equal(quest.regionId,null);assert.ok(!JSON.stringify(quest).includes('PRIVATE_HIDDEN_LOCATION'));assert.equal(quest.deadline,'期限なし');assert.equal(quest.grossReward,0);assert.equal(quest.netReward,0);assert.equal((await call('reception',path)).draft,null);
 await call('reception',path,'PUT',{fields,checklist,attachmentIds:[],revision:null},409);
});
