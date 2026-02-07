"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export function useSessionUser() {
  const { data, status } = useSession();
  const user = useMemo(() => data?.user ?? null, [data?.user]);
  return {
    user,
    isLoading: status === "loading",
  };
}
