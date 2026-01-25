"use client";

import { useEffect, useMemo, useState } from "react";
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
import DevUserSelector from "@/components/dev-user-selector";

export default function ReceptionPage() {
  const [requests, setRequests] = useState([]);
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([fetch("/api/requests"), fetch("/api/quests")])
      .then(async ([requestsResponse, questsResponse]) => {
        const requestsData = await requestsResponse.json();
        const questsData = await questsResponse.json();
        if (!active) return;
        setRequests(requestsData.requests ?? []);
        setQuests(questsData.quests ?? []);
      })
      .catch(() => {
        if (!active) return;
        setRequests([]);
        setQuests([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const inAgreement = useMemo(() => {
    return (requests ?? []).filter((item) => ["確認前", "合意待ち"].includes(item.status));
  }, [requests]);

  const questDrafts = useMemo(() => {
    return (requests ?? []).filter((item) => ["合意済み", "クエスト化済み"].includes(item.status));
  }, [requests]);

  const recruitingQuests = useMemo(() => {
    return (quests ?? []).filter((item) => item.status === "募集中");
  }, [quests]);

  const completionReviews = useMemo(() => {
    return (quests ?? []).filter((item) => item.status === "完了報告済み");
  }, [quests]);

  const adjustTarget = inAgreement[0]?.id;
  const quickLinks = [
    { label: "依頼一覧", href: "/requests", variant: "outline" },
    {
      label: "下書き調整へ",
      href: adjustTarget ? `/requests/reception/${adjustTarget}/adjust` : "/requests",
      variant: "secondary",
    },
    { label: "トップへ戻る", href: "/", variant: "ghost" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-10 space-y-10">
        <header className="flex flex-col gap-4 border-b border-primary/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Receptionist</p>
            <h1 className="font-serif text-3xl text-ink">受付嬢モック（PC向けダミー）</h1>
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

        <DevUserSelector
          role="reception"
          roleLabel="受付"
          helperText="開発用ユーザーを選択すると受付操作の記録に使われます。"
        />

        <section className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:auto-rows-fr">
          <Card className="flex h-full flex-col border border-border/70 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">合意中（受付視点）</CardTitle>
                <Badge variant="secondary">確認前 / 合意待ち</Badge>
              </div>
              <CardDescription>依頼者との合意が終わっていない案件。依頼詳細を開いて対応します。</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 divide-y divide-border/80 p-0">
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
              ) : inAgreement.length ? (
                inAgreement.map((item) => (
                  <div key={item.id} className="space-y-1 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                      </div>
                      <Badge variant="muted">{item.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.notes}</p>
                    <p className="text-xs text-muted-foreground">依頼者: {item.requesterName ?? "未設定"}</p>
                    <p className="text-xs text-ink">次のアクション: 依頼内容の確認</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <Link href={`/requests/reception/${item.id}`}>依頼詳細を開く</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  現在の確認待ち依頼はありません。
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">公開準備（依頼者と合意済みの内容）</CardTitle>
                <Badge variant="secondary">公開前</Badge>
              </div>
              <CardDescription>
                冒険者に公開する前に、ランク制限・成果物・ギルド支給物・地図/注意事項を確認します（ダミー）。クエスト化が完了すると即時公開されます。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid flex-1 content-start grid-cols-1 gap-3 lg:grid-cols-2">
              {isLoading ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-white/70 p-4 text-sm text-muted-foreground">
                  読み込み中...
                </div>
              ) : questDrafts.length ? (
                questDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="space-y-2 rounded-lg border border-border/70 bg-muted/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-primary">{draft.id}</p>
                        <p className="text-base font-semibold text-ink">{draft.title}</p>
                      </div>
                    <Badge variant="muted">{draft.status}</Badge>
                  </div>
                  <p className="text-sm text-ink">報酬案: {draft.fields["報酬上限額"] ?? "未設定"}</p>
                  <p className="text-sm text-muted-foreground">リスク: {draft.fields["危険度・同行条件"] ?? "未設定"}</p>
                  <p className="text-xs text-muted-foreground">依頼者: {draft.requesterName ?? "未設定"}</p>
                  {draft.status === "合意済み" ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" className="border-dashed text-xs" asChild>
                        <Link href={`/reception/questify?requestId=${draft.id}`}>クエスト化へ</Link>
                      </Button>
                      <span className="text-[11px] text-muted-foreground">合意済みのため公開準備へ進めます</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      公開済みのため、募集状況は冒険者側ダッシュボードで確認できます。
                    </p>
                  )}
                </div>
              ))
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 bg-white/70 p-4 text-sm text-muted-foreground">
                  公開準備中の依頼はありません。
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="flex h-full flex-col border border-border/70 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">募集中クエスト（冒険者選定）</CardTitle>
                <Badge variant="secondary">募集中</Badge>
              </div>
              <CardDescription>募集をかけているクエスト。申請順にレビューし、選定へ進みます。</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 divide-y divide-border/80 p-0">
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
              ) : recruitingQuests.length ? (
                recruitingQuests.map((quest) => (
                  <div key={quest.id} className="space-y-1 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                        <p className="text-sm font-semibold text-ink">{quest.title}</p>
                        <p className="text-xs text-muted-foreground">報酬: {quest.reward}</p>
                      </div>
                      <Badge variant="muted">{quest.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{quest.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      受付: {quest.receptionistName ?? "未設定"} / 冒険者: {quest.adventurerName ?? "未設定"}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <Link href={`/reception/quests/${quest.id}`}>選定へ</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  募集中のクエストはありません。
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col border border-border/70 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">クエスト完了確認</CardTitle>
                <Badge variant="secondary">評価待ち</Badge>
              </div>
              <CardDescription>冒険者の完了報告を確認し、達成確認を行うキューです。</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 divide-y divide-border/80 p-0">
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
              ) : completionReviews.length ? (
                completionReviews.map((quest) => (
                  <div key={quest.id} className="space-y-1 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                        <p className="text-sm font-semibold text-ink">{quest.title}</p>
                        <p className="text-xs text-muted-foreground">完了報告受付済み</p>
                      </div>
                      <Badge variant="muted">評価待ち</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{quest.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      受付: {quest.receptionistName ?? "未設定"} / 冒険者: {quest.adventurerName ?? "未設定"}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <Link href={`/reception/reviews/${quest.id}`}>完了報告を確認</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  完了報告の確認待ちはありません。
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
