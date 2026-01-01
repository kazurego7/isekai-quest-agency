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

const roles = [
  {
    title: "依頼者モック（モバイル想定）",
    description: "既存の依頼作成・一覧・詳細などのモバイルUI。",
    href: "/requests",
    badge: "Requester",
  },
  {
    title: "受付嬢コンソール（PC向けダミー）",
    description: "PC操作で依頼キュー、クエスト下書き、チェックをまとめて確認。",
    href: "/reception",
    badge: "Receptionist",
  },
  {
    title: "冒険者用ダッシュボード（モック）",
    description: "クエスト受注・進行確認のダミー画面。",
    href: "/adventurer",
    badge: "Adventurer",
  },
  {
    title: "会計係ビュー（モック）",
    description: "報酬支払い待ちリストのダミー画面。",
    href: "/treasurer",
    badge: "Treasurer",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-md px-6 pb-16 pt-10 space-y-8">
        <header className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-lg font-serif text-white shadow-glow">
            異
          </span>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Mock</p>
            <h1 className="font-serif text-2xl">ロール別モック選択</h1>
            <p className="text-sm text-muted-foreground">
              トップページはモックのハブとして利用します。各担当者向けの画面へ遷移してください。
            </p>
          </div>
        </header>

        <Card className="border border-primary/15 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">担当者を選択</CardTitle>
            <CardDescription>モック用の画面に飛び、役割ごとのUIを確認できます。</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roles.map((role) => (
              <Card
                key={role.title}
                className="border border-border/60 bg-muted/40 shadow-sm transition hover:-translate-y-1 hover:shadow-glow"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-ink">{role.title}</CardTitle>
                    <Badge variant="secondary">{role.badge}</Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={role.href}>画面へ移動</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
