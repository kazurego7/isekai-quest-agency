import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isGeneralUser, isReceptionStaff } from "@/lib/authz";

const ensureAdventurerForUser = async (user) => {
  if (!user?.id) return null;
  const existing = await prisma.adventurer.findUnique({
    where: { userId: user.id },
  });
  if (existing) return existing;
  return prisma.adventurer.create({
    data: {
      userId: user.id,
      code: `ADV-${String(Date.now()).slice(-6)}`,
      name: user.displayName || "未設定",
      rank: "Cランク",
      role: "未設定",
      note: "ユーザー申請から作成",
      source: "申請",
      appliedAt: null,
    },
  });
};
export async function GET(_request, context) {
  const session = await getServerSession(authOptions);
  const actor = assertAuthenticatedSession(session);
  const { params } = context;
  const { id } = (await params) ?? {};
  if (!id) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest) {
    return NextResponse.json({ error: "クエストが見つかりません。" }, { status: 404 });
  }

  const loaded = await prisma.quest.findUnique({
    where: { id },
    include: {
      receptionist: true,
      adventurer: true,
      selectedAdventurers: true,
      applications: {
        include: {
          adventurer: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  const viewerAdventurer =
    actor && isGeneralUser(actor)
      ? await prisma.adventurer.findUnique({ where: { userId: actor.id } })
      : null;

  return NextResponse.json({
    quest: {
      ...loaded,
      receptionistName: loaded?.receptionist?.displayName ?? null,
      adventurerName: loaded?.adventurer?.displayName ?? null,
      viewerAdventurerId: viewerAdventurer?.id ?? null,
      selectedAdventurerIds: (loaded?.selectedAdventurers ?? []).map((item) => item.adventurerId),
      applicants: (loaded?.applications ?? [])
        .filter((application) => application.adventurer)
        .map((application) => ({
          id: application.adventurer.id,
          name: application.adventurer.user?.displayName ?? application.adventurer.name ?? "未設定",
          rank: application.adventurer.rank ?? "未設定",
          role: application.adventurer.role ?? "未設定",
          note: application.adventurer.note ?? "",
          source: application.adventurer.source ?? "申請",
          appliedAt: application.appliedAt,
        })),
    },
  });
}

export async function PATCH(request, context) {
  const session = await getServerSession(authOptions);
  const actor = assertAuthenticatedSession(session);
  if (!actor) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (!isGeneralUser(actor) && !isReceptionStaff(actor)) {
    return NextResponse.json({ error: "更新権限がありません。" }, { status: 403 });
  }
  const { params } = context;
  const { id } = (await params) ?? {};
  if (!id) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const payload = await request.json();
  const mode = payload.mode;

  if (mode === "apply") {
    if (!isGeneralUser(actor)) {
      return NextResponse.json({ error: "冒険者が不正です。" }, { status: 400 });
    }
    const targetQuest = await prisma.quest.findUnique({ where: { id } });
    if (!targetQuest) {
      return NextResponse.json({ error: "クエストが見つかりません。" }, { status: 404 });
    }
    if (targetQuest.status !== "募集中") {
      return NextResponse.json({ error: "募集中のクエストのみ申請できます。" }, { status: 400 });
    }
    const adventurer = await ensureAdventurerForUser(actor);
    if (!adventurer) {
      return NextResponse.json({ error: "冒険者情報が見つかりません。" }, { status: 404 });
    }

    const created = await prisma.questApplication.upsert({
      where: { questId_adventurerId: { questId: id, adventurerId: adventurer.id } },
      create: { questId: id, adventurerId: adventurer.id },
      update: {},
    });

    return NextResponse.json({
      application: {
        questId: created.questId,
        adventurerId: created.adventurerId,
        appliedAt: created.appliedAt,
      },
    });
  }

  if (mode === "accept") {
    if (!isGeneralUser(actor)) {
      return NextResponse.json({ error: "冒険者が不正です。" }, { status: 400 });
    }
    const adventurer = await ensureAdventurerForUser(actor);
    if (!adventurer) {
      return NextResponse.json({ error: "冒険者情報が見つかりません。" }, { status: 404 });
    }
    const targetQuest = await prisma.quest.findUnique({ where: { id } });
    if (!targetQuest) {
      return NextResponse.json({ error: "クエストが見つかりません。" }, { status: 404 });
    }
    if (targetQuest.status !== "募集中") {
      return NextResponse.json({ error: "この状態では受注できません。" }, { status: 400 });
    }
    const selection = await prisma.questAdventurer.findMany({
      where: { questId: id },
    });
    if (selection.length && !selection.some((item) => item.adventurerId === adventurer.id)) {
      return NextResponse.json({ error: "選定された冒険者のみ受注できます。" }, { status: 400 });
    }
    const updated = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.update({
        where: { id },
        data: {
          status: "クエスト進行中",
          summary: "冒険者が参加しました。進行状況の更新を待っています。",
          adventurerId: actor.id,
        },
        include: {
          receptionist: true,
          adventurer: true,
          selectedAdventurers: true,
        },
      });

      if (quest.requestId) {
        await tx.request.update({
          where: { id: quest.requestId },
          data: {
            status: "クエスト進行中",
            notes: "冒険者が参加しました。進行状況の更新を待っています。",
          },
        });
      }

      return quest;
    });

    return NextResponse.json({
      quest: {
        ...updated,
        receptionistName: updated.receptionist?.displayName ?? null,
        adventurerName: updated.adventurer?.displayName ?? null,
        selectedAdventurerIds: (updated.selectedAdventurers ?? []).map((item) => item.adventurerId),
      },
    });
  }

  if (mode === "report") {
    if (!isGeneralUser(actor)) {
      return NextResponse.json({ error: "冒険者が不正です。" }, { status: 400 });
    }
    const reportComment = payload.reportComment ?? "";
    const checklist = payload.checklist ?? [];
    const photos = payload.photos ?? [];

    const updated = await prisma.quest.update({
      where: { id },
      data: {
        status: "完了報告済み",
        summary: "完了報告が提出済み。受付の確認待ち。",
        reportComment,
        checklist,
        photos,
        adventurerId: actor.id,
      },
      include: {
        receptionist: true,
        adventurer: true,
        selectedAdventurers: true,
      },
    });

    return NextResponse.json({
      quest: {
        ...updated,
        receptionistName: updated.receptionist?.displayName ?? null,
        adventurerName: updated.adventurer?.displayName ?? null,
        selectedAdventurerIds: (updated.selectedAdventurers ?? []).map((item) => item.adventurerId),
      },
    });
  }

  if (mode === "verify") {
    if (!isReceptionStaff(actor)) {
      return NextResponse.json({ error: "受付が不正です。" }, { status: 400 });
    }
    const reviewNote = payload.reviewNote ?? null;
    const updated = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.update({
        where: { id },
        data: {
          status: "達成確認済み",
          summary: "受付の達成確認が完了。履歴に保存。",
          reviewNote,
          receptionistId: actor.id,
        },
        include: {
          receptionist: true,
          adventurer: true,
          selectedAdventurers: true,
        },
      });

      if (quest.requestId) {
        await tx.request.update({
          where: { id: quest.requestId },
          data: {
            status: "完了",
            notes: "完了済み。履歴として参照できます。",
          },
        });
      }

      return quest;
    });

    return NextResponse.json({
      quest: {
        ...updated,
        receptionistName: updated.receptionist?.displayName ?? null,
        adventurerName: updated.adventurer?.displayName ?? null,
        selectedAdventurerIds: (updated.selectedAdventurers ?? []).map((item) => item.adventurerId),
      },
    });
  }

  if (mode === "remand") {
    if (!isReceptionStaff(actor)) {
      return NextResponse.json({ error: "受付が不正です。" }, { status: 400 });
    }
    const reviewNote = payload.reviewNote ?? null;
    const updated = await prisma.quest.update({
      where: { id },
      data: {
        status: "クエスト進行中",
        summary: "受付が差し戻しました。冒険者の再報告待ち。",
        reviewNote,
        receptionistId: actor.id,
      },
      include: {
        receptionist: true,
        adventurer: true,
        selectedAdventurers: true,
      },
    });

    return NextResponse.json({
      quest: {
        ...updated,
        receptionistName: updated.receptionist?.displayName ?? null,
        adventurerName: updated.adventurer?.displayName ?? null,
        selectedAdventurerIds: (updated.selectedAdventurers ?? []).map((item) => item.adventurerId),
      },
    });
  }

  if (mode === "select") {
    const selectedIds = Array.isArray(payload.selectedIds) ? payload.selectedIds : null;
    if (!selectedIds) {
      return NextResponse.json({ error: "選定内容が不正です。" }, { status: 400 });
    }
    if (!isReceptionStaff(actor)) {
      return NextResponse.json({ error: "受付が不正です。" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.questAdventurer.deleteMany({
        where: { questId: id },
      });
      if (selectedIds.length) {
        await tx.questAdventurer.createMany({
          data: selectedIds.map((adventurerId) => ({
            questId: id,
            adventurerId,
          })),
        });
      }
      return tx.quest.update({
        where: { id },
        data: {
          receptionistId: actor.id,
          summary: "受付が冒険者を選定中です。",
        },
        include: {
          receptionist: true,
          adventurer: true,
          selectedAdventurers: true,
        },
      });
    });

    return NextResponse.json({
      quest: {
        ...updated,
        receptionistName: updated.receptionist?.displayName ?? null,
        adventurerName: updated.adventurer?.displayName ?? null,
        selectedAdventurerIds: (updated.selectedAdventurers ?? []).map((item) => item.adventurerId),
      },
    });
  }

  if (mode === "finalize-selection") {
    const selectedIds = Array.isArray(payload.selectedIds) ? payload.selectedIds : null;
    if (!selectedIds) {
      return NextResponse.json({ error: "選定内容が不正です。" }, { status: 400 });
    }
    if (!isReceptionStaff(actor)) {
      return NextResponse.json({ error: "受付が不正です。" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.questAdventurer.deleteMany({
        where: { questId: id },
      });
      if (selectedIds.length) {
        await tx.questAdventurer.createMany({
          data: selectedIds.map((adventurerId) => ({
            questId: id,
            adventurerId,
          })),
        });
      }
      const adventurerId =
        selectedIds.length === 1 ? selectedIds[0] : null;
      return tx.quest.update({
        where: { id },
        data: {
          status: "クエスト進行中",
          summary: "受付がクエストを開始。進行状況の更新を待っています。",
          receptionistId: actor.id,
          adventurerId,
        },
        include: {
          receptionist: true,
          adventurer: true,
          selectedAdventurers: true,
        },
      });
    });

    return NextResponse.json({
      quest: {
        ...updated,
        receptionistName: updated.receptionist?.displayName ?? null,
        adventurerName: updated.adventurer?.displayName ?? null,
        selectedAdventurerIds: (updated.selectedAdventurers ?? []).map((item) => item.adventurerId),
      },
    });
  }

  return NextResponse.json({ error: "更新内容が不正です。" }, { status: 400 });
}
