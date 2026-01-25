import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const seedUsers = [
  { role: "requester", name: "依頼者A" },
  { role: "requester", name: "依頼者B" },
  { role: "requester", name: "依頼者C" },
  { role: "reception", name: "受付嬢リリア" },
  { role: "reception", name: "受付嬢ユナ" },
  { role: "adventurer", name: "冒険者レイ" },
  { role: "adventurer", name: "冒険者ミナ" },
  { role: "adventurer", name: "冒険者カイ" },
];

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

  const count = await prisma.user.count();
  if (count === 0) {
    await prisma.user.createMany({ data: seedUsers });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}
