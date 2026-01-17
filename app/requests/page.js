"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ensurePrototypeState, getPrototypeState } from "@/lib/prototype-store";

const statusStyle = {
  合意待ち: "default",
  確認前: "secondary",
  下書き: "outline",
  受注済み: "muted",
  完了: "muted",
  合意済み: "secondary",
  クエスト化済み: "secondary",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    ensurePrototypeState();
    setRequests(getPrototypeState().requests ?? []);
  }, []);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      if (a.createdAt === "seed") return 1;
      if (b.createdAt === "seed") return -1;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
  }, [requests]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Requests</p>
            <h1 className="font-serif text-2xl">依頼者モック（モバイル想定）</h1>
          </div>
          <Button asChild size="sm">
            <Link href="/requests/new">新規依頼</Link>
          </Button>
        </header>

        <div className="space-y-3">
          {sortedRequests.length ? (
            sortedRequests.map((req) => (
              <Card key={req.id} className="border border-border/70 bg-white/90 shadow-sm">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-ink">{req.title}</CardTitle>
                    <Badge variant={statusStyle[req.status] ?? "muted"}>{req.status}</Badge>
                  </div>
                  <CardDescription>{req.summary ?? req.notes}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" asChild className="ml-auto">
                    <Link href={`/requests/requester/${req.id}`}>詳細を見る</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">依頼がまだありません</CardTitle>
                <CardDescription>「新規依頼」から依頼を作成してください。</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>


        <Button variant="ghost" asChild className="w-full justify-center">
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
