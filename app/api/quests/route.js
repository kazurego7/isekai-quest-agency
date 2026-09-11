import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { publicUserSelect, visibleQuestWhere } from "@/lib/api-data";
import { ApiError, readJson, transaction, withApiErrors } from "@/lib/api-handler";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isGeneralUser, isReceptionStaff } from "@/lib/authz";
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
  const requestedUserId = String(searchParams.get("userId") ?? "").trim();
  const userId = isGeneralUser(actor) ? actor.id : requestedUserId;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const adventurer =
    user && user.userType === "general"
      ? await prisma.adventurer.findUnique({ where: { userId: user.id } })
      : null;

  const quests = await prisma.quest.findMany({
    where: isGeneralUser(actor) ? visibleQuestWhere(actor.id) : {},
    orderBy: { createdAt: "desc" },
    include: {
      receptionist: { select: publicUserSelect },
      adventurer: { select: publicUserSelect },
      selectedAdventurers: true,
      applications: adventurer
        ? {
            where: { adventurerId: adventurer.id },
            include: {
              adventurer: {
                include: {
                  user: { select: publicUserSelect },
                },
              },
            },
          }
        : false,
    },
  });
  const payload = quests.map((item) => ({
    ...item,
    receptionistName: item.receptionist?.displayName ?? null,
    adventurerName: item.adventurer?.displayName ?? null,
    selectedAdventurerIds: (item.selectedAdventurers ?? []).map((entry) => entry.adventurerId),
    applicants: (item.applications ?? []).map((application) => ({
      id: application.adventurer?.id,
      name: application.adventurer?.user?.displayName ?? application.adventurer?.name ?? "未設定",
      rank: application.adventurer?.rank ?? "未設定",
      role: application.adventurer?.role ?? "未設定",
      note: application.adventurer?.note ?? "",
      source: application.adventurer?.source ?? "申請",
      appliedAt: application.appliedAt,
    })),
    viewerAdventurerId: adventurer?.id ?? null,
  }));
  return NextResponse.json({ quests: payload });
}

export const POST = withApiErrors(async (request) => {
  const session = await getServerSession(authOptions);
  const actor = assertAuthenticatedSession(session);
  if (!actor) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (!isReceptionStaff(actor)) {
    return NextResponse.json({ error: "受付のみ実行できます。" }, { status: 403 });
  }
  const payload = await readJson(request);
  const requestId = payload.requestId;
  const publishFields = payload.publishFields ?? {};
  const checklist = Array.isArray(payload.checklist) ? payload.checklist : [];

  if (!requestId) {
    return NextResponse.json({ error: "requestIdが必要です。" }, { status: 400 });
  }

  if (typeof requestId !== "string" || !publishFields || typeof publishFields !== "object" ||
    Array.isArray(publishFields) || Object.values(publishFields).some((value) => value != null && typeof value !== "string") ||
    checklist.length > 100 || checklist.some((item) => !item || typeof item.label !== "string" || !item.label.trim() ||
      (item.note != null && typeof item.note !== "string"))) {
    throw new ApiError(400, "クエストの入力内容が不正です。");
  }
  const created = await transaction(async (tx) => {
    const sourceRequest = await tx.request.findUnique({ where: { id: requestId } });
    if (!sourceRequest) throw new ApiError(404, "依頼が見つかりません。");
    if (sourceRequest.status !== "合意済み" || !sourceRequest.requesterAgreed || !sourceRequest.receptionistAgreed) {
      throw new ApiError(409, "合意済みの依頼のみクエスト化できます。");
    }
    const quest = await tx.quest.create({
      data: {
        requestId: sourceRequest.id,
        title: sourceRequest.title,
        status: "募集中",
        receptionistId: actor.id,
        reward: sourceRequest.reward ?? null,
        risk: sourceRequest.risk ?? null,
        rank: publishFields.rank ?? null,
        slots: publishFields.slots ?? null,
        detail: publishFields.detail ?? null,
        deliverables: publishFields.deliverables ?? null,
        supplies: publishFields.supplies ?? null,
        mapNotes: publishFields.mapNotes ?? null,
        channel: publishFields.channel ?? null,
        summary: "受付がクエスト票を作成済み。募集中。",
        checklist: checklist.map((item) => ({
          label: String(item.label ?? "").trim(),
          note: String(item.note ?? "").trim(),
          checked: false,
        })),
        photos: [],
      },
    });

    await tx.request.update({
      where: { id: sourceRequest.id },
      data: {
        status: "クエスト化済み",
        notes: "クエスト化が完了し、冒険者の募集を開始しました。",
        receptionistId: actor.id,
      },
    });

    return quest;
  });

  const loaded = await prisma.quest.findUnique({
    where: { id: created.id },
    include: {
      receptionist: { select: publicUserSelect },
      adventurer: { select: publicUserSelect },
    },
  });

  return NextResponse.json(
    {
      quest: {
        ...loaded,
        receptionistName: loaded?.receptionist?.displayName ?? null,
        adventurerName: loaded?.adventurer?.displayName ?? null,
      },
    },
    { status: 201 },
  );
});
