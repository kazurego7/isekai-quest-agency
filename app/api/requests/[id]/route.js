import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(_request, context) {
  const { searchParams } = new URL(_request.url);
  const requesterId = searchParams.get("requesterId");
  const hasRequesterFilter = requesterId !== null;
  const trimmedRequesterId = String(requesterId || "").trim();
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

  if (hasRequesterFilter && (!trimmedRequesterId || request.requesterId !== trimmedRequesterId)) {
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
  const actorId = String(payload.actorId || "").trim();
  const actorRole = payload.actorRole === "reception" ? "reception" : "requester";
  const actor = actorId
    ? await prisma.user.findUnique({ where: { id: actorId } })
    : null;
  if (!actor || actor.role !== actorRole) {
    return NextResponse.json({ error: "担当者が不正です。" }, { status: 400 });
  }
  const nameUpdate =
    actorRole === "reception"
      ? { receptionistName: actor.name, receptionistId: actor.id }
      : { requesterName: actor.name, requesterId: actor.id };

  if (mode === "agree") {
    const current = await prisma.request.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }
    if (actorRole === "requester" && current.requesterId && current.requesterId !== actor.id) {
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
        ...nameUpdate,
        status: isFullyAgreed ? "合意済み" : "合意待ち",
        notes: isFullyAgreed ? "依頼内容は合意済みです。受付のクエスト化を待っています。" : "相手の合意待ちです。",
      },
    });

    return NextResponse.json({ request: updated });
  }

  if (mode === "adjust") {
    const fields = payload.fields ?? {};
    const reason = payload.reason ?? "調整案が届きました。相手の合意待ちです。";
    const current = await prisma.request.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }
    if (actorRole === "requester" && current.requesterId && current.requesterId !== actor.id) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        fields,
        status: "合意待ち",
        notes: reason,
        ...nameUpdate,
        requesterAgreed: actorRole === "requester",
        receptionistAgreed: actorRole === "reception",
      },
    });

    return NextResponse.json({ request: updated });
  }

  return NextResponse.json({ error: "更新内容が不正です。" }, { status: 400 });
}
