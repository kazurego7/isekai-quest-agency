"use client";
import RequestAttachments from '@/components/request-attachments';
import { requestTypes } from '@/lib/request-options';
import { gold,rewardBreakdown } from '@/lib/public-quest';
export default function PublicQuestDetails({quest}){
 const q=quest,{commissionAmount,netReward}=rewardBreakdown(q.grossReward,q.commissionRate);
 const people=q.selectedAdventurerIds?.length||q.recruitCount;
 return <><section className="reward-breakdown" aria-label="報酬の内訳"><h3>報酬の内訳</h3>{q.grossReward===0&&<p>無報酬（0 G）のクエストです。</p>}<dl><div><dt>依頼金額</dt><dd>{gold(q.grossReward)}</dd></div><div><dt>仲介料 {q.commissionRate}％</dt><dd>− {gold(commissionAmount)}</dd></div><div className="reward-net"><dt>冒険者への報酬総額</dt><dd>{gold(netReward)}</dd></div></dl><p>全員分の総額です。仲介料の1 G未満は切り捨てます。</p><p>{q.distributionMode==='equal'?`参加者で均等分配。${q.selectedAdventurerIds?.length?'参加':'募集'}人数${people}人の場合、1人${gold(Math.floor(netReward/people))}${netReward%people?`・余り${gold(netReward%people)}は代表者へ`:''}。`:q.distributionNote}</p></section><dl className="document-details public-quest-details">{[
 ['依頼種別',requestTypes.find(x=>x.id===q.categoryId)?.name],['任務の内容',q.detail],['場所',q.location],['期限',q.deadline],['クエストランク',`${q.rank}ランク`],['募集人数',`${q.recruitCount}人`],['参加条件',[q.minimumRank?`${q.minimumRank}ランク以上`:'ランク制限なし',q.participationNote].filter(Boolean).join('\n')],['集合・出発',[q.meetingAt&&`${q.meetingAt.replace('T',' ')}（日本時間）`,q.meetingPlace].filter(Boolean).join('\n')||'参加決定後に調整'],['備考・冒険者への補足',q.publicNote||'なし'],['連絡窓口',q.receptionistName||'ギルド受付']
 ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'未定'}</dd></div>)}<div><dt>達成条件</dt><dd><ol className="public-checklist">{q.checklist.map((item,i)=><li key={i}><strong>{item.label}</strong>{item.note&&<p>{item.note}</p>}</li>)}</ol></dd></div><div><dt>公開資料</dt><dd><RequestAttachments files={q.requestAttachments||[]}/></dd></div></dl></>;
}
