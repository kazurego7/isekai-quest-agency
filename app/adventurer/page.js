"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DevUserSelector from "@/components/dev-user-selector";
import { useDevUser } from "@/lib/dev-user";
export default function AdventurerMock() {
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useDevUser("adventurer");
  const hasActor = Boolean(user?.id);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetch("/api/quests")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setQuests(data.quests ?? []);
      })
      .catch(() => {
        if (!active) return;
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

  const openQuests = useMemo(() => {
    return quests.filter((quest) => quest.status === "募集中");
  }, [quests]);

  const activeQuests = useMemo(() => {
    return quests.filter((quest) => ["受注済み", "完了報告済み"].includes(quest.status));
  }, [quests]);

  const questHistory = useMemo(() => {
    return quests.filter((quest) => quest.status === "達成確認済み");
  }, [quests]);

  const handleAccept = (questId) => {
    if (!user?.id) return Promise.resolve();
    return fetch(`/api/quests/${questId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "accept", actorId: user?.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("受注に失敗しました。");
      }
      return fetch("/api/quests")
        .then((nextResponse) => nextResponse.json())
        .then((data) => {
          setQuests(data.quests ?? []);
        });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Adventurer</p>
          <h1 className="font-serif text-2xl text-ink">冒険者モック（ダッシュボード）</h1>
          <p className="text-sm text-muted-foreground">
            まず自分のクエスト状況を確認し、その後に募集中クエストを探す想定のモック画面です。
          </p>
        </header>

        <DevUserSelector
          role="adventurer"
          roleLabel="冒険者"
          helperText="開発用ユーザーを選択すると受注・報告の記録に使われます。"
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">自分のクエスト状況一覧</CardTitle>
              <CardDescription>申請中・進行中・評価待ち・完了の状況をまとめて確認します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
              ) : activeQuests.length ? (
                activeQuests.map((quest) => (
                  <div key={quest.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                      <p className="text-sm font-semibold text-ink">{quest.title}</p>
                    </div>
                    <Badge variant="muted">{quest.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{quest.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    受付: {quest.receptionistName ?? "未設定"} / 冒険者: {quest.adventurerName ?? "未設定"}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <Link href={`/adventurer/quests/${quest.id}`}>詳細を見る</Link>
                      </Button>
                      <Button size="sm" className="text-xs" disabled={!hasActor}>
                        チャット（ダミー）
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">進行中のクエストはありません。</div>
              )}
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
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
              ) : openQuests.length ? (
                openQuests.map((quest) => (
                  <div key={quest.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
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
                        <Link href={`/adventurer/quests/${quest.id}`}>詳細を見る</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleAccept(quest.id)}
                        disabled={!hasActor}
                      >
                        受注する
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">募集中のクエストはありません。</div>
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">クエスト履歴</CardTitle>
            <CardDescription>完了済みのクエストを一覧で確認します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 divide-y divide-border/80 p-0">
            {isLoading ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
            ) : questHistory.length ? (
              questHistory.map((quest) => (
                <div key={quest.id} className="space-y-1 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                      <p className="text-sm font-semibold text-ink">{quest.title}</p>
                    </div>
                    <Badge variant="muted">完了</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{quest.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    受付: {quest.receptionistName ?? "未設定"} / 冒険者: {quest.adventurerName ?? "未設定"}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <Link href={`/adventurer/quests/${quest.id}`}>履歴を見る</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-muted-foreground">完了済みの履歴はありません。</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
