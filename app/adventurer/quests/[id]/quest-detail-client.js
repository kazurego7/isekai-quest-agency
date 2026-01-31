"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestDetailClient({ quest, onComplete }) {
  const isEditable = quest.status === "クエスト進行中";
  const canComplete = quest.status === "クエスト進行中";
  const fieldHint = isEditable ? "クエスト進行中の間だけ編集できます。" : "現在は閲覧のみです。";
  const [photoItems, setPhotoItems] = useState([]);
  const [activePreview, setActivePreview] = useState(null);
  const [reportComment, setReportComment] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    setReportComment(quest.reportComment ?? "");
    setChecklistItems(
      (quest.checklist ?? []).map((item) => ({
        ...item,
        checked: Boolean(item.checked),
      })),
    );
    setPhotoItems(
      (quest.photos ?? []).map((photo, index) => ({
        id: photo.id ?? `${quest.id}-photo-${index}`,
        label: photo.label ?? photo.name ?? "写真",
        name: photo.name ?? photo.label ?? "写真",
        size: photo.size ?? null,
        url: photo.url ?? null,
      })),
    );
  }, [quest.id, quest.reportComment, quest.checklist, quest.photos]);

  useEffect(() => {
    return () => {
      photoItems.forEach((item) => {
        if (item.url?.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [photoItems]);

  const photoCountLabel = useMemo(() => {
    if (!photoItems.length) return "写真は未選択";
    return `${photoItems.length}枚の写真を追加済み`;
  }, [photoItems.length]);

  const handlePhotoSelect = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const nextItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: Math.round(file.size / 1024),
      url: URL.createObjectURL(file),
      label: file.name,
    }));
    setPhotoItems((prev) => [...prev, ...nextItems]);
    event.target.value = "";
  };

  const handleRemovePhoto = (id) => {
    setPhotoItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
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
            <label className="block">
              <span className="sr-only">成果写真を追加</span>
              <input
                type="file"
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
                      <img
                        src={photo.url ?? "/file.svg"}
                        alt={photo.name ?? photo.label}
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
          <Button
            size="sm"
            onClick={() =>
              onComplete?.({
                comment: reportComment,
                checklist: checklistItems,
                photos: photoItems,
              })
            }
            disabled={!canComplete}
          >
            完了報告を送信
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
              <img
                src={activePreview.url ?? "/file.svg"}
                alt={activePreview.name ?? activePreview.label}
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
