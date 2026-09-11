"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readApiResponse } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QuestReviewClient from "./quest-review-client";
import { useSessionUser } from "@/lib/session-user";

export default function ReceptionReviewDetail() {
  const params = useParams();
  const router = useRouter();
  const [quest, setQuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const id = String(params?.id ?? "");
  const { user } = useSessionUser();

  useEffect(() => {
    if (!id) return;
    let active = true;
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
      reportComment: quest.reportComment ?? "冒険者からの報告は未入力です。",
      checklist: quest.checklist ?? [],
      photos: quest.photos ?? [],
    };
  }, [quest]);

  const canReview = normalizedQuest?.status === "完了報告済み" && Boolean(user?.id);

  const handleVerify = (reviewNote) => {
    if (!normalizedQuest?.id || !user?.id) return;
    return fetch(`/api/quests/${normalizedQuest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "verify", reviewNote }),
    }).then(async (response) => {
      await readApiResponse(response, "達成確認の記録に失敗しました。");
      router.push("/reception");
    });
  };

  const handleRemand = (reviewNote) => {
    if (!normalizedQuest?.id || !user?.id) return;
    return fetch(`/api/quests/${normalizedQuest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "remand", reviewNote }),
    }).then(async (response) => {
      await readApiResponse(response, "差し戻しに失敗しました。");
      router.push("/reception");
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
        <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>クエストの内容を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!normalizedQuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
        <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">クエストが見つかりません</CardTitle>
              <CardDescription>受付コンソールから選び直してください。</CardDescription>
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
      <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-8">
        <header className="flex flex-col gap-4 border-b border-primary/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Receptionist</p>
            <h1 className="font-serif text-3xl text-ink">クエスト完了確認</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              冒険者から提出された成果物を確認し、達成確認を記録するための画面です。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/reception">受付コンソールへ戻る</Link>
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
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
              <InfoRow label="受付" value={normalizedQuest.receptionistName ?? "未設定"} />
              <InfoRow label="冒険者" value={normalizedQuest.adventurerName ?? "未設定"} />
              <InfoRow label="募集枠" value={normalizedQuest.slots} />
              <InfoRow label="報酬" value={normalizedQuest.reward ?? "未設定"} />
              <InfoRow label="ランク制限" value={normalizedQuest.rank ?? "未設定"} />
              <InfoRow label="クエスト詳細" value={normalizedQuest.detail ?? "未設定"} />
              <InfoRow label="リスク" value={normalizedQuest.risk ?? "未設定"} />
              <InfoRow label="成果物 / 評価基準" value={normalizedQuest.deliverables ?? "未設定"} />
              <InfoRow label="ギルド支給物" value={normalizedQuest.supplies ?? "未設定"} />
              <InfoRow label="地図 / 注意事項" value={normalizedQuest.mapNotes ?? "未設定"} />
              <InfoRow label="連絡方法" value={normalizedQuest.channel ?? "未設定"} />
            </CardContent>
          </Card>

          <QuestReviewClient
            key={`${normalizedQuest.id}-${normalizedQuest.updatedAt ?? ""}`}
            quest={normalizedQuest}
            onVerify={handleVerify}
            onRemand={handleRemand}
            canReview={canReview}
          />
        </section>
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
