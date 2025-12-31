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

const mockRequests = {
  "req-001": {
    title: "護衛 / 商隊の街道移動",
    status: "進行中",
    details: [
      { label: "目的", value: "商隊を西の街まで護衛" },
      { label: "場所", value: "森を抜ける街道 / 合流地点あり" },
      { label: "期限", value: "今週末までに完了" },
      { label: "報酬上限", value: "90,000G" },
    ],
    notes: "追加の合流地点を共有予定。夜間の休憩地点も確認中。",
    next: "進捗報告を確認して返信",
  },
  "req-002": {
    title: "討伐 / 湿地帯の魔蛇",
    status: "審査待ち",
    details: [
      { label: "目的", value: "湿地帯に出現する魔蛇の討伐" },
      { label: "場所", value: "南方の湿地帯" },
      { label: "期限", value: "緊急 / 3日以内に対応希望" },
      { label: "報酬上限", value: "120,000G" },
    ],
    notes: "危険度の補足を追記すると審査が早まります。",
    next: "受付の見積りを待機",
  },
  "req-003": {
    title: "採取 / 氷花の採取",
    status: "下書き",
    details: [
      { label: "目的", value: "魔導薬の原料となる氷花の採取" },
      { label: "場所", value: "北方の山岳地帯 / 標高2,000m付近" },
      { label: "期限", value: "来週末までに納品" },
      { label: "報酬上限", value: "60,000G" },
    ],
    notes: "納品先と品質条件を追記してから送信してください。",
    next: "条件を確認して送信",
  },
};

const statusStyle = {
  進行中: "default",
  審査待ち: "secondary",
  下書き: "outline",
};

export default function RequestDetail({ params }) {
  const request = mockRequests[params.id] ?? mockRequests["req-001"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Detail</p>
            <h1 className="font-serif text-2xl">依頼詳細</h1>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/requests">一覧へ</Link>
          </Button>
        </header>

        <Card className="border border-border/70 bg-white/90 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl text-ink">{request.title}</CardTitle>
              <Badge variant={statusStyle[request.status] ?? "muted"}>{request.status}</Badge>
            </div>
            <CardDescription>{request.notes}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {request.details.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/60 px-3 py-3 text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-ink">{item.value}</span>
                </div>
              ))}
            </div>
            <Card className="border-dashed border-primary/40 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">次のアクション</CardTitle>
                <CardDescription>{request.next}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button size="sm" asChild>
                  <Link href="/requests">一覧に戻る</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/requests/new">この条件で複製</Link>
                </Button>
              </CardFooter>
            </Card>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              進捗を更新（ダミー）
            </Button>
            <Button size="sm" variant="ghost">
              受付に相談（ダミー）
            </Button>
          </CardFooter>
        </Card>

        <Button variant="ghost" asChild className="w-full justify-center">
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
