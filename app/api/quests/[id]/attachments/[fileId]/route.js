import { env } from "cloudflare:workers";
import { requireActor } from "@/lib/session";
import { getQuest,first,canSeeQuest } from "@/lib/store";
import { ApiError,withApiErrors } from "@/lib/api-handler";
export const GET=withApiErrors(async(request,context)=>{
 const actor=await requireActor(),{id,fileId}=await context.params,quest=await getQuest(id);
 if(!await canSeeQuest(quest,actor))throw new ApiError(404,"添付ファイルが見つかりません。");
 const row=await first("SELECT publicAttachments FROM quests WHERE id=?",[id]);
 const file=JSON.parse(row.publicAttachments||"[]").find(x=>x.id===fileId);
 if(!file)throw new ApiError(404,"添付ファイルが見つかりません。");
 const object=await env.BUCKET.get(file.key);if(!object)throw new ApiError(404,"添付ファイルが見つかりません。");
 return new Response(object.body,{headers:{"Content-Type":file.type,"Content-Length":String(object.size),"Content-Disposition":`inline; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g,"%27")}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});
});
