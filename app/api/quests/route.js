import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = String(searchParams.get("userId") ?? "").trim();
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const adventurer =
    user && user.role === "adventurer"
      ? await prisma.adventurer.findFirst({ where: { name: user.name } })
      : null;

  const quests = await prisma.quest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      receptionist: true,
      adventurer: true,
      selectedAdventurers: true,
      applications: adventurer
        ? {
            where: { adventurerId: adventurer.id },
            include: { adventurer: true },
          }
        : false,
    },
  });
  const payload = quests.map((item) => ({
    ...item,
    receptionistName: item.receptionist?.name ?? null,
    adventurerName: item.adventurer?.name ?? null,
    selectedAdventurerIds: (item.selectedAdventurers ?? []).map((entry) => entry.adventurerId),
    applicants: (item.applications ?? []).map((application) => ({
      id: application.adventurer?.id,
      name: application.adventurer?.name ?? "未設定",
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

export async function POST(request) {
  const payload = await request.json();
  const requestId = payload.requestId;
  const publishFields = payload.publishFields ?? {};
  const checklist = Array.isArray(payload.checklist) ? payload.checklist : [];
  const actorId = String(payload.actorId || "").trim();

  if (!requestId) {
    return NextResponse.json({ error: "requestIdが必要です。" }, { status: 400 });
  }

  const sourceRequest = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!sourceRequest) {
    return NextResponse.json({ error: "依頼が見つかりません。" }, { status: 404 });
  }

  if (sourceRequest.status !== "合意済み") {
    return NextResponse.json({ error: "合意済みの依頼のみクエスト化できます。" }, { status: 400 });
  }

  const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;
  if (!actor || actor.role !== "reception") {
    return NextResponse.json({ error: "受付が不正です。" }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
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
      receptionist: true,
      adventurer: true,
    },
  });

  return NextResponse.json(
    {
      quest: {
        ...loaded,
        receptionistName: loaded?.receptionist?.name ?? null,
        adventurerName: loaded?.adventurer?.name ?? null,
      },
    },
    { status: 201 },
  );
}
