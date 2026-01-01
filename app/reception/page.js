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

const inAgreement = [
  {
    id: "req-002",
    title: "討伐 / 湿地帯の魔蛇",
    status: "確認前",
    note: "依頼者が調整案を確認中。返信待ち（受付視点）。",
    next: "依頼詳細を見て、返信を待つ",
    href: "/requests/req-002",
  },
  {
    id: "req-001",
    title: "護衛 / 商隊の街道移動",
    status: "合意待ち",
    note: "依頼者の再調整案を確認し、合意する状態。",
    next: "依頼詳細を開いて合意判断（ダミー）",
    href: "/requests/req-001",
  },
];

const questDrafts = [
  {
    questId: "QST-019",
    title: "討伐 / 湿地帯の魔蛇",
    stage: "合意済み",
    rewards: "120,000G（案）",
    risk: "毒・沼地 / 同行3名",
    rank: "Bランク以上",
    deliverables: "討伐証明部位 + 現地写真（代替可）",
    supplies: "解毒薬2本 / 地図支給 / 簡易テント",
    mapNotes: "沼地東側の浅瀬を通行。夜間は迂回指示。",
  },
  {
    questId: "QST-020",
    title: "護衛 / 商隊の街道移動",
    stage: "公開済み",
    rewards: "90,000G",
    risk: "夜間警戒 / 同行2名",
    rank: "Cランク以上（盾役1名必須）",
    deliverables: "護衛完了報告と商隊代表の署名",
    supplies: "松明 / 予備馬1頭 / 連絡用笛",
    mapNotes: "宿場町で合流。森の迂回路を利用し、夜間は停止。",
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

        <section className="grid grid-cols-1 gap-4">
          <Card className="border border-border/70 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">合意中（受付視点）</CardTitle>
                <Badge variant="secondary">確認前 / 合意待ち</Badge>
              </div>
              <CardDescription>依頼者との合意が終わっていない案件。依頼詳細を開いて対応します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {inAgreement.map((item) => (
                <div key={item.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                    </div>
                    <Badge variant="muted">{item.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                  <p className="text-xs text-ink">次のアクション: {item.next}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <Link href={item.href}>依頼詳細を開く</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">公開準備（依頼者と合意済みの内容）</CardTitle>
                <Badge variant="secondary">公開前</Badge>
              </div>
              <CardDescription>
                冒険者に公開する前に、ランク下限・成果物・ギルド支給物・地図/注意事項を確認します（ダミー）。クエスト化が完了すると即時公開されます。
              </CardDescription>
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
              <div className="rounded-lg border border-border/60 bg-white/70 p-3 text-xs space-y-1">
                <p className="font-semibold text-ink">公開前チェック（必須情報）</p>
                <p className="text-ink">ランク下限: {draft.rank}</p>
                <p className="text-ink">成果物 / 評価基準: {draft.deliverables}</p>
                <p className="text-ink">ギルド支給物: {draft.supplies}</p>
                <p className="text-ink">地図 / 注意事項: {draft.mapNotes}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                公開時: ランク/成果物/支給物/注意事項が公開文面に含まれているか最終確認（ダミー）
              </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {draft.stage === "合意済み" ? (
                      <Button size="sm" variant="outline" className="border-dashed text-xs" asChild>
                        <Link href="/reception/questify">クエスト化へ（ダミー）</Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-dashed text-xs" asChild>
                        <Link href={`/reception/quests/${draft.questId.toLowerCase()}`}>クエスト詳細（PC版）</Link>
                      </Button>
                    )}
                    <Badge variant="secondary">クエスト化=即公開</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="border border-border/70 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-primary">Future</p>
              <CardTitle className="text-xl text-ink">公募してきた冒険者の選定（プレースホルダー）</CardTitle>
              <CardDescription>今回は非対応。選定ロジックは後で追加予定。</CardDescription>
            </div>
            <Badge variant="muted">後で検討</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              依頼合意→公開までを優先して実装しています。応募者リストや選定基準は別途追加予定です（ダミー）。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
