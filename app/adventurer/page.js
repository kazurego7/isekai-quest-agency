import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const openQuests = [
  {
    id: "QST-019",
    title: "討伐 / 湿地帯の魔蛇",
    status: "募集中",
    reward: "120,000G",
    note: "危険度高め。下見の地図あり。",
    href: "/adventurer/quests/qst-019",
  },
  {
    id: "QST-020",
    title: "護衛 / 商隊の街道移動",
    status: "募集中",
    reward: "90,000G",
    note: "護衛人数2名以上で報酬上積み。",
    href: "/adventurer/quests/qst-020",
  },
];

const activeQuests = [
  {
    id: "QST-003",
    title: "調査 / 古代遺跡の地形",
    stage: "申請中",
    action: "申請内容を見る（ダミー）",
    note: "受付の承認待ち",
    href: "/adventurer/quests/qst-003",
  },
  {
    id: "QST-010",
    title: "採取 / 氷花の採取",
    stage: "進行中",
    action: "進捗・成果を入力（ダミー）",
    note: "提出期限: 3日後",
    href: "/adventurer/quests/qst-010",
  },
  {
    id: "QST-007",
    title: "討伐 / 森の魔狼",
    stage: "評価待ち",
    action: "完了報告を確認（ダミー）",
    note: "受付の確認待ち",
    href: "/adventurer/quests/qst-007",
  },
];

const questHistory = [
  {
    id: "QST-002",
    title: "採取 / 星砂の採集",
    stage: "完了",
    action: "履歴を見る（ダミー）",
    note: "報酬支払い済み",
    href: "/adventurer/quests/qst-002",
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
            まず自分のクエスト状況を確認し、その後に募集中クエストを探す想定のモック画面です。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">自分のクエスト状況一覧</CardTitle>
              <CardDescription>申請中・進行中・評価待ち・完了の状況をまとめて確認します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {activeQuests.map((quest) => (
                <div key={quest.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                      <p className="text-sm font-semibold text-ink">{quest.title}</p>
                    </div>
                    <Badge variant="muted">{quest.stage}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{quest.note}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <Link href={quest.href}>{quest.action}</Link>
                    </Button>
                    <Button size="sm" className="text-xs">
                      チャット（ダミー）
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">募集中クエスト一覧</CardTitle>
                <Badge variant="secondary">公開済み</Badge>
              </div>
              <CardDescription>公開済み = 募集中のクエストを一覧で確認します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {openQuests.map((quest) => (
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
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <Link href={quest.href}>詳細を見る（ダミー）</Link>
                    </Button>
                    <Button size="sm" className="text-xs">
                      受注申請（ダミー）
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">クエスト履歴</CardTitle>
            <CardDescription>完了済みのクエストを一覧で確認します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 divide-y divide-border/80 p-0">
            {questHistory.map((quest) => (
              <div key={quest.id} className="space-y-1 px-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                    <p className="text-sm font-semibold text-ink">{quest.title}</p>
                  </div>
                  <Badge variant="muted">{quest.stage}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{quest.note}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href={quest.href}>{quest.action}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
