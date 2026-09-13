"use client";
import { appFetch } from "@/lib/app-path";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { readApiResponse } from "@/lib/api-client";
import QuestDossier from "@/components/quest-dossier";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Check, Swords } from "lucide-react";
import { Button } from "@/components/quest-ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/quest-ui/card";
import { useSessionUser } from "@/lib/session-user";
export default function QuestSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const questId = typeof params?.id === "string" ? params.id : params?.id?.[0];
    const [quest, setQuest] = useState(null);
    const [adventurers, setAdventurers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useSessionUser();
    const [applicantPage, setApplicantPage] = useState(1);
    const [allPage, setAllPage] = useState(1);
    const [activeList, setActiveList] = useState("applicants");
    const [selectedIds, setSelectedIds] = useState([]);
    const pageSize = 6;
    // 仮選定中は別ページング
    const [selectedPage, setSelectedPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [actionError, setActionError] = useState("");
    const actionPending = useRef(false);
    const canSelect = quest?.status === "募集中" && Boolean(user?.id) && !isSaving && !isFinalizing;
    const activeQuest = useMemo(() => quest, [quest]);
    const applicantList = useMemo(() => activeQuest?.applicants ?? [], [activeQuest]);
    const totalAdventurers = adventurers.length;
    const applicantTotalPages = Math.max(Math.ceil(applicantList.length / pageSize), 1);
    const allTotalPages = Math.max(Math.ceil(adventurers.length / pageSize), 1);
    const applicantPageItems = useMemo(() => {
        const startIndex = (applicantPage - 1) * pageSize;
        return applicantList.slice(startIndex, startIndex + pageSize);
    }, [applicantPage, applicantList]);
    const allPageItems = useMemo(() => {
        const startIndex = (allPage - 1) * pageSize;
        return adventurers.slice(startIndex, startIndex + pageSize);
    }, [adventurers, allPage]);
    const adventurerMap = useMemo(() => {
        const merged = new Map();
        applicantList.forEach((item) => {
            if (item?.id)
                merged.set(item.id, item);
        });
        adventurers.forEach((item) => {
            if (item?.id && !merged.has(item.id)) {
                merged.set(item.id, item);
            }
        });
        return merged;
    }, [adventurers, applicantList]);
    const selectedAdventurers = useMemo(() => selectedIds.map((id) => adventurerMap.get(id)).filter(Boolean), [selectedIds, adventurerMap]);
    const selectedTotalPages = Math.max(Math.ceil(selectedAdventurers.length / pageSize), 1);
    const selectedPageItems = useMemo(() => {
        const startIndex = (selectedPage - 1) * pageSize;
        return selectedAdventurers.slice(startIndex, startIndex + pageSize);
    }, [selectedAdventurers, selectedPage]);
    const toggleSelection = (id) => {
        if (!canSelect || actionPending.current)
            return;
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };
    useEffect(() => {
        if (!questId)
            return;
        let active = true;
        Promise.all([appFetch(`/api/quests/${questId}`), appFetch("/api/adventurers")])
            .then(async ([questResponse, adventurerResponse]) => {
            const questData = await questResponse.json();
            const adventurerData = await adventurerResponse.json();
            if (!active)
                return;
            setQuest(questData.quest ?? null);
            setAdventurers(adventurerData.adventurers ?? []);
        })
            .catch(() => {
            if (!active)
                return;
            setQuest(null);
            setAdventurers([]);
        })
            .finally(() => {
            if (!active)
                return;
            setIsLoading(false);
        });
        return () => {
            active = false;
        };
    }, [questId]);
    useEffect(() => {
        if (!activeQuest)
            return;
        const stored = Array.isArray(activeQuest.selectedAdventurerIds)
            ? activeQuest.selectedAdventurerIds
            : [];
        Promise.resolve().then(() => {
            setSelectedIds(stored);
        });
    }, [activeQuest]);
    useEffect(() => {
        if (selectedPage > selectedTotalPages) {
            Promise.resolve().then(() => {
                setSelectedPage(selectedTotalPages);
            });
        }
    }, [selectedPage, selectedTotalPages]);
    const handleApplicantPageChange = (nextPage) => {
        setApplicantPage(Math.min(Math.max(nextPage, 1), applicantTotalPages));
    };
    const handleAllPageChange = (nextPage) => {
        setAllPage(Math.min(Math.max(nextPage, 1), allTotalPages));
    };
    const handleSaveSelection = async () => {
        if (!activeQuest?.id || !canSelect || actionPending.current)
            return;
        actionPending.current = true;
        setActionError("");
        setIsSaving(true);
        try {
            const response = await appFetch(`/api/quests/${activeQuest.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "select",
                    selectedIds,
                }),
            });
            const data = await readApiResponse(response, "選定内容の保存に失敗しました。");
            setQuest(data.quest ?? activeQuest);
        }
        catch (error) {
            setActionError(error.message);
        }
        finally {
            actionPending.current = false;
            setIsSaving(false);
        }
    };
    const handleFinalizeSelection = async () => {
        if (!activeQuest?.id || !canSelect || !selectedIds.length || actionPending.current)
            return;
        actionPending.current = true;
        setActionError("");
        setIsFinalizing(true);
        try {
            const response = await appFetch(`/api/quests/${activeQuest.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "finalize-selection",
                    selectedIds,
                }),
            });
            await readApiResponse(response, "選定完了に失敗しました。");
            router.push("/reception");
        }
        catch (error) {
            setActionError(error.message);
        }
        finally {
            actionPending.current = false;
            setIsFinalizing(false);
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-2xl px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>クエスト詳細を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>);
    }
    if (!activeQuest) {
        return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-2xl px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">クエストが見つかりません</CardTitle>
              <CardDescription>募集一覧から選び直してください。</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline" asChild>
                <Link href="/reception">受付デスクへ戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>);
    }
    return <div className="page-wrap"><QuestDossier quest={activeQuest} backHref="/reception"><section className="guild-document"><header className="document-heading"><Users size={24}/><div><p className="eyebrow">ASSEMBLE YOUR PARTY</p><h2>冒険者を選定する</h2></div></header><div className="document-body"><div className="party-summary"><h3>参加予定者 <span>{selectedAdventurers.length} 名</span></h3>{selectedAdventurers.length ? <><div className="party-chips">{selectedPageItems.map(a => <button key={a.id} disabled={!canSelect} onClick={() => toggleSelection(a.id)} aria-label={`${a.name}を選定から外す`}><Check size={14}/>{a.name}<span>×</span></button>)}</div>{selectedTotalPages > 1 && <div className="pagination-row"><Button size="sm" variant="ghost" disabled={selectedPage <= 1} onClick={() => setSelectedPage(selectedPage - 1)}>前へ</Button><span>{selectedPage} / {selectedTotalPages}</span><Button size="sm" variant="ghost" disabled={selectedPage >= selectedTotalPages} onClick={() => setSelectedPage(selectedPage + 1)}>次へ</Button></div>}</> : <p className="quiet text-sm">下の候補から冒険者を選んでください。</p>}</div><Tabs value={activeList} onValueChange={setActiveList}><TabsList className="guild-tabs" variant="line"><TabsTrigger value="applicants">応募者 {applicantList.length}</TabsTrigger><TabsTrigger value="all">全冒険者 {totalAdventurers}</TabsTrigger></TabsList>{["applicants", "all"].map(list => { const items = list === "applicants" ? applicantPageItems : allPageItems; const page = list === "applicants" ? applicantPage : allPage; const total = list === "applicants" ? applicantTotalPages : allTotalPages; const change = list === "applicants" ? handleApplicantPageChange : handleAllPageChange; return <TabsContent key={list} value={list}><div className="candidate-list">{items.length ? items.map(a => <label key={a.id} className={`candidate ${selectedIds.includes(a.id) ? "chosen" : ""}`}><Checkbox checked={selectedIds.includes(a.id)} disabled={!canSelect} onCheckedChange={() => toggleSelection(a.id)}/><span className="candidate-avatar">{a.name?.slice(0, 1) || "冒"}</span><div><strong>{a.name}</strong><p>{a.rank || "ランク未設定"} · {a.role || "役割未設定"}</p>{a.note && <p className="quiet">{a.note}</p>}</div></label>) : <p className="active-empty">{list === "applicants" ? "まだ応募者はいません。" : "冒険者は登録されていません。"}</p>}</div>{total > 1 && <div className="pagination-row"><Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => change(page - 1)}>前へ</Button><span>{page} / {total}</span><Button size="sm" variant="ghost" disabled={page >= total} onClick={() => change(page + 1)}>次へ</Button></div>}</TabsContent>; })}</Tabs>{actionError && <p role="alert" className="action-error">{actionError}</p>}</div><footer className="document-actions"><Button variant="outline" onClick={handleSaveSelection} disabled={!canSelect}>{isSaving ? "保存中…" : "選定を一時保存"}</Button><Button onClick={handleFinalizeSelection} disabled={!canSelect || !selectedIds.length}><Swords size={16}/>{isFinalizing ? "開始中…" : "このメンバーで開始"}</Button></footer></section></QuestDossier></div>;
}
