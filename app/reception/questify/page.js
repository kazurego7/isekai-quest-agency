"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionUser } from "@/lib/session-user";
const publishFieldLabels = [
  { key: "rank", label: "冒険者ランク制限", placeholder: "Bランク以上" },
  { key: "slots", label: "募集人数・役割", placeholder: "3名（前衛1 / 後衛1 / 支援1）" },
  { key: "detail", label: "クエスト詳細", placeholder: "討伐地点の状況や注意点を記載" },
  { key: "deliverables", label: "成果物・評価基準", placeholder: "討伐証明部位 + 現地写真。傷/欠損がないこと" },
  { key: "supplies", label: "ギルド支給物", placeholder: "解毒薬2本 / 地図 / 簡易テント / 松明" },
  { key: "mapNotes", label: "地図・注意事項", placeholder: "沼地東側の浅瀬を推奨。夜間は迂回。毒沼に立入禁止" },
  { key: "channel", label: "連絡方法", placeholder: "魔法通信 / 緊急時は鐘楼" },
];

export default function QuestifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
          <div className="mx-auto max-w-screen-xl px-6 pb-16 pt-10">
            <Card className="border border-dashed border-border/60 bg-white/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
                <CardDescription>依頼内容を取得しています。</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <QuestifyClient />
    </Suspense>
  );
}

function QuestifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSessionUser();
  const [checklistItems, setChecklistItems] = useState([{ label: "", note: "" }]);
  const [publishFields, setPublishFields] = useState(() =>
    publishFieldLabels.reduce((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {}),
  );

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    fetch(`/api/requests/${requestId}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setRequest(data.request ?? null);
      })
      .catch(() => {
        if (!active) return;
        setRequest(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestId]);

  const canPublish = useMemo(() => {
    return request?.status === "合意済み" && Boolean(user?.id);
  }, [request, user]);

  const handleFieldChange = (key, value) => {
    setPublishFields((prev) => ({ ...prev, [key]: value }));
  };

  const updateChecklistItem = (index, key, value) => {
    setChecklistItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
    );
  };

  const addChecklistItem = () => {
    setChecklistItems((prev) => [...prev, { label: "", note: "" }]);
  };

  const removeChecklistItem = (index) => {
    setChecklistItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePublish = () => {
    if (!requestId) return;
    return fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        publishFields,
        checklist: checklistItems
          .map((item) => ({
            label: String(item.label ?? "").trim(),
            note: String(item.note ?? "").trim(),
          }))
          .filter((item) => item.label),
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("クエスト化に失敗しました。");
      }
      router.push("/adventurer");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-xl px-6 pb-16 pt-10">
          <Card className="border border-dashed border-border/60 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>依頼内容を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-xl px-6 pb-16 pt-10">
          <Card className="border border-dashed border-border/60 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">依頼が見つかりません</CardTitle>
              <CardDescription>合意済みの依頼を一覧から選んでください。</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline" asChild>
                <Link href="/reception">受付コンソールへ戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-xl px-6 pb-16 pt-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Questify</p>
            <h1 className="font-serif text-2xl text-ink">クエスト化</h1>
            <p className="text-sm text-muted-foreground">
              依頼者と合意済みの内容に、冒険者向け公開項目を追加してクエスト票を作成します。
            </p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/reception">受付コンソールへ戻る</Link>
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">{request.id}</p>
                  <CardTitle className="text-lg text-ink">{request.title}</CardTitle>
                  <CardDescription>依頼者から送信された情報を表示しています。</CardDescription>
                </div>
                <Badge variant="secondary">{request.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">依頼者</span>
                <span className="text-ink text-right">{request.requesterName ?? "未設定"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">依頼タイトル</span>
                <span className="text-ink text-right">{request.title ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">目的・背景</span>
                <span className="text-ink text-right">{request.purpose ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">場所</span>
                <span className="text-ink text-right">{request.location ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">完了期限</span>
                <span className="text-ink text-right">{request.deadline ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">危険度・同行条件</span>
                <span className="text-ink text-right">{request.risk ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">報酬上限額</span>
                <span className="text-ink text-right">{request.reward ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">備考</span>
                <span className="text-ink text-right">{request.requesterNote ?? "-"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">冒険者向け公開項目</CardTitle>
                <Badge variant="secondary">公開前に必須</Badge>
              </div>
              <CardDescription>ランク制限や成果物など、公開文面に載せる追加項目を入力します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {publishFieldLabels.map((field) => (
                <label key={field.key} className="space-y-1 block">
                  <span className="text-sm font-semibold text-ink">{field.label}</span>
                  <input
                    className="w-full rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder={field.placeholder}
                    value={publishFields[field.key]}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  />
                </label>
              ))}
              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">成果チェックリスト</p>
                    <p className="text-xs text-muted-foreground">冒険者が完了報告時にチェックする項目です。</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addChecklistItem}>
                    追加
                  </Button>
                </div>
                {checklistItems.map((item, index) => (
                  <div
                    key={`check-${index}`}
                    className="space-y-2 rounded-lg border border-border/60 bg-white/80 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">項目 {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground"
                        onClick={() => removeChecklistItem(index)}
                        disabled={checklistItems.length <= 1}
                      >
                        削除
                      </Button>
                    </div>
                    <label className="space-y-1 block">
                      <span className="text-xs font-semibold text-ink">チェック項目</span>
                      <input
                        className="w-full rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                        placeholder="例: 成果物の写真を提出"
                        value={item.label}
                        onChange={(event) => updateChecklistItem(index, "label", event.target.value)}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-semibold text-ink">補足メモ</span>
                      <input
                        className="w-full rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                        placeholder="例: 提出時に傷がないことを確認"
                        value={item.note}
                        onChange={(event) => updateChecklistItem(index, "note", event.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handlePublish} disabled={!canPublish}>
                クエストとして公開
              </Button>
              {!canPublish ? (
                <span className="text-[11px] text-muted-foreground">合意済みの依頼のみ公開できます。</span>
              ) : null}
              <Button size="sm" variant="outline" asChild>
                <Link href="/reception">公開せず戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">メモ</CardTitle>
            <CardDescription>クエスト化すると「合意済み」から「クエスト化済み」に状態が遷移し、冒険者側ダッシュボードに表示されます。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
