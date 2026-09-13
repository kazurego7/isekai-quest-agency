export const requestTypes = [{id:"hunt",name:"討伐"},{id:"gather",name:"採集"},{id:"explore",name:"探索・調査"},{id:"escort",name:"護衛"},{id:"rescue",name:"救助"},{id:"other",name:"その他"}];
export const requestRegions = [{id:"capital",name:"王都"},{id:"north",name:"王都北部"},{id:"south",name:"王都南部"},{id:"east",name:"王都東部"},{id:"west",name:"王都西部"},{id:"frontier",name:"辺境"},{id:"other",name:"その他の地域"}];
export const REQUEST_FILE_COUNT=5, REQUEST_FILE_BYTES=5*1024*1024, REQUEST_TOTAL_BYTES=10*1024*1024;
export const requestDisplayFields = [
 {key:"title",label:"依頼名",value:r=>r.title||"未記入"},
 {key:"categoryId",label:"依頼種別",value:r=>requestTypes.find(x=>x.id===r.categoryId)?.name||"未設定"},
 {key:"purpose",label:"依頼内容",value:r=>r.purpose||"未記入"},
 {key:"location",label:"場所",value:r=>[requestRegions.find(x=>x.id===r.regionId)?.name,r.location].filter(Boolean).join("・")||"未定"},
 {key:"deadline",label:"希望期限",value:r=>r.formatVersion ? r.deadlineMode==="date" ? r.deadlineDate : r.deadlineMode==="none" ? "期限なし" : "未定" : r.deadline||"未定"},
 {key:"reward",label:"報酬予算",value:r=>r.formatVersion ? r.rewardMode==="amount" ? `${Number(r.rewardAmount).toLocaleString("ja-JP")} G` : "相談" : r.reward||"相談"},
 {key:"requesterNote",label:"その他備考",value:r=>[r.requesterNote,!r.formatVersion&&r.risk?`危険度・同行条件：${r.risk}`:null].filter(Boolean).join("\n")||"未記入"},
];
export function requestSubmissionIssue(r){
 const missing=[!r?.title?.trim()&&"依頼名",!r?.categoryId&&"依頼種別",!r?.purpose?.trim()&&"依頼内容",r?.deadlineMode==="date"&&!r.deadlineDate&&"希望期限の日付",r?.rewardMode==="amount"&&r.rewardAmount==null&&"報酬予算の金額"].filter(Boolean);
 return missing.length?`送信には${missing.join("・")}の入力が必要です。`:"";
}
export const canSubmitRequest = r => !requestSubmissionIssue(r);
