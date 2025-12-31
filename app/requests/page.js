import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const requests = [
  {
    id: "req-001",
    title: "護衛 / 商隊の街道移動",
    status: "合意待ち（依頼者）",
    summary: "受付嬢から調整案が届いています",
    next: "依頼者が合意 or 再調整を送信",
  },
  {
    id: "req-002",
    title: "討伐 / 湿地帯の魔蛇",
    status: "合意待ち（受付嬢）",
    summary: "依頼者が調整案を送信済み",
    next: "受付嬢が合意すると受注",
  },
  {
    id: "req-003",
    title: "採取 / 氷花の採取",
    status: "依頼者ドラフト",
    summary: "依頼者の下書き。受付に送信で合意ラリー開始",
    next: "内容を確認して送信",
  },
  {
    id: "req-004",
    title: "討伐 / 森の魔狼",
    status: "合意済み（受注）",
    summary: "両者合意済み。以降は進行フェーズ",
    next: "参照のみ",
  },
];

const statusStyle = {
  "合意待ち（依頼者）": "default",
  "合意待ち（受付嬢）": "secondary",
  "依頼者ドラフト": "outline",
  "合意済み（受注）": "muted",
};

const actionsByStatus = {
  "依頼者ドラフト": [
    { label: "編集する（ダミー）", href: "/requests/new", variant: "outline" },
    { label: "受付へ送信（ダミー）", href: "/requests", variant: "default" },
  ],
  "合意待ち（依頼者）": [
    { label: "合意する（ダミー）", href: "/requests/req-001", variant: "default" },
    { label: "調整を送る（ダミー）", href: "/requests/req-001/adjust", variant: "outline" },
  ],
  "合意待ち（受付嬢）": [
    { label: "合意する（ダミー）", href: "/requests/req-002", variant: "default" },
    { label: "再調整を送る（ダミー）", href: "/requests/req-002/adjust", variant: "outline" },
  ],
  "合意済み（受注）": [{ label: "参照のみ", href: "/requests", variant: "ghost" }],
};

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Requests</p>
            <h1 className="font-serif text-2xl">依頼状況一覧</h1>
          </div>
          <Button asChild size="sm">
            <Link href="/requests/new">新規依頼</Link>
          </Button>
        </header>

        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="border border-border/70 bg-white/90 shadow-sm">
              <CardHeader className="space-y-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-ink">{req.title}</CardTitle>
                  <Badge variant={statusStyle[req.status] ?? "muted"}>{req.status}</Badge>
                </div>
                <CardDescription>{req.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">次のアクション: {req.next}</p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/requests/${req.id}`}>詳細を見る</Link>
                </Button>
                {(actionsByStatus[req.status] ?? []).map((action) => (
                  <Button key={action.label} variant={action.variant} size="sm" asChild>
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">依頼を絞り込み</CardTitle>
            <CardDescription>合意待ち（依頼者 / 受付嬢）やドラフトで切り替えられます。（ダミー）</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2">
            {["合意待ち（依頼者）", "合意待ち（受付嬢）", "依頼者ドラフト"].map((label) => (
              <Button key={label} size="sm" variant="outline">
                {label}
              </Button>
            ))}
          </CardFooter>
        </Card>

        <Button variant="ghost" asChild className="w-full justify-center">
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
