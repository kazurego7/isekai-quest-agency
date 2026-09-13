import { env } from "cloudflare:workers";
import { ApiError } from "@/lib/api-handler";
import { REQUEST_FILE_COUNT,REQUEST_FILE_BYTES,REQUEST_TOTAL_BYTES } from "@/lib/request-options";
export const REQUEST_BODY_BYTES=15*1024*1024;
export async function prepareRequestFiles(request, files, {keyPrefix="request-files",urlPrefix=`/api/requests/${request.id}/attachments`}={}) {
  if(!Array.isArray(files)||files.length>REQUEST_FILE_COUNT) throw new ApiError(400,"添付ファイルは5件までです。");
  const existing=[...(request.attachments||[]),...(request.previousConditions?.attachments||[])];
  const items=[],pending=[],seen=new Set(); let total=0;
  for(const file of files) {
    const saved=existing.find(x=>x.id===file?.id && x.url===file?.url);
    if(saved) {
      if(seen.has(saved.id)) throw new ApiError(400,"同じ添付ファイルが重複しています。");
      seen.add(saved.id);total+=saved.bytes;items.push(saved);continue;
    }
    const match=typeof file?.url==="string" ? /^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/.exec(file.url) : null;
    if(!match) throw new ApiError(400,"画像（JPEG・PNG・WebP）かPDFを選んでください。");
    let binary;try{binary=atob(match[2]);}catch{throw new ApiError(400,"添付ファイルが不正です。");}
    if(btoa(binary)!==match[2]) throw new ApiError(400,"添付ファイルが不正です。");
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0)),type=match[1];
    const valid=type==="application/pdf"?binary.startsWith("%PDF-"):type==="image/png"?[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b):type==="image/jpeg"?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:binary.startsWith("RIFF")&&binary.slice(8,12)==="WEBP";
    if(!valid) throw new ApiError(400,"ファイルの内容と形式が一致しません。");
    if(bytes.length>REQUEST_FILE_BYTES) throw new ApiError(413,"添付ファイルは1件5MBまでです。");
    total+=bytes.length;
    const id=crypto.randomUUID(),name=String(file.name||"添付ファイル").replace(/[\r\n]/g," ").slice(0,200);
    const item={id,name,type,bytes:bytes.length,key:`${keyPrefix}/${request.id}/${id}`,url:`${urlPrefix}/${id}`};
    items.push(item);pending.push({item,bytes});
  }
  if(total>REQUEST_TOTAL_BYTES) throw new ApiError(413,"添付ファイルは合計10MBまでです。");
  const uploaded=[];
  try {for(const {item,bytes} of pending){await env.BUCKET.put(item.key,bytes,{httpMetadata:{contentType:item.type}});uploaded.push(item.key);}}
  catch(error){if(uploaded.length)await env.BUCKET.delete(uploaded);throw error;}
  return {items,rollback:()=>uploaded.length?env.BUCKET.delete(uploaded):Promise.resolve()};
}
