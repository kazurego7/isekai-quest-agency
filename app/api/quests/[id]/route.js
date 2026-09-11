import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isGeneralUser, isReceptionStaff } from "@/lib/authz";
import { publicUserSelect, questInclude, questPayload, visibleQuestWhere } from "@/lib/api-data";
import { ApiError, readJson, transaction, withApiErrors } from "@/lib/api-handler";
import { validatePhotos } from "@/lib/report-photos";

async function getActor() {
  const actor = assertAuthenticatedSession(await getServerSession(authOptions));
  if (!actor) throw new ApiError(401, "認証が必要です。");
  if (!isGeneralUser(actor) && !isReceptionStaff(actor)) throw new ApiError(403, "権限がありません。");
  return actor;
}

export const GET = withApiErrors(async (_request, context) => {
  const actor = await getActor();
  const { id } = await context.params;
  const viewerAdventurer = isGeneralUser(actor)
    ? await prisma.adventurer.findUnique({ where: { userId: actor.id } }) : null;
  const quest = await prisma.quest.findFirst({
    where: { id, ...(isGeneralUser(actor) ? visibleQuestWhere(actor.id) : {}) },
    include: {
      ...questInclude,
      applications: {
        where: isGeneralUser(actor) ? { adventurer: { userId: actor.id } } : {},
        include: { adventurer: { include: { user: { select: publicUserSelect } } } },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  if (!quest) throw new ApiError(404, "クエストが見つかりません。");
  return NextResponse.json({ quest: {
    ...questPayload(quest),
    viewerAdventurerId: viewerAdventurer?.id ?? null,
    canReport: isGeneralUser(actor) && quest.status === "クエスト進行中" &&
      (quest.adventurerId === actor.id || quest.selectedAdventurers.some((item) => item.adventurerId === viewerAdventurer?.id)),
    applicants: quest.applications.map(({ adventurer, appliedAt }) => ({
      id: adventurer.id, name: adventurer.user?.displayName ?? adventurer.name,
      rank: adventurer.rank, role: adventurer.role, note: adventurer.note,
      source: adventurer.source, appliedAt,
    })),
  } });
});

export const PATCH = withApiErrors(async (request, context) => {
  const actor = await getActor();
  const { id } = await context.params;
  const payload = await readJson(request, 3 * 1024 * 1024);
  const mode = payload.mode;
  const generalModes = ["apply", "accept", "report"];
  const staffModes = ["select", "finalize-selection", "verify", "remand"];
  if (![...generalModes, ...staffModes].includes(mode)) throw new ApiError(400, "更新内容が不正です。");
  if (generalModes.includes(mode) ? !isGeneralUser(actor) : !isReceptionStaff(actor)) {
    throw new ApiError(403, "この操作の権限がありません。");
  }
  const result = await transaction(async (tx) => {
    const current = await tx.quest.findUnique({ where: { id }, include: { selectedAdventurers: true } });
    if (!current) throw new ApiError(404, "クエストが見つかりません。");
    const expectedStatus = mode === "report" ? "クエスト進行中"
      : ["verify", "remand"].includes(mode) ? "完了報告済み" : "募集中";
    if (current.status !== expectedStatus) throw new ApiError(409, "現在の状態では操作できません。再読み込みしてください。");
    let adventurer = isGeneralUser(actor)
      ? await tx.adventurer.findUnique({ where: { userId: actor.id } }) : null;
    if (mode === "apply" && !adventurer) {
      adventurer = await tx.adventurer.upsert({
        where: { userId: actor.id }, update: {},
        create: { userId: actor.id, code: `ADV-${randomUUID()}`, name: actor.displayName,
          rank: "Cランク", role: "未設定", note: "ユーザー申請から作成", source: "申請" },
      });
    }
    if (mode === "apply") {
      const application = await tx.questApplication.upsert({
        where: { questId_adventurerId: { questId: id, adventurerId: adventurer.id } },
        create: { questId: id, adventurerId: adventurer.id }, update: {},
      });
      return { application };
    }
    const selected = Boolean(adventurer && current.selectedAdventurers.some((item) => item.adventurerId === adventurer.id));
    let data;
    let requestStatus;
    if (mode === "accept") {
      if (!selected) throw new ApiError(403, "選定された冒険者のみ受注できます。");
      data = { status: "クエスト進行中", adventurerId: current.selectedAdventurers.length === 1 ? actor.id : null,
        summary: "冒険者が参加しました。進行状況の更新を待っています。" };
      requestStatus = "クエスト進行中";
    } else if (mode === "report") {
      if (current.adventurerId !== actor.id && !selected) throw new ApiError(403, "担当する冒険者のみ完了報告できます。");
      if (typeof payload.reportComment !== "string" || payload.reportComment.length > 10000) {
        throw new ApiError(400, "成果コメントは10000文字以内で入力してください。");
      }
      const checklist = current.checklist ?? [];
      if (!Array.isArray(payload.checklist) || payload.checklist.length !== checklist.length ||
        payload.checklist.some((item, index) => !item || typeof item.checked !== "boolean" || item.label !== checklist[index].label)) {
        throw new ApiError(400, "チェックリストが不正です。再読み込みしてください。");
      }
      data = { status: "完了報告済み", summary: "完了報告が提出済み。受付の確認待ち。",
        reportComment: payload.reportComment,
        checklist: checklist.map((item, index) => ({ ...item, checked: payload.checklist[index].checked })),
        photos: validatePhotos(payload.photos ?? []),
      };
      requestStatus = "完了報告済み";
    } else if (mode === "verify" || mode === "remand") {
      if (payload.reviewNote != null && (typeof payload.reviewNote !== "string" || payload.reviewNote.length > 10000)) {
        throw new ApiError(400, "確認メモは10000文字以内で入力してください。");
      }
      const reviewNote = payload.reviewNote?.trim() || null;
      if (mode === "remand" && !reviewNote) throw new ApiError(400, "差し戻し理由を入力してください。");
      data = { status: mode === "verify" ? "達成確認済み" : "クエスト進行中",
        summary: mode === "verify" ? "受付の達成確認が完了。履歴に保存。" : "受付が差し戻しました。冒険者の再報告待ち。",
        reviewNote, receptionistId: actor.id };
      requestStatus = mode === "verify" ? "完了" : "クエスト進行中";
    } else {
      const selectedIds = payload.selectedIds;
      if (!Array.isArray(selectedIds) || selectedIds.length > 100 ||
        selectedIds.some((value) => typeof value !== "string" || !value) ||
        new Set(selectedIds).size !== selectedIds.length || (mode === "finalize-selection" && !selectedIds.length)) {
        throw new ApiError(400, "選定内容が不正です。冒険者を選び直してください。");
      }
      const members = await tx.adventurer.findMany({
        where: { id: { in: selectedIds }, user: { userType: "general" } },
        select: { id: true, userId: true },
      });
      if (members.length !== selectedIds.length) throw new ApiError(400, "有効なユーザーに紐づく冒険者を選んでください。");
      await tx.questAdventurer.deleteMany({ where: { questId: id } });
      if (selectedIds.length) await tx.questAdventurer.createMany({ data: selectedIds.map((adventurerId) => ({ questId: id, adventurerId })) });
      data = { receptionistId: actor.id, summary: "受付が冒険者を選定中です。" };
      if (mode === "finalize-selection") {
        data = { ...data, status: "クエスト進行中", summary: "受付がクエストを開始。進行状況の更新を待っています。",
          adventurerId: members.length === 1 ? members[0].userId : null };
        requestStatus = "クエスト進行中";
      }
    }
    const updated = await tx.quest.update({ where: { id }, data, include: questInclude });
    if (current.requestId && requestStatus) {
      await tx.request.update({ where: { id: current.requestId }, data: { status: requestStatus, notes: data.summary } });
    }
    return { quest: questPayload(updated) };
  });
  return NextResponse.json(result);
});
