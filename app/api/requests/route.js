import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isGeneralUser, isReceptionStaff } from "@/lib/authz";

const normalizeValue = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed : null;
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const actor = assertAuthenticatedSession(session);
  if (!actor) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (!isGeneralUser(actor) && !isReceptionStaff(actor)) {
    return NextResponse.json({ error: "閲覧権限がありません。" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const requesterId = searchParams.get("requesterId");
  const requestedRequesterId = String(requesterId || "").trim();
  const hasRequesterFilter = requesterId !== null || isGeneralUser(actor);
  const trimmedRequesterId =
    isGeneralUser(actor) ? actor.id : requestedRequesterId;

  if (hasRequesterFilter && !trimmedRequesterId) {
    return NextResponse.json({ requests: [] });
  }

  const requests = await prisma.request.findMany({
    where: hasRequesterFilter ? { requesterId: trimmedRequesterId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      requester: true,
      receptionist: true,
    },
  });

  const payload = requests.map((item) => ({
    ...item,
    requesterName: item.requester?.displayName ?? null,
    receptionistName: item.receptionist?.displayName ?? null,
  }));

  return NextResponse.json({ requests: payload });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const actor = assertAuthenticatedSession(session);
  if (!actor) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (!isGeneralUser(actor)) {
    return NextResponse.json({ error: "依頼作成権限がありません。" }, { status: 403 });
  }
  const payload = await request.json();
  const mode = payload.mode;
  const title = String(payload.title || "").trim();
  const requesterId = actor.id;

  if (!requesterId) {
    return NextResponse.json({ error: "依頼者の指定が必要です。" }, { status: 400 });
  }
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
  });
  if (!requester || requester.userType !== "general") {
    return NextResponse.json({ error: "依頼者が不正です。" }, { status: 400 });
  }

  const requestData = {
    purpose: normalizeValue(payload.purpose),
    location: normalizeValue(payload.location),
    deadline: normalizeValue(payload.deadline),
    risk: normalizeValue(payload.risk),
    reward: normalizeValue(payload.reward),
    requesterNote: normalizeValue(payload.requesterNote),
  };
  if (mode === "draft") {
    const created = await prisma.request.create({
      data: {
        title: title || "未入力の依頼",
        status: "下書き",
        requesterId: requester.id,
        purpose: requestData.purpose,
        location: requestData.location,
        deadline: requestData.deadline,
        risk: requestData.risk,
        reward: requestData.reward,
        requesterNote: requestData.requesterNote,
        notes: "下書きを保存しました。",
        requesterAgreed: false,
        receptionistAgreed: false,
      },
      include: {
        requester: true,
        receptionist: true,
      },
    });

    return NextResponse.json(
      {
        request: {
          ...created,
          requesterName: created.requester?.displayName ?? null,
          receptionistName: created.receptionist?.displayName ?? null,
        },
      },
      { status: 201 },
    );
  }

  if (!title) {
    return NextResponse.json({ error: "依頼タイトルは必須です。" }, { status: 400 });
  }

  const created = await prisma.request.create({
    data: {
      title,
      status: "確認前",
      requesterId: requester.id,
      purpose: requestData.purpose,
      location: requestData.location,
      deadline: requestData.deadline,
      risk: requestData.risk,
      reward: requestData.reward,
      requesterNote: requestData.requesterNote,
      notes: "受付が確認中。クエスト化の準備を進める状態です。",
      requesterAgreed: true,
      receptionistAgreed: false,
    },
    include: {
      requester: true,
      receptionist: true,
    },
  });

  return NextResponse.json(
    {
      request: {
        ...created,
        requesterName: created.requester?.displayName ?? null,
        receptionistName: created.receptionist?.displayName ?? null,
      },
    },
    { status: 201 },
  );
}
