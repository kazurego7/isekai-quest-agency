"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QuestDetailClient from "./quest-detail-client";

export default function AdventurerQuestDetail() {
  const params = useParams();
  const router = useRouter();
  const [quest, setQuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const id = String(params?.id ?? "");

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    fetch(`/api/quests/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setQuest(data.quest ?? null);
      })
      .catch(() => {
        if (!active) return;
        setQuest(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const normalizedQuest = useMemo(() => {
    if (!quest) return null;
    return {
      ...quest,
      slots: quest.slots ?? "未設定",
      checklist: quest.checklist ?? [],
      photos: quest.photos ?? [],
      reportComment: quest.reportComment ?? "",
      reward: quest.reward ?? "未設定",
      rank: quest.rank ?? "未設定",
      detail: quest.detail ?? "未設定",
      risk: quest.risk ?? "未設定",
      deliverables: quest.deliverables ?? "未設定",
      supplies: quest.supplies ?? "未設定",
      mapNotes: quest.mapNotes ?? "未設定",
      channel: quest.channel ?? "未設定",
      summary: quest.summary ?? "詳細は受付で確認",
    };
  }, [quest]);

  const handleAccept = () => {
    if (!normalizedQuest?.id) return;
    return fetch(`/api/quests/${normalizedQuest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "accept" }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("受注に失敗しました。");
      }
      router.push("/adventurer");
    });
  };

  const handleComplete = (reportComment) => {
    if (!normalizedQuest?.id) return;
    return fetch(`/api/quests/${normalizedQuest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "report",
        reportComment: reportComment?.comment ?? reportComment ?? "",
        checklist: reportComment?.checklist ?? [],
        photos: reportComment?.photos ?? [],
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("完了報告に失敗しました。");
      }
      router.push("/adventurer");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>クエスト詳細を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!normalizedQuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">クエストが見つかりません</CardTitle>
              <CardDescription>一覧からクエストを選び直してください。</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline" asChild>
                <Link href="/adventurer">一覧へ戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Adventurer</p>
            <h1 className="font-serif text-2xl text-ink">クエスト詳細（モック）</h1>
            <p className="text-sm text-muted-foreground">冒険者が進行状況を入力・確認する想定のダミー画面です。</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/adventurer">一覧へ戻る</Link>
          </Button>
        </header>

        <Card className="border-primary/15 bg-white/90 shadow-sm">
          <CardHeader className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">{normalizedQuest.id}</p>
              <CardTitle className="text-lg text-ink">{normalizedQuest.title}</CardTitle>
              <CardDescription>{normalizedQuest.summary}</CardDescription>
            </div>
            <Badge variant="secondary">{normalizedQuest.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="募集枠" value={normalizedQuest.slots} />
            <InfoRow label="報酬" value={normalizedQuest.reward} />
            <InfoRow label="ランク制限" value={normalizedQuest.rank} />
            <InfoRow label="クエスト詳細" value={normalizedQuest.detail} />
            <InfoRow label="リスク" value={normalizedQuest.risk} />
            <InfoRow label="成果物 / 評価基準" value={normalizedQuest.deliverables} />
            <InfoRow label="ギルド支給物" value={normalizedQuest.supplies} />
            <InfoRow label="地図 / 注意事項" value={normalizedQuest.mapNotes} />
            <InfoRow label="連絡方法" value={normalizedQuest.channel} />
          </CardContent>
          {normalizedQuest.status === "募集中" ? (
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleAccept}>
                受注する
              </Button>
            </CardFooter>
          ) : null}
        </Card>

        <QuestDetailClient quest={normalizedQuest} onComplete={handleComplete} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  );
}
