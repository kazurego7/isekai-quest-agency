import { requestTypes, requestRegions } from './request-options.js';
export const questRanks=['S','A','B','C','D','E','F'];
export const DEFAULT_COMMISSION_RATE=10;
export const gold=value=>`${Number(value).toLocaleString('ja-JP')} G`;
export function rewardBreakdown(gross,rate){const commissionAmount=Math.floor(gross*rate/100);return {commissionAmount,netReward:gross-commissionAmount};}
export function meetsRank(rank,minimum){if(!minimum)return true;const index=questRanks.indexOf(String(rank||'').replace(/ランク.*$/,''));return index>=0&&index<=questRanks.indexOf(minimum);}
export function initialPublicBrief(request){return {title:request.title||'',categoryId:request.categoryId||'',detail:request.purpose||'',locationMode:request.regionId||request.location?.trim()?'specified':'unknown',regionId:request.regionId||'',location:request.location||'',deadlineMode:request.deadlineMode||'unknown',deadlineDate:request.deadlineDate||'',publicNote:request.requesterNote||'',rank:'',recruitCount:1,minimumRank:'',participationNote:'',grossReward:request.rewardMode==='amount'?request.rewardAmount:null,commissionRate:DEFAULT_COMMISSION_RATE,distributionMode:'equal',distributionNote:'',meetingAt:'',meetingPlace:''};}
export const briefLocation=q=>q.locationMode==='after-selection'?'参加決定後に案内':[requestRegions.find(x=>x.id===q.regionId)?.name,q.location].filter(Boolean).join('・')||'未定';
export const briefDeadline=q=>q.deadlineMode==='date'?q.deadlineDate:q.deadlineMode==='none'?'期限なし':'未定';
export function validatePublicBrief(fields,checklist){
 if(!fields||typeof fields!=='object'||Array.isArray(fields))return '公開内容が不正です。';
 for(const key of ['title','categoryId','detail','regionId','locationMode','location','deadlineMode','deadlineDate','publicNote','rank','minimumRank','participationNote','distributionMode','distributionNote','meetingAt','meetingPlace'])if(fields[key]!=null&&(typeof fields[key]!=='string'||fields[key].length>(key==='title'?200:10000)))return '公開内容の文字数・形式を確認してください。';
 if(!fields.title?.trim()||!fields.detail?.trim()||!requestTypes.some(x=>x.id===fields.categoryId))return '公開する名称・種別・内容を入力してください。';
 if(fields.regionId&&!requestRegions.some(x=>x.id===fields.regionId))return '地域を選び直してください。';
 if(!['specified','after-selection'].includes(fields.locationMode)||(fields.locationMode==='specified'&&!fields.regionId&&!fields.location?.trim()))return '任務の場所を記載するか「参加決定後に案内」を選択してください。';
 if(!questRanks.includes(fields.rank))return 'クエストランクを選択してください。';
 if(fields.minimumRank&&!questRanks.includes(fields.minimumRank))return '参加できる最低ランクを選び直してください。';
 if(!Number.isInteger(fields.recruitCount)||fields.recruitCount<1||fields.recruitCount>100)return '募集人数は1〜100人で入力してください。';
 if(!Number.isSafeInteger(fields.grossReward)||fields.grossReward<0||fields.grossReward>999999999)return '依頼金額は0〜999999999 Gの整数で入力してください。';
 if(!Number.isInteger(fields.commissionRate)||fields.commissionRate<0||fields.commissionRate>100)return '仲介料率は0〜100％の整数で入力してください。';
 if(!['equal','custom'].includes(fields.distributionMode)||(fields.distributionMode==='custom'&&!fields.distributionNote?.trim()))return '報酬の分配方法を入力してください。';
 if(!['none','date'].includes(fields.deadlineMode))return '公開時は期限の日付か「期限なし」を選択してください。';
 const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 if(fields.deadlineMode==='date'&&!validDate(fields.deadlineDate))return '有効な期限を入力してください。';
 if(fields.meetingAt&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fields.meetingAt)||!validDate(fields.meetingAt.slice(0,10))||Number(fields.meetingAt.slice(11,13))>23||Number(fields.meetingAt.slice(14,16))>59))return '有効な集合日時を入力してください。';
 if(!Array.isArray(checklist)||!checklist.length||checklist.length>100||checklist.some(x=>!x||typeof x.label!=='string'||!x.label.trim()||x.label.length>1000||(x.note!=null&&(typeof x.note!=='string'||x.note.length>10000))))return '達成条件を1件以上入力してください。';
 return '';
}

export function validatePublicationDraft(fields,checklist,attachmentIds){
 if(!fields||typeof fields!=="object"||Array.isArray(fields))return "下書きの形式が不正です。";
 const numbers=["recruitCount","grossReward","commissionRate"];
 const strings=["title","categoryId","detail","regionId","locationMode","location","deadlineMode","deadlineDate","publicNote","rank","minimumRank","participationNote","distributionMode","distributionNote","meetingAt","meetingPlace"];
 if(Object.keys(fields).some(key=>!numbers.includes(key)&&!strings.includes(key)))return "下書きの項目が不正です。";
 if(strings.some(key=>fields[key]!=null&&(typeof fields[key]!=="string"||fields[key].length>(key==="title"?200:10000))))return "下書きの文字数・形式を確認してください。";
 if(numbers.some(key=>fields[key]!=null&&!Number.isSafeInteger(fields[key])))return "人数・金額・料率は整数で入力してください。";
 if(!Array.isArray(checklist)||checklist.length>100||checklist.some(x=>!x||typeof x.label!=="string"||typeof x.note!=="string"||x.label.length>1000||x.note.length>10000))return "達成条件の形式を確認してください。";
 if(!Array.isArray(attachmentIds)||attachmentIds.length>5||attachmentIds.some(x=>typeof x!=="string")||new Set(attachmentIds).size!==attachmentIds.length)return "添付ファイルの選択を確認してください。";
 return "";
}
