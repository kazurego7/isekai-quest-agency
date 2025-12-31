"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

const creationChecklist = [
  { label: "依頼タイトル", hint: "例: 東門の魔獣討伐支援" },
  { label: "目的・成果物", hint: "何を達成したいかを1文で" },
  { label: "期限・緊急度", hint: "日付と優先度をセット" },
  { label: "報酬", hint: "上限/下限があれば明記" },
  { label: "添付", hint: "地図・証跡・参考資料 (任意)" },
];

const requestList = [
  {
    id: "US-01",
    title: "依頼票の作成",
    status: "受付待ち",
    meta: "期限: 2日後 / 緊急度: 中",
  },
  {
    id: "US-03",
    title: "依頼内容の追記",
    status: "下書き",
    meta: "差し戻し: 目的を具体的に記載",
  },
  {
    id: "US-09",
    title: "納品受領確認",
    status: "完了",
    meta: "受付ログにサイン済み",
  },
];

const requestDetail = {
  id: "US-01",
  title: "依頼票の作成",
  status: "受付待ち",
  summary: "魔獣討伐の補給支援を依頼。補給品の種別と数量を指定。",
  fields: [
    { label: "期限", value: "2日後" },
    { label: "緊急度", value: "中" },
    { label: "報酬", value: "30,000G 上限" },
    { label: "添付", value: "地図・在庫リスト (2件)" },
  ],
};

const actionButtons = [
  { label: "下書きを提出", variant: "default" },
  { label: "前回依頼をコピー", variant: "secondary" },
  { label: "ドラフトを保存", variant: "outline" },
];

export default function RequesterPage() {
  const [activeId, setActiveId] = useState(requestDetail.id);

  const activeRequest = useMemo(
    () => requestList.find((item) => item.id === activeId) ?? requestDetail,
    [activeId],
  );

  const isNearDeadline = (meta) => meta?.includes("期限");

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-primary/5">
      <div className="pointer-events-none absolute right-[-25%] top-[-20%] h-[320px] w-[320px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-20%] h-[320px] w-[320px] rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative z-10 px-5 pb-20 pt-8 md:px-10">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-ink">
                依頼作成・一覧・詳細
              </Badge>
              <span className="text-sm text-muted-foreground">モバイル優先</span>
            </div>
            <h1 className="font-serif text-3xl text-ink sm:text-4xl">
              依頼者のためのシンプルな3画面
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              依頼作成・依頼一覧・依頼詳細だけに絞り、余計なガイドや差し戻しフローを排除した最短の導線です。
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/">トップへ戻る</Link>
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              下書きを提出
            </Button>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              前回依頼をコピー
            </Button>
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl border border-primary/15 bg-white/95 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">依頼作成</p>
                <h2 className="text-lg font-semibold text-ink">下書きから提出まで</h2>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              必須項目を埋めたらプレビューして提出。前回依頼のコピーで入力を短縮できます。
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {creationChecklist.map((item) => (
                <Card key={item.label} className="border border-border/60 bg-background/80 shadow-none">
                  <CardContent className="space-y-1 p-4">
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {actionButtons.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant === "outline" ? "outline" : action.variant === "secondary" ? "secondary" : "default"}
                  className="w-full sm:w-auto"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">依頼一覧</p>
                <h2 className="font-semibold text-ink">提出・下書き・完了</h2>
              </div>
              <Badge variant="muted">{requestList.length} 件</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {requestList.map((item) => (
                <Card
                  key={item.title}
                  className={`border border-border/60 shadow-none ${isNearDeadline(item.meta) ? "bg-amber-50" : "bg-background/80"}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(item.id)}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">依頼詳細</p>
                <h2 className="font-semibold text-ink">{activeRequest.title}</h2>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {activeRequest.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {requestDetail.summary}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {requestDetail.fields.map((field) => (
                <Card key={field.label} className="border border-border/60 bg-background/80 shadow-none">
                  <CardContent className="space-y-1 p-3">
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-semibold text-ink">{field.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button className="w-full sm:w-auto">提出内容を編集</Button>
              <Button variant="outline" className="w-full sm:w-auto">
                プレビューを確認
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
