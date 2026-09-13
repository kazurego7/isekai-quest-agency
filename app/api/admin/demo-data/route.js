import { env } from 'cloudflare:workers';
import { requireActor } from '@/lib/session';
import { first } from '@/lib/store';
import { ApiError, readJson, withApiErrors } from '@/lib/api-handler';
import { DEMO_VERSION, seedDemoData } from '@/lib/demo-data';

export const POST=withApiErrors(async request=>{
  const actor=await requireActor('staff');
  if(!await first('SELECT 1 FROM owner o JOIN users u ON u.authId=o.authId WHERE o.singleton=1 AND u.id=?',[actor.id]))throw new ApiError(403,'所有者のみデモデータを追加できます。');
  const payload=await readJson(request,1024);
  if(payload.version!==DEMO_VERSION)throw new ApiError(400,'デモデータの種類が不正です。');
  return Response.json(await seedDemoData(env.DB,actor.id));
});
