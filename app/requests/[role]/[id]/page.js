"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmActionButton from "../../confirm-action-button";
import { DevUserSelectorView } from "@/components/dev-user-selector";
import { useDevUser } from "@/lib/dev-user";

const fieldOrder = [
  { label: "依頼タイトル", key: "title" },
  { label: "目的・背景", key: "purpose" },
  { label: "場所", key: "location" },
  { label: "完了期限", key: "deadline" },
  { label: "危険度・同行条件", key: "risk" },
  { label: "報酬上限額", key: "reward" },
  { label: "備考", key: "requesterNote" },
];

const statusStyle = {
  合意待ち: "default",
  確認前: "secondary",
  下書き: "outline",
  受注済み: "muted",
  クエスト進行中: "muted",
  完了: "muted",
  合意済み: "secondary",
  クエスト化済み: "secondary",
};

const deriveViewStatus = ({ status, requesterAgreed, receptionistAgreed }, role) => {
  if (!["確認前", "合意待ち", "合意済み"].includes(status)) {
    return status;
  }
  if (requesterAgreed && receptionistAgreed) {
    return "合意済み";
  }
  const selfAgreed = role === "reception" ? receptionistAgreed : requesterAgreed;
  return selfAgreed ? "合意待ち" : "確認前";
};

function actionsByStatus(status) {
  switch (status) {
    case "下書き":
      return [
        { label: "送信", href: "/requests", variant: "default" },
        { label: "下書き保存", href: "/requests", variant: "secondary" },
      ];
    case "合意済み":
      return [{ label: "合意済み", href: "/requests", variant: "ghost" }];
    case "受注済み":
      return [{ label: "参照のみ", href: "/requests", variant: "ghost" }];
    case "クエスト進行中":
      return [{ label: "参照のみ", href: "/requests", variant: "ghost" }];
    case "完了":
      return [{ label: "完了済みの履歴", href: "/requests", variant: "ghost" }];
    case "クエスト化済み":
      return [{ label: "募集状況を見る", href: "/adventurer", variant: "outline" }];
    default:
      return [];
  }
}

export default function RequestDetail() {
  const params = useParams();
  const router = useRouter();
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";
  const role =
    params?.role === "reception" ? "reception" : params?.role === "requester" ? "requester" : null;
  const isRoleValid = Boolean(role);
  const roleForLinks = role ?? "requester";
  const listHref = role === "reception" ? "/reception" : "/requests";
  const roleLabel = roleForLinks === "reception" ? "受付" : "依頼者";
  const { user, users, userId, selectUser, ready, isEnabled } = useDevUser(roleForLinks);
  const requesterId = roleForLinks === "requester" ? user?.id : "";
  const activeAbortRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    if (roleForLinks === "requester") {
      if (!ready) {
        return;
      }
      if (!requesterId) {
        setCurrentRequest(null);
        setIsLoading(false);
        return;
      }
    }
    let active = true;
    setIsLoading(true);
    const query = requesterId ? `?requesterId=${encodeURIComponent(requesterId)}` : "";
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortRef.current = controller;
    fetch(`/api/requests/${id}${query}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setCurrentRequest(data.request ?? null);
      })
      .catch((error) => {
        if (!active) return;
        if (error?.name === "AbortError") return;
        setCurrentRequest(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, ready, requesterId, roleForLinks]);

  const request = useMemo(() => currentRequest, [currentRequest]);
  const hasActor = Boolean(user?.id);

  const agreement = useMemo(
    () => ({
      requesterAgreed: Boolean(request?.requesterAgreed),
      receptionistAgreed: Boolean(request?.receptionistAgreed),
    }),
    [request?.requesterAgreed, request?.receptionistAgreed],
  );

  const selfAgreed =
    roleForLinks === "reception" ? agreement.receptionistAgreed : agreement.requesterAgreed;
  const otherAgreed =
    roleForLinks === "reception" ? agreement.requesterAgreed : agreement.receptionistAgreed;
  const status = request?.status ?? "";
  const viewStatus = useMemo(() => {
    if (!request) return "";
    return deriveViewStatus(
      {
        status: request.status,
        requesterAgreed: Boolean(request.requesterAgreed),
        receptionistAgreed: Boolean(request.receptionistAgreed),
      },
      roleForLinks,
    );
  }, [request, roleForLinks]);
  const canAgree = hasActor && isRoleValid && ["確認前", "合意待ち"].includes(status) && !selfAgreed;
  const canAdjust = useMemo(() => {
    if (!isRoleValid || !hasActor) return false;
    if (status !== "確認前" && status !== "合意待ち") return false;
    return otherAgreed && !selfAgreed;
  }, [hasActor, isRoleValid, otherAgreed, selfAgreed, status]);
  const canShowActions = isRoleValid && !canAgree && !canAdjust;

  const handleAgree = async () => {
    if (!currentRequest || !isRoleValid || !user?.id) {
      router.push(listHref);
      return;
    }
    const response = await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "agree", actorRole: roleForLinks, actorId: user?.id }),
    });
    if (!response.ok) {
      return;
    }
    router.push(listHref);
  };
  const isDraft = status === "下書き";
  const [draftFields, setDraftFields] = useState(null);

  useEffect(() => {
    if (!request || !isDraft) return;
    setDraftFields({
      title: request.title ?? "",
      purpose: request.purpose ?? "",
      location: request.location ?? "",
      deadline: request.deadline ?? "",
      risk: request.risk ?? "",
      reward: request.reward ?? "",
      requesterNote: request.requesterNote ?? "",
    });
  }, [request, isDraft]);

  const canSaveDraft = isDraft && hasActor && isRoleValid && roleForLinks === "requester";
  const canSubmitDraft = canSaveDraft && Boolean(draftFields?.title);

  const handleDraftChange = (key, value) => {
    setDraftFields((prev) => ({ ...(prev ?? {}), [key]: value }));
  };

  const handleDraftSave = async () => {
    if (!request || !canSaveDraft) return;
    const response = await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "draft-save",
        actorRole: roleForLinks,
        actorId: user?.id,
        fields: draftFields ?? {},
      }),
    });
    if (!response.ok) {
      throw new Error("下書きの保存に失敗しました。");
    }
    const data = await response.json();
    setCurrentRequest(data.request ?? null);
  };

  const handleDraftSubmit = async () => {
    if (!request || !canSubmitDraft) return;
    const response = await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "submit",
        actorRole: roleForLinks,
        actorId: user?.id,
        fields: draftFields ?? {},
      }),
    });
    if (!response.ok) {
      throw new Error("依頼の送信に失敗しました。");
    }
  };

  const handleDraftDelete = async () => {
    if (!request || !canSaveDraft) return;
    const response = await fetch(`/api/requests/${request.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorRole: roleForLinks,
        actorId: user?.id,
      }),
    });
    if (!response.ok) {
      throw new Error("下書きの削除に失敗しました。");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
        <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
              <CardDescription>依頼の詳細を取得しています。</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!request) {
    if (roleForLinks === "requester" && !requesterId) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
          <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-primary">Detail</p>
                <h1 className="font-serif text-2xl">依頼詳細</h1>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={listHref}>一覧へ</Link>
              </Button>
            </header>

            <DevUserSelectorView
              user={user}
              users={users}
              userId={userId}
              selectUser={selectUser}
              isEnabled={isEnabled}
              roleLabel={roleLabel}
              helperText="開発用ユーザーを選択すると合意や調整が可能になります。"
            />

            <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">依頼者を選択してください</CardTitle>
                <CardDescription>上の開発用ログインでユーザーを選ぶと、依頼詳細が表示されます。</CardDescription>
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
              <p className="text-xs uppercase tracking-[0.32em] text-primary">Detail</p>
              <h1 className="font-serif text-2xl">依頼詳細</h1>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={listHref}>一覧へ</Link>
            </Button>
          </header>

          <DevUserSelectorView
            user={user}
            users={users}
            userId={userId}
            selectUser={selectUser}
            isEnabled={isEnabled}
            roleLabel={roleLabel}
            helperText="開発用ユーザーを切り替えると表示できる場合があります。"
          />

          <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-ink">依頼が見つかりません</CardTitle>
              <CardDescription>
                一覧から依頼を選び直してください。
                {roleForLinks === "requester" ? " 選択中の依頼者が一致しているかも確認してください。" : ""}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href={listHref}>一覧へ戻る</Link>
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
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Detail</p>
            <h1 className="font-serif text-2xl">依頼詳細</h1>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={listHref}>一覧へ</Link>
          </Button>
        </header>

        <DevUserSelectorView
          user={user}
          users={users}
          userId={userId}
          selectUser={selectUser}
          isEnabled={isEnabled}
          roleLabel={roleLabel}
          helperText="開発用ユーザーを選択すると合意や調整が可能になります。"
        />

        {isDraft ? (
          <Card className="border border-primary/15 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">下書きの編集</CardTitle>
                  <CardDescription>新規作成と同じ形式で入力できます。</CardDescription>
                </div>
                <ConfirmActionButton
                  href="/requests"
                  requireConfirm
                  confirmTitle="下書きを削除しますか？"
                  confirmMessage="削除後は元に戻せません。"
                  confirmLabel="削除する"
                  confirmClassName="bg-red-500 text-white hover:bg-red-600"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50"
                  ariaLabel="下書きを削除"
                  onConfirm={handleDraftDelete}
                >
                  ×
                </ConfirmActionButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldOrder.map(({ label, key }) =>
                key === "requesterNote" ? (
                  <label key={key} className="space-y-1">
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <textarea
                      className="h-28 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                      value={draftFields?.[key] ?? ""}
                      onChange={(event) => handleDraftChange(key, event.target.value)}
                    />
                  </label>
                ) : (
                  <label key={key} className="space-y-1">
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <input
                      className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                      value={draftFields?.[key] ?? ""}
                      onChange={(event) => handleDraftChange(key, event.target.value)}
                    />
                  </label>
                ),
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <ConfirmActionButton
                href="/requests"
                requireConfirm
                confirmTitle="この内容で送信しますか？"
                confirmMessage="送信後は編集できません。"
                confirmLabel="送信する"
                variant="default"
                size="sm"
                onConfirm={handleDraftSubmit}
                className={!canSubmitDraft ? "pointer-events-none opacity-50" : undefined}
              >
                送信
              </ConfirmActionButton>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDraftSave}
                className={!canSaveDraft ? "pointer-events-none opacity-50" : undefined}
              >
                下書き保存
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border border-border/70 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl text-ink">{request.title}</CardTitle>
                <Badge variant={statusStyle[viewStatus] ?? "muted"}>{viewStatus}</Badge>
              </div>
              <CardDescription>{request.notes ?? "詳細がまだ登録されていません。"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">依頼者</span>
                  <span className="text-ink">{request.requesterName ?? "未設定"}</span>
                </div>
                <div className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">受付</span>
                  <span className="text-ink">{request.receptionistName ?? "未設定"}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {fieldOrder.map(({ label, key }) => (
                  <div
                    key={key}
                    className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/60 px-3 py-3 text-sm"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-ink">{request?.[key] ?? "未入力"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              {canAgree ? (
                <ConfirmActionButton
                  href={role === "reception" ? "/reception" : "/requests"}
                  requireConfirm
                  confirmTitle="合意しますか？"
                  confirmMessage="合意後は合意済みとなり、クエスト化の準備に進みます。"
                  confirmLabel="合意する"
                  variant="default"
                  size="sm"
                  onConfirm={handleAgree}
                >
                  合意する
                </ConfirmActionButton>
              ) : null}
              {canAdjust ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/requests/${roleForLinks}/${id}/adjust`}>調整を送る</Link>
                </Button>
              ) : null}
              {canShowActions
                ? actionsByStatus(request.status).map((action) => (
                    <Button key={action.label} size="sm" variant={action.variant} asChild>
                      <Link
                        href={
                          roleForLinks === "reception" && action.href === "/requests"
                            ? "/reception"
                            : action.href
                        }
                      >
                        {action.label}
                      </Link>
                    </Button>
                  ))
                : null}
            </CardFooter>
          </Card>
        )}

        <Button variant="ghost" asChild className="w-full justify-center">
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
