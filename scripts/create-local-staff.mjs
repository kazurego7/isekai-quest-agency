import "./load-env.mjs";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const url = new URL(process.env.DATABASE_URL || "");
if (process.env.NODE_ENV === "production" || url.hostname !== "127.0.0.1" ||
  url.port !== "55432" || url.pathname !== "/isekai_quest_agency") {
  throw new Error("このコマンドは db:local で作成したローカル開発用DB専用です。");
}
const db = new PrismaClient();
try {
  const userId = "receptionist";
  if (await db.user.findUnique({ where: { userId } })) {
    console.log("受付ユーザーは作成済みです。既存のパスワードは変更しません。");
  } else {
    const password = randomBytes(18).toString("base64url");
    await db.user.create({ data: {
      userId, displayName: "開発用受付", userType: "staff", role: "reception",
      passwordHash: await bcrypt.hash(password, 10),
    } });
    mkdirSync(".local", { recursive: true });
    writeFileSync(".local/receptionist.txt", "ユーザーID: " + userId + "\nパスワード: " + password + "\n", { mode: 0o600 });
    console.log("受付ユーザーを作成しました。ログイン情報: .local/receptionist.txt");
  }
} finally {
  await db.$disconnect();
}
