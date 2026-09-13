import { requireActor } from "@/lib/session";
import { readJson,withApiErrors } from "@/lib/api-handler";
import { insert,getRequest,listRequests,now } from "@/lib/store";
import { prepareRequestFiles,REQUEST_BODY_BYTES } from "@/lib/request-files";
import { requestFields,validateSubmitted } from "@/lib/requests";
export const GET=withApiErrors(async(request)=> {
  const actor=await requireActor();
  const filter=new URL(request.url).searchParams.get("requesterId");
  const where=[],values=[];
  if(actor.userType==="staff") where.push("r.status <> '下書き'");
  if(actor.userType==="general" || filter!==null) { where.push("r.requesterId=?"); values.push(actor.userType==="general"?actor.id:filter.trim()); }
  return Response.json({requests:await listRequests(where.join(" AND ")||"1",values)});
});
export const POST=withApiErrors(async(request)=> {
  const actor=await requireActor("general"),payload=await readJson(request,REQUEST_BODY_BYTES);
  const draft=payload.mode==="draft",fields=requestFields(payload,{allowIncomplete:draft});
  if(!draft) validateSubmitted(fields);
  const id=crypto.randomUUID(),stamp=now();
  const files=await prepareRequestFiles({id},payload.attachments||[]);
  try {await insert("requests",{id,...fields,formatVersion:1,attachments:JSON.stringify(files.items),title:fields.title||"",status:draft?"下書き":"確認前",requesterId:actor.id,requesterAgreed:!draft,receptionistAgreed:false,notes:draft?"下書きを保存しました。":"受付が確認中です。",createdAt:stamp,updatedAt:stamp}).run();} catch(error){await files.rollback();throw error;}
  return Response.json({request:await getRequest(id)},{status:201});
});
