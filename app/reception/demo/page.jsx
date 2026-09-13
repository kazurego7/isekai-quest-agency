import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { first } from '@/lib/store';
import { DEMO_MARKER_ID } from '@/lib/demo-data';
import DemoSetup from './setup';
export const dynamic='force-dynamic';
export default async function DemoPage(){
  const actor=await getSessionUser();
  if(!actor||!await first('SELECT 1 FROM owner o JOIN users u ON u.authId=o.authId WHERE o.singleton=1 AND u.id=?',[actor.id]))notFound();
  return <DemoSetup alreadyPresent={Boolean(await first('SELECT 1 FROM users WHERE id=?',[DEMO_MARKER_ID]))}/>;
}
