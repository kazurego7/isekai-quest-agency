import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";
import LogoutButton from "@/components/logout-button";

const roleLabelMap = {
  requester: "依頼者",
  reception: "受付",
  adventurer: "冒険者",
  general: "一般ユーザー",
};

export default async function SessionToolbar() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return null;
  }

  return (
    <div className="w-full px-4 pt-4 md:w-auto md:px-0 md:pt-0">
      <div className="rounded-lg border border-border/70 bg-white/95 px-3 py-2 shadow-sm backdrop-blur md:fixed md:right-4 md:top-4 md:z-50">
        <div className="flex items-center justify-between gap-3 md:justify-start">
          <div className="min-w-0 text-right">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">ログイン中</p>
            <p className="truncate text-xs text-ink">
              {roleLabelMap[user.role] ?? "不明"} / {user.displayName ?? user.name ?? "ユーザー"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
