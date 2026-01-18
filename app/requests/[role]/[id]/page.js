"use client";

import { useEffect, useMemo, useState } from "react";
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

const fieldOrder = [
  "依頼タイトル",
  "目的・背景",
  "場所",
  "完了期限",
  "危険度・同行条件",
  "報酬上限額",
  "備考",
];

const statusStyle = {
  合意待ち: "default",
  確認前: "secondary",
  下書き: "outline",
  受注済み: "muted",
  完了: "muted",
  合意済み: "secondary",
  クエスト化済み: "secondary",
};

function actionsByStatus(status) {
  switch (status) {
    case "下書き":
      return [
        { label: "送信（ダミー）", href: "/requests", variant: "default" },
        { label: "下書き保存（ダミー）", href: "/requests", variant: "secondary" },
      ];
    case "合意済み":
      return [{ label: "合意済み", href: "/requests", variant: "ghost" }];
    case "受注済み":
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

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    fetch(`/api/requests/${id}`)
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
  }, [id]);

  const request = useMemo(() => currentRequest, [currentRequest]);

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
  const canAgree = isRoleValid && ["確認前", "合意待ち"].includes(status) && !selfAgreed;
  const canAdjust = useMemo(() => {
    if (!isRoleValid) return false;
    if (status !== "確認前" && status !== "合意待ち") return false;
    return otherAgreed && !selfAgreed;
  }, [isRoleValid, otherAgreed, selfAgreed, status]);
  const canShowActions = isRoleValid && !canAgree && !canAdjust;

  const handleAgree = async () => {
    if (!currentRequest || !isRoleValid) {
      router.push(listHref);
      return;
    }
    const response = await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "agree", actorRole: roleForLinks }),
    });
    if (!response.ok) {
      return;
    }
    router.push(listHref);
  };
  const isDraft = status === "下書き";
  const draftActions = [
    {
      label: "送信（ダミー）",
      href: "/requests",
      variant: "default",
      requireConfirm: true,
      confirmTitle: "この内容で送信しますか？",
      confirmMessage: "送信後は編集できません。",
      confirmLabel: "送信する",
    },
    { label: "下書き保存（ダミー）", href: "/requests", variant: "secondary", requireConfirm: false },
  ];

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
                  ariaLabel="下書きを削除（ダミー）"
                >
                  ×
                </ConfirmActionButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldOrder.map((label) =>
                label === "備考" ? (
                  <label key={label} className="space-y-1">
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <textarea
                      className="h-28 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                      defaultValue={request.fields[label]}
                    />
                  </label>
                ) : (
                  <label key={label} className="space-y-1">
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <input
                      className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                      defaultValue={request.fields[label]}
                    />
                  </label>
                ),
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              {draftActions.map((action) => (
                <ConfirmActionButton
                  key={action.label}
                  href={action.href}
                  requireConfirm={action.requireConfirm}
                  confirmTitle={action.confirmTitle}
                  confirmMessage={action.confirmMessage}
                  confirmLabel={action.confirmLabel}
                  variant={action.variant}
                  size="sm"
                >
                  {action.label}
                </ConfirmActionButton>
              ))}
            </CardFooter>
          </Card>
        ) : (
          <Card className="border border-border/70 bg-white/90 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl text-ink">{request.title}</CardTitle>
                <Badge variant={statusStyle[request.status] ?? "muted"}>{request.status}</Badge>
              </div>
              <CardDescription>{request.notes ?? "詳細がまだ登録されていません。"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {fieldOrder.map((label) => (
                  <div
                    key={label}
                    className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/60 px-3 py-3 text-sm"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-ink">{request?.fields?.[label] ?? "未入力"}</span>
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
