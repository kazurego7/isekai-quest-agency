"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmActionButton from "../../../confirm-action-button";
import DevUserSelector from "@/components/dev-user-selector";
import { useDevUser } from "@/lib/dev-user";

const fieldOrder = [
  "依頼タイトル",
  "目的・背景",
  "場所",
  "完了期限",
  "危険度・同行条件",
  "報酬上限額",
  "備考",
];

const emptyDraft = {
  title: "依頼が見つかりません",
  before: fieldOrder.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {}),
  suggested: fieldOrder.reduce((acc, key) => {
    acc[key] = "";
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
  const role =
    params?.role === "reception" ? "reception" : params?.role === "requester" ? "requester" : null;
  const isRoleValid = Boolean(role);
  const roleForLinks = role ?? "requester";
  const waitingLabel = roleForLinks === "reception" ? "依頼者" : "受付";
  const roleLabel = roleForLinks === "reception" ? "受付" : "依頼者";
  const { user } = useDevUser(roleForLinks);
  const requesterId = roleForLinks === "requester" ? user?.id : "";

  useEffect(() => {
    if (!requestId) return;
    if (roleForLinks === "requester" && !requesterId) {
      setCurrentRequest(null);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    const query = requesterId ? `?requesterId=${encodeURIComponent(requesterId)}` : "";
    fetch(`/api/requests/${requestId}${query}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setCurrentRequest(data.request ?? null);
      })
      .catch(() => {
        if (!active) return;
        setCurrentRequest(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestId, requesterId, roleForLinks]);

  const [suggestedFields, setSuggestedFields] = useState(() => emptyDraft.suggested);
  const [reason, setReason] = useState(emptyDraft.reason);

  const draft = useMemo(() => {
    if (currentRequest) {
      return {
        title: currentRequest.title,
        before: currentRequest.fields ?? {},
        suggested: currentRequest.fields ?? {},
        reason: "調整の理由を記載",
      };
    }
    return emptyDraft;
  }, [currentRequest]);

  useEffect(() => {
    setSuggestedFields(draft.suggested);
    setReason(draft.reason);
  }, [draft]);

  const inferredAgreement = useMemo(() => {
    if (!currentRequest) {
      return { requesterAgreed: false, receptionistAgreed: false };
    }
    return {
      requesterAgreed: Boolean(currentRequest.requesterAgreed),
      receptionistAgreed: Boolean(currentRequest.receptionistAgreed),
    };
  }, [currentRequest]);

  const isLocked =
    roleForLinks === "reception" ? inferredAgreement.receptionistAgreed : inferredAgreement.requesterAgreed;
  const hasActor = Boolean(user?.id);
  const canSubmit = Boolean(currentRequest) && !isLocked && isRoleValid && hasActor;

  const handleFieldChange = (label, value) => {
    setSuggestedFields((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = () => {
    if (!requestId || !canSubmit) return;
    return fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "adjust",
        actorRole: roleForLinks,
        actorId: user?.id,
        fields: suggestedFields,
        reason,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("調整の送信に失敗しました。");
      }
      router.push(`/requests/${roleForLinks}/${requestId}`);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>依頼の調整内容を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentRequest) {
    if (roleForLinks === "requester" && !requesterId) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
          <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
            <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">依頼者を選択してください</CardTitle>
                <CardDescription>上の開発用ログインでユーザーを選ぶと、調整内容が表示されます。</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/requests">一覧へ戻る</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Adjust</p>
            <h1 className="font-serif text-2xl">依頼調整</h1>
            <p className="text-sm text-muted-foreground">
              依頼者と受付嬢が交互に「合意」または「調整」を送ります。この画面では調整案のみ送信し、合意は詳細画面で行う想定です（誤合意防止のため）。
            </p>
            {isLocked ? (
              <p className="text-xs text-amber-600">
                相手の合意待ちのため、現在は修正できません。
              </p>
            ) : null}
            <div className="mt-2 rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-ink">
              <p className="font-semibold text-ink">合意ラリーの流れ（例）</p>
              <p>依頼者が依頼送信 → 受付嬢が合意 or 調整 → 依頼者が合意 or 再調整 → 受付嬢が合意</p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/requests/${roleForLinks}/${requestId}`}>詳細へ戻る</Link>
          </Button>
        </header>

        <DevUserSelector
          role={roleForLinks}
          roleLabel={roleLabel}
          helperText="開発用ユーザーを選択すると調整案の送信が可能になります。"
        />

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{draft.title}</CardTitle>
            <CardDescription>調整前と調整後を上下で比較しながら入力できます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldOrder.map((label) => (
              <div key={label} className="space-y-2 rounded-lg border border-border/50 bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{label}</span>
                  <span className="text-[11px] text-muted-foreground">上: 調整前（相手案） / 下: 調整後（今回の提案）</span>
                </div>
                <div className="space-y-2">
                  <input
                    className="w-full rounded-lg border border-border/70 bg-muted/60 px-3 py-2 text-sm text-foreground outline-none"
                    readOnly
                    value={draft.before?.[label] ?? ""}
                  />
                  <input
                    className="w-full rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                    value={suggestedFields?.[label] ?? ""}
                    onChange={(event) => handleFieldChange(label, event.target.value)}
                    readOnly={isLocked}
                  />
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">調整理由</p>
              <textarea
                className="h-24 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                readOnly={isLocked}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <ConfirmActionButton
              href={`/requests/${roleForLinks}/${requestId}`}
              requireConfirm
              confirmTitle="調整案を送信しますか？"
              confirmMessage={`送信後は${waitingLabel}の合意待ちになります。`}
              confirmLabel="送信する"
              variant="default"
              size="sm"
              onConfirm={handleSubmit}
              className={!canSubmit ? "pointer-events-none opacity-50" : undefined}
            >
              今回の提案を送信
            </ConfirmActionButton>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/requests/${roleForLinks}/${requestId}`}>送らず戻る</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">合意ルール（ダミー）</CardTitle>
            <CardDescription>
              調整を送った側は合意済みとなり、相手の合意待ちになります。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
