import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import LoginForm from "@/components/login-form";
import { authOptions } from "@/lib/auth-options";
import { resolveRoleHome } from "@/lib/role-route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const userType = session?.user?.userType;
  const homePath = resolveRoleHome(userType, role);

  if (role && homePath !== "/") {
    redirect(homePath);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/70">
      <div className="mx-auto max-w-screen-sm px-6 pb-16 pt-16 space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">Isekai Quest Agency</p>
          <h1 className="font-serif text-3xl text-ink">ログイン</h1>
          <p className="text-sm text-muted-foreground">
            ログイン後、ロールに応じたホーム画面へ自動で移動します。
          </p>
        </header>

        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          アカウント未作成の場合は <a className="underline" href="/signup">新規登録</a> へ
        </p>
      </div>
    </div>
  );
}
