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
import { useSessionUser } from "@/lib/session-user";
import GeneralUserSwitch from "@/components/general-user-switch";

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

const deriveViewStatus = ({ status, requesterAgreed, receptionistAgreed }) => {
  if (!["確認前", "合意待ち", "合意済み"].includes(status)) {
    return status;
  }
  if (requesterAgreed && receptionistAgreed) {
    return "合意済み";
  }
  return requesterAgreed ? "合意待ち" : "確認前";
};

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isUserLoading } = useSessionUser();

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user?.id) {
      setRequests([]);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    fetch("/api/requests")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setRequests(data.requests ?? []);
      })
      .catch(() => {
        if (!active) return;
        setRequests([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isUserLoading, user?.id]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
  }, [requests]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-5 pb-16 pt-8 space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Requests</p>
            <h1 className="font-serif text-2xl">依頼一覧</h1>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <GeneralUserSwitch currentArea="requests" />
            <Button asChild size="sm">
              <Link href="/requests/new">新規依頼</Link>
            </Button>
          </div>
        </header>

        <div className="space-y-3">
          {isLoading ? (
            <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">読み込み中...</CardTitle>
                <CardDescription>依頼一覧を取得しています。</CardDescription>
              </CardHeader>
            </Card>
          ) : sortedRequests.length ? (
            sortedRequests.map((req) => {
              const viewStatus = deriveViewStatus({
                status: req.status,
                requesterAgreed: Boolean(req.requesterAgreed),
                receptionistAgreed: Boolean(req.receptionistAgreed),
              });
              return (
                <Card key={req.id} className="border border-border/70 bg-white/90 shadow-sm">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-ink">{req.title}</CardTitle>
                    <Badge variant={statusStyle[viewStatus] ?? "muted"}>{viewStatus}</Badge>
                  </div>
                  <CardDescription>{req.summary ?? req.notes}</CardDescription>
                  <p className="text-xs text-muted-foreground">依頼者: {req.requesterName ?? "未設定"}</p>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" asChild className="ml-auto">
                    <Link href={`/requests/requester/${req.id}`}>詳細を見る</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
            })
          ) : (
            <Card className="border border-dashed border-border/70 bg-white/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-ink">依頼がまだありません</CardTitle>
                <CardDescription>「新規依頼」から依頼を作成してください。</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
