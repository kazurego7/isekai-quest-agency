import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isReceptionStaff } from "@/lib/authz";

export async function GET() {
  const actor = assertAuthenticatedSession(await getServerSession(authOptions));
  if (!actor) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  if (!isReceptionStaff(actor)) return NextResponse.json({ error: "受付のみ閲覧できます。" }, { status: 403 });
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!prisma.user) {
    return NextResponse.json(
      {
        error: "Prisma Clientが未更新です。",
        hint: "pnpm db:generate 実行後に pnpm dev を再起動してください。",
      },
      { status: 500 },
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      displayName: true,
      role: true,
      userType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ users });
}
