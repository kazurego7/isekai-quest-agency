"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      ログアウト
    </Button>
  );
}
