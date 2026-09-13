"use client";
import { appFetch } from "@/lib/app-path";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/quest-ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/quest-ui/card";
import ConfirmActionButton from "../../../confirm-action-button";
import { useSessionUser } from "@/lib/session-user";
import GeneralUserSwitch from "@/components/general-user-switch";
import RequestFields from "@/components/request-fields";
import RequestAttachments from "@/components/request-attachments";
import { canSubmitRequest } from "@/lib/request-options";
import { PageHeading } from "@/components/quest-workspace";
const fieldOrder = [
    { label: "依頼タイトル", key: "title" },
    { label: "目的・背景", key: "purpose" },
    { label: "場所", key: "location" },
    { label: "完了期限", key: "deadline" },
    { label: "危険度・同行条件", key: "risk" },
    { label: "報酬上限額", key: "reward" },
    { label: "備考", key: "requesterNote" },
];
const emptyDraft = {
    title: "依頼が見つかりません",
    before: fieldOrder.reduce((acc, field) => {
        acc[field.key] = "";
        return acc;
    }, {}),
    suggested: fieldOrder.reduce((acc, field) => {
        acc[field.key] = "";
        return acc;
    }, {}),
    reason: "調整内容が取得できませんでした。",
};
export default function AdjustPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = typeof params?.id === "string" ? params.id : params?.id?.[0];
    const [currentRequest, setCurrentRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const role = params?.role === "reception" ? "reception" : params?.role === "requester" ? "requester" : null;
    const isRoleValid = Boolean(role);
    const roleForLinks = role ?? "requester";
    const waitingLabel = roleForLinks === "reception" ? "依頼者" : "受付";
    const { user, isLoading: isUserLoading } = useSessionUser();
    const requesterId = roleForLinks === "requester" && role !== "reception" ? user?.id : "";
    const shouldSelectRequester = roleForLinks === "requester" && !isUserLoading && !requesterId;
    const activeAbortRef = useRef(null);
    useEffect(() => {
        if (!requestId)
            return;
        if (roleForLinks === "requester") {
            if (isUserLoading || !requesterId)
                return;
        }
        let active = true;
        const query = requesterId ? `?requesterId=${encodeURIComponent(requesterId)}` : "";
        if (activeAbortRef.current) {
            activeAbortRef.current.abort();
        }
        const controller = new AbortController();
        activeAbortRef.current = controller;
        appFetch(`/api/requests/${requestId}${query}`, { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => {
            if (!active)
                return;
            setCurrentRequest(data.request ?? null);
        })
            .catch((error) => {
            if (!active)
                return;
            if (error?.name === "AbortError")
                return;
            setCurrentRequest(null);
        })
            .finally(() => {
            if (!active)
                return;
            setIsLoading(false);
        });
        return () => {
            active = false;
            controller.abort();
        };
    }, [requestId, isUserLoading, requesterId, roleForLinks]);
    const [suggestedFields, setSuggestedFields] = useState(() => emptyDraft.suggested);
    const [filesBusy,setFilesBusy] = useState(false);
    const [reason, setReason] = useState(emptyDraft.reason);
    const activeRequest = shouldSelectRequester ? null : currentRequest;
    const draft = useMemo(() => {
        if (activeRequest) {
            return {
                title: activeRequest.title,
                before: activeRequest ?? {},
                suggested: activeRequest ?? {},
                reason: "",
            };
        }
        return emptyDraft;
    }, [activeRequest]);
    useEffect(() => {
        Promise.resolve().then(() => {
            setSuggestedFields(draft.suggested);
            setReason(draft.reason);
        });
    }, [draft]);
    const inferredAgreement = useMemo(() => {
        if (!activeRequest) {
            return { requesterAgreed: false, receptionistAgreed: false };
        }
        return {
            requesterAgreed: Boolean(activeRequest.requesterAgreed),
            receptionistAgreed: Boolean(activeRequest.receptionistAgreed),
        };
    }, [activeRequest]);
    const isLocked = roleForLinks === "reception" ? inferredAgreement.receptionistAgreed : inferredAgreement.requesterAgreed;
    const hasActor = Boolean(user?.id);
    const canSubmit = Boolean(activeRequest) && !isLocked && isRoleValid && hasActor && !filesBusy && canSubmitRequest(suggestedFields);
    const handleFieldChange = (key, value) => {
        setSuggestedFields((prev) => ({ ...prev, [key]: value }));
    };
    const handleSubmit = () => {
        if (!requestId || !canSubmit)
            return;
        return appFetch(`/api/requests/${requestId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: "adjust",
                fields: {
                    ...suggestedFields,formatVersion:1,
                    title: suggestedFields.title,
                    purpose: suggestedFields.purpose,
                    location: suggestedFields.location,
                    deadline: suggestedFields.deadline,
                    risk: suggestedFields.risk,
                    reward: suggestedFields.reward,
                    requesterNote: suggestedFields.requesterNote,
                },
                reason,
            }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error("調整の送信に失敗しました。");
            }
            router.push(`/requests/${roleForLinks}/${requestId}`);
        });
    };
    const effectiveIsLoading = shouldSelectRequester
        ? false
        : roleForLinks === "requester" && isUserLoading
            ? true
            : isLoading;
    if (effectiveIsLoading) {
        return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>依頼の調整内容を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>);
    }
    if (!activeRequest) {
        if (roleForLinks === "requester" && !requesterId) {
            return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
          <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-primary">Adjust</p>
                <h1 className="font-serif text-2xl">依頼調整</h1>
                <p className="text-sm text-muted-foreground">
                  依頼者と受付が交互に「合意」または「調整」を送ります。この画面では調整案のみ送信し、合意は詳細画面で行う想定です（誤合意防止のため）。
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <GeneralUserSwitch currentArea="requests"/>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/requests/${roleForLinks}/${requestId}`}>詳細へ戻る</Link>
                </Button>
              </div>
            </header>

            <Card className="border border-dashed border-border/70 bg-card shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">依頼者を選択してください</CardTitle>
                <CardDescription>ログイン後に依頼一覧から対象を開いてください。</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/requests">一覧へ戻る</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>);
        }
        return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
          <Card className="border border-dashed border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">依頼が見つかりません</CardTitle>
              <CardDescription>一覧から依頼を選び直してください。</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/requests">一覧へ戻る</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>);
    }
    return <div className="page-wrap"><PageHeading eyebrow="REVISE THE TERMS" title="条件の調整を提案" description="現在の条件と比べながら、変更したい内容を入力してください。"><Button asChild variant="outline"><Link href={`/requests/${roleForLinks}/${requestId}`}>依頼書へ戻る</Link></Button></PageHeading>{isLocked && <p className="notice-banner">相手の確認待ちのため、現在は変更できません。</p>}<section className="guild-document"><header className="document-heading"><div><p className="eyebrow">TERMS OF AGREEMENT</p><h2>{draft.title}</h2></div></header><div className="document-body"><RequestFields value={suggestedFields} onChange={handleFieldChange} disabled={isLocked} onBusyChange={setFilesBusy} renderBefore={field=><div className="before-condition"><span>現在の条件</span><p>{field.value(draft.before)}</p><span>今回の提案</span></div>}/><details className="previous-files"><summary>現在の添付ファイルを確認</summary><RequestAttachments files={draft.before.attachments||[]}/></details><label className="guild-field mt-6"><span>調整理由</span><textarea rows={3} placeholder="変更の理由を相手に伝えましょう" value={reason} onChange={e => setReason(e.target.value)} readOnly={isLocked}/></label></div><footer className="document-actions"><Button asChild variant="ghost"><Link href={`/requests/${roleForLinks}/${requestId}`}>キャンセル</Link></Button><ConfirmActionButton href={`/requests/${roleForLinks}/${requestId}`} requireConfirm confirmTitle="調整案を送信しますか？" confirmMessage={`送信後は${waitingLabel}の合意待ちになります。`} confirmLabel="提案を送信" onConfirm={handleSubmit} disabled={!canSubmit}>調整案を送信</ConfirmActionButton></footer></section></div>;
}
