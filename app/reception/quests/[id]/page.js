 "use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DevUserSelector from "@/components/dev-user-selector";
import { useDevUser } from "@/lib/dev-user";

export default function QuestSelectionPage() {
  const params = useParams();
  const questId = typeof params?.id === "string" ? params.id : params?.id?.[0];
  const [quest, setQuest] = useState(null);
  const [adventurers, setAdventurers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useDevUser("reception");
  const [applicantPage, setApplicantPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [activeList, setActiveList] = useState("applicants");
  const [selectedIds, setSelectedIds] = useState([]);
  const pageSize = 6;
  // 仮選定中は別ページング
  const [selectedPage, setSelectedPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const applicantList = useMemo(
    () => (adventurers ?? []).filter((item) => item.source === "申請"),
    [adventurers],
  );
  const totalAdventurers = adventurers.length;

  const applicantTotalPages = Math.max(Math.ceil(applicantList.length / pageSize), 1);
  const allTotalPages = Math.max(Math.ceil((adventurers ?? []).length / pageSize), 1);

  const applicantPageItems = useMemo(() => {
    const startIndex = (applicantPage - 1) * pageSize;
    return applicantList.slice(startIndex, startIndex + pageSize);
  }, [applicantPage, applicantList]);

  const allPageItems = useMemo(() => {
    const startIndex = (allPage - 1) * pageSize;
    return (adventurers ?? []).slice(startIndex, startIndex + pageSize);
  }, [adventurers, allPage]);

  const adventurerMap = useMemo(() => {
    return new Map((adventurers ?? []).map((item) => [item.id, item]));
  }, [adventurers]);

  const selectedAdventurers = useMemo(
    () => selectedIds.map((id) => adventurerMap.get(id)).filter(Boolean),
    [selectedIds, adventurerMap],
  );

  const selectedTotalPages = Math.max(Math.ceil(selectedAdventurers.length / pageSize), 1);
  const selectedPageItems = useMemo(() => {
    const startIndex = (selectedPage - 1) * pageSize;
    return selectedAdventurers.slice(startIndex, startIndex + pageSize);
  }, [selectedAdventurers, selectedPage]);

  const activeQuest = useMemo(() => quest, [quest]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  useEffect(() => {
    if (!questId) return;
    let active = true;
    setIsLoading(true);
    Promise.all([fetch(`/api/quests/${questId}`), fetch("/api/adventurers")])
      .then(async ([questResponse, adventurerResponse]) => {
        const questData = await questResponse.json();
        const adventurerData = await adventurerResponse.json();
        if (!active) return;
        setQuest(questData.quest ?? null);
        setAdventurers(adventurerData.adventurers ?? []);
      })
      .catch(() => {
        if (!active) return;
        setQuest(null);
        setAdventurers([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [questId]);

  useEffect(() => {
    if (!activeQuest) return;
    const stored = Array.isArray(activeQuest.selectedAdventurerIds)
      ? activeQuest.selectedAdventurerIds
      : [];
    setSelectedIds(stored);
  }, [activeQuest]);

  useEffect(() => {
    if (selectedPage > selectedTotalPages) {
      setSelectedPage(selectedTotalPages);
    }
  }, [selectedPage, selectedTotalPages]);

  const handleApplicantPageChange = (nextPage) => {
    setApplicantPage(Math.min(Math.max(nextPage, 1), applicantTotalPages));
  };

  const handleAllPageChange = (nextPage) => {
    setAllPage(Math.min(Math.max(nextPage, 1), allTotalPages));
  };

  const handleSaveSelection = async () => {
    if (!activeQuest?.id || !user?.id) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/quests/${activeQuest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "select",
          actorId: user?.id,
          selectedIds,
        }),
      });
      if (!response.ok) {
        throw new Error("選定内容の保存に失敗しました。");
      }
      const data = await response.json();
      setQuest(data.quest ?? activeQuest);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-2xl px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>クエスト詳細を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!activeQuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-2xl px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">クエストが見つかりません</CardTitle>
              <CardDescription>募集一覧から選び直してください。</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline" asChild>
                <Link href="/reception">受付コンソールへ戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-2xl px-6 pb-16 pt-10 space-y-8">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Selection</p>
            <h1 className="font-serif text-2xl text-ink">冒険者選定（受付嬢）</h1>
            <p className="text-sm text-muted-foreground">
              クエスト詳細を確認しながら、申請順の冒険者と申請外候補から参加者を選定します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/reception">受付コンソールへ戻る</Link>
            </Button>
            <Button size="sm" onClick={handleSaveSelection} disabled={isSaving || !user?.id}>
              {isSaving ? "保存中..." : "選定を保存"}
            </Button>
          </div>
        </header>

        <DevUserSelector
          role="reception"
          roleLabel="受付"
          helperText="開発用ユーザーを選択すると選定保存が可能になります。"
        />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr_1fr]">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-primary">{activeQuest.id}</p>
                <CardTitle className="text-lg text-ink">{activeQuest.title}</CardTitle>
                <CardDescription>募集中クエストの内容を確認して、選定枠を決定します。</CardDescription>
              </div>
              <Badge variant="secondary">{activeQuest.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="受付" value={activeQuest.receptionistName ?? "未設定"} />
              <InfoRow label="冒険者" value={activeQuest.adventurerName ?? "未設定"} />
              <InfoRow label="募集枠" value={activeQuest.slots ?? "未設定"} />
              <InfoRow label="報酬" value={activeQuest.reward ?? "未設定"} />
              <InfoRow label="ランク制限" value={activeQuest.rank ?? "未設定"} />
              <InfoRow label="クエスト詳細" value={activeQuest.detail ?? "未設定"} />
              <InfoRow label="リスク" value={activeQuest.risk ?? "未設定"} />
              <InfoRow label="成果物 / 評価基準" value={activeQuest.deliverables ?? "未設定"} />
              <InfoRow label="ギルド支給物" value={activeQuest.supplies ?? "未設定"} />
              <InfoRow label="地図 / 注意事項" value={activeQuest.mapNotes ?? "未設定"} />
              <InfoRow label="連絡方法" value={activeQuest.channel ?? "未設定"} />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Badge variant="muted">選定完了で「クエスト進行」に移動</Badge>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border border-border/70 bg-white/90 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-hidden">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-ink">参加予定者</CardTitle>
                <Badge variant="secondary">{selectedAdventurers.length}名</Badge>
              </div>
              <CardDescription>参加予定の冒険者を一覧で確認し、必要に応じて外せます。</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 overflow-y-auto">
              {selectedAdventurers.length ? (
                <>
                  {selectedPageItems.map((adventurer) => (
                    <div
                      key={adventurer.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate font-semibold text-ink">
                          {adventurer.name} <span className="text-xs text-muted-foreground">({adventurer.rank})</span>
                        </p>
                        <p className="text-xs text-muted-foreground">役割: {adventurer.role}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-muted-foreground"
                          onClick={() => toggleSelection(adventurer.id)}
                        >
                          外す
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex min-h-[208px] items-center justify-center rounded-lg border border-dashed border-primary/30 bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  参加予定者はまだいません
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>
                {selectedPage} / {selectedTotalPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={selectedPage <= 1}
                onClick={() => setSelectedPage(selectedPage - 1)}
              >
                前へ
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={selectedPage >= selectedTotalPages}
                onClick={() => setSelectedPage(selectedPage + 1)}
              >
                次へ
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border border-border/70 bg-white/90 shadow-sm lg:max-h-[calc(100vh-2rem)] lg:overflow-hidden">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-ink">冒険者一覧</CardTitle>
                  <CardDescription>申請済みと全冒険者を切り替えて選定できます。</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={activeList === "applicants" ? "default" : "outline"}
                    onClick={() => setActiveList("applicants")}
                  >
                    申請済み（{applicantList.length}）
                  </Button>
                  <Button
                    size="sm"
                    variant={activeList === "all" ? "default" : "outline"}
                    onClick={() => setActiveList("all")}
                  >
                    全冒険者（{totalAdventurers}）
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent
              className="flex-1 space-y-3 overflow-y-auto pr-6"
              style={{ scrollbarGutter: "stable" }}
            >
              {activeList === "applicants"
                ? applicantPageItems.map((applicant) => (
                    <label
                      key={applicant.id}
                      className="flex w-full items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-border/70"
                        checked={selectedIds.includes(applicant.id)}
                        onChange={() => toggleSelection(applicant.id)}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">
                            {applicant.name} <span className="text-xs text-muted-foreground">({applicant.rank})</span>
                          </p>
                          <span className="text-[11px] text-muted-foreground">{applicant.appliedAt}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>役割: {applicant.role}</span>
                          <span className="h-3 w-px bg-border" />
                          <span className="line-clamp-1">{applicant.note}</span>
                        </div>
                      </div>
                    </label>
                  ))
                : allPageItems.map((adventurer) => (
                    <label
                      key={adventurer.id}
                      className="flex w-full items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-border/70"
                        checked={selectedIds.includes(adventurer.id)}
                        onChange={() => toggleSelection(adventurer.id)}
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold text-ink">
                          {adventurer.name} <span className="text-xs text-muted-foreground">({adventurer.rank})</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>役割: {adventurer.role}</span>
                          <span className="h-3 w-px bg-border" />
                          <span className="line-clamp-1">{adventurer.note}</span>
                        </div>
                      </div>
                    </label>
                  ))}
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              {activeList === "applicants" ? (
                <>
                  <span>
                    {applicantPage} / {applicantTotalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={applicantPage <= 1}
                    onClick={() => handleApplicantPageChange(applicantPage - 1)}
                  >
                    前へ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={applicantPage >= applicantTotalPages}
                    onClick={() => handleApplicantPageChange(applicantPage + 1)}
                  >
                    次へ
                  </Button>
                </>
              ) : (
                <>
                  <span>
                    {allPage} / {allTotalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={allPage <= 1}
                    onClick={() => handleAllPageChange(allPage - 1)}
                  >
                    前へ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={allPage >= allTotalPages}
                    onClick={() => handleAllPageChange(allPage + 1)}
                  >
                    次へ
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
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
