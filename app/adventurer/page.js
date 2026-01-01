import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const quests = [
  {
    id: "QST-019",
    title: "討伐 / 湿地帯の魔蛇",
    status: "募集中（案）",
    reward: "120,000G（案）",
    note: "受付が公開準備中。もうすぐ受注可能。",
  },
  {
    id: "QST-020",
    title: "護衛 / 商隊の街道移動",
    status: "公開待ち",
    reward: "90,000G",
    note: "ルート確定後に募集中へ移動予定。",
  },
];

const progress = [
  {
    id: "QST-010",
    title: "採取 / 氷花の採取",
    stage: "進行中",
    action: "納品前チェック（ダミー）",
  },
  {
    id: "QST-007",
    title: "討伐 / 森の魔狼",
    stage: "完了報告待ち",
    action: "完了報告を送信（ダミー）",
  },
];

export default function AdventurerMock() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Adventurer</p>
          <h1 className="font-serif text-2xl text-ink">冒険者用ダッシュボード（モック）</h1>
          <p className="text-sm text-muted-foreground">
            募集中のクエスト候補と、自分の進行中クエストをPCで確認するモック画面です。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">募集中の候補</CardTitle>
                <Badge variant="secondary">モック</Badge>
              </div>
              <CardDescription>受付で公開準備中のクエストを表示します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {quests.map((quest) => (
                <div key={quest.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                      <p className="text-sm font-semibold text-ink">{quest.title}</p>
                      <p className="text-xs text-muted-foreground">報酬: {quest.reward}</p>
                    </div>
                    <Badge variant="muted">{quest.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{quest.note}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      内容を見る（ダミー）
                    </Button>
                    <Button size="sm" className="text-xs">
                      受注キープ（ダミー）
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">自分のクエスト</CardTitle>
              <CardDescription>受注済み・進行中クエストの簡易ビューです。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {progress.map((quest) => (
                <div key={quest.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                      <p className="text-sm font-semibold text-ink">{quest.title}</p>
                    </div>
                    <Badge variant="muted">{quest.stage}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      {quest.action}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs">
                      チャット（ダミー）
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

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
