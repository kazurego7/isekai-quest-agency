import { gold, rewardBreakdown, validatePublicBrief } from './public-quest.js';

export const DEMO_VERSION = 'guild-autumn-v1';
const id = n => `de000001-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
export const DEMO_MARKER_ID = id(1);

// Reserved identities are display-only fictional people, never sign-in credentials.
export function buildDemoData(receptionistId, anchor = new Date()) {
  const stamp = anchor.toISOString();
  const day = offset => new Date(anchor.getTime() + offset * 86400000).toISOString().slice(0, 10);
  const time = offset => new Date(anchor.getTime() + offset * 86400000).toISOString();
  const people = [
    ['薬師リネット', null, '診療所の薬師'], ['街道守エドガー', null, '街道の管理人'],
    ['星詠みセレナ', null, '王立天文院の研究者'], ['村長オルド', null, '花麦村の村長'],
    ['蒼剣のアレン', 'B', '剣士'], ['森歩きのミラ', 'C', '斥候・弓使い'],
    ['灯火のフィオナ', 'B', '治癒術師'], ['鉄壁のガルド', 'A', '盾騎士'],
    ['風読みのノエル', 'C', '魔術師'], ['若葉のティナ', 'F', '採集家'],
  ];
  const users = people.map(([name], i) => ({ id:id(i+1), authId:`demo:${DEMO_VERSION}:${i+1}`, userId:`demo-${DEMO_VERSION}-${i+1}`, displayName:`${name}（デモ）`, userType:'general', role:'general', createdAt:stamp, updatedAt:stamp }));
  const adventurers = people.flatMap(([name,rank,role], i) => rank ? [{ id:id(100+i), userId:users[i].id, code:`DEMO-${String(i-3).padStart(3,'0')}`, name:`${name}（デモ）`, rank, role, note:'デモ用の架空の冒険者です。', source:'デモ', createdAt:stamp, updatedAt:stamp }] : []);
  const scenarios = [
    {title:'診療所に届ける月光草', type:'gather', region:'north', place:'霧の森・三日月の泉', client:0, stage:'review', budget:1800, offset:5, detail:'解熱薬に使う月光草を20束採集し、王都の白灯診療所へ届けてください。銀色の葉を目印に、根を残して採取してください。', note:'採集かごは診療所で貸し出します。', goals:['月光草20束を採集する','白灯診療所へ納品する']},
    {title:'雪解け峠の行方不明者を捜して', type:'rescue', region:'frontier', place:'白峰峠・旧見張り小屋周辺', client:3, stage:'review-adjusted', budget:9000, offset:3, detail:'薬を運ぶ使者2名が峠から戻っていません。最後の目撃地点から捜索し、生存者を麓の宿へ連れ帰ってください。吹雪が強い場合は安全な場所へ退避してください。', note:'受付への連絡：家族への経過連絡は村長が取りまとめます。', goals:['使者2名の所在を確認する','救助者を麓の宿へ引き渡す']},
    {title:'夜明けの薬師を港町まで護衛', type:'escort', region:'south', place:'王都南門〜港町ルミナ', client:0, stage:'waiting', budget:4800, offset:7, detail:'巡回診療に向かう薬師1名と薬箱を港町まで護衛してください。旧街道は避け、南の石橋を渡る経路を希望します。', note:'受付への連絡：出発前に薬箱の封印を一緒に確認したいです。', goals:['薬師と薬箱を港町の診療所まで護衛する']},
    {title:'星見の塔に残る古代文字の調査', type:'explore', region:'east', place:'星見の丘・旧天文塔', client:2, stage:'agreed', budget:7200, offset:10, detail:'旧天文塔の壁面に現れた古代文字を記録してください。入口から観測室までの安全を確認し、文字の位置と形を紙に写して天文院へ提出してください。', note:'文字に触れると発光します。直接触れずに記録してください。', goals:['観測室までの経路を確認する','古代文字の写しと位置図を提出する']},
    {title:'花麦村の水車小屋とスライム', type:'hunt', region:'west', place:'花麦村・川辺の水車小屋', client:3, stage:'open', budget:1200, rank:'F', count:1, members:[], offset:6, detail:'水車の歯車に住みついた小型スライムを取り除き、水車が動くことを確認してください。小屋を傷つけないよう、火の魔法は使用しないでください。', note:'初めての討伐にも向く依頼です。村長が現場へ案内します。', goals:['小屋のスライムを除去する','水車が正常に回ることを確認する']},
    {title:'赤牙の魔狼から北街道を守れ', type:'hunt', region:'north', place:'北街道・石橋から見張り台まで', client:1, stage:'open', budget:6000, rank:'C', minimum:'C', count:2, members:[0,1,2], offset:8, detail:'荷馬車を襲う赤牙の魔狼の群れを討伐してください。街道沿いの足跡から巣の位置を調べ、討伐後に安全な通行経路を街道守へ報告してください。', note:'夜間の単独行動を避け、前衛と索敵役を含む2名で参加してください。', goals:['魔狼の群れを討伐する','巣の位置と街道の安全を報告する']},
    {title:'星詠みの一行を雲上遺跡へ', type:'escort', region:'frontier', place:'風渡りの桟道〜雲上遺跡', client:2, stage:'open', budget:18000, rank:'A', minimum:'B', count:3, members:[0,2,3], offset:12, detail:'天文院の調査員2名を雲上遺跡まで護衛してください。浮遊石の不安定な区間を確認し、観測を終えた一行と機材を麓まで安全に連れ帰ってください。', note:'高所での移動経験が必要です。命綱と防寒具は天文院が支給します。', goals:['調査員2名を遺跡へ護衛する','観測中の安全を確保する','全員と観測機材を麓へ戻す']},
    {title:'水晶洞に響く不思議な音', type:'explore', region:'east', place:'青晶山・東側の水晶洞', client:2, stage:'active', budget:8000, rank:'B', minimum:'C', count:2, members:[1,4], offset:4, detail:'夜ごと洞窟から響く音の発生地点を調査してください。崩落箇所を記録し、音と水晶の発光の関係を観測して報告してください。採掘は不要です。', note:'洞内では互いの姿が見える距離を保ってください。', goals:['音の発生地点を特定する','崩落箇所と発光の様子を記録する']},
    {title:'霧の渓谷へ薬と灯りを届ける', type:'escort', region:'north', place:'王都北門〜霧の渓谷診療所', client:0, stage:'active', budget:5400, rank:'C', count:2, members:[0,2], offset:3, detail:'薬師の助手と救急薬を渓谷の診療所へ護衛してください。吊り橋の手前で足場を確認し、霧が濃い区間では灯りを絶やさないでください。', note:'薬箱は水濡れ厳禁です。防水布を受付で受け取ってください。', goals:['助手と救急薬を診療所へ届ける','到着の受領印を受け取る']},
    {title:'精霊樹の朝露で畑を癒やす', type:'gather', region:'west', place:'精霊の森・大樹の根元', client:3, stage:'reported', budget:2400, rank:'E', count:1, members:[5], offset:1, detail:'夜明けに精霊樹の葉から朝露を3瓶集め、花麦村の畑へ届けてください。木の枝を折ったり、精霊の祠に立ち入ったりしないでください。', note:'露を入れる清浄な瓶は村で用意します。', goals:['精霊樹の朝露を3瓶集める','花麦村の村長に引き渡す'], report:'日の出前に3瓶分を採取しました。祠には立ち入らず、瓶を封印して村長へ直接引き渡しました。畑への散布まで立ち会い、苗の葉が戻る様子を確認しました。'},
    {title:'古い鐘楼の結界石を交換', type:'other', region:'capital', place:'王都西門・鐘楼の最上階', client:1, stage:'reported', budget:3600, rank:'D', count:1, members:[4], offset:1, detail:'夜警の合図を守る鐘楼の結界石を交換し、日没後も結界が維持されることを確認してください。古い石は回収して街道守へ返却してください。', note:'交換前に鐘楼の管理人へ声をかけてください。', goals:['結界石を交換する','日没後の結界を確認する','古い結界石を返却する'], report:'管理人立ち会いのもとで交換し、日没後に外周4点の結界を確認しました。古い結界石は布で包み、街道守の詰所へ返却済みです。'},
    {title:'収穫祭の道を照らす結界灯', type:'other', region:'west', place:'花麦村・広場と参道', client:3, stage:'done', budget:3000, rank:'D', count:2, members:[1,5], offset:-1, detail:'収穫祭の参道に結界灯を12基設置し、広場まで灯りが途切れないことを確認してください。祭りの翌朝に点検し、不具合があれば補修してください。', note:'村の子どもたちが触れても倒れないよう、台座を固定してください。', goals:['結界灯12基を設置する','祭りの翌朝に点検する'], report:'結界灯12基を設置し、台座を固定しました。翌朝の点検では全基が正常に点灯し、補修の必要はありませんでした。', review:'村長立ち会いで12基の点灯と固定を確認。参道の安全を確保できたため達成とします。'},
  ];
  const requests=[], quests=[], applications=[], selections=[];
  for (const [index,s] of scenarios.entries()) {
    const published = Boolean(s.rank), completed=['reported','done'].includes(s.stage);
    const questStatus={open:'募集中',active:'クエスト進行中',reported:'完了報告済み',done:'達成確認済み'}[s.stage];
    const r={id:id(200+index),title:s.title,status:published?(s.stage==='done'?'完了':s.stage==='open'?'クエスト化済み':questStatus):s.stage==='agreed'?'合意済み':s.stage==='review'?'確認前':'合意待ち',requesterId:users[s.client].id,receptionistId,formatVersion:1,categoryId:s.type,regionId:s.region,purpose:s.detail,location:s.place,deadlineMode:'date',deadlineDate:day(s.offset),rewardMode:'amount',rewardAmount:s.budget,requesterNote:s.note,attachments:'[]',requesterAgreed:s.stage!=='waiting',receptionistAgreed:!['review','review-adjusted'].includes(s.stage),createdAt:time(-14+index/2),updatedAt:stamp};
    if(s.stage==='review-adjusted'||s.stage==='waiting') {
      const before={...r,rewardAmount:s.budget-1200,attachments:[]};
      r.previousConditions=JSON.stringify(before);
      r.notes=s.stage==='review-adjusted'?'捜索範囲を広げるため、報酬予算を増額しました。':'迂回路での護衛を含めた金額をご提案します。';
    }
    requests.push(r);
    if(!published)continue;
    const members=s.members.map(i=>adventurers[i]);
    const q={id:id(300+index),requestId:r.id,receptionistId,title:s.title,status:questStatus,publishVersion:1,categoryId:s.type,regionId:s.region,detail:s.detail,locationMode:'specified',location:s.place,deadlineMode:'date',deadlineDate:day(s.offset),publicNote:s.note,publicAttachments:'[]',rank:s.rank,minimumRank:s.minimum||null,recruitCount:s.count,slots:String(s.count),participationNote:s.rank==='F'?'新人歓迎。装備の相談は受付へ。':'携行品と集合場所を確認してから参加してください。',grossReward:s.budget,commissionRate:10,...rewardBreakdown(s.budget,10),distributionMode:'equal',meetingAt:day(s.stage==='done'?-3:s.stage==='open'?2:-2)+'T07:00',meetingPlace:'王都ギルド・正面受付',checklist:JSON.stringify(s.goals.map(label=>({label,note:'',checked:completed}))),photos:'[]',reportComment:s.report||null,reviewNote:s.review||null,summary:s.stage==='open'?'冒険者を募集中です。':s.stage==='active'?'選定した冒険者が任務に取り組んでいます。':s.stage==='reported'?'成果の報告が届いています。受付でご確認ください。':'受付による達成確認が完了しました。',adventurerId:s.stage!=='open'&&members.length===1?members[0].userId:null,createdAt:time(-10+index/2),updatedAt:stamp};
    q.reward=gold(q.netReward);
    const issue=validatePublicBrief(q,JSON.parse(q.checklist));if(issue)throw new Error(issue);
    quests.push(q);
    for(const member of members){applications.push({questId:q.id,adventurerId:member.id,appliedAt:time(-4)});if(s.stage!=='open')selections.push({questId:q.id,adventurerId:member.id,selectedAt:time(-3)});}
  }
  return {users,adventurers,requests,quests,applications,selections};
}

// One transaction protects against partial imports and concurrent double-clicks.
// The marker is a member of the same dataset, so no new schema is needed.
export async function seedDemoData(db, receptionistId) {
  const marker=await db.prepare('SELECT id FROM users WHERE id=?').bind(DEMO_MARKER_ID).first();
  if(marker)return {alreadyPresent:true};
  const dataset=buildDemoData(receptionistId);
  const statements=Object.entries(dataset).flatMap(([table,rows])=>rows.map(row=>{
    const keys=Object.keys(row);
    return db.prepare(`INSERT INTO "${table}" (${keys.map(k=>`"${k}"`).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).bind(...Object.values(row).map(v=>typeof v==='boolean'?Number(v):v));
  }));
  await db.batch(statements);
  return {alreadyPresent:false,counts:Object.fromEntries(Object.entries(dataset).map(([table,rows])=>[table,rows.length]))};
}
