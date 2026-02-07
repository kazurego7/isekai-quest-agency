"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = searchParams.get("from") || "/";
  const registered = searchParams.get("registered") === "1";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      loginId,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("ログインに失敗しました。ユーザー名またはパスワードを確認してください。");
      return;
    }

    router.push(from);
    router.refresh();
  };

  return (
    <Card className="border border-primary/15 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ログイン</CardTitle>
        <CardDescription>ユーザー名とパスワードを入力してください。</CardDescription>
      </CardHeader>
      <CardContent>
        {registered ? (
          <p className="mb-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            登録が完了しました。ログインしてください。
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="loginId" className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              ユーザー名
            </label>
            <input
              id="loginId"
              className="w-full rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="例: 依頼者A"
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
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
