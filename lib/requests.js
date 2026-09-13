import { ApiError } from "@/lib/api-handler";
import { requestTypes,requestRegions } from "@/lib/request-options";
import { getRequest } from "@/lib/store";
export async function ownedRequest(id,actor) {
  const current=await getRequest(id);
  if(!current || (actor.userType==="general" && current.requesterId!==actor.id) || (actor.userType==="staff" && current.status==="下書き")) throw new ApiError(404,"依頼が見つかりません。");
  return current;
}
export function requestFields(fields,{allowIncomplete=false}={}) {
  if(!fields || typeof fields!=="object" || Array.isArray(fields)) throw new ApiError(400,"依頼内容が不正です。");
  const result=Object.fromEntries(["title","purpose","location","deadline","risk","reward","requesterNote"].map(key=> {
    if(fields[key]!=null && (typeof fields[key]!=="string" || fields[key].length>10000)) throw new ApiError(400,"依頼内容は各項目10000文字以内で入力してください。");
    return [key,fields[key]?.trim()||null];
  }));
  const categoryId=fields.categoryId||null,regionId=fields.regionId||null;
  if(categoryId && !requestTypes.some(x=>x.id===categoryId)) throw new ApiError(400,"依頼種別を選び直してください。");
  if(regionId && !requestRegions.some(x=>x.id===regionId)) throw new ApiError(400,"地域を選び直してください。");
  const deadlineMode=fields.deadlineMode??"unknown",rewardMode=fields.rewardMode??"consult";
  if(!["unknown","none","date"].includes(deadlineMode)) throw new ApiError(400,"希望期限の指定が不正です。");
  const deadlineDate=deadlineMode==="date"?(fields.deadlineDate===""?null:fields.deadlineDate??null):null;
  if(deadlineMode==="date" && !(allowIncomplete&&deadlineDate===null) && (typeof deadlineDate!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(deadlineDate) || !Number.isFinite(Date.parse(deadlineDate)) || new Date(deadlineDate).toISOString().slice(0,10)!==deadlineDate)) throw new ApiError(400,"有効な希望期限を入力してください。");
  if(!["consult","amount"].includes(rewardMode)) throw new ApiError(400,"報酬予算の指定が不正です。");
  const rewardAmount=rewardMode==="amount"?fields.rewardAmount??null:null;
  if(rewardMode==="amount" && !(allowIncomplete&&rewardAmount===null) && (!Number.isSafeInteger(rewardAmount)||rewardAmount<0||rewardAmount>999999999)) throw new ApiError(400,"報酬予算は0〜999999999 Gの整数で入力してください。");
  return {...result,formatVersion:fields.formatVersion===1?1:0,categoryId,regionId,deadlineMode,deadlineDate,rewardMode,rewardAmount};
}
export function validateSubmitted(fields) {
  if(!fields.title || !fields.categoryId || !fields.purpose) throw new ApiError(400,"依頼名・依頼種別・依頼内容を入力してください。");
}
export function requestSnapshot(request) {return {...requestFields(request),attachments:request.attachments||[]};}
