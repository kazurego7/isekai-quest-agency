"use client";
import { appFetch } from "@/lib/app-path";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readApiResponse } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import QuestDossier from "@/components/quest-dossier";
import { Button } from "@/components/quest-ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/quest-ui/card";
import QuestDetailClient from "@/app/adventurer/quests/[id]/quest-detail-client";
import { useSessionUser } from "@/lib/session-user";
import ConfirmActionButton from "@/app/requests/confirm-action-button";
export default function AdventurerQuestDetail() {
    const params = useParams();
    const router = useRouter();
    const [quest, setQuest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const id = String(params?.id ?? "");
    const { user } = useSessionUser();
    const hasActor = Boolean(user?.id);
    useEffect(() => {
        if (!id)
            return;
        let active = true;
        appFetch(`/api/quests/${id}`)
            .then((response) => response.json())
            .then((data) => {
            if (!active)
                return;
            setQuest(data.quest ?? null);
        })
            .catch(() => {
            if (!active)
                return;
            setQuest(null);
        })
            .finally(() => {
            if (!active)
                return;
            setIsLoading(false);
        });
        return () => {
            active = false;
        };
    }, [id]);
    const normalizedQuest = useMemo(() => {
        if (!quest)
            return null;
        return {
            ...quest,
            slots: quest.slots ?? "未設定",
            checklist: quest.checklist ?? [],
            photos: quest.photos ?? [],
            reportComment: quest.reportComment ?? "",
            reward: quest.reward ?? "未設定",
            rank: quest.rank ?? "未設定",
            detail: quest.detail ?? "未設定",
            risk: quest.risk ?? "未設定",
            deliverables: quest.deliverables ?? "未設定",
            supplies: quest.supplies ?? "未設定",
            mapNotes: quest.mapNotes ?? "未設定",
            channel: quest.channel ?? "未設定",
            summary: quest.summary ?? "詳細は受付で確認",
            applicants: Array.isArray(quest.applicants) ? quest.applicants : [],
            selectedAdventurerIds: Array.isArray(quest.selectedAdventurerIds)
                ? quest.selectedAdventurerIds
                : [],
            viewerAdventurerId: quest.viewerAdventurerId ?? null,
        };
    }, [quest]);
    const matchedApplicant = useMemo(() => {
        if (!normalizedQuest?.viewerAdventurerId)
            return null;
        return normalizedQuest.applicants.find((applicant) => applicant.id === normalizedQuest.viewerAdventurerId) ?? null;
    }, [normalizedQuest]);
    const isApplied = Boolean(matchedApplicant?.id);
    const handleApply = () => {
        if (!normalizedQuest?.id || !user?.id)
            return;
        return appFetch(`/api/quests/${normalizedQuest.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "apply" }),
        }).then(async (response) => {
            await readApiResponse(response, "申請に失敗しました。");
            return appFetch(`/api/quests/${normalizedQuest.id}`)
                .then((nextResponse) => nextResponse.json())
                .then((data) => {
                setQuest(data.quest ?? null);
            });
        });
    };
    const handleComplete = (reportComment) => {
        if (!normalizedQuest?.id || !user?.id)
            return;
        const normalizedPhotos = (reportComment?.photos ?? []).map((photo, index) => ({
            id: photo.id ?? `${normalizedQuest.id}-photo-${index}`,
            label: photo.label ?? photo.name ?? "写真",
            name: photo.name ?? photo.label ?? "写真",
            size: photo.size ?? null,
            url: photo.url,
        }));
        return appFetch(`/api/quests/${normalizedQuest.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: "report",
                reportComment: reportComment?.comment ?? reportComment ?? "",
                checklist: reportComment?.checklist ?? [],
                photos: normalizedPhotos,
            }),
        }).then(async (response) => {
            await readApiResponse(response, "完了報告に失敗しました。");
            router.push("/adventurer");
        });
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>クエスト詳細を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>);
    }
    if (!normalizedQuest) {
        return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">クエストが見つかりません</CardTitle>
              <CardDescription>一覧からクエストを選び直してください。</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline" asChild>
                <Link href="/adventurer">一覧へ戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>);
    }
    return <div className="page-wrap"><QuestDossier quest={normalizedQuest} backHref="/adventurer">{normalizedQuest.status === "募集中" ? <section className="guild-document"><div className="document-body"><p className="eyebrow">JOIN THE QUEST</p><h2 className="font-serif text-xl">この冒険に参加する</h2><p className="quiet my-4">{normalizedQuest.applicationMessage}</p><ConfirmActionButton onConfirm={handleApply} disabled={!hasActor || !normalizedQuest.canApply}>{isApplied ? "参加を申請済み" : "参加を申請する"}</ConfirmActionButton></div></section> : null}{normalizedQuest.reviewNote && <div className="notice-banner"><h2>{normalizedQuest.status === "クエスト進行中" ? "受付からの差し戻し" : "受付の確認メモ"}</h2><p>{normalizedQuest.reviewNote}</p></div>}{normalizedQuest.status !== "募集中" && <QuestDetailClient key={`${normalizedQuest.id}-${normalizedQuest.updatedAt || ""}`} quest={normalizedQuest} onComplete={handleComplete}/>}</QuestDossier></div>;
}
