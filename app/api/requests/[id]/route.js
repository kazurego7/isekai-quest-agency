import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const normalizeValue = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed : null;
};

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
    include: {
      requester: true,
      receptionist: true,
    },
  });

  if (!request) {
    return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
  }

  if (hasRequesterFilter && (!trimmedRequesterId || request.requesterId !== trimmedRequesterId)) {
    return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({
    request: {
      ...request,
      requesterName: request.requester?.name ?? null,
      receptionistName: request.receptionist?.name ?? null,
    },
  });
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
  const idUpdate =
    actorRole === "reception"
      ? { receptionistId: actor.id }
      : { requesterId: actor.id };

  const buildRequestData = (fields) => ({
    title: normalizeValue(fields?.title),
    purpose: normalizeValue(fields?.purpose),
    location: normalizeValue(fields?.location),
    deadline: normalizeValue(fields?.deadline),
    risk: normalizeValue(fields?.risk),
    reward: normalizeValue(fields?.reward),
    requesterNote: normalizeValue(fields?.requesterNote),
  });

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
        ...idUpdate,
        status: isFullyAgreed ? "合意済み" : "合意待ち",
        notes: isFullyAgreed ? "依頼内容は合意済みです。受付のクエスト化を待っています。" : "相手の合意待ちです。",
      },
      include: {
        requester: true,
        receptionist: true,
      },
    });

    return NextResponse.json({
      request: {
        ...updated,
        requesterName: updated.requester?.name ?? null,
        receptionistName: updated.receptionist?.name ?? null,
      },
    });
  }

  if (mode === "draft-save") {
    const current = await prisma.request.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }
    if (current.status !== "下書き") {
      return NextResponse.json({ error: "下書き以外は保存できません。" }, { status: 400 });
    }
    if (actorRole !== "requester") {
      return NextResponse.json({ error: "依頼者のみが下書きを保存できます。" }, { status: 400 });
    }
    if (current.requesterId && current.requesterId !== actor.id) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }

    const fields = payload.fields ?? {};
    const requestData = buildRequestData(fields);
    const updated = await prisma.request.update({
      where: { id },
      data: {
        title: requestData.title ?? current.title ?? "未入力の依頼",
        purpose: requestData.purpose,
        location: requestData.location,
        deadline: requestData.deadline,
        risk: requestData.risk,
        reward: requestData.reward,
        requesterNote: requestData.requesterNote,
        notes: "下書きを保存しました。",
        ...idUpdate,
      },
      include: {
        requester: true,
        receptionist: true,
      },
    });

    return NextResponse.json({
      request: {
        ...updated,
        requesterName: updated.requester?.name ?? null,
        receptionistName: updated.receptionist?.name ?? null,
      },
    });
  }

  if (mode === "submit") {
    const current = await prisma.request.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }
    if (current.status !== "下書き") {
      return NextResponse.json({ error: "下書き以外は送信できません。" }, { status: 400 });
    }
    if (actorRole !== "requester") {
      return NextResponse.json({ error: "依頼者のみが送信できます。" }, { status: 400 });
    }
    if (current.requesterId && current.requesterId !== actor.id) {
      return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
    }

    const fields = payload.fields ?? {};
    const requestData = buildRequestData(fields);
    if (!requestData.title) {
      return NextResponse.json({ error: "依頼タイトルは必須です。" }, { status: 400 });
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        title: requestData.title,
        purpose: requestData.purpose,
        location: requestData.location,
        deadline: requestData.deadline,
        risk: requestData.risk,
        reward: requestData.reward,
        requesterNote: requestData.requesterNote,
        status: "確認前",
        notes: "受付が確認中。クエスト化の準備を進める状態です。",
        requesterAgreed: true,
        receptionistAgreed: false,
        ...idUpdate,
      },
      include: {
        requester: true,
        receptionist: true,
      },
    });

    return NextResponse.json({
      request: {
        ...updated,
        requesterName: updated.requester?.name ?? null,
        receptionistName: updated.receptionist?.name ?? null,
      },
    });
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

    const requestData = buildRequestData(fields);
    const updated = await prisma.request.update({
      where: { id },
      data: {
        title: requestData.title ?? current.title,
        purpose: requestData.purpose,
        location: requestData.location,
        deadline: requestData.deadline,
        risk: requestData.risk,
        reward: requestData.reward,
        requesterNote: requestData.requesterNote,
        status: "合意待ち",
        notes: reason,
        ...idUpdate,
        requesterAgreed: actorRole === "requester",
        receptionistAgreed: actorRole === "reception",
      },
      include: {
        requester: true,
        receptionist: true,
      },
    });

    return NextResponse.json({
      request: {
        ...updated,
        requesterName: updated.requester?.name ?? null,
        receptionistName: updated.receptionist?.name ?? null,
      },
    });
  }

  return NextResponse.json({ error: "更新内容が不正です。" }, { status: 400 });
}

export async function DELETE(request, context) {
  const { params } = context;
  const { id } = (await params) ?? {};
  if (!id) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const payload = await request.json();
  const actorId = String(payload.actorId || "").trim();
  const actorRole = payload.actorRole === "reception" ? "reception" : "requester";
  const actor = actorId
    ? await prisma.user.findUnique({ where: { id: actorId } })
    : null;
  if (!actor || actor.role !== actorRole) {
    return NextResponse.json({ error: "担当者が不正です。" }, { status: 400 });
  }
  if (actorRole !== "requester") {
    return NextResponse.json({ error: "依頼者のみが削除できます。" }, { status: 400 });
  }

  const current = await prisma.request.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
  }
  if (current.status !== "下書き") {
    return NextResponse.json({ error: "下書き以外は削除できません。" }, { status: 400 });
  }
  if (current.requesterId && current.requesterId !== actor.id) {
    return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
  }

  await prisma.request.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
