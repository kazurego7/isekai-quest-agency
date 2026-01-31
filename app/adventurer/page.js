"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DevUserSelectorView } from "@/components/dev-user-selector";
import { useDevUser } from "@/lib/dev-user";
export default function AdventurerDashboard() {
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, users, userId, selectUser, isEnabled } = useDevUser("adventurer");
  const hasActor = Boolean(user?.id);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    const query = user?.id ? `?userId=${encodeURIComponent(user.id)}` : "";
    fetch(`/api/quests${query}`)
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
  }, [user?.id]);

  const openQuests = useMemo(() => {
    return quests.filter((quest) => quest.status === "募集中");
  }, [quests]);

  const activeQuests = useMemo(() => {
    return quests.filter((quest) => {
      if (!["クエスト進行中", "完了報告済み"].includes(quest.status)) return false;
      const viewerAdventurerId = quest.viewerAdventurerId ?? null;
      if (!viewerAdventurerId) return false;
      if (quest.adventurerId && quest.adventurerId === viewerAdventurerId) return true;
      return (quest.selectedAdventurerIds ?? []).includes(viewerAdventurerId);
    });
  }, [quests]);

  const questHistory = useMemo(() => {
    return quests.filter((quest) => quest.status === "達成確認済み");
  }, [quests]);

  const handleApply = (questId) => {
    if (!user?.id) return Promise.resolve();
    return fetch(`/api/quests/${questId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "apply", actorId: user?.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("申請に失敗しました。");
      }
      const query = user?.id ? `?userId=${encodeURIComponent(user.id)}` : "";
      return fetch(`/api/quests${query}`)
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
          <h1 className="font-serif text-2xl text-ink">冒険者（ダッシュボード）</h1>
          <p className="text-sm text-muted-foreground">
            まず自分のクエスト状況を確認し、その後に募集中クエストを探します。
          </p>
        </header>

        <DevUserSelectorView
          user={user}
          users={users}
          userId={userId}
          selectUser={selectUser}
          isEnabled={isEnabled}
          roleLabel="冒険者"
          helperText="開発用ユーザーを選択すると申請・受注・報告の記録に使われます。"
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
              </div>
              <CardDescription>募集中のクエストを一覧で確認します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 divide-y divide-border/80 p-0">
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">読み込み中...</div>
              ) : openQuests.length ? (
                openQuests.map((quest) => {
                  const applicant = Array.isArray(quest.applicants) ? quest.applicants[0] : null;
                  const isApplied = Boolean(applicant?.id);
                  return (
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
                        onClick={() => handleApply(quest.id)}
                        disabled={!hasActor || isApplied}
                      >
                        {isApplied ? "申請済み" : "申請する"}
                      </Button>
                    </div>
                  </div>
                );
                })
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
