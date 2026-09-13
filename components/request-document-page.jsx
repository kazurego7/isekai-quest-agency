"use client";
import { appFetch } from "@/lib/app-path";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/quest-ui/button";
import ConfirmActionButton from "@/app/requests/confirm-action-button";
import { useSessionUser } from "@/lib/session-user";
import { PageHeading, Status, LoadState, EmptyState } from "@/components/quest-workspace";
import RequestFields, { requestFields } from "@/components/request-fields";
import { ScrollText, ArrowLeft, ArrowRight, Check, Clock, Trash2 } from "lucide-react";
import { deriveViewStatus } from "@/lib/request-status";
import RequestAttachments from "@/components/request-attachments";
import { canSubmitRequest } from "@/lib/request-options";
import RequestComparison from "@/components/request-comparison";
export default function RequestDetail() {
    const params = useParams();
    const router = useRouter();
    const [currentRequest, setCurrentRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const id = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";
    const role = params?.role === "reception" ? "reception" : params?.role === "requester" ? "requester" : null;
    const isRoleValid = Boolean(role);
    const roleForLinks = role ?? "requester";
    const listHref = role === "reception" ? "/reception" : "/requests";
    const { user, isLoading: isUserLoading } = useSessionUser();
    const requesterId = roleForLinks === "requester" && role !== "reception" ? user?.id : "";
    const shouldSelectRequester = roleForLinks === "requester" && !isUserLoading && !requesterId;
    const activeAbortRef = useRef(null);
    useEffect(() => {
        if (!id)
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
        appFetch(`/api/requests/${id}${query}`, { signal: controller.signal })
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
    }, [id, isUserLoading, requesterId, roleForLinks]);
    const request = useMemo(() => (shouldSelectRequester ? null : currentRequest), [currentRequest, shouldSelectRequester]);
    const effectiveIsLoading = shouldSelectRequester
        ? false
        : roleForLinks === "requester" && isUserLoading
            ? true
            : isLoading;
    const hasActor = Boolean(user?.id);
    const agreement = useMemo(() => ({
        requesterAgreed: Boolean(request?.requesterAgreed),
        receptionistAgreed: Boolean(request?.receptionistAgreed),
    }), [request?.requesterAgreed, request?.receptionistAgreed]);
    const selfAgreed = roleForLinks === "reception" ? agreement.receptionistAgreed : agreement.requesterAgreed;
    const otherAgreed = roleForLinks === "reception" ? agreement.requesterAgreed : agreement.receptionistAgreed;
    const status = request?.status ?? "";
    const viewStatus = useMemo(() => {
        if (!request)
            return "";
        return deriveViewStatus({
            status: request.status,
            requesterAgreed: Boolean(request.requesterAgreed),
            receptionistAgreed: Boolean(request.receptionistAgreed),
        }, roleForLinks);
    }, [request, roleForLinks]);
    const canAgree = hasActor && isRoleValid && ["確認前", "合意待ち"].includes(status) && !selfAgreed;
    const canAdjust = useMemo(() => {
        if (!isRoleValid || !hasActor)
            return false;
        if (status !== "確認前" && status !== "合意待ち")
            return false;
        return otherAgreed && !selfAgreed;
    }, [hasActor, isRoleValid, otherAgreed, selfAgreed, status]);
    const handleAgree = async () => {
        if (!currentRequest || !isRoleValid || !user?.id) {
            router.push(listHref);
            return;
        }
        const response = await appFetch(`/api/requests/${request.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "agree" }),
        });
        if (!response.ok) {
            throw new Error("合意を保存できませんでした。再読み込みしてお試しください。");
        }
        router.push(listHref);
    };
    const isDraft = status === "下書き";
    const [draftFields, setDraftFields] = useState(null);
    const [filesBusy,setFilesBusy] = useState(false);
    useEffect(() => {
        if (!request || !isDraft)
            return;
        Promise.resolve().then(() => {
            setDraftFields({
                ...request,
                title: request.title ?? "",
                purpose: request.purpose ?? "",
                location: request.location ?? "",
                deadline: request.deadline ?? "",
                risk: request.risk ?? "",
                reward: request.reward ?? "",
                requesterNote: request.requesterNote ?? "",
            });
        });
    }, [request, isDraft]);
    const canSaveDraft = isDraft && hasActor && isRoleValid && roleForLinks === "requester";
    const canSubmitDraft = canSaveDraft && canSubmitRequest(draftFields) && !filesBusy;
    const handleDraftChange = (key, value) => {
        setDraftFields((prev) => ({ ...(prev ?? {}), [key]: value }));
    };
    const handleDraftSave = async () => {
        if (!request || !canSaveDraft)
            return;
        const response = await appFetch(`/api/requests/${request.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: "draft-save",
                fields: {...draftFields,formatVersion:1},
            }),
        });
        if (!response.ok) {
            throw new Error("下書きの保存に失敗しました。");
        }
        const data = await response.json();
        setCurrentRequest(data.request ?? null);
    };
    const handleDraftSubmit = async () => {
        if (!request || !canSubmitDraft)
            return;
        const response = await appFetch(`/api/requests/${request.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: "submit",
                fields: {...draftFields,formatVersion:1},
            }),
        });
        if (!response.ok) {
            throw new Error("依頼の送信に失敗しました。");
        }
    };
    const handleDraftDelete = async () => {
        if (!request || !canSaveDraft)
            return;
        const response = await appFetch(`/api/requests/${request.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        if (!response.ok) {
            throw new Error("下書きの削除に失敗しました。");
        }
    };
    if (effectiveIsLoading)
        return <div className="page-wrap"><LoadState loading/></div>;
    if (!request)
        return <div className="page-wrap"><EmptyState title="依頼が見つかりません" description="依頼帳から選び直してください。"><Button asChild variant="outline"><Link href={listHref}>依頼帳へ戻る</Link></Button></EmptyState></div>;
    return <div className="page-wrap request-detail-page"><PageHeading eyebrow={isDraft ? "DRAFT REQUEST" : "REQUEST DETAILS"} title={isDraft ? "依頼の下書き" : "依頼書を確認"}><Button asChild variant="ghost"><Link href={listHref}><ArrowLeft size={16}/>一覧へ戻る</Link></Button></PageHeading>{request.relatedQuest && <section className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded border border-border bg-card p-4" aria-label="公開されたクエスト"><div><h2 className="font-semibold">この依頼はクエストとして公開されています</h2><p className="quiet mt-1 text-sm">{request.relatedQuest.status === "募集中" ? "冒険者向けの内容を確認し、参加を申請できます。" : `現在の状態：${request.relatedQuest.status}`}</p></div>{request.relatedQuest.canView && <Button asChild className="w-full sm:w-auto"><Link href={`/quests/${request.relatedQuest.id}`}>公開クエストを見る<ArrowRight size={16}/></Link></Button>}</section>}<div className="document-layout"><section className="guild-document"><header className="document-heading"><ScrollText size={26}/><div><p className="eyebrow">GUILD REQUEST</p><h2>{request.title || "無題の依頼"}</h2></div><Status value={viewStatus}/></header><div className="document-body">{isDraft ? <RequestFields value={draftFields} onChange={handleDraftChange} onBusyChange={setFilesBusy}/> : <><div className="document-people"><span>依頼者<strong>{request.requesterName || "未設定"}</strong></span><span>担当受付<strong>{request.receptionistName || "受付待ち"}</strong></span></div>{viewStatus === "確認前" ? <RequestComparison request={request}/> : <dl className="document-details">{requestFields.filter(f => f.key !== "title").map(f => <div key={f.key}><dt>{f.label}</dt><dd>{f.value(request)}</dd></div>)}<div><dt>添付ファイル</dt><dd><RequestAttachments files={request.attachments}/></dd></div></dl>}{request.relatedQuest && request.previousConditions && <details className="mt-6"><summary className="cursor-pointer text-primary">直前の条件調整を見る</summary><RequestComparison request={request} historical/></details>}</>}</div><footer className="document-actions">{isDraft ? <><ConfirmActionButton requireConfirm confirmTitle="下書きを削除しますか？" confirmMessage="削除した下書きは元に戻せません。" confirmLabel="削除する" href="/requests" onConfirm={handleDraftDelete} variant="ghost" confirmClassName="bg-red-700 text-white"><Trash2 size={16}/>削除</ConfirmActionButton><ConfirmActionButton onConfirm={handleDraftSave} href={`/requests/requester/${id}`} variant="outline" disabled={!canSaveDraft||filesBusy}>下書きを保存</ConfirmActionButton><ConfirmActionButton href="/requests" requireConfirm confirmTitle="この依頼を送信しますか？" confirmMessage="受付が内容を確認します。" confirmLabel="依頼を送信" onConfirm={handleDraftSubmit} disabled={!canSubmitDraft}>受付に送信</ConfirmActionButton></> : <>{canAdjust && <Button asChild variant="outline"><Link href={`/requests/${roleForLinks}/${id}/adjust`}>条件の調整を提案</Link></Button>}{canAgree && <ConfirmActionButton href={listHref} requireConfirm confirmTitle="この条件に合意しますか？" confirmMessage="依頼者と受付の双方が合意すると、公開の準備に進みます。" confirmLabel="合意する" onConfirm={handleAgree}><Check size={16}/>この内容に合意</ConfirmActionButton>}{role === "reception" && status === "合意済み" && <Button asChild><Link href={`/reception/questify?requestId=${id}`}>クエストとして公開</Link></Button>}</>}</footer></section><aside className="document-guide"><p className="eyebrow">REQUEST PROGRESS</p><h2>依頼の進み具合</h2><ol className="progress-steps">{["依頼の作成", "受付・条件の合意", "クエストの公開", "冒険・成果の報告", "完了"].map((label, i) => { const step = isDraft ? 0 : ["確認前", "合意待ち", "合意済み"].includes(status) ? 1 : status === "クエスト化済み" ? 2 : status === "完了" ? 4 : 3; return <li className={i === step ? "current" : i < step ? "finished" : ""} key={label}><span>{i < step ? <Check size={14}/> : i + 1}</span><strong>{label}</strong></li>; })}</ol>{!isDraft && <div className="agreement-box"><h3>条件への合意</h3>{[["依頼者", agreement.requesterAgreed], ["受付", agreement.receptionistAgreed]].map(([label, agreed]) => <p key={label}>{label}<span>{agreed ? <Check size={15}/> : <Clock size={15}/>} {agreed ? "合意済み" : "確認待ち"}</span></p>)}</div>}</aside></div></div>;
}
