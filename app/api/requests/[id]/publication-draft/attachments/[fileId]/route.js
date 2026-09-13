import { env } from "cloudflare:workers";
import { requireActor } from "@/lib/session";
import { ownedRequest } from "@/lib/requests";
import { first } from "@/lib/store";
import { draftFiles } from "@/lib/publication-files";
import { ApiError,withApiErrors } from "@/lib/api-handler";
export const GET=withApiErrors(async(_request,context)=>{
 const actor=await requireActor("staff"),{id,fileId}=await context.params;await ownedRequest(id,actor);
 const row=await first("SELECT additionalAttachments FROM publicationDrafts WHERE id=?",[id]);
 const file=draftFiles(row).find(f=>f.id===fileId);if(!file)throw new ApiError(404,"添付ファイルが見つかりません。");
 const object=await env.BUCKET.get(file.key);if(!object)throw new ApiError(404,"添付ファイルが見つかりません。");
 return new Response(object.body,{headers:{"Content-Type":file.type,"Content-Length":String(object.size),"Content-Disposition":`inline; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g,"%27")}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});
});
