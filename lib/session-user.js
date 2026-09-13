"use client";
import { useCurrentUser } from "@/components/session-provider";
export function useSessionUser() { return { user:useCurrentUser(),isLoading:false }; }
