"use client";

import { Button } from "@/components/ui/button";
import { useDevUser } from "@/lib/dev-user";

export function DevUserSelectorView({
  user,
  users,
  userId,
  selectUser,
  isEnabled,
  roleLabel,
  helperText,
}) {
  if (!isEnabled) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/70 bg-white/90 px-4 py-3 text-sm shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          開発用ログイン
        </span>
        <span className="text-xs text-ink">{roleLabel}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          className="min-w-[220px] flex-1 rounded-lg border border-border/70 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          value={userId}
          onChange={(event) => selectUser(event.target.value)}
        >
          <option value="">ユーザーを選択</option>
          {users.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" disabled>
          {user ? "選択中" : "未選択"}
        </Button>
      </div>
      {helperText ? <p className="mt-2 text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}

export default function DevUserSelector({ role, roleLabel, helperText }) {
  const { user, users, userId, selectUser, isEnabled } = useDevUser(role);

  return (
    <DevUserSelectorView
      user={user}
      users={users}
      userId={userId}
      selectUser={selectUser}
      isEnabled={isEnabled}
      roleLabel={roleLabel}
      helperText={helperText}
    />
  );
}
