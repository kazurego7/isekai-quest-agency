import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
    summary: "受付嬢から調整案が届いています。詳細を確認してください。",
  },
  {
    id: "req-002",
    title: "討伐 / 湿地帯の魔蛇",
    status: "合意待ち（受付嬢）",
    summary: "依頼者が調整案を送信済み。内容を精査してください。",
  },
  {
    id: "req-003",
    title: "採取 / 氷花の採取",
    status: "依頼者ドラフト",
    summary: "依頼者の下書き。送信前に内容を見直せます。",
  },
  {
    id: "req-004",
    title: "討伐 / 森の魔狼",
    status: "合意済み（受注）",
    summary: "両者合意済み。以降は進行フェーズです。",
  },
];

const statusStyle = {
  "合意待ち（依頼者）": "default",
  "合意待ち（受付嬢）": "secondary",
  "依頼者ドラフト": "outline",
  "合意済み（受注）": "muted",
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
              <CardFooter className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" asChild className="ml-auto">
                  <Link href={`/requests/${req.id}`}>詳細を見る</Link>
                </Button>
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
