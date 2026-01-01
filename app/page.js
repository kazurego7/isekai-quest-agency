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

const quickActions = [
  { label: "新規依頼", note: "3分で送信", variant: "default", href: "/requests/new" },
  { label: "依頼一覧", note: "進行・審査を確認", variant: "outline", href: "/requests" },
  { label: "受付に相談", note: "チャットで確認", variant: "ghost", href: "/requests/new" },
];

const checklist = [
  { title: "依頼の目的", note: "どんな課題を解決したいか" },
  { title: "完了期限", note: "急ぎの場合は理由も記載" },
  { title: "危険度・同行条件", note: "必要な装備や人数" },
  { title: "報酬と上限額", note: "分からなければ上限だけ" },
  { title: "連絡方法", note: "電話か魔導通信か" },
];

const activeRequests = [
  {
    title: "護衛 / 商隊の街道移動",
    status: "合意待ち",
    next: "受付嬢の合意を待っています。必要なら相談を。",
    detail: "受付へ送信済み。受付嬢が合意すると受注になります。",
  },
  {
    title: "討伐 / 湿地帯の魔蛇",
    status: "確認前",
    next: "依頼者が内容を確認し、合意または再調整を返信",
    detail: "受付嬢から調整案が届いています。確認して次のアクションを選択。",
  },
  {
    title: "採取 / 氷花の採取",
    status: "受注済み",
    next: "参照のみ",
    detail: "両者合意で受注済み。以降は進行・報告フェーズ。",
  },
];

const templates = [
  {
    title: "討伐テンプレート",
    description: "討伐対象・場所・討伐条件を順に入力。",
    badge: "おすすめ",
  },
  {
    title: "護衛テンプレート",
    description: "移動経路や人数を案内どおりに記入。",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8">
        <header className="mb-8 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-lg font-serif text-white shadow-glow">
            異
          </span>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Requester
            </p>
            <h1 className="font-serif text-xl">依頼をスマホで完結</h1>
          </div>
        </header>

        <main className="space-y-10">
          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Mobile First</p>
              <h2 className="font-serif text-3xl leading-tight text-ink">
                必要な入力だけ。片手で依頼を送信。
              </h2>
              <p className="text-sm text-muted-foreground">
                下書き保存と相談をワンタップで呼び出せます。必須項目を埋めれば最短3分で受付に届きます。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className="justify-between"
                  asChild
                >
                  <a href={action.href}>
                    <span className="font-semibold">{action.label}</span>
                    <span className="text-xs text-muted-foreground">{action.note}</span>
                  </a>
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Checklist</p>
                <h3 className="font-serif text-2xl">送信前にここだけ確認</h3>
              </div>
              <Badge variant="secondary">目安 3分</Badge>
            </div>
            <Card className="border border-primary/10 bg-white/90 shadow-sm backdrop-blur">
              <CardContent className="divide-y divide-border/80 p-0">
                {checklist.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" size="sm">
                  よくある質問
                </Button>
                <Button size="sm">チェックを完了</Button>
              </CardFooter>
            </Card>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Status</p>
                <h3 className="font-serif text-2xl">依頼の状況</h3>
              </div>
              <Button variant="ghost" size="sm">
                履歴を見る
              </Button>
            </div>
            <div className="space-y-3">
              {activeRequests.map((request) => (
                <Card key={request.title} className="border border-border/70 bg-white/90 shadow-sm">
                  <CardHeader className="space-y-1">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-ink">{request.title}</CardTitle>
                      <Badge variant="muted">{request.status}</Badge>
                    </div>
                    <CardDescription>{request.detail}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-between">
                    <p className="text-sm text-muted-foreground">次のアクション: {request.next}</p>
                    <Button variant="ghost" size="sm">
                      詳細
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Templates</p>
                <h3 className="font-serif text-2xl">テンプレートから入力</h3>
              </div>
              <Badge variant="secondary">最短</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.title}
                  className="border-none bg-card/90 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-glow"
                >
                  <CardHeader className="flex items-start justify-between space-y-1">
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    {template.badge ? <Badge variant="secondary">{template.badge}</Badge> : null}
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      このテンプレートで作成
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-r from-primary via-primary/90 to-mint/80 p-6 text-white shadow-glow">
            <div className="absolute right-[-10%] top-[-30%] h-32 w-32 rounded-full bg-white/15 blur-3xl" />
            <div className="relative z-10 space-y-3">
              <h3 className="font-serif text-2xl">困ったら受付にまかせて</h3>
              <p className="text-sm text-white/90">
                分からない項目は空欄でも送信できます。受付嬢がチャットでフォローし、見積りを提示します。
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  すぐ相談する
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  フィードバックを送る
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
