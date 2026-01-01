import Link from "next/link";

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

const queue = [
  {
    id: "REQ-002",
    title: "討伐 / 湿地帯の魔蛇",
    status: "調整案レビュー",
    requester: "依頼者: req-002",
    priority: "緊急 / 3日以内",
    next: "依頼者の再調整案を承認",
    tags: ["討伐", "毒耐性"],
  },
  {
    id: "REQ-001",
    title: "護衛 / 商隊の街道移動",
    status: "合意待ち",
    requester: "依頼者: req-001",
    priority: "通常 / 5日以内",
    next: "調整案を確認して合意",
    tags: ["護衛", "夜間あり"],
  },
  {
    id: "REQ-003",
    title: "採取 / 氷花の採取",
    status: "下書き確認",
    requester: "依頼者: req-003",
    priority: "通常 / 来週末",
    next: "依頼票をレビューして送信",
    tags: ["採取", "寒冷地"],
  },
];

const questDrafts = [
  {
    questId: "QST-019",
    title: "討伐 / 湿地帯の魔蛇",
    stage: "クエスト化中",
    rewards: "120,000G（案）",
    risk: "毒・沼地 / 同行3名",
    next: "報酬確定して公開",
  },
  {
    questId: "QST-020",
    title: "護衛 / 商隊の街道移動",
    stage: "公開待ち",
    rewards: "90,000G",
    risk: "夜間警戒 / 同行2名",
    next: "受付合意後に公開",
  },
];

const checklist = [
  { label: "依頼の整合性", detail: "目的・場所・期限の矛盾を確認" },
  { label: "危険度と人数", detail: "同行条件とリスク文言を明記" },
  { label: "報酬と上限", detail: "上限額と追加費用の備考を残す" },
  { label: "連絡チャネル", detail: "チャット / 電話いずれかを指定" },
  { label: "履歴とメモ", detail: "交渉ログと承認者を記録" },
];

const schedule = [
  {
    time: "09:30",
    title: "未確認の依頼を整理",
    detail: "REQ-003 をチェックし、送信待ちに移動",
  },
  {
    time: "11:00",
    title: "調整案レビュー",
    detail: "REQ-002 の報酬上限を確定。チャットで依頼者へ連絡",
  },
  {
    time: "14:00",
    title: "クエスト票の公開準備",
    detail: "QST-019 のリスク文言を更新し、公開申請",
  },
  {
    time: "16:00",
    title: "会計係との共有",
    detail: "公開済みクエストの予算一覧を送付",
  },
];

const quickLinks = [
  { label: "依頼一覧", href: "/requests", variant: "outline" },
  { label: "下書き調整へ", href: "/requests/req-002/adjust", variant: "secondary" },
  { label: "トップへ戻る", href: "/", variant: "ghost" },
];

export default function ReceptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
      <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-10">
        <header className="flex flex-col gap-4 border-b border-primary/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Receptionist</p>
            <h1 className="font-serif text-3xl text-ink">受付嬢コンソール（PC向けダミー）</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              依頼のレビュー、調整案の合意、クエスト化までをデスクトップでまとめて操作できます。
              進行中の依頼を左のキューで確認し、右側でクエスト票の整形やチャット対応を進めます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Button key={link.label} variant={link.variant} size="sm" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">今日のキュー</CardTitle>
                <Badge variant="secondary">3件</Badge>
              </div>
              <CardDescription>未確認・調整中の依頼を優先順で表示します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {queue.map((item) => (
                <div key={item.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.requester}</p>
                    </div>
                    <Badge variant="muted">{item.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">優先度: {item.priority}</p>
                  <p className="text-xs text-ink">次のアクション: {item.next}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-dashed text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-white/90 shadow-sm md:col-span-2">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">クエスト票の下書き</CardTitle>
                <Badge variant="secondary">公開前</Badge>
              </div>
              <CardDescription>報酬や危険度の文言を整えてから公開します（ダミー）。</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {questDrafts.map((draft) => (
                <div
                  key={draft.questId}
                  className="space-y-2 rounded-lg border border-border/70 bg-muted/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary">{draft.questId}</p>
                      <p className="text-base font-semibold text-ink">{draft.title}</p>
                    </div>
                    <Badge variant="muted">{draft.stage}</Badge>
                  </div>
                  <p className="text-sm text-ink">報酬案: {draft.rewards}</p>
                  <p className="text-sm text-muted-foreground">リスク: {draft.risk}</p>
                  <p className="text-xs text-ink">次のステップ: {draft.next}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="border-dashed text-xs" asChild>
                      <Link href="/requests/req-002/adjust">文言を編集（ダミー）</Link>
                    </Button>
                    <Button size="sm" className="text-xs" variant="secondary">
                      公開申請（ダミー）
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border border-border/70 bg-white/90 shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-primary">Checklist</p>
                <CardTitle className="text-2xl text-ink">クエスト化チェック</CardTitle>
                <CardDescription>確認済みの項目にチェックを入れて進行ログを残します。</CardDescription>
              </div>
              <Button size="sm" variant="outline">チェックを共有</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/50 px-4 py-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto text-xs">
                    済みにする（ダミー）
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm">合意へ進む（ダミー）</Button>
              <Button size="sm" variant="outline">依頼者へ相談（ダミー）</Button>
            </CardFooter>
          </Card>

          <Card className="border border-border/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-ink">本日の進行メモ</CardTitle>
              <CardDescription>PC操作を前提に、時間枠ごとの作業を整理します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedule.map((slot) => (
                <div key={slot.time} className="space-y-1 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">{slot.title}</p>
                    <Badge variant="outline" className="text-[11px]">{slot.time}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{slot.detail}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">カレンダーにコピー（ダミー）</Button>
              <Button size="sm" variant="ghost">メモを消去（ダミー）</Button>
            </CardFooter>
          </Card>
        </section>

        <Card className="border border-primary/15 bg-gradient-to-r from-primary via-primary/90 to-mint/80 text-white shadow-glow">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-white/80">Communication</p>
              <CardTitle className="text-2xl text-white">チャット・コメントのまとめ</CardTitle>
              <CardDescription className="text-white/90">
                PCでの同時作業を想定し、依頼者とのチャット、会計係への共有メモをここに残せます。
                重要メッセージはピン留めして、クエスト票の公開と同時に履歴へ保存します。
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                チャットを開く（ダミー）
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                メモをピン留め（ダミー）
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-2 rounded-lg bg-white/10 p-4">
              <p className="text-sm font-semibold">最新コメント</p>
              <p className="text-sm text-white/90">
                依頼者から「夜間の経路確認をお願い」とメッセージ。護衛依頼のルートを確認して返答が必要。
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-white/10 p-4">
              <p className="text-sm font-semibold">会計共有メモ</p>
              <p className="text-sm text-white/90">
                報酬上限120,000G（討伐）、90,000G（護衛）で調整中。公開前に確認依頼を送付。
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-white/10 p-4">
              <p className="text-sm font-semibold">承認ログ</p>
              <p className="text-sm text-white/90">
                調整案に対する依頼者の合意を記録。公開申請と同時にタイムスタンプを付与します。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
