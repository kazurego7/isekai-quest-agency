"use client";
import QuestPhotos from "@/components/quest-photos";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/quest-ui/button";
export default function QuestReviewClient({ quest, onVerify, onRemand, canReview }) {
    const [reviewNote, setReviewNote] = useState("");
    const [remandError, setRemandError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const actionPending = useRef(false);
    const canAction = Boolean(canReview) && !isSubmitting;
    const trimmedReviewNote = reviewNote.trim();
    const handleAction = async (remand) => {
        if (!canAction || actionPending.current)
            return;
        if (remand && !trimmedReviewNote) {
            setRemandError("差し戻し理由を入力してください。");
            return;
        }
        actionPending.current = true;
        setIsSubmitting(true);
        setRemandError("");
        try {
            await (remand ? onRemand(trimmedReviewNote) : onVerify(reviewNote));
        }
        catch (error) {
            setRemandError(error.message || "更新に失敗しました。");
        }
        finally {
            actionPending.current = false;
            setIsSubmitting(false);
        }
    };
    return <section className="guild-document"><header className="document-heading"><ShieldCheck size={24}/><div><p className="eyebrow">GUILD VERIFICATION</p><h2>{quest.status === "クエスト進行中" ? "冒険の進み具合" : quest.status === "達成確認済み" ? "達成の記録" : "成果報告の確認"}</h2></div></header><div className="document-body space-y-7">{quest.status === "クエスト進行中" && <p className="quiet">冒険者が活動中です。完了報告が届いたら確認できます。</p>}<div><h3 className="field-label">達成条件</h3>{quest.checklist.length ? quest.checklist.map(item => <div className="check-row" key={item.label}>{item.checked ? <Check size={18} className="text-primary"/> : <Minus size={18}/>}<span><strong>{item.label}</strong><small>{item.checked ? "達成済み" : "未チェック"}{item.note ? ` · ${item.note}` : ""}</small></span></div>) : <p className="quiet text-sm">個別のチェック項目はありません。</p>}</div><div><h3 className="field-label">成果写真</h3><QuestPhotos photos={quest.photos}/></div><div><h3 className="field-label">冒険者からの報告</h3><blockquote className="report-quote">{quest.reportComment || "コメントはありません。"}</blockquote></div>{canReview ? <label className="guild-field"><span>確認メモ・差し戻し理由</span><textarea rows={4} placeholder="差し戻す場合は、再報告してほしい点を書いてください" value={reviewNote} onChange={e => setReviewNote(e.target.value)} readOnly={!canAction}/></label> : quest.reviewNote && <div><h3 className="field-label">受付の確認メモ</h3><p>{quest.reviewNote}</p></div>}{remandError && <p role="alert" className="action-error">{remandError}</p>}</div>{canReview && <footer className="document-actions"><Button variant="outline" onClick={() => handleAction(true)} disabled={!canAction}>差し戻す</Button><Button onClick={() => handleAction(false)} disabled={!canAction}><ShieldCheck size={16}/>{isSubmitting ? "記録中…" : "クエスト達成を承認"}</Button></footer>}</section>;
}
