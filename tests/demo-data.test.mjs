import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readdirSync,readFileSync } from 'node:fs';
import { buildDemoData,seedDemoData,DEMO_MARKER_ID } from '../lib/demo-data.js';
import { meetsRank,validatePublicBrief } from '../lib/public-quest.js';
import { requestSubmissionIssue } from '../lib/request-options.js';

function database(){
  const sqlite=new DatabaseSync(':memory:');
  for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
  sqlite.exec("INSERT INTO users(id,authId,userId,displayName,userType,role,createdAt,updatedAt) VALUES ('owner','real-owner','owner','受付','staff','reception','2026-09-12','2026-09-12'); INSERT INTO requests(id,title,status,requesterId,createdAt,updatedAt) VALUES('existing','既存の依頼','確認前','owner','2026-09-12','2026-09-12')");
  const db={prepare(sql){return {bind(...args){return {sql,args,first:()=>sqlite.prepare(sql).get(...args)}}}},async batch(statements){sqlite.exec('BEGIN');try{for(const s of statements)sqlite.prepare(s.sql).run(...s.args);sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
  return {sqlite,db};
}
test('現行スキーマに一括追加し、再実行しても既存記録や編集を保持する',async()=>{
  const {sqlite,db}=database();
  try{
    const result=await seedDemoData(db,'owner');
    assert.deepEqual(result.counts,{users:10,adventurers:6,requests:12,quests:8,applications:14,selections:8});
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM requests').get().n,13);
    assert.equal(sqlite.prepare("SELECT title FROM requests WHERE id='existing'").get().title,'既存の依頼');
    sqlite.prepare('UPDATE users SET displayName=? WHERE id=?').run('利用者の編集',DEMO_MARKER_ID);
    assert.deepEqual(await seedDemoData(db,'owner'),{alreadyPresent:true});
    assert.equal(sqlite.prepare('SELECT displayName FROM users WHERE id=?').get(DEMO_MARKER_ID).displayName,'利用者の編集');
    assert.deepEqual(sqlite.prepare('PRAGMA foreign_key_check').all(),[]);
  }finally{sqlite.close();}
});
test('途中で失敗してもデモデータが一部だけ残らない',async()=>{
  const {sqlite,db}=database();
  try{
    await assert.rejects(seedDemoData(db,'missing-owner'),/FOREIGN KEY/);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM users').get().n,1);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM requests').get().n,1);
  }finally{sqlite.close();}
});
test('全依頼の必須条件、報酬、参加者、進行状態が整合する',()=>{
  const data=buildDemoData('owner',new Date('2026-09-12T09:00:00Z'));
  for(const r of data.requests)assert.equal(requestSubmissionIssue(r),'',r.title);
  for(const q of data.quests){
    assert.equal(validatePublicBrief(q,JSON.parse(q.checklist)),'',q.title);
    assert.equal(q.netReward+q.commissionAmount,q.grossReward);
    assert.equal(q.commissionAmount,Math.floor(q.grossReward*0.1));
    const request=data.requests.find(r=>r.id===q.requestId);
    assert.ok(request.requesterAgreed&&request.receptionistAgreed);
    assert.equal(request.status,q.status==='募集中'?'クエスト化済み':q.status==='達成確認済み'?'完了':q.status);
    const selections=data.selections.filter(s=>s.questId===q.id);
    assert.ok(selections.length<=q.recruitCount);
    assert.equal(selections.length>0,q.status!=='募集中');
    for(const application of data.applications.filter(a=>a.questId===q.id))assert.ok(meetsRank(data.adventurers.find(a=>a.id===application.adventurerId).rank,q.minimumRank));
    if(['完了報告済み','達成確認済み'].includes(q.status))assert.ok(q.reportComment&&JSON.parse(q.checklist).every(c=>c.checked));
    if(q.status==='達成確認済み')assert.ok(q.reviewNote);
  }
});
