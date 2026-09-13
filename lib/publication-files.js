import { env } from 'cloudflare:workers';
import { ApiError } from '@/lib/api-handler';
import { prepareRequestFiles } from '@/lib/request-files';
export const draftFiles=row=>JSON.parse(row?.additionalAttachments||'[]');
export async function preparePublicationFiles(source,draft,ids,additional=[]){
 if(!Array.isArray(ids)||ids.length>5||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||!source.attachments.some(f=>f.id===id)))throw new ApiError(400,'公開する依頼書の資料を選び直してください。');
 if(!Array.isArray(additional))throw new ApiError(400,'追加する添付ファイルが不正です。');
 const selected=source.attachments.filter(f=>ids.includes(f.id));
 const prepared=await prepareRequestFiles({id:source.id,attachments:[...selected,...draftFiles(draft)]},[...selected,...additional],{keyPrefix:'publication-files',urlPrefix:`/api/requests/${source.id}/publication-draft/attachments`});
 return {...prepared,additional:prepared.items.slice(selected.length),cleanup:async()=>{
  const keep=new Set(prepared.items.map(f=>f.key)),stale=draftFiles(draft).filter(f=>!keep.has(f.key)).map(f=>f.key);
  if(stale.length)await env.BUCKET.delete(stale).catch(error=>console.error('Publication attachment cleanup failed',error));
 }};
}
