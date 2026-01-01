import Link from "next/link";

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

const adjustDrafts = {
  "req-001": {
    title: "護衛 / 商隊の街道移動",
    before: {
      "依頼タイトル": "護衛 / 商隊の街道移動",
      "目的・背景": "商隊を西の街まで護衛する",
      "場所": "森を抜ける街道 / 合流地点あり",
      "完了期限": "今週末までに完了",
      "危険度・同行条件": "同行2名、夜間警戒を希望",
      "報酬上限額": "90,000G",
      備考: "追加の合流地点を共有予定。夜間の休憩地点も確認中。",
    },
    suggested: {
      "依頼タイトル": "護衛 / 商隊の街道移動",
      "目的・背景": "商隊を西の街まで護衛する",
      "場所": "森の入口の宿場町に変更",
      "完了期限": "5日以内に変更",
      "危険度・同行条件": "同行2名、夜間警戒を希望",
      "報酬上限額": "90,000G",
      備考: "宿場町で合流することで安全性を確保",
    },
    reason: "夜間の安全確保と人員調整のため",
  },
  "req-002": {
    title: "討伐 / 湿地帯の魔蛇",
    before: {
      "依頼タイトル": "討伐 / 湿地帯の魔蛇",
      "目的・背景": "湿地帯に出現する魔蛇の討伐",
      "場所": "南方の湿地帯",
      "完了期限": "緊急 / 3日以内に対応希望",
      "危険度・同行条件": "同行3名、毒への耐性装備必須",
      "報酬上限額": "90,000G",
      備考: "沼地入口で合流予定",
    },
    suggested: {
      "依頼タイトル": "討伐 / 湿地帯の魔蛇",
      "目的・背景": "湿地帯に出現する魔蛇の討伐",
      "場所": "南方の湿地帯",
      "完了期限": "緊急 / 3日以内に対応希望",
      "危険度・同行条件": "同行3名、毒への耐性装備必須",
      "報酬上限額": "120,000G",
      備考: "沼地入口で合流予定",
    },
    reason: "危険度が高いエリアのため",
  },
  "req-003": {
    title: "採取 / 氷花の採取",
    before: {
      "依頼タイトル": "採取 / 氷花の採取",
      "目的・背景": "魔導薬の原料となる氷花の採取",
      "場所": "北方の山岳地帯 / 標高2,000m付近",
      "完了期限": "来週末までに納品",
      "危険度・同行条件": "同行1名、寒冷地装備必須",
      "報酬上限額": "60,000G",
      備考: "天候によっては納期延長あり",
    },
    suggested: {
      "依頼タイトル": "採取 / 氷花の採取",
      "目的・背景": "魔導薬の原料となる氷花の採取",
      "場所": "標高1,800mの尾根に変更",
      "完了期限": "10日以内に変更",
      "危険度・同行条件": "同行1名、寒冷地装備必須",
      "報酬上限額": "60,000G",
      備考: "天候悪化の可能性を考慮",
    },
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
            <p className="text-sm text-muted-foreground">
              依頼者と受付嬢が交互に「合意」または「調整」を送ります。この画面では調整案のみ送信し、合意は詳細画面で行う想定です（誤合意防止のため）。
            </p>
            <div className="mt-2 rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-ink">
              <p className="font-semibold text-ink">合意ラリーの流れ（例）</p>
              <p>依頼者が依頼送信 → 受付嬢が合意 or 調整 → 依頼者が合意 or 再調整 → 受付嬢が合意</p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/requests/${params.id}`}>詳細へ戻る</Link>
          </Button>
        </header>

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{draft.title}</CardTitle>
            <CardDescription>調整前と調整後を上下で比較しながら入力できます（ダミー）。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldOrder.map((label) => (
              <div key={label} className="space-y-2 rounded-lg border border-border/50 bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{label}</span>
                  <span className="text-[11px] text-muted-foreground">上: 調整前（相手案） / 下: 調整後（今回の提案）</span>
                </div>
                <div className="space-y-2">
                  <input
                    className="w-full rounded-lg border border-border/70 bg-muted/60 px-3 py-2 text-sm text-foreground outline-none"
                    readOnly
                    defaultValue={draft.before[label]}
                  />
                  <input
                    className="w-full rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                    defaultValue={draft.suggested[label]}
                  />
                </div>
              </div>
            ))}
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
              <Link href={`/requests/${params.id}`}>今回の提案を送信（ダミー）</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/requests/${params.id}`}>送らず戻る</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">合意ルール（ダミー）</CardTitle>
            <CardDescription>
              調整を送った側は受付嬢の合意待ちとなり、自分（依頼者）は合意済みとみなされます。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
