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
    status: "合意待ち（依頼者）",
    details: [
      { label: "目的", value: "商隊を西の街まで護衛" },
      { label: "場所", value: "森を抜ける街道 / 合流地点あり" },
      { label: "期限", value: "今週末までに完了" },
      { label: "報酬上限", value: "90,000G" },
    ],
    notes: "受付嬢から調整案が届いています。依頼者が合意すると受注されます。",
    next: "依頼者が合意 or 調整を返信",
    lastProposalBy: "受付嬢",
    proposal: [
      {
        label: "合流地点",
        before: "街道の中間地点",
        after: "森の入口の宿場町",
        reason: "夜間の安全確保のため",
      },
      {
        label: "期限",
        before: "今週末まで",
        after: "5日以内に変更",
        reason: "護衛の人数調整に時間が必要",
      },
    ],
  },
  "req-002": {
    title: "討伐 / 湿地帯の魔蛇",
    status: "合意待ち（受付嬢）",
    details: [
      { label: "目的", value: "湿地帯に出現する魔蛇の討伐" },
      { label: "場所", value: "南方の湿地帯" },
      { label: "期限", value: "緊急 / 3日以内に対応希望" },
      { label: "報酬上限", value: "120,000G" },
    ],
    notes: "依頼者から調整案が届いています。受付嬢が合意すると受注されます。",
    next: "受付嬢が合意 or 調整を返信",
    lastProposalBy: "依頼者",
    proposal: [
      {
        label: "報酬上限",
        before: "90,000G",
        after: "120,000G",
        reason: "危険度が高いエリアのため",
      },
    ],
  },
  "req-003": {
    title: "採取 / 氷花の採取",
    status: "依頼者ドラフト",
    details: [
      { label: "目的", value: "魔導薬の原料となる氷花の採取" },
      { label: "場所", value: "北方の山岳地帯 / 標高2,000m付近" },
      { label: "期限", value: "来週末までに納品" },
      { label: "報酬上限", value: "60,000G" },
    ],
    notes: "受付への送信前です。送信すると合意ラリーが始まります。",
    next: "送信して合意ラリーを開始",
    lastProposalBy: "依頼者",
    proposal: [],
  },
  "req-004": {
    title: "討伐 / 森の魔狼",
    status: "合意済み（受注）",
    details: [
      { label: "目的", value: "森の魔狼の討伐" },
      { label: "場所", value: "北の森 / 周辺の村" },
      { label: "期限", value: "完了済み" },
      { label: "報酬上限", value: "150,000G" },
    ],
    notes: "両者合意済みのため受注済み。以降は進捗・納品フェーズ。",
    next: "参照のみ",
    lastProposalBy: "受付嬢",
    proposal: [],
  },
};

const statusStyle = {
  "合意待ち（依頼者）": "default",
  "合意待ち（受付嬢）": "secondary",
  "依頼者ドラフト": "outline",
  "合意済み（受注）": "muted",
};

const actionsByStatus = {
  "依頼者ドラフト": [
    { label: "編集（ダミー）", href: "/requests/new", variant: "outline" },
    { label: "送信（ダミー）", href: "/requests", variant: "default" },
    { label: "取り下げ（ダミー）", href: "/requests", variant: "ghost" },
  ],
  "合意待ち（依頼者）": [
    { label: "合意する（ダミー）", href: "/requests", variant: "default" },
    { label: "調整を送る（ダミー）", href: "/requests/req-001/adjust", variant: "outline" },
  ],
  "合意待ち（受付嬢）": [
    { label: "合意する（ダミー）", href: "/requests", variant: "default" },
    { label: "再調整を送る（ダミー）", href: "/requests/req-002/adjust", variant: "outline" },
  ],
  "合意済み（受注）": [{ label: "参照のみ", href: "/requests", variant: "ghost" }],
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
                  <Link href={`/requests/${params.id}/adjust`}>調整を作成</Link>
                </Button>
              </CardFooter>
            </Card>
            {request.proposal.length ? (
              <Card className="border border-primary/15 bg-white/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">直近の調整案（{request.lastProposalBy}から）</CardTitle>
                  <CardDescription>調整前 / 調整後 / 調整理由を並べて表示します。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {request.proposal.map((item) => (
                    <div
                      key={item.label}
                      className="space-y-1 rounded-lg border border-border/60 bg-muted/50 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">{item.label}</span>
                        <Badge variant="outline" className="text-[11px]">
                          {request.lastProposalBy}の提案
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-1 rounded-lg bg-white/80 p-2 text-xs text-foreground">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">調整前</span>
                          <span className="font-medium">{item.before}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">調整後</span>
                          <span className="font-medium text-primary">{item.after}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">理由</span>
                          <span className="text-muted-foreground">{item.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
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
