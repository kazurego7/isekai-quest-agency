import { env } from "cloudflare:workers";
import { requireActor } from "@/lib/session";
import { ApiError,withApiErrors } from "@/lib/api-handler";
import { getQuest,canSeeQuest } from "@/lib/store";
export const GET=withApiErrors(async(_request,context)=> {
  const actor=await requireActor(),{id,photoId}=await context.params,quest=await getQuest(id);
  if(!await canSeeQuest(quest,actor)) throw new ApiError(404,"写真が見つかりません。");
  const photo=quest.photos.find(x=>x.id===photoId);
  if(!photo) throw new ApiError(404,"写真が見つかりません。");
  const object=await env.BUCKET.get(photo.key);
  if(!object) throw new ApiError(404,"写真が見つかりません。");
  return new Response(object.body,{headers:{"Content-Type":photo.type,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
});
