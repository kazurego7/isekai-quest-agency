import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request) {
  const payload = await request.json();
  const userId = String(payload?.userId ?? "").trim().toLowerCase();
  const displayName = String(payload?.displayName ?? "").trim();
  const password = String(payload?.password ?? "").trim();
  const userIdPattern = /^[a-zA-Z0-9_-]+$/;

  if (!userId) {
    return NextResponse.json({ error: "ユーザーIDは必須です。" }, { status: 400 });
  }
  if (!userIdPattern.test(userId) || userId.length < 3 || userId.length > 32) {
    return NextResponse.json(
      { error: "ユーザーIDは3〜32文字の半角英数字・-_で入力してください。" },
      { status: 400 },
    );
  }
  if (!displayName) {
    return NextResponse.json({ error: "表示名は必須です。" }, { status: 400 });
  }
  if (displayName.length > 50) {
    return NextResponse.json({ error: "表示名は50文字以内で入力してください。" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上で入力してください。" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { userId } });
  if (exists) {
    return NextResponse.json({ error: "このユーザーIDは既に使われています。" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: {
      userId,
      displayName,
      name: userId,
      passwordHash,
      userType: "general",
      role: "general",
    },
    select: {
      id: true,
      userId: true,
      displayName: true,
      userType: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user: created }, { status: 201 });
}
