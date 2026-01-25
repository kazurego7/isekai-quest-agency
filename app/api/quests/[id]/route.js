import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(_request, context) {
  const { params } = context;
  const { id } = (await params) ?? {};
  if (!id) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest) {
    return NextResponse.json({ error: "クエストが見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ quest });
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
  const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;

  if (mode === "accept") {
    if (!actor || actor.role !== "adventurer") {
      return NextResponse.json({ error: "冒険者が不正です。" }, { status: 400 });
    }
    const updated = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.update({
        where: { id },
        data: {
          status: "受注済み",
          summary: "冒険者が受注しました。進行状況の更新を待っています。",
          adventurerName: actor.name,
          adventurerId: actor.id,
        },
      });

      if (quest.requestId) {
        await tx.request.update({
          where: { id: quest.requestId },
          data: {
            status: "受注済み",
            notes: "冒険者が受注しました。進行状況の更新を待っています。",
          },
        });
      }

      return quest;
    });

    return NextResponse.json({ quest: updated });
  }

  if (mode === "report") {
    if (!actor || actor.role !== "adventurer") {
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
        adventurerName: actor.name,
        adventurerId: actor.id,
      },
    });

    return NextResponse.json({ quest: updated });
  }

  if (mode === "verify") {
    if (!actor || actor.role !== "reception") {
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
          receptionistName: actor.name,
          receptionistId: actor.id,
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

    return NextResponse.json({ quest: updated });
  }

  if (mode === "select") {
    const selectedIds = Array.isArray(payload.selectedIds) ? payload.selectedIds : null;
    if (!selectedIds) {
      return NextResponse.json({ error: "選定内容が不正です。" }, { status: 400 });
    }
    if (!actor || actor.role !== "reception") {
      return NextResponse.json({ error: "受付が不正です。" }, { status: 400 });
    }

    const updated = await prisma.quest.update({
      where: { id },
      data: {
        selectedAdventurers: selectedIds,
        receptionistName: actor.name,
        receptionistId: actor.id,
        summary: "受付が冒険者を選定中です。",
      },
    });

    return NextResponse.json({ quest: updated });
  }

  return NextResponse.json({ error: "更新内容が不正です。" }, { status: 400 });
}
