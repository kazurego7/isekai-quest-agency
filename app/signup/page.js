"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }
    if (password !== passwordConfirm) {
      setError("確認用パスワードが一致しません。");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data?.error ?? "ユーザー登録に失敗しました。");
      return;
    }

    router.push("/?registered=1");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-6 pb-16 pt-16 space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Isekai Quest Agency</p>
          <h1 className="font-serif text-3xl text-ink">新規登録</h1>
          <p className="text-sm text-muted-foreground">登録後は依頼と受注の両方を利用できます。</p>
        </header>

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">アカウント作成</CardTitle>
            <CardDescription>ユーザー名とパスワードを設定してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  ユーザー名
                </label>
                <input
                  id="name"
                  className="w-full rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="passwordConfirm" className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  パスワード（確認）
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  className="w-full rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "登録中..." : "登録する"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              すでにアカウントをお持ちの場合は <Link href="/" className="underline">ログイン</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
