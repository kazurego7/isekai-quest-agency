import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
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
      name: true,
      role: true,
      userType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ users });
}
