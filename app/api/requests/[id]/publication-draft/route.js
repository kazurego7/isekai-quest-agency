import { REQUEST_BODY_BYTES } from "@/lib/request-files";
import { preparePublicationFiles,draftFiles } from "@/lib/publication-files";
import { requireActor } from "@/lib/session";
import { ApiError,readJson,withApiErrors } from "@/lib/api-handler";
import { ownedRequest } from "@/lib/requests";
import { first,insert,update,guarded,now } from "@/lib/store";
import { validatePublicationDraft } from "@/lib/public-quest";
const payload=row=>row?{fields:JSON.parse(row.fields),checklist:JSON.parse(row.checklist),attachmentIds:JSON.parse(row.attachmentIds),additionalAttachments:draftFiles(row),revision:row.revision}:null;
export const GET=withApiErrors(async(_request,context)=>{
 const actor=await requireActor("staff"),{id}=await context.params;await ownedRequest(id,actor);
 return Response.json({draft:payload(await first("SELECT * FROM publicationDrafts WHERE id=?",[id]))});
});
export const PUT=withApiErrors(async(request,context)=>{
 const actor=await requireActor("staff"),{id}=await context.params,source=await ownedRequest(id,actor),body=await readJson(request,REQUEST_BODY_BYTES);
 if(source.status!=="合意済み")throw new ApiError(409,"合意済みの依頼のみ公開準備を保存できます。");
 const problem=validatePublicationDraft(body.fields,body.checklist,body.attachmentIds);if(problem)throw new ApiError(400,problem);
 if(body.attachmentIds.some(id=>!source.attachments.some(f=>f.id===id)))throw new ApiError(400,"依頼書に含まれる資料を選択してください。");
 const current=await first("SELECT * FROM publicationDrafts WHERE id=?",[id]);
 if((current?.revision??null)!==(body.revision??null))throw new ApiError(409,"別の画面で下書きが更新されました。再読み込みして確認してください。");
 const files=await preparePublicationFiles(source,current,body.attachmentIds,body.additionalAttachments??[]);
 const data={fields:JSON.stringify(body.fields),checklist:JSON.stringify(body.checklist),attachmentIds:JSON.stringify(body.attachmentIds),additionalAttachments:JSON.stringify(files.additional)};
 try {
  if(current)await guarded("publicationDrafts",id,current.revision,[update("publicationDrafts",id,data)]);
  else await guarded("requests",id,source.revision,[insert("publicationDrafts",{id,...data,createdAt:now(),updatedAt:now()})]);
 }catch(error){await files.rollback();throw error;}
 await files.cleanup();
 return Response.json({draft:payload(await first("SELECT * FROM publicationDrafts WHERE id=?",[id]))});
});
