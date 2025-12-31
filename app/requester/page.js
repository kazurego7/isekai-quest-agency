"use client";

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

const requesterView = {
  id: "requester",
  label: "依頼者",
  badge: "依頼票の作成",
  description: "依頼内容を登録し、受付状況を追跡するモバイル優先ビュー。",
  metrics: [
    { label: "下書き", value: "2件", note: "未送信" },
    { label: "受付待ち", value: "3件", note: "平均処理 12分" },
    { label: "完了", value: "6件", note: "過去30日" },
  ],
  laneTitle: "提出・進捗ボード",
  laneSubtitle: "受付に送信済みの依頼票",
  laneItems: [
    {
      title: "US-01 依頼票の作成",
      status: "受付待ち",
      meta: "期限: 2日後 / 緊急度: 中",
    },
    {
      title: "US-03 依頼内容の追記",
      status: "下書き",
      meta: "質問: 希望報酬の上限調整",
    },
    {
      title: "US-09 納品受領確認",
      status: "完了",
      meta: "受付ログにサイン済み",
    },
  ],
  panels: [
    {
      title: "入力ガイド",
      items: [
        "目的・期限・報酬の必須チェックを表示",
        "添付素材のアップロード枠を固定",
        "提出前プレビューで漏れを警告",
      ],
    },
    {
      title: "連絡ボックス",
      items: [
        "受付からの質問に回答して再提出",
        "補足コメントを残して履歴化",
        "通知とメールを同時に送信",
      ],
    },
  ],
  actions: [
    { title: "下書きを提出", note: "受付嬢へ送信してエスカレーション" },
    { title: "前回の依頼をコピー", note: "フィールドを再利用して高速登録" },
    { title: "納品受領書を共有", note: "会計係が支払いを準備" },
  ],
  handoff: {
    title: "受付への共有",
    steps: [
      "緊急度タグと期限をセット",
      "添付ファイルをドラッグ＆ドロップ",
      "提出後は質問チャットに集約",
    ],
  },
  alerts: [
    { label: "質問", text: "報酬上限を5%引き上げますか？", note: "受付嬢 ミリア" },
    { label: "進行中", text: "US-01 が受付ステップに進行", note: "14分前" },
    { label: "完了", text: "納品確認済み。支払い手続きへ移行", note: "昨日" },
  ],
};

export default function RequesterPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-primary/5">
      <div className="pointer-events-none absolute right-[-25%] top-[-20%] h-[320px] w-[320px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-20%] h-[320px] w-[320px] rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative z-10 px-5 pb-20 pt-8 md:px-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-ink">
                {requesterView.badge}
              </Badge>
              <span className="text-sm text-muted-foreground">モバイル優先</span>
            </div>
            <h1 className="font-serif text-3xl text-ink sm:text-4xl">
              依頼者のためのシンプルな依頼フロー
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              下書き保存、提出、受付とのやりとりをスマホから完結。進捗と次の一手を1画面で確認できます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/">トップへ戻る</Link>
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              下書きを提出
            </Button>
          </div>
        </header>

        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {requesterView.metrics.map((metric) => (
              <Card key={metric.label} className="border-none bg-white/90 shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-semibold text-ink">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.note}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-3 rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">{requesterView.laneSubtitle}</p>
                <h2 className="font-semibold text-ink">{requesterView.laneTitle}</h2>
              </div>
              <Badge variant="muted">{requesterView.laneItems.length} 件</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {requesterView.laneItems.map((item) => (
                <Card
                  key={item.title}
                  className="border border-border/60 bg-background/80 shadow-none"
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {requesterView.panels.map((panel) => (
              <Card key={panel.title} className="border border-border/60 bg-white/90">
                <CardHeader>
                  <CardTitle className="text-lg">{panel.title}</CardTitle>
                  <CardDescription>スマホでも確認しやすいガイド</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {panel.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,0.9fr]">
            <Card className="border border-border/60 bg-white/90 shadow-sm">
              <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">主要アクション</CardTitle>
                  <CardDescription>依頼者がすぐに行える操作</CardDescription>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button className="w-full sm:w-auto">下書きを提出</Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    前回依頼をコピー
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {requesterView.actions.map((action) => (
                  <div
                    key={action.title}
                    className="rounded-lg border border-border/60 bg-background/70 px-3 py-3"
                  >
                    <p className="text-sm font-semibold text-ink">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.note}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Card className="border border-border/60 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{requesterView.handoff.title}</CardTitle>
                  <CardDescription>提出後の引き継ぎチェック</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {requesterView.handoff.steps.map((step) => (
                      <li
                        key={step}
                        className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-white/90 shadow-sm">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">アラートと更新</CardTitle>
                    <CardDescription>最新の通知を確認</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-accent text-ink">
                    {requesterView.alerts.length} 件
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requesterView.alerts.map((alert) => (
                    <div
                      key={alert.text}
                      className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="muted" className="bg-primary/10 text-primary">
                          {alert.label}
                        </Badge>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-ink">{alert.text}</p>
                          <p className="text-xs text-muted-foreground">{alert.note}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        次のアクション
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
