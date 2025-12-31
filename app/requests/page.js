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
    next: "進捗報告の確認",
  },
  {
    id: "req-002",
    title: "討伐 / 湿地帯の魔蛇",
    status: "審査待ち",
    summary: "危険度の補足を追記すると早く進みます",
    next: "受付の見積りを待機",
  },
  {
    id: "req-003",
    title: "採取 / 氷花の採取",
    status: "下書き",
    summary: "納品先と品質条件を入力してください",
    next: "条件を確認して送信",
  },
];

const statusStyle = {
  進行中: "default",
  審査待ち: "secondary",
  下書き: "outline",
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
              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/requests/${req.id}`}>詳細を見る</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/requests/${req.id}`}>進捗を更新</Link>
                </Button>
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
