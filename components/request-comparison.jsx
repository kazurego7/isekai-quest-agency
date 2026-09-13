import { requestDisplayFields } from "@/lib/request-options";
import RequestAttachments from "@/components/request-attachments";
export default function RequestComparison({ request, historical = false }) {
 const previous=request.previousConditions;
 const beforeFiles=previous?.attachments||[],files=request.attachments||[];
 const added=files.filter(x=>!beforeFiles.some(y=>x.id===y.id)),removed=beforeFiles.filter(x=>!files.some(y=>x.id===y.id));
 const fileChanged=Boolean(previous&&(added.length||removed.length));
 const changed=previous?requestDisplayFields.filter(f=>f.value(previous)!==f.value(request)).length+Number(fileChanged):0;
 return <section className="request-comparison" aria-labelledby="request-comparison-title"><header><h2 id="request-comparison-title">{historical ? "直前の条件調整" : "依頼の条件・調整案"}</h2><p>{previous?`8 項目中 ${changed} 項目に変更があります。`:request.status==="確認前"?"初めて届いた依頼です。":"変更前の記録がないため、今回の条件を表示しています。"}</p></header>
 {requestDisplayFields.map(f=>{const differs=previous&&f.value(previous)!==f.value(request);return <section className="condition-change" data-changed={Boolean(differs)} key={f.key} aria-label={`${f.label}の条件`}><h3>{f.label}{previous&&<span>{differs?"変更あり":"変更なし"}</span>}</h3>{differs?<div className="condition-values"><div><h4>{historical ? "変更前の条件" : "自分が送った条件"}</h4><p>{f.value(previous)}</p></div><div><h4>{historical ? "変更後の条件" : "相手の調整案"}</h4><p>{f.value(request)}</p></div></div>:<p className="condition-current">{f.value(request)}</p>}</section>;})}
 <section className="condition-change" data-changed={fileChanged} aria-label="添付ファイルの条件"><h3>添付ファイル{previous&&<span>{fileChanged?"変更あり":"変更なし"}</span>}</h3>{fileChanged&&<p className="attachment-help">追加 {added.length}件・削除 {removed.length}件</p>}<RequestAttachments files={files}/>{removed.length>0&&<details className="previous-files"><summary>削除された添付（{removed.length}件）</summary><RequestAttachments files={removed}/></details>}</section>
 {!historical&&request.notes&&request.status!=="確認前"&&<div className="proposal-reason"><h3>調整理由</h3><p>{request.notes}</p></div>}</section>;
}
