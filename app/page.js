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
