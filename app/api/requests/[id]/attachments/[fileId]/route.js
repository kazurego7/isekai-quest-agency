import { env } from "cloudflare:workers";
import { requireActor } from "@/lib/session";
import { getRequest } from "@/lib/store";
import { ApiError,withApiErrors } from "@/lib/api-handler";
export const GET=withApiErrors(async(request,context)=>{
  const actor=await requireActor(),{id,fileId}=await context.params,current=await getRequest(id);
  if(!current)throw new ApiError(404,"添付ファイルが見つかりません。");
  const participant=actor.id===current.requesterId || (actor.userType==="staff" && current.status!=="下書き");
  if(!participant)throw new ApiError(404,"添付ファイルが見つかりません。");
  const file=[...current.attachments,...(participant?current.previousConditions?.attachments||[]:[])].find(x=>x.id===fileId);
  if(!file)throw new ApiError(404,"添付ファイルが見つかりません。");
  const object=await env.BUCKET.get(file.key);
  if(!object)throw new ApiError(404,"添付ファイルが見つかりません。");
  const disposition=new URL(request.url).searchParams.has("download")?"attachment":"inline";
  return new Response(object.body,{headers:{"Content-Type":file.type,"Content-Length":String(object.size),"Content-Disposition":`${disposition}; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g,"%27")}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});
});
