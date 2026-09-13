'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/quest-ui/button';
import { appFetch } from '@/lib/app-path';
export default function DemoSetup({alreadyPresent}){
  const [done,setDone]=useState(alreadyPresent),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function add(){
    setBusy(true);setError('');
    try{
      const response=await appFetch('/api/admin/demo-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:'guild-autumn-v1'})});
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      setDone(true);
    }catch(e){setError(e.message||'追加できませんでした。もう一度お試しください。');}
    finally{setBusy(false);}
  }
  return <div className="page-wrap"><header className="page-heading"><div><h1>ギルドのデモデータ</h1></div></header><section className="guild-document"><div className="document-body space-y-5"><p>採集・討伐・護衛・探索などの依頼12件と、6名の冒険者を追加します。依頼の確認からクエストの達成確認まで、各段階を試せます。</p><p>架空の人物には「デモ」と表示します。既存の記録はそのまま残り、追加は一度だけです。</p>{error&&<p role="alert">{error}</p>}{done?<p role="status">デモデータを追加済みです。受付デスクで確認できます。</p>:<Button onClick={add} disabled={busy}>{busy?'追加しています…':'デモデータを追加'}</Button>}<div><Link href="/reception">受付デスクへ戻る</Link></div></div></section></div>;
}
