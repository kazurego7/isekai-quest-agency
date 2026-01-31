"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestReviewClient({ quest, onVerify, onRemand, canReview }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [remandError, setRemandError] = useState("");

  useEffect(() => {
    setReviewNote("");
    setRemandError("");
  }, [quest.id]);

  const canAction = Boolean(canReview);
  const trimmedReviewNote = reviewNote.trim();
  const hasPhotos = quest.photos.length > 0;

  return (
    <>
      <Card className="border-primary/15 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-ink">成果チェック & 写真</CardTitle>
          <CardDescription>冒険者が提出した成果物を確認するための一覧です。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {quest.checklist.map((item) => (
            <label
              key={item.label}
              className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border/70"
                checked={item.checked}
                readOnly
                disabled
              />
              <div>
                <p className="font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
            </label>
          ))}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-semibold text-ink">成果写真</p>
            {hasPhotos ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {quest.photos.map((photo, index) => (
                  <button
                    key={photo.id ?? `${quest.id}-photo-${index}`}
                    type="button"
                    className="group overflow-hidden rounded-lg border border-border/70 bg-muted/30 text-left"
                    onClick={() => setActivePhoto(photo)}
                  >
                    <img
                      src={photo.url ?? "/file.svg"}
                      alt={photo.label ?? photo.name ?? "成果写真"}
                      className="h-24 w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      <p className="truncate">{photo.label ?? photo.name ?? "成果写真"}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                成果写真はまだ登録されていません。
              </div>
            )}
            <p className="text-xs text-muted-foreground">写真をクリックすると拡大表示します。</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-ink">達成確認</CardTitle>
          <CardDescription>受付が確認した内容を記録します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink">冒険者の成果コメント</p>
            <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-ink">
              {quest.reportComment}
            </div>
          </div>
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink">確認メモ</span>
            <textarea
              className="h-28 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
              placeholder="確認内容のメモ"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              readOnly={!canAction}
            />
          </label>
          {remandError ? <p className="text-xs text-red-500">{remandError}</p> : null}
          <p className="text-xs text-muted-foreground">レビュー後に達成確認を記録します。</p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!trimmedReviewNote) {
                setRemandError("差し戻し理由を入力してください。");
                return;
              }
              setRemandError("");
              onRemand?.(trimmedReviewNote);
            }}
            disabled={!canAction}
          >
            差し戻し
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setRemandError("");
              onVerify?.(reviewNote);
            }}
            disabled={!canAction}
          >
            達成確認を記録
          </Button>
        </CardFooter>
      </Card>

      {activePhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink"
              onClick={() => setActivePhoto(null)}
            >
              閉じる
            </button>
            <div className="overflow-hidden rounded-2xl bg-white">
              <img
                src={activePhoto.url ?? "/file.svg"}
                alt={activePhoto.label ?? activePhoto.name ?? "成果写真"}
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                <p className="font-semibold text-ink">{activePhoto.label ?? activePhoto.name ?? "成果写真"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
