import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { assertAuthenticatedSession, isGeneralUser, isReceptionStaff } from "@/lib/authz";
import { requestInclude, requestPayload } from "@/lib/api-data";
import { ApiError, readJson, transaction, withApiErrors } from "@/lib/api-handler";

async function getActor() {
  const actor = assertAuthenticatedSession(await getServerSession(authOptions));
  if (!actor) throw new ApiError(401, "認証が必要です。");
  if (!isGeneralUser(actor) && !isReceptionStaff(actor)) throw new ApiError(403, "権限がありません。");
  return actor;
}
function checkOwner(current, actor) {
  if (!current || (isGeneralUser(actor) && current.requesterId !== actor.id) ||
    (isReceptionStaff(actor) && current.status === "下書き")) {
    throw new ApiError(404, "依頼が見つかりません。");
  }
}
function requestFields(fields) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) throw new ApiError(400, "依頼内容が不正です。");
  return Object.fromEntries(["title", "purpose", "location", "deadline", "risk", "reward", "requesterNote"].map((key) => {
    if (fields[key] != null && (typeof fields[key] !== "string" || fields[key].length > 10000)) {
      throw new ApiError(400, "依頼内容は各項目10000文字以内で入力してください。");
    }
    return [key, fields[key]?.trim() || null];
  }));
}

export const GET = withApiErrors(async (request, context) => {
  const actor = await getActor();
  const { id } = await context.params;
  const current = await prisma.request.findUnique({ where: { id }, include: requestInclude });
  checkOwner(current, actor);
  const filter = new URL(request.url).searchParams.get("requesterId");
  if (filter !== null && isReceptionStaff(actor) && current.requesterId !== filter.trim()) {
    throw new ApiError(404, "依頼が見つかりません。");
  }
  return NextResponse.json({ request: requestPayload(current) });
});

export const PATCH = withApiErrors(async (request, context) => {
  const actor = await getActor();
  const { id } = await context.params;
  const payload = await readJson(request);
  const { mode } = payload;
  const updated = await transaction(async (tx) => {
    const current = await tx.request.findUnique({ where: { id } });
    checkOwner(current, actor);
    let data = isReceptionStaff(actor) ? { receptionistId: actor.id } : {};
    if (mode === "draft-save" || mode === "submit") {
      if (!isGeneralUser(actor)) throw new ApiError(403, "依頼者のみ操作できます。");
      if (current.status !== "下書き") throw new ApiError(409, "下書き以外は保存・送信できません。");
      const fields = requestFields(payload.fields ?? {});
      if (mode === "submit" && !fields.title) throw new ApiError(400, "依頼タイトルは必須です。");
      data = { ...data, ...fields, title: fields.title || current.title,
        notes: mode === "submit" ? "受付が確認中です。" : "下書きを保存しました。" };
      if (mode === "submit") Object.assign(data, { status: "確認前", requesterAgreed: true, receptionistAgreed: false });
    } else if (mode === "agree" || mode === "adjust") {
      if (!["確認前", "合意待ち", "合意済み"].includes(current.status)) {
        throw new ApiError(409, "現在の状態では合意・調整できません。");
      }
      if (mode === "agree") {
        const requesterAgreed = isGeneralUser(actor) || current.requesterAgreed;
        const receptionistAgreed = isReceptionStaff(actor) || current.receptionistAgreed;
        const agreed = requesterAgreed && receptionistAgreed;
        data = { ...data, requesterAgreed, receptionistAgreed, status: agreed ? "合意済み" : "合意待ち",
          notes: agreed ? "依頼内容は合意済みです。受付のクエスト化を待っています。" : "相手の合意待ちです。" };
      } else {
        const fields = requestFields(payload.fields ?? {});
        if (payload.reason != null && (typeof payload.reason !== "string" || payload.reason.length > 10000)) {
          throw new ApiError(400, "調整理由は10000文字以内で入力してください。");
        }
        data = { ...data, ...fields, title: fields.title || current.title, status: "合意待ち",
          notes: payload.reason || "調整案が届きました。相手の合意待ちです。",
          requesterAgreed: isGeneralUser(actor), receptionistAgreed: isReceptionStaff(actor) };
      }
    } else throw new ApiError(400, "更新内容が不正です。");
    return tx.request.update({ where: { id }, data, include: requestInclude });
  });
  return NextResponse.json({ request: requestPayload(updated) });
});

export const DELETE = withApiErrors(async (_request, context) => {
  const actor = await getActor();
  if (!isGeneralUser(actor)) throw new ApiError(403, "依頼者のみ削除できます。");
  const { id } = await context.params;
  await transaction(async (tx) => {
    const current = await tx.request.findUnique({ where: { id } });
    checkOwner(current, actor);
    if (current.status !== "下書き") throw new ApiError(409, "下書き以外は削除できません。");
    await tx.request.delete({ where: { id } });
  });
  return NextResponse.json({ ok: true });
});
