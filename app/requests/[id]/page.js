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

const fieldOrder = [
  "依頼タイトル",
  "目的・背景",
  "場所",
  "完了期限",
  "危険度・同行条件",
  "報酬上限額",
  "備考",
];

const mockRequests = {
  "req-001": {
    title: "護衛 / 商隊の街道移動",
    status: "合意待ち",
    fields: {
      "依頼タイトル": "護衛 / 商隊の街道移動",
      "目的・背景": "商隊を西の街まで護衛する",
      "場所": "森を抜ける街道 / 合流地点あり",
      "完了期限": "今週末までに完了",
      "危険度・同行条件": "同行2名、夜間警戒を希望",
      "報酬上限額": "90,000G",
      備考: "追加の合流地点を共有予定。夜間の休憩地点も確認中。",
    },
    notes: "受付へ送信済み。受付嬢の合意を待っています。相談・再調整が必要なら連絡してください。",
  },
  "req-002": {
    title: "討伐 / 湿地帯の魔蛇",
    status: "確認前",
    fields: {
      "依頼タイトル": "討伐 / 湿地帯の魔蛇",
      "目的・背景": "湿地帯に出現する魔蛇の討伐",
      "場所": "南方の湿地帯",
      "完了期限": "緊急 / 3日以内に対応希望",
      "危険度・同行条件": "同行3名、毒への耐性装備必須",
      "報酬上限額": "120,000G",
      備考: "依頼者から調整案が届いています。受付嬢が合意すると受注されます。",
    },
    notes: "受付嬢から調整案が届きました。内容を確認し、合意または再調整を返信してください。",
  },
  "req-003": {
    title: "採取 / 氷花の採取",
    status: "下書き",
    fields: {
      "依頼タイトル": "採取 / 氷花の採取",
      "目的・背景": "魔導薬の原料となる氷花の採取",
      "場所": "北方の山岳地帯 / 標高2,000m付近",
      "完了期限": "来週末までに納品",
      "危険度・同行条件": "同行1名、寒冷地装備必須",
      "報酬上限額": "60,000G",
      備考: "受付への送信前です。送信すると合意ラリーが始まります。",
    },
    notes: "送信して合意ラリーを開始してください。",
  },
  "req-004": {
    title: "討伐 / 森の魔狼",
    status: "受注済み",
    fields: {
      "依頼タイトル": "討伐 / 森の魔狼",
      "目的・背景": "森の魔狼の討伐",
      "場所": "北の森 / 周辺の村",
      "完了期限": "完了済み",
      "危険度・同行条件": "同行2名、夜間行動あり",
      "報酬上限額": "150,000G",
      備考: "両者合意済みのため受注済み。以降は進捗・納品フェーズ。",
    },
    notes: "参照のみ可能です。",
  },
  "req-005": {
    title: "護衛 / 貴族の街道行軍",
    status: "完了",
    fields: {
      "依頼タイトル": "護衛 / 貴族の街道行軍",
      "目的・背景": "貴族一行の安全な移動と警護",
      "場所": "王都から東の街道沿い",
      "完了期限": "完了済み",
      "危険度・同行条件": "同行3名、夜間行軍あり",
      "報酬上限額": "200,000G",
      備考: "完了した依頼の履歴です。",
    },
    notes: "完了済みのため参照のみです。",
  },
};

const statusStyle = {
  合意待ち: "default",
  確認前: "secondary",
  下書き: "outline",
  受注済み: "muted",
  完了: "muted",
};

const actionsByStatus = {
  下書き: [
    { label: "編集（ダミー）", href: "/requests/new", variant: "outline" },
    { label: "送信（ダミー）", href: "/requests", variant: "default" },
    { label: "取り下げ（ダミー）", href: "/requests", variant: "ghost" },
  ],
  合意待ち: [
    { label: "受付嬢の合意待ち", href: "/requests", variant: "secondary" },
    { label: "相談する（ダミー）", href: "/requests", variant: "outline" },
  ],
  確認前: [
    { label: "合意する（ダミー）", href: "/requests", variant: "default" },
    { label: "再調整を送る（ダミー）", href: "/requests/req-002/adjust", variant: "outline" },
  ],
  受注済み: [{ label: "参照のみ", href: "/requests", variant: "ghost" }],
  完了: [{ label: "完了済みの履歴", href: "/requests", variant: "ghost" }],
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
              {fieldOrder.map((label) => (
                <div
                  key={label}
                  className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/60 px-3 py-3 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-ink">{request.fields[label]}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {(actionsByStatus[request.status] ?? []).map((action) => (
              <Button key={action.label} size="sm" variant={action.variant} asChild>
                <Link href={action.href}>{action.label}</Link>
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
