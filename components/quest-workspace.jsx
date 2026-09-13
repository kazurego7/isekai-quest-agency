"use client";
import { appFetch } from "@/lib/app-path";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { requestDisplayFields } from "@/lib/request-options";
import { useSessionUser } from "@/lib/session-user";
import { deriveViewStatus } from "@/lib/request-status";
import { Compass, ArrowUpRight, MapPin, Coins, ScrollText, RefreshCw } from "lucide-react";
import { Button } from "@/components/quest-ui/button";
import { Skeleton } from "@/components/ui/skeleton";
export function useRecords(paths) {
    const [state, setState] = useState({ data: null, error: "", loading: true });
    const key = JSON.stringify(paths);
    const fetchData = useCallback(() => Promise.all(JSON.parse(key).map(async (path) => { const r = await appFetch(path); if (!r.ok)
        throw new Error("読み込めませんでした。もう一度お試しください。"); return r.json(); })), [key]);
    useEffect(() => { let active = true; fetchData().then(data => { if (active)
        setState({ data, error: "", loading: false }); }, e => { if (active)
        setState({ data: null, error: e.message, loading: false }); }); return () => { active = false; }; }, [fetchData]);
    async function reload() { setState(s => ({ ...s, loading: true, error: "" })); try {
        setState({ data: await fetchData(), error: "", loading: false });
    }
    catch (e) {
        setState({ data: null, error: e.message, loading: false });
    } }
    return { ...state, reload };
}
export function PageHeading({ eyebrow, title, description, children }) { return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</header>; }
export function Status({ value }) { const tone = ["完了", "達成確認済み", "合意済み"].includes(value) ? "green" : ["確認前", "完了報告済み", "合意待ち"].includes(value) ? "gold" : "slate"; return <span className={`quest-status ${tone}`}>{value}</span>; }
export function EmptyState({ title = "該当するクエストはありません", description, children }) { return <div className="quest-empty"><Compass size={36} strokeWidth={1}/><h3>{title}</h3>{description && <p>{description}</p>}{children}</div>; }
export function LoadState({ loading, error, reload }) { if (loading)
    return <div className="space-y-4 p-6" role="status" aria-label="読み込み中"><Skeleton className="h-8 w-1/3"/><Skeleton className="h-24 w-full"/><Skeleton className="h-24 w-full"/></div>; if (error)
    return <div className="quest-empty" role="alert"><p>{error}</p><Button variant="outline" onClick={reload}><RefreshCw size={16}/>再読み込み</Button></div>; return null; }
export function QuestCard({ quest, href, action = "詳細を見る", children }) { return <article className="quest-card"><div className="quest-card-top"><span className="rank-seal">{quest.rank || quest.rankRestriction || "—"}<small>RANK</small></span><Status value={quest.status}/></div><Link href={href} className="quest-card-title">{quest.title}<ArrowUpRight size={18}/></Link><p className="quest-summary">{quest.detail || quest.summary || quest.purpose || "詳しい条件はクエスト詳細で確認できます。"}</p><div className="quest-facts"><span><MapPin size={15}/>{quest.location || "場所未設定"}</span><span><Coins size={15}/>{quest.reward || "報酬未設定"}</span></div><footer><Link href={href} className="text-sm text-primary">{action} <span aria-hidden="true">→</span></Link>{children}</footer></article>; }
export function RequestRow({ item, href, action }) { const { user } = useSessionUser(); const viewStatus = item.questStatus || deriveViewStatus(item, user?.userType === "staff" ? "reception" : "requester"); return <Link href={item.questId ? `/quests/${item.questId}` : href} className="request-row"><span className="request-symbol"><ScrollText size={21}/></span><div className="request-row-main"><strong>{item.publishedTitle || item.title || "無題の依頼"}</strong><span>{item.requesterName || "依頼者"}{(item.location||item.regionId) ? ` · ${requestDisplayFields.find(f=>f.key==="location").value(item)}` : ""}</span></div><Status value={viewStatus}/><span className="row-action">{action || "詳細を見る"}<ArrowUpRight size={16}/></span></Link>; }
