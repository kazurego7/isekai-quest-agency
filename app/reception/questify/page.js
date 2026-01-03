import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const agreedRequest = {
  id: "REQ-002",
  title: "討伐 / 湿地帯の魔蛇",
  fields: {
    title: "討伐 / 湿地帯の魔蛇",
    purpose: "湿地帯に出現する魔蛇の討伐。周辺村の安全確保。",
    place: "南方の湿地帯 / 沼地入口で合流",
    deadline: "緊急: 3日以内に対応",
    risk: "毒・沼地。夜間は視界不良。",
    reward: "120,000G（依頼者合意済み上限）",
    note: "依頼者合意済み。公開時にリスクと成果物を明記する。",
  },
};

const publishFields = [
  { label: "冒険者ランク制限", placeholder: "Bランク以上" },
  { label: "募集人数・役割", placeholder: "3名（前衛1 / 後衛1 / 支援1）" },
  { label: "クエスト詳細", placeholder: "討伐地点の状況や注意点を記載" },
  { label: "成果物・評価基準", placeholder: "討伐証明部位 + 現地写真。傷/欠損がないこと" },
  { label: "ギルド支給物", placeholder: "解毒薬2本 / 地図 / 簡易テント / 松明" },
  { label: "地図・注意事項", placeholder: "沼地東側の浅瀬を推奨。夜間は迂回。毒沼に立入禁止" },
  { label: "連絡方法", placeholder: "ギルドチャット / 緊急時は鐘楼" },
];

export default function QuestifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-xl px-6 pb-16 pt-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Questify</p>
            <h1 className="font-serif text-2xl text-ink">クエスト化（ダミー）</h1>
            <p className="text-sm text-muted-foreground">
              依頼者と合意済みの内容に、冒険者向け公開項目を追加してクエスト票を作成します。
            </p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/reception">受付コンソールへ戻る</Link>
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">{agreedRequest.id}</p>
                  <CardTitle className="text-lg text-ink">{agreedRequest.title}</CardTitle>
                  <CardDescription>依頼者と合意済みの情報を表示しています。</CardDescription>
                </div>
                <Badge variant="secondary">合意済み</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">目的・背景</span>
                <span className="text-ink text-right">{agreedRequest.fields.purpose}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">場所</span>
                <span className="text-ink text-right">{agreedRequest.fields.place}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">完了期限</span>
                <span className="text-ink text-right">{agreedRequest.fields.deadline}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">危険度・同行条件</span>
                <span className="text-ink text-right">{agreedRequest.fields.risk}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">報酬上限額</span>
                <span className="text-ink text-right">{agreedRequest.fields.reward}</span>
              </div>
              <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">備考</span>
                <span className="text-ink text-right">{agreedRequest.fields.note}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">冒険者向け公開項目</CardTitle>
                <Badge variant="secondary">公開前に必須</Badge>
              </div>
              <CardDescription>ランク制限や成果物など、公開文面に載せる追加項目（ダミー入力）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {publishFields.map((field) => (
                <label key={field.label} className="space-y-1 block">
                  <span className="text-sm font-semibold text-ink">{field.label}</span>
                  <input
                    className="w-full rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder={field.placeholder}
                    readOnly
                  />
                </label>
              ))}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/adventurer">クエストとして公開（ダミー）</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/reception">公開せず戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">メモ</CardTitle>
            <CardDescription>クエスト化すると「合意済み」から「公開済み」に状態が遷移し、冒険者側ダッシュボードに表示されます。（ダミー）</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
