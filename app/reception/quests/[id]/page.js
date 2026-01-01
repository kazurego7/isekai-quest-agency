import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const published = {
  "qst-020": {
    id: "QST-020",
    title: "護衛 / 商隊の街道移動",
    status: "公開済み",
    reward: "90,000G",
    rank: "Cランク以上（盾役1名必須）",
    deliverables: "護衛完了報告と商隊代表の署名",
    supplies: "松明 / 予備馬1頭 / 連絡用笛",
    mapNotes: "宿場町で合流。森の迂回路を利用し、夜間は停止。",
    risk: "夜間警戒 / 同行2名",
    channel: "ギルドチャット / 緊急時は鐘楼",
  },
};

export default function PublishedQuestDetail({ params }) {
  const quest = published[params.id] ?? published["qst-020"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Quest Detail</p>
            <h1 className="font-serif text-2xl text-ink">公開済みクエスト（PC版ダミー）</h1>
            <p className="text-sm text-muted-foreground">冒険者に公開済みの内容を確認するためのダミー画面です。</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/reception">受付コンソールへ戻る</Link>
          </Button>
        </header>

        <Card className="border-primary/15 bg-white/90 shadow-sm">
          <CardHeader className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
              <CardTitle className="text-lg text-ink">{quest.title}</CardTitle>
              <CardDescription>公開済み。冒険者側ダッシュボードに表示される想定（ダミー）。</CardDescription>
            </div>
            <Badge variant="secondary">{quest.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-2">
              <InfoRow label="報酬" value={quest.reward} />
              <InfoRow label="ランク下限" value={quest.rank} />
              <InfoRow label="リスク" value={quest.risk} />
              <InfoRow label="成果物 / 評価基準" value={quest.deliverables} />
              <InfoRow label="ギルド支給物" value={quest.supplies} />
              <InfoRow label="地図 / 注意事項" value={quest.mapNotes} />
              <InfoRow label="連絡方法" value={quest.channel} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/adventurer">冒険者ビューで確認（ダミー）</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/reception/questify">文言を再編集（ダミー）</Link>
            </Button>
          </CardFooter>
        </Card>
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
