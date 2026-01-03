 "use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const recruitingQuests = {
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
    slots: "2名（盾役1名必須）",
  },
  "qst-019": {
    id: "QST-019",
    title: "討伐 / 湿地帯の魔蛇",
    status: "募集中",
    reward: "120,000G",
    rank: "Bランク以上",
    detail: "沼地に生息する魔蛇の討伐。毒対策と地形把握が重要。",
    deliverables: "討伐証明部位 + 現地写真（代替可）",
    supplies: "解毒薬2本 / 地図支給 / 簡易テント",
    mapNotes: "沼地東側の浅瀬を通行。夜間は迂回指示。",
    risk: "毒・沼地 / 同行3名",
    channel: "ギルドチャット / 緊急時は鐘楼",
    slots: "3名（前衛1 / 後衛1 / 支援1）",
  },
};

const baseApplicants = [
  {
    id: "ADV-014",
    name: "レン・ハドリック",
    rank: "Cランク",
    role: "盾役",
    appliedAt: "今朝 09:12",
    note: "街道護衛経験あり。馬の扱いも可。",
    source: "申請",
  },
  {
    id: "ADV-008",
    name: "ミオ・サザーランド",
    rank: "Cランク",
    role: "斥候",
    appliedAt: "今朝 09:18",
    note: "夜間警戒の実績あり。静音移動が得意。",
    source: "申請",
  },
  {
    id: "ADV-021",
    name: "ダン・フォード",
    rank: "Dランク",
    role: "支援",
    appliedAt: "今朝 09:35",
    note: "護衛は初参加。補給・索敵を希望。",
    source: "申請",
  },
  {
    id: "ADV-003",
    name: "エルネ・ミード",
    rank: "Bランク",
    role: "槍士",
    appliedAt: "今朝 09:40",
    note: "高ランク枠。指揮を担える。",
    source: "申請",
  },
];

const baseStandby = [
  {
    id: "ADV-011",
    name: "アラン・ベイル",
    rank: "Cランク",
    role: "回復",
    note: "申請なし。ギルド推薦枠。",
    source: "推薦",
  },
  {
    id: "ADV-019",
    name: "スイ・カナリス",
    rank: "Bランク",
    role: "剣士",
    note: "申請なし。前回実績が良好。",
    source: "推薦",
  },
  {
    id: "ADV-002",
    name: "ヨナ・ホークス",
    rank: "Cランク",
    role: "弓手",
    note: "申請なし。護衛の後衛支援に適任。",
    source: "推薦",
  },
];

const TOTAL_ADVENTURERS = 100;
const APPLICANT_TARGET = 10;
const STANDBY_TARGET = TOTAL_ADVENTURERS - APPLICANT_TARGET;

const rankCycle = ["Dランク", "Cランク", "Bランク", "Aランク"];
const roleCycle = ["前衛", "後衛", "支援", "盾役", "回復", "斥候", "弓手", "魔導"];

const applicantList = [
  ...baseApplicants,
  ...Array.from({ length: Math.max(APPLICANT_TARGET - baseApplicants.length, 0) }, (_, index) => {
    const seq = baseApplicants.length + index + 1;
    return {
      id: `ADV-${String(100 + seq).slice(-3)}`,
      name: `候補冒険者${String(seq).padStart(2, "0")}`,
      rank: rankCycle[seq % rankCycle.length],
      role: roleCycle[seq % roleCycle.length],
      appliedAt: `今朝 09:${String(12 + index).padStart(2, "0")}`,
      note: "申請内容は簡易フォーム提出（ダミー）",
      source: "申請",
    };
  }),
].slice(0, APPLICANT_TARGET);

const standbyList = [
  ...baseStandby,
  ...Array.from({ length: Math.max(STANDBY_TARGET - baseStandby.length, 0) }, (_, index) => {
    const seq = baseStandby.length + index + 1;
    return {
      id: `ADV-${String(200 + seq).slice(-3)}`,
      name: `推薦候補${String(seq).padStart(2, "0")}`,
      rank: rankCycle[(seq + 1) % rankCycle.length],
      role: roleCycle[(seq + 3) % roleCycle.length],
      note: "申請なし / 受付推薦（ダミー）",
      source: "推薦",
    };
  }),
].slice(0, STANDBY_TARGET);

export default function QuestSelectionPage() {
  const params = useParams();
  const questId = typeof params?.id === "string" ? params.id : params?.id?.[0];
  const quest = recruitingQuests[questId] ?? recruitingQuests["qst-020"];
  const [applicantPage, setApplicantPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [activeList, setActiveList] = useState("applicants");
  const [selectedIds, setSelectedIds] = useState([]);
  const pageSize = 6;
  // 仮選定中は別ページング
  const [selectedPage, setSelectedPage] = useState(1);

  const applicantTotalPages = Math.max(Math.ceil(applicantList.length / pageSize), 1);
  const allTotalPages = Math.max(Math.ceil((applicantList.length + standbyList.length) / pageSize), 1);

  const applicantPageItems = useMemo(() => {
    const startIndex = (applicantPage - 1) * pageSize;
    return applicantList.slice(startIndex, startIndex + pageSize);
  }, [applicantPage]);

  const allAdventurers = useMemo(() => [...applicantList, ...standbyList], []);

  const allPageItems = useMemo(() => {
    const startIndex = (allPage - 1) * pageSize;
    return allAdventurers.slice(startIndex, startIndex + pageSize);
  }, [allAdventurers, allPage]);

  const adventurerMap = useMemo(() => {
    return new Map(allAdventurers.map((item) => [item.id, item]));
  }, []);

  const selectedAdventurers = useMemo(
    () => selectedIds.map((id) => adventurerMap.get(id)).filter(Boolean),
    [selectedIds, adventurerMap],
  );

  const selectedTotalPages = Math.max(Math.ceil(selectedAdventurers.length / pageSize), 1);
  const selectedPageItems = useMemo(() => {
    const startIndex = (selectedPage - 1) * pageSize;
    return selectedAdventurers.slice(startIndex, startIndex + pageSize);
  }, [selectedAdventurers, selectedPage]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

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
            <Button size="sm" asChild>
              <Link href="/reception">選定完了（ダミー）</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr_1fr]">
          <Card className="border-primary/15 bg-white/90 shadow-sm">
            <CardHeader className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-primary">{quest.id}</p>
                <CardTitle className="text-lg text-ink">{quest.title}</CardTitle>
                <CardDescription>募集中クエストの内容を確認して、選定枠を決定します。</CardDescription>
              </div>
              <Badge variant="secondary">{quest.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="募集枠" value={quest.slots} />
              <InfoRow label="報酬" value={quest.reward} />
              <InfoRow label="ランク制限" value={quest.rank} />
              <InfoRow label="クエスト詳細" value={quest.detail} />
              <InfoRow label="リスク" value={quest.risk} />
              <InfoRow label="成果物 / 評価基準" value={quest.deliverables} />
              <InfoRow label="ギルド支給物" value={quest.supplies} />
              <InfoRow label="地図 / 注意事項" value={quest.mapNotes} />
              <InfoRow label="連絡方法" value={quest.channel} />
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
                    全冒険者（{applicantList.length + standbyList.length}）
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
