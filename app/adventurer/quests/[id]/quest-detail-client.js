"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import { MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_PHOTO_BYTES, PHOTO_TYPES, PHOTO_HINT } from "@/lib/photo-limits";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestDetailClient({ quest, onComplete }) {
  const [isReading, setIsReading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const isEditable = Boolean(quest.canReport) && !isReading && !isSubmitting;
  const canComplete = isEditable;
  const fieldHint = isEditable ? "クエスト進行中の間だけ編集できます。" : "現在は閲覧のみです。";
  const [photoItems, setPhotoItems] = useState(() =>
    (quest.photos ?? []).map((photo, index) => ({
      id: photo.id ?? `${quest.id}-photo-${index}`,
      label: photo.label ?? photo.name ?? "写真",
      name: photo.name ?? photo.label ?? "写真",
      size: photo.size ?? null,
      url: photo.url ?? null,
    })),
  );
  const [activePreview, setActivePreview] = useState(null);
  const [reportComment, setReportComment] = useState(() => quest.reportComment ?? "");
  const [checklistItems, setChecklistItems] = useState(() =>
    (quest.checklist ?? []).map((item) => ({
      ...item,
      checked: Boolean(item.checked),
    })),
  );

  const photoCountLabel = useMemo(() => {
    if (!photoItems.length) return "写真は未選択";
    return `${photoItems.length}枚の写真を追加済み`;
  }, [photoItems.length]);

  const handlePhotoSelect = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !isEditable || busy.current) return;
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
    } catch (cause) {
      setError(cause.message);
    } finally {
      busy.current = false;
      setIsReading(false);
    }
  };

  const handleRemovePhoto = (id) => {
    if (!isEditable || busy.current) return;
    setPhotoItems((prev) => prev.filter((item) => item.id !== id));
  };
  const handleComplete = async () => {
    if (!canComplete || busy.current) return;
    busy.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      await onComplete({ comment: reportComment, checklist: checklistItems, photos: photoItems });
    } catch (cause) {
      setError(cause.message || "完了報告に失敗しました。再度お試しください。");
    } finally {
      busy.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-primary/15 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-ink">成果チェック & 写真</CardTitle>
          <CardDescription>成果のチェックと写真アップロードをまとめて管理します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {checklistItems.map((item) => (
            <label key={item.label} className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border/70"
                checked={item.checked}
                disabled={!isEditable}
                onChange={() => {
                  if (!isEditable) return;
                  setChecklistItems((prev) =>
                    prev.map((entry) =>
                      entry.label === item.label ? { ...entry, checked: !entry.checked } : entry,
                    ),
                  );
                }}
              />
              <div>
                <p className="font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
            </label>
          ))}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-semibold text-ink">成果写真</p>
            <p className="text-xs text-muted-foreground">{photoCountLabel}</p>
            <p className="text-xs text-muted-foreground">{PHOTO_HINT}</p>
            <label className="block">
              <span className="sr-only">成果写真を追加</span>
              <input
                type="file"
                accept={PHOTO_TYPES.join(",")}
                multiple
                className="w-full text-sm text-muted-foreground"
                onChange={handlePhotoSelect}
                disabled={!isEditable}
              />
            </label>
            {photoItems.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photoItems.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                    <button
                      type="button"
                      disabled={!isEditable}
                      aria-label={`${photo.name ?? "写真"}を削除`}
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemovePhoto(photo.id);
                      }}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      className="block w-full"
                      onClick={() => setActivePreview(photo)}
                    >
                      <Image
                        src={photo.url ?? "/file.svg"}
                        alt={photo.name ?? photo.label}
                        width={320}
                        height={224}
                        unoptimized
                        className="h-28 w-full object-cover transition group-hover:scale-105"
                      />
                    </button>
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      <p className="truncate">{photo.name ?? photo.label}</p>
                      <p>{photo.size ? `${photo.size}KB` : "サイズ不明"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/30 bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                写真を選択すると一覧に追加されます。
              </div>
            )}
            <p className="text-xs text-muted-foreground">{fieldHint}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-ink">完了報告</CardTitle>
          <CardDescription>成果報告と補足コメントを送信します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink">成果コメント</span>
            <textarea
              className="h-28 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
              placeholder="成果や注意点を記入"
              value={reportComment}
              onChange={(event) => setReportComment(event.target.value)}
              readOnly={!isEditable}
            />
          </label>
          <p className="text-xs text-muted-foreground">{fieldHint}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {error ? <p role="alert" className="w-full text-sm text-red-700">{error}</p> : null}
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={!canComplete}
          >
            {isSubmitting ? "送信中..." : isReading ? "写真を読み込み中..." : "完了報告を送信"}
          </Button>
        </CardFooter>
      </Card>

      {activePreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink"
              onClick={() => setActivePreview(null)}
            >
              閉じる
            </button>
            <div className="overflow-hidden rounded-2xl bg-white">
              <Image
                src={activePreview.url ?? "/file.svg"}
                alt={activePreview.name ?? activePreview.label}
                width={1200}
                height={900}
                unoptimized
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                <p className="font-semibold text-ink">{activePreview.name ?? activePreview.label}</p>
                <p>{activePreview.size ? `${activePreview.size}KB` : "サイズ不明"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
