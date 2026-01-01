import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const fields = [
  { label: "依頼タイトル", placeholder: "例: 討伐 / 湿地帯の魔蛇" },
  { label: "目的・背景", placeholder: "解決したい課題を記載" },
  { label: "場所", placeholder: "エリア / 合流地点" },
  { label: "完了期限", placeholder: "緊急度や希望日程" },
  { label: "危険度・同行条件", placeholder: "必要な人数・装備・特殊条件" },
  { label: "報酬上限額", placeholder: "分からなければ上限だけ" },
];

export default function NewRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">New</p>
            <h1 className="font-serif text-2xl">新規依頼作成（ダミー）</h1>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/requests">一覧へ</Link>
          </Button>
        </header>

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">必要な入力</CardTitle>
            <CardDescription>入力はダミーです。送信ボタンで一覧へ戻ります。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field) => (
              <label key={field.label} className="space-y-1">
                <span className="block text-sm font-semibold text-ink">{field.label}</span>
                <input
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                  placeholder={field.placeholder}
                  readOnly
                />
              </label>
            ))}
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-ink">備考・添付（ダミー）</span>
              <textarea
                className="h-28 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                placeholder="受付嬢へのメモを記載"
                readOnly
              />
            </label>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/requests">送信（ダミー）</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">テンプレートのおすすめ</CardTitle>
            <CardDescription>討伐と護衛のテンプレートを用意しています。（ダミー）</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/">トップでテンプレートを見る</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/requests">依頼一覧に戻る</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
