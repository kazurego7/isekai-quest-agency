import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function withApiErrors(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (error.code === "P2034" || error.code === "P2002") {
        return NextResponse.json({ error: "別の操作と重なりました。再読み込みしてお試しください。" }, { status: 409 });
      }
      throw error;
    }
  };
}

// Read and validate bounded JSON before touching the database.
export async function readJson(request, maxBytes = 64 * 1024) {
  if (!request.body) throw new ApiError(400, "入力内容が不正です。");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ApiError(413, "送信内容が大きすぎます。");
    }
    chunks.push(value);
  }
  try {
    const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error();
    return payload;
  } catch {
    throw new ApiError(400, "入力内容が不正です。");
  }
}

// Re-read permissions and status on retries so simultaneous transitions cannot
// overwrite each other (for example publishing twice or reporting after closure).
export async function transaction(action) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(action, { isolationLevel: "Serializable" });
    } catch (error) {
      if (error.code !== "P2034" || attempt >= 2) throw error;
    }
  }
}
