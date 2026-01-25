"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmActionButton from "../confirm-action-button";
import { useRouter } from "next/navigation";
import DevUserSelector from "@/components/dev-user-selector";
import { useDevUser } from "@/lib/dev-user";

const fields = [
  { label: "依頼タイトル", placeholder: "例: 討伐 / 湿地帯の魔蛇" },
  { label: "目的・背景", placeholder: "解決したい課題を記載" },
  { label: "場所", placeholder: "エリア / 合流地点" },
  { label: "完了期限", placeholder: "緊急度や希望日程" },
  { label: "危険度・同行条件", placeholder: "必要な人数・装備・特殊条件" },
  { label: "報酬上限額", placeholder: "分からなければ上限だけ" },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useDevUser("requester");
  const [formState, setFormState] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.label] = "";
      return acc;
    }, { 備考: "" }),
  );

  const canSubmit = useMemo(() => {
    return Boolean(formState["依頼タイトル"]) && Boolean(user?.id);
  }, [formState, user]);

  const handleChange = (label, value) => {
    setFormState((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    return fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formState["依頼タイトル"],
        fields: formState,
        requesterId: user?.id,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("依頼の作成に失敗しました。");
      }
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">New</p>
            <h1 className="font-serif text-2xl">新規依頼作成（ダミー）</h1>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/requests">一覧へ</Link>
          </Button>
        </header>

        <DevUserSelector
          role="requester"
          roleLabel="依頼者"
          helperText="開発用ユーザーを選択すると依頼作成が可能になります。"
        />

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">必要な入力</CardTitle>
            <CardDescription>入力後に送信すると受付のキューへ登録されます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field) => (
              <label key={field.label} className="space-y-1">
                <span className="block text-sm font-semibold text-ink">{field.label}</span>
                <input
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                  placeholder={field.placeholder}
                  value={formState[field.label]}
                  onChange={(event) => handleChange(field.label, event.target.value)}
                />
              </label>
            ))}
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-ink">備考・添付（ダミー）</span>
              <textarea
                className="h-28 w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/50"
                placeholder="受付嬢へのメモを記載"
                value={formState["備考"]}
                onChange={(event) => handleChange("備考", event.target.value)}
              />
            </label>
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
              onConfirm={handleSubmit}
              className={!canSubmit ? "pointer-events-none opacity-50" : undefined}
            >
              送信
            </ConfirmActionButton>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/requests">下書きを保存（プロトタイプ）</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
