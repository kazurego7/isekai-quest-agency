import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const payouts = [
  {
    id: "P-001",
    quest: "討伐 / 湿地帯の魔蛇",
    status: "支払い待ち",
    reward: "120,000G",
    note: "受付から評価ランクSの申請。確認中。",
  },
  {
    id: "P-002",
    quest: "護衛 / 商隊の街道移動",
    status: "受付合意待ち",
    reward: "90,000G（案）",
    note: "受付が合意後に支払い予定。",
  },
  {
    id: "P-003",
    quest: "採取 / 氷花の採取",
    status: "精算準備",
    reward: "60,000G",
    note: "納品確認済み。口座情報を確認中。",
  },
];

export default function TreasurerMock() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Treasurer</p>
          <h1 className="font-serif text-2xl text-ink">会計係ビュー（モック）</h1>
          <p className="text-sm text-muted-foreground">
            支払い待ちのクエストと、受付合意待ちの精算候補をざっと確認するためのダミー画面です。
          </p>
        </header>

        <Card className="border-primary/15 bg-white/90 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">支払いリスト</CardTitle>
              <CardDescription>PC操作で精算処理を行う想定のモックです。</CardDescription>
            </div>
            <Badge variant="secondary">モック</Badge>
          </CardHeader>
          <CardContent className="space-y-3 divide-y divide-border/80 p-0">
            {payouts.map((payout) => (
              <div key={payout.id} className="space-y-1 px-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-primary">{payout.id}</p>
                    <p className="text-sm font-semibold text-ink">{payout.quest}</p>
                    <p className="text-xs text-muted-foreground">報酬: {payout.reward}</p>
                  </div>
                  <Badge variant="muted">{payout.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{payout.note}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="text-xs">
                    支払い処理（ダミー）
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs">
                    詳細を見る（ダミー）
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">CSVエクスポート（ダミー）</Button>
            <Button size="sm" variant="ghost">履歴を見る（ダミー）</Button>
          </CardFooter>
        </Card>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">メモ</CardTitle>
            <CardDescription>この画面はモックです。実動作はしません。</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" asChild className="w-full justify-center">
              <a href="/">トップに戻る</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
