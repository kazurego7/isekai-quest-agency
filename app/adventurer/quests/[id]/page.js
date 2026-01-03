import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QuestDetailClient from "./quest-detail-client";

const questCatalog = {
  "qst-019": {
    id: "QST-019",
    title: "討伐 / 湿地帯の魔蛇",
    status: "募集中",
    reward: "120,000G",
    rank: "Bランク以上（毒耐性必須）",
    detail: "湿地帯中央の古井戸付近に出現。単独討伐で討伐証明を回収。",
    deliverables: "討伐証明（牙または鱗）",
    supplies: "解毒薬 / 照明具",
    mapNotes: "湿地帯の東側。足場注意。",
    risk: "毒霧 / 水中戦",
    channel: "ギルドチャット / 緊急時は伝令鳥",
    summary: "魔蛇1体の討伐と討伐証明の提出。",
    checklist: [
      { label: "討伐証明の回収", note: "牙または鱗" },
      { label: "討伐地点の座標記録", note: "簡易メモで可" },
      { label: "依頼者への引き渡し準備", note: "写真も推奨" },
    ],
  },
  "qst-020": {
    id: "QST-020",
    title: "護衛 / 商隊の街道移動",
    status: "募集中",
    reward: "90,000G",
    rank: "Cランク以上（盾役1名必須）",
    detail: "護衛ルートは宿場町経由。夜間は野営し、日中に移動する。",
    deliverables: "護衛完了報告と商隊代表の署名",
    supplies: "松明 / 予備馬1頭 / 連絡用笛",
    mapNotes: "宿場町で合流。森の迂回路を利用し、夜間は停止。",
    risk: "夜間警戒 / 同行2名",
    channel: "ギルドチャット / 緊急時は鐘楼",
    summary: "商隊の護衛完了と代表者署名を提出。",
    checklist: [
      { label: "護衛完了報告の署名", note: "代表者の署名" },
      { label: "危険箇所の記録", note: "迂回路メモ" },
      { label: "荷車の破損チェック", note: "任意" },
    ],
  },
  "qst-003": {
    id: "QST-003",
    title: "調査 / 古代遺跡の地形",
    status: "申請中",
    reward: "70,000G",
    rank: "Cランク以上",
    detail: "遺跡内の通路を簡易スケッチ。危険箇所を赤印で記録。",
    deliverables: "遺跡の簡易地図と危険箇所メモ",
    supplies: "測量ロープ / マーカー",
    mapNotes: "北の古代遺跡。入口付近に目印あり。",
    risk: "落盤 / 迷路化",
    channel: "ギルドチャット",
    summary: "遺跡内の通路と危険箇所を簡易地図で提出。",
    checklist: [
      { label: "主要通路の記録", note: "簡易地図" },
      { label: "危険箇所の記録", note: "崩落/罠" },
      { label: "入口付近の写真", note: "目印用" },
    ],
  },
  "qst-010": {
    id: "QST-010",
    title: "採取 / 氷花の採取",
    status: "進行中",
    reward: "45,000G",
    rank: "Dランク以上",
    detail: "氷結の谷の北側斜面で採取。滑落防止に縄を使用。",
    deliverables: "氷花5束と採取写真",
    supplies: "保温手袋 / 保冷箱",
    mapNotes: "氷結の谷。滑落しやすい箇所に縄あり。",
    risk: "低温 / 滑落注意",
    channel: "ギルドチャット",
    summary: "氷花を5束採取し、写真と簡易レポートを提出。",
    checklist: [
      { label: "氷花5束の採取", note: "束の写真が必須" },
      { label: "採取地点の座標記録", note: "簡易メモ" },
      { label: "天候/気温のメモ", note: "任意" },
    ],
  },
  "qst-007": {
    id: "QST-007",
    title: "討伐 / 森の魔狼",
    status: "評価待ち",
    reward: "110,000G",
    rank: "Bランク以上",
    detail: "夜間の群れに注意。討伐後は現地で簡易報告を作成。",
    deliverables: "討伐証明と簡易報告",
    supplies: "応急手当具",
    mapNotes: "緑陰の森。夜間は視界不良。",
    risk: "夜間襲撃 / 群れ",
    channel: "ギルドチャット",
    summary: "討伐完了報告済み。受付の評価待ち。",
    checklist: [
      { label: "討伐証明の提出", note: "牙の提出済み" },
      { label: "討伐地点の記録", note: "提出済み" },
      { label: "同行者の報告", note: "任意" },
    ],
  },
  "qst-002": {
    id: "QST-002",
    title: "採取 / 星砂の採集",
    status: "完了",
    reward: "30,000G",
    rank: "Eランク以上",
    detail: "夜間に採集。星砂は夜露のタイミングで回収。",
    deliverables: "星砂3瓶と採集写真",
    supplies: "ランタン / 砂除け布",
    mapNotes: "夜の砂丘。月明かりが強い日に実施。",
    risk: "視界不良",
    channel: "ギルドチャット",
    summary: "報酬支払い済み。履歴として保存。",
    checklist: [
      { label: "星砂3瓶の採集", note: "提出済み" },
      { label: "採集地点の写真", note: "提出済み" },
      { label: "受取確認", note: "完了" },
    ],
  },
};

export default async function AdventurerQuestDetail({ params }) {
  const resolvedParams = await params;
  const quest = questCatalog[resolvedParams.id] ?? questCatalog["qst-010"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Adventurer</p>
            <h1 className="font-serif text-2xl text-ink">クエスト詳細（モック）</h1>
            <p className="text-sm text-muted-foreground">冒険者が進行状況を入力・確認する想定のダミー画面です。</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/adventurer">一覧へ戻る</Link>
          </Button>
        </header>

        <Card className="border-primary/15 bg-white/90 shadow-sm">
          <CardHeader className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
              <CardTitle className="text-lg text-ink">{quest.title}</CardTitle>
              <CardDescription>{quest.summary}</CardDescription>
            </div>
            <Badge variant="secondary">{quest.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="報酬" value={quest.reward} />
            <InfoRow label="ランク制限" value={quest.rank} />
            <InfoRow label="クエスト詳細" value={quest.detail} />
            <InfoRow label="リスク" value={quest.risk} />
            <InfoRow label="成果物 / 評価基準" value={quest.deliverables} />
            <InfoRow label="ギルド支給物" value={quest.supplies} />
            <InfoRow label="地図 / 注意事項" value={quest.mapNotes} />
            <InfoRow label="連絡方法" value={quest.channel} />
          </CardContent>
        </Card>

        <QuestDetailClient quest={quest} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  );
}
