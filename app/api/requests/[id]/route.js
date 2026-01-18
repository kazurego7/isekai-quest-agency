import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request, context) {
  const { params } = context;
  const { id } = (await params) ?? {};
  if (!id) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const request = await prisma.request.findUnique({
    where: { id },
  });

  if (!request) {
    return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ request });
}

export async function PATCH(request, context) {
  const { params } = context;
  const { id } = (await params) ?? {};
  if (!id) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const payload = await request.json();
  const mode = payload.mode;

  if (mode === "agree") {
    const actorRole = payload.actorRole === "reception" ? "reception" : "requester";
    const current = await prisma.request.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }

    const nextAgreement = {
      requesterAgreed: actorRole === "requester" ? true : current.requesterAgreed,
      receptionistAgreed: actorRole === "reception" ? true : current.receptionistAgreed,
    };
    const isFullyAgreed = nextAgreement.requesterAgreed && nextAgreement.receptionistAgreed;

    const updated = await prisma.request.update({
      where: { id },
      data: {
        ...nextAgreement,
        status: isFullyAgreed ? "合意済み" : "合意待ち",
        notes: isFullyAgreed ? "依頼内容は合意済みです。受付のクエスト化を待っています。" : "相手の合意待ちです。",
      },
    });

    return NextResponse.json({ request: updated });
  }

  if (mode === "adjust") {
    const actorRole = payload.actorRole === "reception" ? "reception" : "requester";
    const fields = payload.fields ?? {};
    const reason = payload.reason ?? "調整案が届きました。相手の合意待ちです。";

    const updated = await prisma.request.update({
      where: { id },
      data: {
        fields,
        status: "合意待ち",
        notes: reason,
        requesterAgreed: actorRole === "requester",
        receptionistAgreed: actorRole === "reception",
      },
    });

    return NextResponse.json({ request: updated });
  }

  return NextResponse.json({ error: "更新内容が不正です。" }, { status: 400 });
}
