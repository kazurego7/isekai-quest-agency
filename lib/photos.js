import { env } from "cloudflare:workers";
import { ApiError } from "@/lib/api-handler";
import { MAX_PHOTOS,MAX_PHOTO_BYTES,MAX_TOTAL_PHOTO_BYTES } from "@/lib/photo-limits";

export async function preparePhotos(quest,photos) {
  if(!Array.isArray(photos) || photos.length>MAX_PHOTOS) throw new ApiError(400,"写真は5枚まで登録できます。");
  let total=0; const items=[],pending=[];
  for(const photo of photos) {
    const existing=quest.photos.find(x=>x.url===photo?.url);
    if(existing) {total+=existing.bytes;items.push(existing);continue;}
    const match=typeof photo?.url==="string" ? /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo.url):null;
    if(!match) throw new ApiError(400,"写真を選択し直してください（JPEG・PNG・WebPのみ）。");
    let binary; try {binary=atob(match[2]);} catch {throw new ApiError(400,"写真データが不正です。");}
    if(btoa(binary)!==match[2]) throw new ApiError(400,"写真データが不正です。");
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const valid=match[1]==="png"?[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b):match[1]==="jpeg"?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:binary.slice(0,4)==="RIFF"&&binary.slice(8,12)==="WEBP";
    if(!valid) throw new ApiError(400,"写真データが不正です。");
    total+=bytes.length;
    if(bytes.length>MAX_PHOTO_BYTES) throw new ApiError(413,"写真は1枚1MBまでです。");
    const id=crypto.randomUUID(),name=String(photo.name??photo.label??"写真").slice(0,200);
    const item={id,name,label:name,bytes:bytes.length,size:Math.ceil(bytes.length/1024),type:"image/"+match[1],key:quest.id+"/"+id,url:`/api/quests/${quest.id}/photos/${id}`};
    items.push(item); pending.push({item,bytes});
  }
  if(total>MAX_TOTAL_PHOTO_BYTES) throw new ApiError(413,"写真は合計2MBまでです。");
  const uploaded=[];
  try {
    for(const {item,bytes} of pending) {await env.BUCKET.put(item.key,bytes,{httpMetadata:{contentType:item.type}});uploaded.push(item.key);}
  } catch(error) {if(uploaded.length) await env.BUCKET.delete(uploaded);throw error;}
  return {items,rollback:()=>uploaded.length?env.BUCKET.delete(uploaded):Promise.resolve(),cleanup:async()=> {
    const stale=quest.photos.filter(x=>!items.some(y=>x.key===y.key)).map(x=>x.key);
    if(stale.length) await env.BUCKET.delete(stale);
  }};
}
