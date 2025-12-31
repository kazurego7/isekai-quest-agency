import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const adjustDrafts = {
  "req-001": {
    title: "護衛 / 商隊の街道移動",
    before: [
      { label: "合流地点", value: "街道の中間地点" },
      { label: "期限", value: "今週末まで" },
    ],
    suggested: [
      { label: "合流地点", value: "森の入口の宿場町" },
      { label: "期限", value: "5日以内" },
    ],
    reason: "夜間の安全確保と人員調整のため",
  },
  "req-002": {
    title: "討伐 / 湿地帯の魔蛇",
    before: [{ label: "報酬上限", value: "90,000G" }],
    suggested: [{ label: "報酬上限", value: "120,000G" }],
    reason: "危険度が高いエリアのため",
  },
  "req-003": {
    title: "採取 / 氷花の採取",
    before: [
      { label: "場所", value: "北方の山岳地帯 / 標高2,000m付近" },
      { label: "期限", value: "来週末までに納品" },
    ],
    suggested: [
      { label: "場所", value: "標高1,800mの尾根に変更" },
      { label: "期限", value: "10日以内に変更" },
    ],
    reason: "天候悪化の可能性を考慮",
  },
};

export default function AdjustPage({ params }) {
  const draft = adjustDrafts[params.id] ?? adjustDrafts["req-001"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Adjust</p>
            <h1 className="font-serif text-2xl">依頼調整（ダミー）</h1>
            <p className="text-sm text-muted-foreground">送信すると「合意待ち」側に回ります。</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/requests/${params.id}`}>詳細へ戻る</Link>
          </Button>
        </header>

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{draft.title}</CardTitle>
            <CardDescription>調整前と調整後を並べて入力できます（ダミー入力）。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">調整前</p>
              <div className="grid gap-2">
                {draft.before.map((item) => (
                  <input
                    key={item.label}
                    className="w-full rounded-lg border border-border/70 bg-muted/50 px-3 py-2 text-sm text-foreground outline-none"
                    defaultValue={`${item.label}: ${item.value}`}
                    readOnly
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">調整後（編集可能）</p>
              <div className="grid gap-2">
                {draft.suggested.map((item) => (
                  <input
                    key={item.label}
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                    defaultValue={`${item.label}: ${item.value}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">調整理由</p>
              <textarea
                className="h-24 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                defaultValue={draft.reason}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href={`/requests/${params.id}`}>調整案を送る（ダミー）</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/requests/${params.id}`}>送らず戻る</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">合意ルール（ダミー）</CardTitle>
            <CardDescription>
              調整を送った側は「合意待ち」相手にボールを渡した状態となり、自分は合意済みとみなされます。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
