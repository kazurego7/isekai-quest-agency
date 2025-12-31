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
    status: "進行中",
    summary: "追加の合流地点を連絡予定",
    next: "変更依頼 / 取り消し依頼のみ可",
  },
  {
    id: "req-002",
    title: "討伐 / 湿地帯の魔蛇",
    status: "審査待ち",
    summary: "審査前は取り下げのみ可",
    next: "受付の見積りを待機",
  },
  {
    id: "req-003",
    title: "採取 / 氷花の採取",
    status: "下書き",
    summary: "納品先と品質条件を入力してください",
    next: "条件を確認して送信",
  },
  {
    id: "req-004",
    title: "討伐 / 森の魔狼",
    status: "完了",
    summary: "記録のみ参照可能",
    next: "完了後は取り下げ不可",
  },
];

const statusStyle = {
  進行中: "default",
  審査待ち: "secondary",
  下書き: "outline",
  完了: "muted",
};

const actionsByStatus = {
  下書き: [
    { label: "編集（ダミー）", href: "/requests/new", variant: "outline" },
    { label: "取り下げ（ダミー）", href: "/requests", variant: "ghost" },
  ],
  審査待ち: [{ label: "取り下げ（審査前）", href: "/requests", variant: "outline" }],
  進行中: [
    { label: "変更依頼を送る（ダミー）", href: "/requests", variant: "outline" },
    { label: "取り消し依頼を送る（ダミー）", href: "/requests", variant: "ghost" },
  ],
  完了: [{ label: "参照のみ", href: "/requests", variant: "ghost" }],
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
            <CardDescription>進行中 / 審査待ち / 下書きで切り替えられます。（ダミー）</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2">
            {["進行中", "審査待ち", "下書き"].map((label) => (
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
