"use client";
import { appFetch } from "@/lib/app-path";
import { useState } from "react";
import MobileSectionSelect from "@/components/mobile-section-select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/quest-ui/button";
import { useSessionUser } from "@/lib/session-user";
import { useRecords, PageHeading, EmptyState, LoadState, QuestCard } from "@/components/quest-workspace";
export default function AdventurerDashboard() { const { user } = useSessionUser(); const [tab, setTab] = useState("open"); const state = useRecords(["/api/quests"]); const quests = state.data?.[0]?.quests || []; const [pending, setPending] = useState(null), [error, setError] = useState(""); const mine = q => q.adventurerId === user?.id || (q.viewerAdventurerId && (q.selectedAdventurerIds || []).includes(q.viewerAdventurerId)); const active = quests.filter(q => mine(q) && ["クエスト進行中", "完了報告済み"].includes(q.status)); const applied = q => Boolean(q.applicants?.length); const groups = [{ id: "open", label: "募集中", items: quests.filter(q => q.status === "募集中") }, { id: "applied", label: "申請中", items: quests.filter(q => q.status === "募集中" && applied(q)) }, { id: "history", label: "達成の記録", items: quests.filter(q => mine(q) && q.status === "達成確認済み") }]; async function apply(id) { if (pending)
    return; setPending(id); setError(""); try {
    const r = await appFetch(`/api/quests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "apply" }) });
    const data = await r.json();
    if (!r.ok)
        throw new Error(data.error || "申請できませんでした。");
    await state.reload();
}
catch (e) {
    setError(e.message);
}
finally {
    setPending(null);
} } return <div className="page-wrap adventurer-dashboard"><PageHeading eyebrow="ADVENTURER’S GUILD" title="クエストボード" description="あなたの力を待っている依頼があります。"/><section className="guild-banner"><div><p className="eyebrow">CHOOSE YOUR NEXT ADVENTURE</p><h2>新たな冒険が、あなたを待つ。</h2><p>条件を確かめ、挑みたいクエストへ。</p></div></section><section className="my-quests"><div className="section-heading"><h2>参加中のクエスト</h2><span className="quiet text-sm">{active.length} 件</span></div><LoadState {...state}/>{!state.loading && !state.error && (active.length ? <div className="quest-grid">{active.map(q => <QuestCard key={q.id} quest={q} href={`/quests/${q.id}`} action={q.status === "完了報告済み" ? "報告を確認" : "成果を報告"}/>)}</div> : <div className="active-empty">参加中のクエストはありません。下のボードから次の冒険を探しましょう。</div>)}</section>{error && <p role="alert" className="action-error">{error}</p>}<Tabs value={tab} onValueChange={setTab}><MobileSectionSelect label="クエストを探す" value={tab} onChange={setTab} groups={groups}/><div className="tab-scroll"><TabsList variant="line" className="guild-tabs">{groups.map(g => <TabsTrigger key={g.id} value={g.id}>{g.label}<span className="tab-count">{g.items.length}</span></TabsTrigger>)}</TabsList></div>{groups.map(g => <TabsContent value={g.id} key={g.id}>{!state.loading && !state.error && (g.items.length ? <div className="quest-grid">{g.items.map(q => <QuestCard key={q.id} quest={q} href={`/quests/${q.id}`}>{q.status === "募集中" && <div>{!q.canApply && !applied(q) && <p className="quiet text-sm">{q.applicationMessage}</p>}<Button size="sm" disabled={Boolean(pending) || !q.canApply} onClick={() => apply(q.id)}>{pending === q.id ? "申請中…" : applied(q) ? "申請済み" : "参加を申請"}</Button></div>}</QuestCard>)}</div> : <div className="panel"><EmptyState title={g.id === "history" ? "冒険の記録はこれからです" : g.id === "applied" ? "申請中のクエストはありません" : "新しいクエストを準備中です"} description={g.id === "open" ? "依頼が公開されると、ここに表示されます。" : undefined}/></div>)}</TabsContent>)}</Tabs></div>; }
