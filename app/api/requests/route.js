import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requesterId = searchParams.get("requesterId");
  const hasRequesterFilter = requesterId !== null;
  const trimmedRequesterId = String(requesterId || "").trim();

  if (hasRequesterFilter && !trimmedRequesterId) {
    return NextResponse.json({ requests: [] });
  }

  const requests = await prisma.request.findMany({
    where: hasRequesterFilter ? { requesterId: trimmedRequesterId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(request) {
  const payload = await request.json();
  const title = String(payload.title || "").trim();
  const fields = payload.fields ?? {};
  const requesterId = String(payload.requesterId || "").trim();

  if (!title) {
    return NextResponse.json({ error: "依頼タイトルは必須です。" }, { status: 400 });
  }
  if (!requesterId) {
    return NextResponse.json({ error: "依頼者の指定が必要です。" }, { status: 400 });
  }
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
  });
  if (!requester || requester.role !== "requester") {
    return NextResponse.json({ error: "依頼者が不正です。" }, { status: 400 });
  }

  const created = await prisma.request.create({
    data: {
      title,
      status: "確認前",
      requesterId: requester.id,
      requesterName: requester.name,
      fields,
      notes: "受付が確認中。クエスト化の準備を進める状態です。",
      requesterAgreed: true,
      receptionistAgreed: false,
    },
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
