import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(request) {
  const payload = await request.json();
  const title = String(payload.title || "").trim();
  const fields = payload.fields ?? {};

  if (!title) {
    return NextResponse.json({ error: "依頼タイトルは必須です。" }, { status: 400 });
  }

  const created = await prisma.request.create({
    data: {
      title,
      status: "確認前",
      fields,
      notes: "受付が確認中。クエスト化の準備を進める状態です。",
      requesterAgreed: true,
      receptionistAgreed: false,
    },
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
