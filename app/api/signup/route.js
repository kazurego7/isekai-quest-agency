import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request) {
  const payload = await request.json();
  const name = String(payload?.name ?? "").trim();
  const password = String(payload?.password ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "ユーザー名は必須です。" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上で入力してください。" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "このユーザー名は既に使われています。" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: {
      name,
      passwordHash,
      userType: "general",
      role: "general",
    },
    select: {
      id: true,
      name: true,
      userType: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user: created }, { status: 201 });
}
