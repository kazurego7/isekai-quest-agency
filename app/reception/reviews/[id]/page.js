import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QuestReviewClient from "./quest-review-client";

const reviewCatalog = {
  "qst-007": {
    id: "QST-007",
    title: "討伐 / 森の魔狼",
    status: "評価待ち",
    reward: "110,000G",
    rank: "Bランク以上",
    detail: "夜間の群れに注意。討伐後は現地で簡易報告を作成。",
    deliverables: "討伐証明と簡易報告",
    risk: "夜間襲撃 / 群れ",
    supplies: "応急手当具",
    mapNotes: "緑陰の森。夜間は視界不良。",
    channel: "ギルドチャット",
    slots: "2名（前衛1 / 後衛1）",
    summary: "討伐完了報告済み。冒険者の成果を確認する。",
    reportComment: "現地は視界が悪く、夜間は索敵が難しい状態でした。討伐証明と現地記録を添付しています。",
    checklist: [
      { label: "討伐証明の提出", note: "牙の提出済み", checked: true },
      { label: "討伐地点の記録", note: "座標と地形メモあり", checked: true },
      { label: "同行者の報告", note: "任意 / 口頭報告のみ", checked: false },
    ],
    photos: [
      { id: "photo-1", label: "討伐証明（牙）", url: "/window.svg" },
      { id: "photo-2", label: "現地記録（森）", url: "/globe.svg" },
      { id: "photo-3", label: "同行者の報告書", url: "/file.svg" },
    ],
  },
};

export default async function ReceptionReviewDetail({ params }) {
  const resolvedParams = await params;
  const quest = reviewCatalog[resolvedParams.id] ?? reviewCatalog["qst-007"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
      <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-8">
        <header className="flex flex-col gap-4 border-b border-primary/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Receptionist</p>
            <h1 className="font-serif text-3xl text-ink">クエスト完了確認（モック）</h1>
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
                <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                <CardTitle className="text-lg text-ink">{quest.title}</CardTitle>
                <CardDescription>{quest.summary}</CardDescription>
              </div>
              <Badge variant="secondary">{quest.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="募集枠" value={quest.slots} />
              <InfoRow label="報酬" value={quest.reward} />
              <InfoRow label="ランク制限" value={quest.rank} />
              <InfoRow label="クエスト詳細" value={quest.detail} />
              <InfoRow label="リスク" value={quest.risk} />
              <InfoRow label="成果物 / 評価基準" value={quest.deliverables} />
              <InfoRow label="ギルド支給物" value={quest.supplies} />
              <InfoRow label="地図 / 注意事項" value={quest.mapNotes} />
              <InfoRow label="連絡方法" value={quest.channel} />
            </CardContent>
          </Card>

          <QuestReviewClient quest={quest} />
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
