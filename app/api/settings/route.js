import { requireActor } from "@/lib/session";
import { ApiError, readJson, withApiErrors } from "@/lib/api-handler";
import { run, now } from "@/lib/store";
export const PATCH = withApiErrors(async request => {
  const actor = await requireActor();
  const payload = await readJson(request, 1024);
  if (Object.keys(payload).some(key => key !== "themePreference") || !["system", "light", "dark"].includes(payload.themePreference)) throw new ApiError(400, "テーマはシステムデフォルト・ライト・ダークから選んでください。");
  await run("UPDATE users SET themePreference=?,updatedAt=?,revision=revision+1 WHERE id=?", [payload.themePreference, now(), actor.id]);
  return Response.json({ themePreference: payload.themePreference });
});
