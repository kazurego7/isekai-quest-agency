import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isReceptionStaff } from "@/lib/authz";

export async function GET() {
  const actor = assertAuthenticatedSession(await getServerSession(authOptions));
  if (!actor) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  if (!isReceptionStaff(actor)) return NextResponse.json({ error: "受付のみ閲覧できます。" }, { status: 403 });
  const adventurers = await prisma.adventurer.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ adventurers });
}
