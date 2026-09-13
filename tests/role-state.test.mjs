import test from 'node:test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';import {initialPublicBrief} from '../lib/public-quest.js';
const base=process.env.TEST_BASE_URL??'http://localhost:5177';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local only');
async function call(actor,path,method='GET',body,status=200){const r=await fetch(base+path,{method,headers:{...(actor?{cookie:'quest_test_actor='+actor}:{}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.status,status,await r.clone().text());return r.json();}
test('役割と全進行状態ごとの閲覧・申請・報告権限',async()=>{
 const fixtures=[];
 for(const stage of ['draft','staff-review','requester-review','agreed','open','applied','rank-limited','active','reported','done','remanded']){
  const fields={title:'役割状態検証・'+stage,categoryId:'gather',purpose:'役割別表示の確認',rewardMode:'amount',rewardAmount:1000,deadlineMode:'none'};
  let {request}=await call('general','/api/requests','POST',{...fields,...(stage==='draft'?{mode:'draft'}:{})},201);
  if(stage==='requester-review')await call('reception','/api/requests/'+request.id,'PATCH',{mode:'adjust',fields:{...fields,purpose:'受付が調整した条件'},reason:'条件を調整'});
  let quest;
  if(!['draft','staff-review','requester-review'].includes(stage))await call('reception','/api/requests/'+request.id,'PATCH',{mode:'agree'});
  if(!['draft','staff-review','requester-review','agreed'].includes(stage)){
   ({quest}=await call('reception','/api/quests','POST',{requestId:request.id,publishFields:{...initialPublicBrief(fields),locationMode:'after-selection',rank:'C',minimumRank:stage==='rank-limited'?'S':'',recruitCount:1},checklist:[{label:'薬草を納品'}]},201));
   if(['applied','active','reported','done','remanded'].includes(stage)){
    const {application}=await call('general2','/api/quests/'+quest.id,'PATCH',{mode:'apply'});
    if(stage!=='applied')await call('reception','/api/quests/'+quest.id,'PATCH',{mode:'finalize-selection',selectedIds:[application.adventurerId]});
    if(['reported','done','remanded'].includes(stage))await call('general2','/api/quests/'+quest.id,'PATCH',{mode:'report',reportComment:'納品しました',checklist:[{label:'薬草を納品',checked:true}],photos:[]});
    if(stage==='done')await call('reception','/api/quests/'+quest.id,'PATCH',{mode:'verify',reviewNote:'成果を確認しました'});
    if(stage==='remanded')await call('reception','/api/quests/'+quest.id,'PATCH',{mode:'remand',reviewNote:'納品数を追記してください'});
   }
  }
  ({request}=await call('general','/api/requests/'+request.id));
  for(const actor of [null,'reception','general','general2','general3']){
   const visible=actor==='general'||(actor==='reception'&&stage!=='draft');
   const result=await call(actor,'/api/requests/'+request.id,'GET',undefined,!actor?401:visible?200:404);
   if(visible)assert.equal(result.request.id,request.id);
   if(quest){
    const open=['open','applied','rank-limited'].includes(stage),questVisible=actor&&(open||actor==='reception'||actor==='general'||actor==='general2');
    const result=await call(actor,'/api/quests/'+quest.id,'GET',undefined,!actor?401:questVisible?200:404);
    if(questVisible){const q=result.quest;assert.equal(q.canViewSourceRequest,actor==='general'||actor==='reception');assert.equal(q.canApply,actor!=='reception'&&open&&stage!=='rank-limited'&&!(stage==='applied'&&actor==='general2'));assert.equal(q.canReport,actor==='general2'&&['active','remanded'].includes(stage));}
   }
  }
  fixtures.push({stage,requestId:request.id,questId:quest?.id,title:fields.title});
 }
 if(process.env.TEST_FIXTURE_OUTPUT)await writeFile(process.env.TEST_FIXTURE_OUTPUT,JSON.stringify(fixtures,null,2));
});
