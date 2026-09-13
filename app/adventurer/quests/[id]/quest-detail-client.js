"use client";
import QuestPhotos from "@/components/quest-photos";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_PHOTO_BYTES, PHOTO_TYPES, PHOTO_HINT } from "@/lib/photo-limits";
import { Button } from "@/components/quest-ui/button";
export default function QuestDetailClient({ quest, onComplete }) {
    const [isReading, setIsReading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const busy = useRef(false);
    const isEditable = Boolean(quest.canReport) && !isReading && !isSubmitting;
    const canComplete = isEditable;
    const fieldHint = quest.canReport ? "クエスト進行中の間だけ編集できます。" : quest.status === "完了報告済み" ? "受付が報告内容を確認しています。" : quest.status === "達成確認済み" ? "このクエストは完了しています。" : "冒険者が活動中です。完了報告が届くまでお待ちください。";
    const [photoItems, setPhotoItems] = useState(() => (quest.photos ?? []).map((photo, index) => ({
        id: photo.id ?? `${quest.id}-photo-${index}`,
        label: photo.label ?? photo.name ?? "写真",
        name: photo.name ?? photo.label ?? "写真",
        size: photo.size ?? null,
        url: photo.url ?? null,
    })));
    const [reportComment, setReportComment] = useState(() => quest.reportComment ?? "");
    const [checklistItems, setChecklistItems] = useState(() => (quest.checklist ?? []).map((item) => ({
        ...item,
        checked: Boolean(item.checked),
    })));
    const photoCountLabel = useMemo(() => {
        if (!photoItems.length)
            return quest.canReport ? "写真は未選択" : "成果写真はまだありません。";
        return `${photoItems.length}枚の写真を追加済み`;
    }, [photoItems.length, quest.canReport]);
    const handlePhotoSelect = async (event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (!files.length || !isEditable || busy.current)
            return;
        setError("");
        const currentBytes = photoItems.reduce((sum, item) => {
            const encoded = item.url?.split(",")[1] ?? "";
            return sum + encoded.length * 3 / 4 - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
        }, 0);
        if (photoItems.length + files.length > MAX_PHOTOS ||
            files.some((file) => !PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) ||
            currentBytes + files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_PHOTO_BYTES) {
            setError(PHOTO_HINT);
            return;
        }
        busy.current = true;
        setIsReading(true);
        try {
            const nextItems = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    id: crypto.randomUUID(), name: file.name, label: file.name,
                    size: Math.ceil(file.size / 1024), url: reader.result,
                });
                reader.onerror = () => reject(new Error("写真を読み込めませんでした。選択し直してください。"));
                reader.readAsDataURL(file);
            })));
            setPhotoItems((prev) => [...prev, ...nextItems]);
        }
        catch (cause) {
            setError(cause.message);
        }
        finally {
            busy.current = false;
            setIsReading(false);
        }
    };
    const handleRemovePhoto = (id) => {
        if (!isEditable || busy.current)
            return;
        setPhotoItems((prev) => prev.filter((item) => item.id !== id));
    };
    const handleComplete = async () => {
        if (!canComplete || busy.current)
            return;
        busy.current = true;
        setIsSubmitting(true);
        setError("");
        try {
            await onComplete({ comment: reportComment, checklist: checklistItems, photos: photoItems });
        }
        catch (cause) {
            setError(cause.message || "完了報告に失敗しました。再度お試しください。");
        }
        finally {
            busy.current = false;
            setIsSubmitting(false);
        }
    };
    return <section className="guild-document"><header className="document-heading"><div><p className="eyebrow">FIELD REPORT</p><h2>{quest.status === "完了報告済み" ? "受付の確認待ち" : quest.status === "達成確認済み" ? "達成の記録" : quest.canReport ? "冒険の成果を届ける" : "冒険の進み具合"}</h2></div></header><div className="document-body space-y-7"><div><h3 className="field-label">達成条件</h3>{checklistItems.length ? checklistItems.map((item, index) => <label className="check-row" key={item.label}><Checkbox checked={item.checked} disabled={!isEditable} onCheckedChange={checked => setChecklistItems(prev => prev.map((x, i) => i === index ? { ...x, checked: Boolean(checked) } : x))}/><span><strong>{item.label}</strong>{item.note && <small>{item.note}</small>}</span></label>) : <p className="quiet text-sm">個別のチェック項目はありません。</p>}</div><div><h3 className="field-label">成果写真</h3>{isEditable && <label className="upload-zone"><Camera size={26} strokeWidth={1}/><strong>写真を選んで追加</strong><span>{PHOTO_HINT}</span><input aria-label="成果写真を追加" type="file" accept={PHOTO_TYPES.join(",")} multiple onChange={handlePhotoSelect} disabled={!isEditable}/></label>}<p className="quiet text-sm my-3" role="status">{photoCountLabel}</p><QuestPhotos photos={photoItems} onRemove={isEditable ? handleRemovePhoto : undefined} disabled={!isEditable}/></div>{quest.canReport ? <label className="guild-field"><span>成果コメント</span><textarea rows={5} placeholder="達成したことや、現地の状況を報告してください" value={reportComment} onChange={e => setReportComment(e.target.value)} readOnly={!isEditable}/></label> : <div><h3 className="field-label">成果コメント</h3><p className="whitespace-pre-wrap">{reportComment || "まだ成果報告はありません。"}</p></div>}<p className="quiet text-sm">{fieldHint}</p>{error && <p role="alert" className="action-error">{error}</p>}</div>{quest.canReport && <footer className="document-actions"><Button onClick={handleComplete} disabled={!canComplete}><Send size={16}/>{isSubmitting ? "送信中…" : isReading ? "写真を読み込み中…" : "完了報告を送信"}</Button></footer>}</section>;
}
