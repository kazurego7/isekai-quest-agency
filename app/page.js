"use client";

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
import Link from "next/link";
import { useState } from "react";

const heroStats = [
  { label: "稼働中クエスト", value: "128", note: "3日以内の完了見込み" },
  { label: "未処理依頼", value: "24", note: "受付嬢の確認待ち" },
  { label: "支払い待ち", value: "9", note: "素材査定完了済み" },
];

const roles = [
  { title: "依頼者", text: "依頼票の作成と進行状況の確認を一元化。" },
  { title: "受付嬢", text: "依頼内容を精査し、クエスト票へ変換。" },
  { title: "冒険者", text: "公開クエストの受注と進捗報告。" },
  { title: "会計係", text: "素材評価と報酬支払いを管理。" },
];

const roleViews = [
  {
    id: "requester",
    label: "依頼者",
    badge: "依頼票の作成",
    description: "依頼内容を登録し、受付状況を追跡するビュー。",
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
  },
  {
    id: "reception",
    label: "受付嬢",
    badge: "クエスト票作成",
    description: "依頼票を精査し、冒険者へ配信するビュー。",
    metrics: [
      { label: "受理待ち", value: "5件", note: "今シフト" },
      { label: "確認中", value: "3件", note: "平均 8分" },
      { label: "差戻し", value: "1件", note: "補足依頼" },
    ],
    laneTitle: "クエスト票の下書き",
    laneSubtitle: "冒険者公開前のチェック",
    laneItems: [
      {
        title: "US-02 依頼詳細の確認",
        status: "チェック中",
        meta: "素材リストと危険度を検証",
      },
      {
        title: "US-10 緊急依頼の精査",
        status: "優先",
        meta: "期限: 本日中 / 補給申請",
      },
      {
        title: "US-11 依頼差戻し",
        status: "コメント送付",
        meta: "報酬配分の再確認を依頼",
      },
    ],
    panels: [
      {
        title: "審査チェック",
        items: [
          "危険度・難易度をタグで設定",
          "報酬バランスを自動提案",
          "補足質問を依頼者へ送信",
        ],
      },
      {
        title: "クエスト票プレビュー",
        items: [
          "公開範囲と担当ギルドを選択",
          "必要スキルと人数を明示",
          "準備物リストを印刷可能に",
        ],
      },
    ],
    actions: [
      { title: "クエスト票を発行", note: "冒険者掲示板に公開" },
      { title: "差戻しコメントを書く", note: "依頼者に修正点を共有" },
      { title: "危険度タグを更新", note: "緊急案件を優先に表示" },
    ],
    handoff: {
      title: "冒険者への引き渡し",
      steps: [
        "受付チェックリストを完了",
        "担当班を割り当て",
        "進行アラートを自動設定",
      ],
    },
    alerts: [
      { label: "新着", text: "US-04 が受注されました", note: "冒険者: カナタ" },
      { label: "確認", text: "報酬額を 12% 再計算", note: "自動提案" },
      { label: "差戻し", text: "US-11 コメント送信済み", note: "依頼者の追記待ち" },
    ],
  },
  {
    id: "adventurer",
    label: "冒険者",
    badge: "進捗報告",
    description: "受注したクエストと連絡を一画面で管理。",
    metrics: [
      { label: "受注可能", value: "12件", note: "掲示板" },
      { label: "進行中", value: "4件", note: "パーティ共有" },
      { label: "期限接近", value: "1件", note: "残り 1日" },
    ],
    laneTitle: "受注・進捗トラッカー",
    laneSubtitle: "報告テンプレート付き",
    laneItems: [
      {
        title: "US-04 クエスト受注",
        status: "進行中",
        meta: "次の報告: 2時間後",
      },
      {
        title: "US-05 進捗コメント更新",
        status: "報告待ち",
        meta: "写真添付必須 / 危険度: 高",
      },
      {
        title: "US-06 素材納品申請",
        status: "納品準備",
        meta: "査定予定: 明日午前",
      },
    ],
    panels: [
      {
        title: "進捗報告テンプレ",
        items: [
          "位置情報とスクリーンショットを添付",
          "ボタン一つでステータス更新",
          "通知を依頼者・受付へ同報",
        ],
      },
      {
        title: "パーティ共有",
        items: [
          "役割分担をカードで表示",
          "危険度上昇時に即アラート",
          "補給申請をワンクリックで送信",
        ],
      },
    ],
    actions: [
      { title: "進捗コメントを書く", note: "テンプレに沿って 1 分で送信" },
      { title: "納品チェックを開始", note: "会計係へ自動連携" },
      { title: "サポートに ping", note: "受付へ緊急連絡" },
    ],
    handoff: {
      title: "納品と引き継ぎ",
      steps: [
        "完了報告と証跡を提出",
        "素材を倉庫へ搬入し査定予約",
        "支払いトリガーを会計へ通知",
      ],
    },
    alerts: [
      { label: "締切", text: "US-05 の報告期限が 2 時間後", note: "通知済み" },
      { label: "更新", text: "受付が補給申請を承認", note: "倉庫へ搬入" },
      { label: "連絡", text: "会計係が査定を待機中", note: "納品チェック後" },
    ],
  },
  {
    id: "accountant",
    label: "会計係",
    badge: "査定と支払い",
    description: "素材査定と報酬支払いを管理するビュー。",
    metrics: [
      { label: "査定待ち", value: "4件", note: "納品済み" },
      { label: "支払い待ち", value: "3件", note: "承認済み" },
      { label: "今月完了", value: "18件", note: "合計 1,284,000G" },
    ],
    laneTitle: "査定・支払いキュー",
    laneSubtitle: "証跡とレシートを確認",
    laneItems: [
      {
        title: "US-07 素材評価",
        status: "査定中",
        meta: "希少素材: 星欠けの鱗 / 2個",
      },
      {
        title: "US-08 報酬支払い記録",
        status: "支払い待ち",
        meta: "ギルド口座への送金予定",
      },
      {
        title: "US-12 領収書発行",
        status: "準備中",
        meta: "依頼者へ PDF 送付",
      },
    ],
    panels: [
      {
        title: "査定チェックリスト",
        items: [
          "提出証跡と数量を照合",
          "市場価格から報酬を自動計算",
          "会計ログを履歴に残す",
        ],
      },
      {
        title: "支払いオプション",
        items: [
          "口座・現金・ギルドポイントを選択",
          "承認者と二重チェックを記録",
          "領収書の発行先を設定",
        ],
      },
    ],
    actions: [
      { title: "査定を完了", note: "単価を確定して依頼者へ通知" },
      { title: "支払いを実行", note: "承認付きで送金" },
      { title: "領収書を送付", note: "メールとポータルで共有" },
    ],
    handoff: {
      title: "支払いまでの流れ",
      steps: [
        "査定結果を受付と依頼者へ共有",
        "支払い予定日を確定",
        "完了後に履歴へ保存",
      ],
    },
    alerts: [
      { label: "承認", text: "US-08 が支払い承認済み", note: "最終確認待ち" },
      { label: "確認", text: "納品証跡の画像が添付されました", note: "冒険者カナタ" },
      { label: "完了", text: "今月の支払い 86% が完了", note: "ダッシュボード更新" },
    ],
  },
];

const flows = [
  {
    title: "クエストフロー",
    steps: [
      "依頼登録 → 依頼一覧",
      "受付確認 → クエスト票作成",
      "冒険者受注 → 進捗更新",
      "完了報告 → 報告記録",
    ],
  },
  {
    title: "素材納品フロー",
    steps: [
      "納品申請 → 受付確認",
      "素材評価 → 報酬設定",
      "支払い記録 → 履歴保存",
    ],
  },
  {
    title: "通知と履歴",
    steps: ["進捗アラート通知", "差分ログの自動保存", "ロール別の閲覧制御"],
  },
];

const boardColumns = [
  {
    title: "受付待ち",
    items: ["US-01 依頼票の作成", "US-02 依頼詳細の確認"],
  },
  {
    title: "進行中",
    items: ["US-04 クエスト受注", "US-05 進捗コメント更新", "US-06 素材納品申請"],
  },
  {
    title: "完了",
    items: ["US-07 素材評価", "US-08 報酬支払い記録"],
  },
];

const reports = [
  { title: "今月の報酬支払い", value: "1,284,000G", note: "支払い済み 86%" },
  { title: "クエスト成功率", value: "92%", note: "前月比 +4pt" },
  { title: "受付処理時間", value: "14分", note: "平均/依頼" },
];

export default function Home() {
  const [activeRole, setActiveRole] = useState(roleViews[0].id);
  const selectedRole = roleViews.find((role) => role.id === activeRole) ?? roleViews[0];

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute right-[-18%] top-[-22%] h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-12%] h-[420px] w-[420px] rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative z-10 px-6 pb-24 pt-10 lg:px-16">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-lg font-serif text-white shadow-glow">
              異
            </span>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                Guild Ops Platform
              </p>
              <h2 className="font-serif text-xl">異世界クエスト斡旋局</h2>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="transition hover:text-foreground" href="#features">
              機能
            </a>
            <a className="transition hover:text-foreground" href="#flows">
              フロー
            </a>
            <a className="transition hover:text-foreground" href="#board">
              ボード
            </a>
            <a className="transition hover:text-foreground" href="#reports">
              レポート
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm">
              資料を見る
            </Button>
            <Button variant="outline" size="sm">
              デモを予約
            </Button>
            <Button asChild size="sm" className="bg-secondary text-ink hover:bg-secondary/90">
              <Link href="/requester">依頼者モックを開く</Link>
            </Button>
          </div>
        </header>

        <main className="space-y-16">
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">
                  Quest Operation Suite
                </p>
                <h1 className="font-serif text-4xl leading-tight tracking-wide text-ink md:text-5xl">
                  依頼から報酬まで、ギルド運営を一画面で。
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  依頼者・受付嬢・冒険者・会計係の動きを同期し、クエストの進行・納品・支払いを見える化します。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg">体験フローを見る</Button>
                  <Button variant="outline" size="lg">
                    機能一覧
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <Card
                    key={stat.label}
                    className="border-none bg-white/80 shadow-glow backdrop-blur"
                  >
                    <CardContent className="space-y-2 p-5">
                      <span className="text-sm text-muted-foreground">
                        {stat.label}
                      </span>
                      <p className="text-3xl font-semibold text-ink">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border-none bg-white/90 shadow-glow backdrop-blur">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">今日のギルド状況</p>
                  <CardDescription>第3支部 / 夜勤帯</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-mint text-white">
                  稼働中
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    { label: "緊急", text: "魔獣討伐の補給申請が到着" },
                    { label: "新規", text: "依頼票 5件が受理待ち" },
                    { label: "完了", text: "納品3件の報酬承認済み" },
                  ].map((item) => (
                    <li
                      key={item.text}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-white/70 px-4 py-3"
                    >
                      <Badge variant="muted" className="bg-accent text-ink">
                        {item.label}
                      </Badge>
                      <span className="text-sm text-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex items-center justify-between rounded-b-xl bg-muted/60">
                <div>
                  <p className="text-sm text-muted-foreground">次の受付シフト</p>
                  <p className="font-semibold text-ink">22:00 - 02:00</p>
                </div>
                <Button variant="ghost" size="sm">
                  引き継ぎを書く
                </Button>
              </CardFooter>
            </Card>
          </section>

          <section id="features" className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Roles</p>
              <div className="space-y-2">
                <h2 className="font-serif text-3xl">役割ごとのワークスペース</h2>
                <p className="max-w-2xl text-muted-foreground">
                  依頼者の入力から会計係の支払いまで、担当ごとに必要な情報だけを整理。
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((role) => (
                <Card
                  key={role.title}
                  className="border-none bg-white/80 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-glow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription>{role.text}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Badge variant="muted">専用ダッシュボード</Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-6 rounded-2xl border border-primary/10 bg-white/80 p-6 shadow-glow backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Role Views</p>
                <h2 className="font-serif text-3xl">操作する人ごとのモックレイアウト</h2>
                <p className="max-w-3xl text-muted-foreground">
                  依頼者・受付嬢・冒険者・会計係の4ロールをタブで切り替え、必要なパネルと導線をそれぞれに最適化したビューを確認できます。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roleViews.map((role) => (
                  <Button
                    key={role.id}
                    variant={activeRole === role.id ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setActiveRole(role.id)}
                  >
                    {role.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-4 rounded-xl border border-border/60 bg-background/70 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-secondary text-ink">
                      {selectedRole.badge}
                    </Badge>
                    <h3 className="font-serif text-2xl text-ink">{selectedRole.label}ビュー</h3>
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    このレイアウトを複製
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {selectedRole.metrics.map((metric) => (
                    <Card key={metric.label} className="border-none bg-white/80 shadow-sm">
                      <CardContent className="space-y-2 p-4">
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-semibold text-ink">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.note}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{selectedRole.laneSubtitle}</p>
                      <h4 className="font-semibold text-ink">{selectedRole.laneTitle}</h4>
                    </div>
                    <Badge variant="muted">{selectedRole.laneItems.length} 件</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {selectedRole.laneItems.map((item) => (
                      <div
                        key={item.title}
                        className="space-y-1 rounded-lg border border-border/60 bg-background/70 p-3"
                      >
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="text-xs text-primary">{item.status}</p>
                        <p className="text-xs text-muted-foreground">{item.meta}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {selectedRole.panels.map((panel) => (
                    <Card key={panel.title} className="border border-border/60 bg-white/80">
                      <CardHeader>
                        <CardTitle className="text-lg">{panel.title}</CardTitle>
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
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border border-border/60 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">主要アクション</CardTitle>
                    <CardDescription>ロール固有のCTAをピン留め</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRole.actions.map((action) => (
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

                <Card className="border border-border/60 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedRole.handoff.title}</CardTitle>
                    <CardDescription>引き継ぎ時のチェックポイント</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {selectedRole.handoff.steps.map((step) => (
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

                <Card className="border border-border/60 bg-white/80 shadow-sm">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">アラートと更新</CardTitle>
                      <CardDescription>最新の通知を確認</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-accent text-ink">
                      {selectedRole.alerts.length} 件
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRole.alerts.map((alert) => (
                      <div
                        key={alert.text}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
                      >
                        <Badge variant="muted" className="bg-primary/10 text-primary">
                          {alert.label}
                        </Badge>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-ink">{alert.text}</p>
                          <p className="text-xs text-muted-foreground">{alert.note}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="flows" className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Flows</p>
              <h2 className="font-serif text-3xl">依頼から完了までの流れを一本化</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {flows.map((flow) => (
                <Card
                  key={flow.title}
                  className="border border-primary/10 bg-card/90 shadow-sm backdrop-blur"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{flow.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {flow.steps.map((step) => (
                        <li
                          key={step}
                          className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2"
                        >
                          <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="board" className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Live Board
              </p>
              <h2 className="font-serif text-3xl">クエストボードのモック</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {boardColumns.map((column) => (
                <Card
                  key={column.title}
                  className="border border-border/60 bg-white/80 shadow-sm backdrop-blur"
                >
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-lg">{column.title}</CardTitle>
                    <Badge variant="muted">{column.items.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.items.map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-border/70 bg-background/80 px-3 py-3 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-ink">{item}</p>
                        <p className="text-xs text-muted-foreground">担当: 自動割当</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="reports" className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Reports
              </p>
              <h2 className="font-serif text-3xl">レポートと支払い状況</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {reports.map((report) => (
                <Card
                  key={report.title}
                  className="border-none bg-card/80 shadow-sm backdrop-blur"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-3xl font-semibold text-ink">{report.value}</p>
                    <p className="text-sm text-muted-foreground">{report.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/80 via-primary to-mint/70 p-10 text-white shadow-glow">
            <div className="absolute right-[-10%] top-[-20%] h-48 w-48 rounded-full bg-white/20 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-3">
                <h2 className="font-serif text-3xl">ギルド運営をすぐにデジタル化</h2>
                <p className="max-w-2xl text-sm text-white/90">
                  モックアップはそのまま Next.js で拡張できます。UI を使って仕様を詰めていきましょう。
                </p>
              </div>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                variant="secondary"
              >
                モックを共有
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
