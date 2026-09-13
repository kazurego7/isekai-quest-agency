"use client";
import { appFetch } from "@/lib/app-path";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readApiResponse } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import QuestDossier from "@/components/quest-dossier";
import { Button } from "@/components/quest-ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/quest-ui/card";
import QuestReviewClient from "@/app/reception/reviews/[id]/quest-review-client";
import { useSessionUser } from "@/lib/session-user";
export default function ReceptionReviewDetail() {
    const params = useParams();
    const router = useRouter();
    const [quest, setQuest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const id = String(params?.id ?? "");
    const { user } = useSessionUser();
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
            reportComment: quest.reportComment ?? "冒険者からの報告は未入力です。",
            checklist: quest.checklist ?? [],
            photos: quest.photos ?? [],
        };
    }, [quest]);
    const canReview = normalizedQuest?.status === "完了報告済み" && Boolean(user?.id);
    const handleVerify = (reviewNote) => {
        if (!normalizedQuest?.id || !user?.id)
            return;
        return appFetch(`/api/quests/${normalizedQuest.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "verify", reviewNote }),
        }).then(async (response) => {
            await readApiResponse(response, "達成確認の記録に失敗しました。");
            router.push("/reception");
        });
    };
    const handleRemand = (reviewNote) => {
        if (!normalizedQuest?.id || !user?.id)
            return;
        return appFetch(`/api/quests/${normalizedQuest.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "remand", reviewNote }),
        }).then(async (response) => {
            await readApiResponse(response, "差し戻しに失敗しました。");
            router.push("/reception");
        });
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
        <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>クエストの内容を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>);
    }
    if (!normalizedQuest) {
        return (<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/70">
        <div className="mx-auto max-w-screen-lg px-6 pb-16 pt-10 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">クエストが見つかりません</CardTitle>
              <CardDescription>受付デスクから選び直してください。</CardDescription>
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
    return <div className="page-wrap"><QuestDossier quest={normalizedQuest} backHref="/reception"><QuestReviewClient key={`${normalizedQuest.id}-${normalizedQuest.updatedAt || ""}`} quest={normalizedQuest} onVerify={handleVerify} onRemand={handleRemand} canReview={canReview}/></QuestDossier></div>;
}
