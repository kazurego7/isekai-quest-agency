import { requireActor } from "@/lib/session";
import { ApiError,readJson,withApiErrors } from "@/lib/api-handler";
import { getRequest,guarded,update,statement,first,canSeeQuest } from "@/lib/store";
import { prepareRequestFiles,REQUEST_BODY_BYTES } from "@/lib/request-files";
import { env } from "cloudflare:workers";
import { ownedRequest,requestFields,validateSubmitted,requestSnapshot } from "@/lib/requests";
export const GET=withApiErrors(async(request,context)=> {
  const actor=await requireActor(),{id}=await context.params,current=await ownedRequest(id,actor);
  const filter=new URL(request.url).searchParams.get("requesterId");
  if(filter!==null && actor.userType==="staff" && current.requesterId!==filter.trim()) throw new ApiError(404,"依頼が見つかりません。");
  const quest=await first("SELECT id,requestId,status,adventurerId FROM quests WHERE requestId=?",[id]);
  current.relatedQuest=quest?{id:quest.id,status:quest.status,canView:await canSeeQuest(quest,actor)}:null;
  return Response.json({request:current});
});
export const PATCH=withApiErrors(async(request,context)=> {
  const actor=await requireActor(),{id}=await context.params,payload=await readJson(request,REQUEST_BODY_BYTES),{mode}=payload;
  const current=await ownedRequest(id,actor),staff=actor.userType==="staff";
  let data=staff?{receptionistId:actor.id}:{};
  if(mode==="draft-save" || mode==="submit") {
    if(staff) throw new ApiError(403,"依頼者のみ操作できます。");
    if(current.status!=="下書き") throw new ApiError(409,"下書き以外は保存・送信できません。");
    const fields=requestFields(payload.fields??{},{allowIncomplete:mode==="draft-save"});
    if(mode==="submit") validateSubmitted(fields);
    data={...fields,title:fields.title||"",notes:mode==="submit"?"受付が確認中です。":"下書きを保存しました。"};
    if(mode==="submit") Object.assign(data,{status:"確認前",requesterAgreed:true,receptionistAgreed:false});
  } else if(mode==="agree" || mode==="adjust") {
    if(!["確認前","合意待ち","合意済み"].includes(current.status)) throw new ApiError(409,"現在の状態では合意・調整できません。");
    if(mode==="agree") {
      const requesterAgreed=!staff||current.requesterAgreed,receptionistAgreed=staff||current.receptionistAgreed,agreed=requesterAgreed&&receptionistAgreed;
      data={...data,requesterAgreed,receptionistAgreed,status:agreed?"合意済み":"合意待ち",notes:agreed?"依頼内容は合意済みです。受付のクエスト化を待っています。":"相手の合意待ちです。"};
    } else {
      const fields=requestFields(payload.fields??{});
      validateSubmitted(fields);
      // Repeated proposals from the same side retain the recipient's last conditions.
      const sameSender=staff ? current.receptionistAgreed && !current.requesterAgreed : current.requesterAgreed && !current.receptionistAgreed;
      const previousConditions=sameSender && current.previousConditions ? current.previousConditions : requestSnapshot(current);
      if(payload.reason!=null && (typeof payload.reason!=="string" || payload.reason.length>10000)) throw new ApiError(400,"調整理由は10000文字以内で入力してください。");
      data={...data,...fields,previousConditions:JSON.stringify(previousConditions),title:fields.title||current.title,status:"合意待ち",notes:payload.reason||"調整案が届きました。相手の合意待ちです。",requesterAgreed:!staff,receptionistAgreed:staff};
    }
  } else throw new ApiError(400,"更新内容が不正です。");
  let files;
  if(["draft-save","submit","adjust"].includes(mode)) {
    files=await prepareRequestFiles(current,payload.fields?.attachments??current.attachments);
    data={...data,formatVersion:1,attachments:JSON.stringify(files.items)};
  }
  try {await guarded("requests",id,current.revision,[update("requests",id,data)]);}
  catch(error){await files?.rollback();throw error;}
  if(files) {
    const keep=new Set([...files.items,...(data.previousConditions?JSON.parse(data.previousConditions).attachments||[]:current.previousConditions?.attachments||[])].map(x=>x.key));
    const stale=[...current.attachments,...(current.previousConditions?.attachments||[])].filter(x=>!keep.has(x.key)).map(x=>x.key);
    if(stale.length) await env.BUCKET.delete([...new Set(stale)]).catch(error=>console.error("Attachment cleanup failed",error));
  }
  return Response.json({request:await getRequest(id)});
});
export const DELETE=withApiErrors(async(request,context)=> {
  const actor=await requireActor("general"),{id}=await context.params,current=await ownedRequest(id,actor);
  const origin=request.headers.get("origin");
  if((origin && origin!==new URL(request.url).origin) || request.headers.get("sec-fetch-site")==="cross-site") throw new ApiError(403,"この送信元からは操作できません。");
  if(current.status!=="下書き") throw new ApiError(409,"下書き以外は削除できません。");
  await guarded("requests",id,current.revision,[statement("DELETE FROM requests WHERE id=?",[id])]);
  const keys=[...current.attachments,...(current.previousConditions?.attachments||[])].map(x=>x.key);
  if(keys.length) await env.BUCKET.delete([...new Set(keys)]).catch(error=>console.error("Attachment cleanup failed",error));
  return Response.json({ok:true});
});
