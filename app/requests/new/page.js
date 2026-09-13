"use client";
import { appFetch } from "@/lib/app-path";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ScrollText, Send, Save } from "lucide-react";
import { Button } from "@/components/quest-ui/button";
import ConfirmActionButton from "../confirm-action-button";
import { canSubmitRequest } from "@/lib/request-options";
import RequestFields from "@/components/request-fields";
import { PageHeading } from "@/components/quest-workspace";
export default function NewRequestPage() { const router = useRouter(); const [form, setForm] = useState({formatVersion:1}), [pending, setPending] = useState(false), [filesBusy,setFilesBusy] = useState(false), [error, setError] = useState(""); const busy = useRef(false); async function save(draft) { if (busy.current)
    return; busy.current = true; setPending(true); setError(""); try {
    const r = await appFetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, ...(draft ? { mode: "draft" } : {}) }) });
    const d = await r.json();
    if (!r.ok)
        throw new Error(d.error || "保存できませんでした。");
    router.push(draft ? `/requests/requester/${d.request.id}` : "/requests");
}
catch (e) {
    setError(e.message);
    throw e;
}
finally {
    busy.current = false;
    setPending(false);
} } return <div className="page-wrap"><PageHeading eyebrow="A NEW REQUEST" title="新しい依頼を書く" description="あなたの願いを、冒険者に託しましょう。"><Button asChild variant="ghost"><Link href="/requests"><ArrowLeft size={16}/>依頼帳に戻る</Link></Button></PageHeading><div className="document-layout"><section className="guild-document"><header className="document-heading"><ScrollText size={25}/><div><p className="eyebrow">REQUEST FORM</p><h2>ギルド依頼書</h2></div><span className="document-mark">未提出</span></header><div className="document-body"><RequestFields value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} disabled={pending||filesBusy} onBusyChange={setFilesBusy}/>{error && <p role="alert" className="action-error">{error}</p>}</div><footer className="document-actions"><Button variant="outline" disabled={pending||filesBusy} onClick={() => save(true).catch(() => { })}><Save size={16}/>下書きを保存</Button><ConfirmActionButton href="/requests" requireConfirm confirmTitle="この依頼をギルドに届けますか？" confirmMessage="送信後は受付が内容を確認します。条件の変更は受付との調整で行います。" confirmLabel="依頼を送信" onConfirm={() => save(false)} disabled={pending || filesBusy || !canSubmitRequest(form)}><Send size={16}/>受付に送信</ConfirmActionButton></footer></section><aside className="document-guide"><p className="eyebrow">BEFORE YOU SEND</p><h2>依頼を届けるまで</h2><ol><li><strong>願いと条件を書く</strong><p>場所、期限、報酬が分かると、受付との相談がスムーズです。</p></li><li><strong>受付と内容を確認</strong><p>送信後に条件を調整し、お互いに合意します。</p></li><li><strong>冒険者を募集</strong><p>受付がクエストを公開し、冒険者を選定します。</p></li></ol><p className="guide-note">迷ったら、まずは下書きへ。あとから続きを書けます。</p></aside></div></div>; }
